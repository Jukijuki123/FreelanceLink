"use server";

import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // 1. Cari user di database
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Email atau password salah." };
  }

  // 2. Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: "Email atau password salah." };
  }

  // 3. Set Session Cookie (Simpel)
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify({
    userId: user.id,
    role: user.role,
    name: user.name
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 minggu
    path: "/",
  });

  // 4. Return success
  return { success: true, redirectUrl: "/jobs" };
}
