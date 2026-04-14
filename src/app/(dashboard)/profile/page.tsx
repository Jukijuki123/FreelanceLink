import { db } from "@/lib/db";
import { getSession } from "@/app/actions/chat";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import { User, Settings } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/login");

  // Format data untuk dikirim ke Client Component
  const u = user as any;
  const sanitizedUser = {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    skills: u.skills || [],
    location: u.location || null,
    website: u.website || null,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" /> Profil Saya
            </h1>
            <p className="mt-2 text-gray-600 font-medium">
              Kelola informasi profil dan pengaturan akun Anda di sini.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-500 text-sm font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" /> Account Settings
          </div>
        </div>

        {/* Profile Form Component */}
        <ProfileForm user={sanitizedUser} />

      </div>
    </div>
  );
}
