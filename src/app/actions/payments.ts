"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

export async function payJobAd(jobId: string) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  await db.job.update({
    where: { id: jobId },
    data: { isPaidAd: true },
  });

  revalidatePath("/jobs");
  revalidatePath("/jobs/my-jobs");
  redirect("/jobs/my-jobs");
}

export async function acceptAndDeposit(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const appId = formData.get("appId") as string;

  const app = await db.application.findUnique({
    where: { id: appId },
    include: { job: true },
  });

  if (!app || app.job.companyId !== session.userId) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch Company Balance
  const companyUser = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!companyUser) {
    throw new Error("User not found");
  }

  // 2. Check if balance is sufficient
  if (companyUser.balance < app.job.budget) {
    throw new Error(`Saldo tidak mencukupi. Anda butuh Rp ${new Intl.NumberFormat("id-ID").format(app.job.budget)} untuk menahan dana Escrow.`);
  }

  // 3. Atomically Update Applications, Job Status, and Deduct Company Balance
  await db.$transaction([
    db.application.update({
      where: { id: appId },
      data: { status: "ACCEPTED" },
    }),
    db.application.updateMany({
      where: { jobId: app.jobId, id: { not: appId } },
      data: { status: "REJECTED" },
    }),
    db.job.update({
      where: { id: app.jobId },
      data: { status: "ONGOING" },
    }),
    db.user.update({
      where: { id: session.userId },
      data: { balance: { decrement: app.job.budget } },
    }),
  ]);

  revalidatePath("/jobs/my-jobs");
  redirect("/jobs/my-jobs");
}

export async function completeProjectAndPayout(jobId: string) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { apps: { where: { status: "ACCEPTED" } } },
  });

  if (!job || job.companyId !== session.userId) {
    throw new Error("Unauthorized");
  }

  const acceptedApp = job.apps[0];
  if (!acceptedApp) {
    throw new Error("No accepted application found");
  }

  const adminFee = job.budget * 0.05;
  const netPayout = job.budget - adminFee;

  await db.$transaction([
    db.job.update({
      where: { id: jobId },
      data: { status: "COMPLETED" },
    }),
    db.user.update({
      where: { id: acceptedApp.freelancerId },
      data: { balance: { increment: netPayout } },
    }),
  ]);

  revalidatePath("/jobs/my-jobs");
  redirect("/jobs/my-jobs");
}
