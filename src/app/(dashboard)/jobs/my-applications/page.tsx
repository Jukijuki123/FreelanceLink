import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, Briefcase } from "lucide-react";

async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  try {
    return JSON.parse(sessionValue);
  } catch (e) {
    return null;
  }
}

export default async function FreelancerDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "FREELANCER") {
    redirect("/login");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!currentUser) redirect("/login");

  const applications = await db.application.findMany({
    where: { freelancerId: session.userId },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
            <Clock className="w-3.5 h-3.5" /> Menunggu Keputusan
          </span>
        );
      case "ONGOING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" /> Sedang Dikerjakan (Dana di Escrow)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Papan Lowongan
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Halo, {currentUser.name}!</h1>
            <p className="mt-1 text-gray-600">Kelola lamaran pekerjaan dan proyek Anda di sini.</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 min-w-[200px]">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total Saldo Pendapatan</p>
            <p className="text-3xl font-black text-blue-900 tracking-tight">
              Rp {new Intl.NumberFormat("id-ID").format(currentUser.balance)}
            </p>
          </div>
        </div>

        {/* Applications List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            Riwayat Lamaran &amp; Proyek
          </h2>
          
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center border border-dashed border-gray-300">
                <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada lamaran</h3>
                <p className="text-gray-500 text-sm">Anda belum melamar pekerjaan apa pun. Cari lowongan menarik di papan pekerjaan utama.</p>
                <Link href="/jobs" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Cari Pekerjaan
                </Link>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{app.job.title}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Perusahaan: <span className="text-gray-900">{app.job.company.name}</span>
                      </p>
                      
                      {app.proposal && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Proposal Anda:</p>
                          <p className="text-sm text-gray-700 italic line-clamp-2">"{app.proposal}"</p>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col gap-2 sm:items-end">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Nilai Proyek</p>
                        <p className="text-base font-bold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(app.job.budget)}</p>
                      </div>
                      
                      {/* Action buttons if ONGOING or COMPLETED */}
                      {app.status === "ONGOING" && (
                        <Link href={`/jobs/${app.job.slug || app.job.id}`} className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition">
                          Cek Proyek & Chat
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
