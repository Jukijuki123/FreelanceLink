"use server";

import { db } from "@/lib/db"; 
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "FREELANCER" | "COMPANY";
  const skillsInput = formData.get("skills") as string;

  // 1. Validasi Input Sederhana
  if (!name || !email || !password || !role) {
    throw new Error("Semua kolom wajib diisi.");
  }

  // 2. Cek Email Unik
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar.");
  }

  // 3. Hashing Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Olah Skills (Pisahkan koma menjadi array)
  const skills = skillsInput ? skillsInput.split(",").map((s) => s.trim()) : [];

  // 5. Simpan ke Database
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      skills,
    },
  });

  // 6. Redirect ke Login
  redirect("/login");
}