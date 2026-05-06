"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sesi tidak aktif" };

  try {
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const skillsString = formData.get("skills") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    const skills = skillsString
      ? skillsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const dataToUpdate: Record<string, unknown> = { name, bio, location, website };

    if (avatarUrl) {
      dataToUpdate.avatarUrl = avatarUrl;
    }

    if (session.role === "FREELANCER") {
      dataToUpdate.skills = skills;

      // ── Data Rekening Bank (Freelancer Only) ──────────────────────────────
      const bankName = formData.get("bankName") as string;
      const accountNumber = formData.get("accountNumber") as string;
      const accountHolder = formData.get("accountHolder") as string;

      // Validasi: nomor rekening hanya boleh berisi angka
      if (accountNumber && !/^\d+$/.test(accountNumber)) {
        return { error: "Nomor rekening hanya boleh berisi angka." };
      }

      if (bankName !== null) dataToUpdate.bankName = bankName || null;
      if (accountNumber !== null) dataToUpdate.accountNumber = accountNumber || null;
      if (accountHolder !== null) dataToUpdate.accountHolder = accountHolder || null;
    }

    await db.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    return { error: "Gagal memperbarui profil" };
  }
}
