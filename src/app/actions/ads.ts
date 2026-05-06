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

export async function buyAd(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const imageUrl = formData.get("imageUrl") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const daysString = formData.get("days") as string;
  const days = parseInt(daysString);

  if (!imageUrl || !days || isNaN(days) || days <= 0) {
    throw new Error("Input tidak valid.");
  }

  // Harga iklan (contoh: Rp 50.000 per hari)
  const pricePerDay = 50000;
  const totalPrice = pricePerDay * days;

  // 1. Cek saldo perusahaan
  const companyUser = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!companyUser || companyUser.balance < totalPrice) {
    throw new Error(`Saldo tidak mencukupi. Anda butuh Rp ${new Intl.NumberFormat("id-ID").format(totalPrice)} untuk pasang iklan.`);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  // 2. Buat iklan, potong saldo, catat transaksi
  await db.$transaction([
    db.advertisement.create({
      data: {
        companyId: session.userId,
        imageUrl,
        linkUrl: linkUrl || null,
        expiresAt,
        status: "ACTIVE"
      }
    }),
    db.user.update({
      where: { id: session.userId },
      data: { balance: { decrement: totalPrice } }
    }),
    db.transaction.create({
      data: {
        userId: session.userId,
        type: "BUY_AD",
        amount: totalPrice,
        description: `Pembelian Iklan Pop-up untuk ${days} hari`,
      }
    })
  ]);

  revalidatePath("/ads");
  revalidatePath("/");
  redirect("/ads");
}

export async function getActiveAd() {
  // Ambil iklan yang masih aktif dan belum kedaluwarsa
  const ad = await db.advertisement.findFirst({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });
  return ad;
}
