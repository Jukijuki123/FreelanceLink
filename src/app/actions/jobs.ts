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
    return { error: "Hanya akun Perusahaan yang dapat memposting lowongan." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budgetStr = formData.get("budget") as string;
  const budget = parseFloat(budgetStr);

  if (!title || !description || isNaN(budget)) {
    return { error: "Data lowongan tidak lengkap." };
  }

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const baseSlug = generateSlug(title) || 'job';
  const randomStr = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${randomStr}`;

  // Simpan ke Database
  const newJob = await db.job.create({
    data: {
      title,
      slug,
      description,
      budget,
      companyId: session.userId,
      status: "OPEN",
      isPaidAd: false, // Default false sebelum simulasi pembayaran
    },
  });

  return { success: true, redirectUrl: `/jobs/${newJob.slug}/payment` };
}
