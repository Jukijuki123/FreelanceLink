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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden min-h-[75vh]">
      {/* Sidebar for Conversations */}
      <aside className="w-80 bg-gray-50/50 border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900">List Pesan</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm font-medium">
              Belum ada pesan masuk.
            </div>
          ) : (
            conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block p-4 border-b border-gray-100 hover:bg-white hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {c.otherUser.name}
                  </h3>
                  <span className="text-xs font-semibold text-gray-400">
                    {c.updatedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {c.lastMessage ? c.lastMessage.content : "Start a conversation..."}
                </p>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-200/60 text-gray-600 rounded">
                  {c.otherUser.role}
                </span>
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white relative">
        {children}
      </main>
    </div>
  );
}
