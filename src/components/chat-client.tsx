"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { sendMessage } from "@/app/actions/chat";
import { Send } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export function ChatClient({
  initialMessages,
  conversationId,
  currentUserId,
}: {
  initialMessages: Message[];
  conversationId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;

    // Use environment variables (make sure they are NEXT_PUBLIC_)
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "key_placeholder", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    });

    const channel = pusher.subscribe(`chat-${conversationId}`);

    channel.bind("new-message", (data: any) => {
      const sanitizedData = {
        ...data,
        createdAt: new Date(data.createdAt).toISOString(),
      };
      setMessages((prev) => {
        // Prevent duplicate append if sender
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, sanitizedData];
      });
    });

    return () => {
      pusher.unsubscribe(`chat-${conversationId}`);
    };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const content = input;
    setInput("");

    try {
      // Optimistic updat is complex since we don't know the exact ID before creation,
      // but Server Action will trigger Pusher anyway.
      await sendMessage(conversationId, content);
    } catch (e) {
      console.error("Failed to send message", e);
      // Restore on failure
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
              >
                <p className="text-[15px] leading-relaxed wrap-break-word">
                  {msg.content}
                </p>
                <div
                  className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"
                    }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-gray-700 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 transition"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}
