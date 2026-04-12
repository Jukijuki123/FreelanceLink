"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function topUpBalance(amount: number) {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Increment user balance
  await db.user.update({
    where: { id: session.userId },
    data: { balance: { increment: amount } },
  });

  // Revalidate layout/pages so the new balance shows up in Topbar
  revalidatePath("/", "layout");
}
