import { Bell, UserCircle, Wallet, Menu } from "lucide-react";
import TopUpModal from "@/components/TopUpModal";
import Link from "next/link";

type TopbarProps = {
  user: {
    name: string;
    role: string;
    balance: number;
    avatarUrl?: string | null;
    unreadCount?: number;
  };
  onMenuClick?: () => void;
};

export default function Topbar({ user, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-10 w-full flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden transition"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Breadcrumb / Page Title placeholder */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Workspace</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Balance Display (Green accent for money) - Now Clickable for TopUp */}
        <div className="relative flex items-center gap-2 sm:gap-3 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition">
          <TopUpModal />
          <Wallet className="w-4 h-4 text-emerald-600 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-600 leading-none">Saldo</span>
            <span className="text-xs sm:text-sm font-black text-emerald-800 leading-tight">
              Rp {new Intl.NumberFormat("id-ID").format(user.balance)}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/chat" className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition">
            <Bell className="w-5 h-5" />
            {user.unreadCount !== undefined && user.unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {user.unreadCount > 9 ? "9+" : user.unreadCount}
              </span>
            )}
          </Link>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 sm:pl-2 hover:opacity-80 transition">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800 leading-none">{user.name}</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mt-1">
                {user.role}
              </span>
            </div>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm" />
            ) : (
              <UserCircle className="w-8 h-8 sm:w-9 sm:h-9 text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
