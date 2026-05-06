import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { getUnreadMessagesCount } from "@/app/actions/chat";

export const metadata = {
  title: "Dashboard - FreelanceLink",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Jika query count gagal, jangan crash seluruh layout
  const unreadCount = await getUnreadMessagesCount().catch(() => 0);

  const sessionUser = {
    name: user.name,
    role: user.role as "FREELANCER" | "COMPANY",
    balance: (user as any).balance ?? 0,
    avatarUrl: user.avatarUrl,
    unreadCount,
  };

  return (
    <DashboardShell user={sessionUser}>
      {children}
    </DashboardShell>
  );
}
