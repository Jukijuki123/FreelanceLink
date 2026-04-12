"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  MessageSquare,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  UserCircle
} from "lucide-react";
import { logoutUser } from "@/app/actions/logout";
import { useTransition } from "react";
import Image from "next/image";

type SidebarProps = {
  role: "FREELANCER" | "COMPANY";
  onClose?: () => void;
};

export default function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutUser();
    });
  };

  const navItems = [
    { name: "Papan Lowongan", href: "/jobs", icon: Briefcase },
    { name: "Kotak Pesan", href: "/chat", icon: MessageSquare },
  ];

  if (role === "COMPANY") {
    navItems.push({ name: "Dashboard Pelamar", href: "/jobs/my-jobs", icon: LayoutDashboard });
    navItems.push({ name: "Post Lowongan", href: "/jobs/create", icon: PlusCircle });
  }

  // Active state styling using White/Blue/Orange/Green combination
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 font-medium ${isActive
      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
      : "text-gray-600 bg-white hover:text-blue-600 hover:shadow-sm"
      }`;
  };

  return (
    <aside className="w-64 shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col h-full sticky top-0">
      {/* Brand area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
          <Image
            src="/logo.png"
            alt="FreelanceLink Logo"
            width={60}
            height={60}
            priority
            className="object-contain"
          />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-blue-900">
            FreelanceLink
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClasses(item.href)}
              onClick={onClose}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition font-medium disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span>{isPending ? "Keluar..." : "Keluar Akun"}</span>
        </button>
      </div>
    </aside>
  );
}
