import { getConversations } from "@/app/actions/chat";
import ChatLayoutClient from "@/components/chat/ChatLayoutClient";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();

  return (
    <ChatLayoutClient conversations={conversations}>
      {children}
    </ChatLayoutClient>
  );
}
