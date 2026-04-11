import { cookies } from "next/headers";
import { db } from "./db";

export type SessionData = {
  userId: string;
  role: "FREELANCER" | "COMPANY";
  name: string;
};

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  
  if (!sessionValue) return null;
  
  try {
    return JSON.parse(sessionValue) as SessionData;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId }
    });
    return user;
  } catch (error) {
    return null;
  }
}
