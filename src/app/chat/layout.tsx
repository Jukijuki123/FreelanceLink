import { getConversations } from "@/app/actions/chat";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen fixed">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>
          <Link href="/jobs" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet.
            </div>
          ) : (
            conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block p-4 border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {c.otherUser.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {c.updatedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {c.lastMessage ? c.lastMessage.content : "Start a conversation..."}
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {c.otherUser.role}
                </span>
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-80 bg-gray-50 h-screen">
        {children}
      </main>
    </div>
  );
}
