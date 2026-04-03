"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  try {
    return JSON.parse(sessionValue);
  } catch (e) {
    return null;
  }
}

export async function createJob(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "COMPANY") {
    throw new Error("Hanya akun Perusahaan yang dapat memposting lowongan.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budgetStr = formData.get("budget") as string;
  const budget = parseFloat(budgetStr);

  if (!title || !description || isNaN(budget)) {
    throw new Error("Data lowongan tidak lengkap.");
  }

  // Simpan ke Database
  await db.job.create({
    data: {
      title,
      description,
      budget,
      companyId: session.userId,
      status: "OPEN",
      isPaidAd: false, // Default false sebelum simulasi pembayaran
    },
  });

  redirect("/jobs");
}
