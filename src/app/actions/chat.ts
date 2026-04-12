"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pusherServer } from "@/lib/pusher";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  return JSON.parse(sessionValue);
}

export async function getConversations() {
  const session = await getSession();
  if (!session) redirect("/login");

  const conversations = await db.conversation.findMany({
    where: {
      OR: [
        { user1Id: session.userId },
        { user2Id: session.userId }
      ]
    },
    include: {
      user1: { select: { id: true, name: true, role: true, avatarUrl: true } },
      user2: { select: { id: true, name: true, role: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return conversations.map(c => {
    const otherUser = c.user1Id === session.userId ? c.user2 : c.user1;
    return {
      id: c.id,
      otherUser,
      lastMessage: c.messages[0] || null,
      updatedAt: c.updatedAt
    };
  });
}

export async function getConversation(conversationId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: { select: { id: true, name: true, role: true } },
      user2: { select: { id: true, name: true, role: true } },
      messages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!conversation) return null;
  if (conversation.user1Id !== session.userId && conversation.user2Id !== session.userId) return null;

  return conversation;
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.user1Id !== session.userId && conversation.user2Id !== session.userId)) {
    throw new Error("Invalid conversation");
  }

  const message = await db.message.create({
    data: {
      conversationId,
      senderId: session.userId,
      content
    }
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  // Trigger Pusher event
  await pusherServer.trigger(`chat-${conversationId}`, "new-message", message);

  return message;
}

export async function initiateChat(otherUserId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.userId === otherUserId) {
    throw new Error("Cannot chat with yourself");
  }

  // Check if conversation already exists
  let conversation = await db.conversation.findFirst({
    where: {
      OR: [
        { user1Id: session.userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: session.userId }
      ]
    }
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        user1Id: session.userId,
        user2Id: otherUserId
      }
    });
  }

  redirect(`/chat/${conversation.id}`);
}
