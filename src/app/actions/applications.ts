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

export async function applyToJob(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "FREELANCER") {
    throw new Error("Hanya Freelancer yang dapat melamar pekerjaan.");
  }

  const jobId = formData.get("jobId") as string;
  const proposal = formData.get("proposal") as string;
  const resumeUrl = formData.get("resumeUrl") as string; // Untuk MVP, bisa link GDrive/Dropbox

  if (!jobId || !proposal) {
    throw new Error("Lengkapi data lamaran (Proposal wajib diisi).");
  }

  // 1. Cek apakah sudah pernah melamar
  const existingApp = await db.application.findFirst({
    where: {
      jobId,
      freelancerId: session.userId,
    },
  });

  if (existingApp) {
    throw new Error("Anda sudah melamar pekerjaan ini.");
  }

  // 2. Simpan Lamaran
  await db.application.create({
    data: {
      jobId,
      freelancerId: session.userId,
      proposal,
      resumeUrl,
      status: "PENDING",
    },
  });

  redirect("/jobs");
}

export async function rejectApplication(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "COMPANY") {
    throw new Error("Hanya Perusahaan yang dapat menolak pelamar.");
  }

  const appId = formData.get("appId") as string;

  const app = await db.application.findUnique({
    where: { id: appId },
    include: { job: true },
  });

  if (!app || app.job.companyId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await db.application.update({
    where: { id: appId },
    data: { status: "REJECTED" },
  });

  redirect("/jobs/my-jobs");
}
