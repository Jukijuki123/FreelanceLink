export default function ChatPage() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-500">
      <div className="bg-white p-8 rounded-full shadow-sm mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
      <p className="mt-1">Select a conversation to start chatting.</p>
    </div>
  );
}
