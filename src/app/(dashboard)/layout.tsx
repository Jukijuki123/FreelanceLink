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

  const unreadCount = await getUnreadMessagesCount();

  const sessionUser = {
    name: user.name,
    role: user.role,
    balance: user.balance,
    avatarUrl: user.avatarUrl,
    unreadCount, // Sisipkan ke data user
  };

  return (
    <DashboardShell user={sessionUser}>
      {children}
    </DashboardShell>
  );
}
