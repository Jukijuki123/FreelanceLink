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

export async function buyJobPackage(jobId: string, days: number, price: number) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.balance < price) {
    throw new Error("Saldo tidak mencukupi.");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await db.$transaction([
    db.job.update({
      where: { id: jobId },
      data: { 
        isPaidAd: true, 
        expiresAt,
        adFeePaid: { increment: price }
      },
    }),
    db.user.update({
      where: { id: session.userId },
      data: { balance: { decrement: price } },
    }),
    db.transaction.create({
      data: {
        userId: session.userId,
        type: "BUY_AD",
        amount: price,
        description: `Promosi lowongan kerja selama ${days} hari`,
      }
    })
  ]);

  revalidatePath("/jobs");
  revalidatePath("/jobs/my-jobs");
  redirect("/jobs/my-jobs?success=ad_paid");
}

export async function payJobAd(jobId: string) {
  // Fungsi lama tetap dipertahankan jika ada yang menggunakan
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
    db.transaction.create({
      data: {
        userId: session.userId,
        type: "DEPOSIT_ESCROW",
        amount: app.job.budget,
        description: `Deposit Escrow untuk proyek: ${app.job.title}`,
      }
    })
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
    db.transaction.create({
      data: {
        userId: acceptedApp.freelancerId,
        type: "PAYOUT",
        amount: netPayout,
        description: `Pencairan dana proyek: ${job.title} (setelah potongan admin 5%)`,
      }
    })
  ]);

  revalidatePath("/jobs/my-jobs");
  redirect("/jobs/my-jobs");
}
