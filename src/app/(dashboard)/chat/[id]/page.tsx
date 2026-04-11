import { getConversation, getSession } from "@/app/actions/chat";
import { ChatClient } from "@/components/chat-client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    redirect("/chat");
  }

  const cookieStore = await cookies();
  const sessionString = cookieStore.get("session")?.value;
  if (!sessionString) redirect("/login");
  const session = JSON.parse(sessionString);
  const currentUserId = session.userId;

  const otherUser =
    conversation.user1Id === currentUserId
      ? conversation.user2
      : conversation.user1;

  // Serialize before passing to client components
  const sanitizedMessages = conversation.messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4 bg-white">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
          {otherUser.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{otherUser.name}</h2>
          <p className="text-xs text-gray-500 capitalize">{otherUser.role}</p>
        </div>
      </div>

      {/* Messages Client Component */}
      <ChatClient
        initialMessages={sanitizedMessages}
        conversationId={id}
        currentUserId={currentUserId}
      />
    </div>
  );
}
