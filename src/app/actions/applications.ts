"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function applyToJob(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "FREELANCER") {
    throw new Error("Hanya Freelancer yang dapat melamar pekerjaan.");
  }

  const jobId = formData.get("jobId") as string;
  const proposal = formData.get("proposal") as string;
  const resumeUrl = formData.get("resumeUrl") as string;

  if (!jobId || !proposal) {
    throw new Error("Proposal wajib diisi.");
  }

  // Cek duplikasi lamaran
  const existingApp = await db.application.findFirst({
    where: { jobId, freelancerId: session.userId },
  });

  if (existingApp) {
    throw new Error("Anda sudah melamar pekerjaan ini.");
  }

  await db.application.create({
    data: {
      jobId,
      freelancerId: session.userId,
      proposal,
      resumeUrl: resumeUrl || null,
      status: "PENDING",
    },
  });

  redirect("/jobs");
}

/**
 * Perusahaan memindahkan status pelamar ke INTERVIEW.
 * Ini membuka akses chat langsung dari action ini (tidak perlu redirect ke halaman lain).
 */
export async function moveToInterview(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") throw new Error("Unauthorized");

  const appId = formData.get("appId") as string;

  const app = await db.application.findUnique({
    where: { id: appId },
    include: { job: true },
  });

  if (!app || app.job.companyId !== session.userId) throw new Error("Unauthorized");

  await db.application.update({
    where: { id: appId },
    data: { status: "INTERVIEW" },
  });

  revalidatePath("/jobs/my-jobs");
}

export async function rejectApplication(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") throw new Error("Unauthorized");

  const appId = formData.get("appId") as string;

  const app = await db.application.findUnique({
    where: { id: appId },
    include: { job: true },
  });

  if (!app || app.job.companyId !== session.userId) throw new Error("Unauthorized");

  await db.application.update({
    where: { id: appId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/jobs/my-jobs");
}
