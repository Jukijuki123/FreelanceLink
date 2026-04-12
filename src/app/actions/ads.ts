"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function buyJobPackage(jobId: string, daysOpen: number, packagePrice: number) {
  const session = await getSession();

  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized Access");
  }

  // Cari Lowongan & Perusahaan
  const job = await db.job.findUnique({
    where: { id: jobId }
  });

  if (!job || job.companyId !== session.userId) {
    throw new Error("Pekerjaan tidak ditemukan atau bukan milik Anda.");
  }

  const companyUser = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!companyUser) throw new Error("Pengguna tidak ditemukan");

  // Validasi Saldo
  if (companyUser.balance < packagePrice) {
    throw new Error("Saldo dompet Anda tidak mencukupi untuk membeli paket ini.");
  }

  // Hitung Tanggal Kedaluwarsa
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysOpen); // Sekarang + Jumlah Hari

  // Transaksi Atomik (Potong Saldo, Aktifkan Iklan, Set Kedaluwarsa)
  await db.$transaction([
    // Pemotongan Saldo Perusahaan
    db.user.update({
      where: { id: session.userId },
      data: { balance: { decrement: packagePrice } }
    }),
    // Pembaruan Lowongan (Masa Aktif & Track Biaya Iklan)
    db.job.update({
      where: { id: jobId },
      data: {
        isPaidAd: true,
        expiresAt: expiryDate,
        adFeePaid: packagePrice
      }
    })
  ]);

  revalidatePath("/jobs");
  revalidatePath("/admin");

  redirect("/jobs/my-jobs?success=ad_paid");
}
