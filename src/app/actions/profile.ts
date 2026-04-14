"use server";

import { db } from "@/lib/db";
import { getSession } from "@/app/actions/chat";
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
      ? skillsString.split(",").map(s => s.trim()).filter(s => s.length > 0) 
      : [];

    const dataToUpdate: any = {
      name,
      bio,
      location,
      website
    };
    
    // Update avatar jika ada URL baru dari hasil upload
    if (avatarUrl) {
      dataToUpdate.avatarUrl = avatarUrl;
    }
    
    // Freelancer-specific fields
    if (session.role === "FREELANCER") {
      dataToUpdate.skills = skills;
    }

    await db.user.update({
      where: { id: session.userId },
      data: dataToUpdate
    });

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (err: any) {
    console.error("Update profile error:", err);
    return { error: "Gagal memperbarui profil" };
  }
}
