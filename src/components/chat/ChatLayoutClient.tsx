"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ChevronRight } from "lucide-react";

type Conversation = {
  id: string;
  otherUser: { name: string; role: string };
  lastMessage: { content: string } | null;
  updatedAt: Date;
};

export default function ChatLayoutClient({
  conversations,
  children,
}: {
  conversations: Conversation[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Jika path adalah /chat tepat (bukan detail chat specific)
  const isListView = pathname === "/chat";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden min-h-[75vh] relative">
      
      {/* Sidebar - Ditampilkan di Desktop, atau di Mobile HANYA jika list view */}
      <aside 
        className={`w-full md:w-80 bg-gray-50/50 border-r border-gray-200 flex-col shrink-0 absolute md:static inset-0 z-10 transition-transform duration-300
          ${isListView ? "flex" : "hidden md:flex"}
        `}
      >
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Pesan</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm font-medium">
              Belum ada pesan masuk.
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = pathname === `/chat/${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className={`block p-4 border-b border-gray-100 transition relative overflow-hidden group
                    ${isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-white hover:shadow-sm"}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold truncate pr-2 ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                      {c.otherUser.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0 mt-0.5">
                      {new Date(c.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate pr-4 ${isActive ? "text-blue-700" : "text-gray-600"}`}>
                      {c.lastMessage ? c.lastMessage.content : "Start a conversation..."}
                    </p>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-blue-600 translate-x-0" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
                  </div>
                  <span className={`inline-block mt-2 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded
                    ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-200/60 text-gray-600"}
                  `}>
                    {c.otherUser.role}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content (Chat Detail) - Ditampilkan di Desktop, atau di Mobile HANYA jika bukan list view */}
      <main 
        className={`flex-1 bg-white relative flex-col
          ${!isListView ? "flex" : "hidden md:flex"}
        `}
      >
        {children}
      </main>
      
    </div>
  );
}
