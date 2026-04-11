import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { completeProjectAndPayout } from "@/app/actions/payments";
import { rejectApplication } from "@/app/actions/applications";
import { initiateChat } from "@/app/actions/chat";

export default async function MyJobsPage() {
  const session = await getSession();

  if (!session || session.role !== "COMPANY") {
    redirect("/login");
  }

  const myJobs = await db.job.findMany({
    where: { companyId: session.userId },
    include: {
      apps: {
        include: {
          freelancer: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Perusahaan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Kelola lowongan dan pelamar Anda.
        </p>
      </div>

      <div className="space-y-8">
        {myJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Anda belum memposting lowongan apapun.</p>
            <Link href="/jobs/create" className="text-blue-600 font-medium mt-2 inline-block">Post Lowongan Sekarang</Link>
          </div>
        ) : (
          myJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Status: {job.status}</p>
                  {job.status === "OPEN" && !job.isPaidAd && (
                    <span className="inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded bg-orange-100 text-orange-800 tracking-wide uppercase">
                      Belum Bayar Iklan
                    </span>
                  )}
                  {job.isPaidAd && job.status === "OPEN" && (
                    <span className="inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                      Iklan Aktif
                    </span>
                  )}
                  {job.status === "ONGOING" && (
                    <span className="inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 tracking-wide uppercase">
                      Proyek Sedang Berjalan
                    </span>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-black text-emerald-600 text-lg">Rp {new Intl.NumberFormat("id-ID").format(job.budget)}</p>
                  <p className="text-sm text-blue-600 font-semibold mb-2">{job.apps.length} Pelamar</p>
                  {!job.isPaidAd && job.status === "OPEN" && (
                    <Link href={`/jobs/${job.id}/payment`} className="mt-2 text-xs font-bold px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      Bayar Iklan
                    </Link>
                  )}
                  {job.status === "ONGOING" && (
                    <form action={completeProjectAndPayout.bind(null, job.id)} className="mt-2 border-t border-gray-200 pt-3 text-right">
                      <button type="submit" className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow shadow-emerald-200 transition">
                        Selesaikan Proyek & Cairkan Dana (Rp {new Intl.NumberFormat("id-ID").format(job.budget * 0.95)})
                      </button>
                      <p className="text-xs text-orange-600 font-medium mt-1">Potongan Admin 5% (Rp {new Intl.NumberFormat("id-ID").format(job.budget * 0.05)})</p>
                    </form>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daftar Pelamar:</h3>
                {job.apps.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Belum ada yang melamar ke lowongan ini.</p>
                ) : (
                  <div className="grid gap-4">
                    {job.apps.map((app) => (
                      <div key={app.id} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-extrabold text-gray-900 text-lg">{app.freelancer.name}</h4>
                          <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-800 rounded uppercase tracking-wide">
                            {app.status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            <strong className="text-gray-900">Proposal:</strong><br />{app.proposal}
                          </p>
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-max"
                            >
                              📎 Lihat CV / Portofolio
                            </a>
                          )}
                        </div>

                        <div className="mt-5 flex gap-3 pt-4 border-t border-gray-50">
                          {job.status === "OPEN" && app.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Link href={`/jobs/${job.id}/escrow/${app.id}`} className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow shadow-emerald-200 transition">
                                Terima & Setor Escrow
                              </Link>
                              <form action={rejectApplication}>
                                <input type="hidden" name="appId" value={app.id} />
                                <button type="submit" className="text-xs font-bold px-4 py-2 border border-red-200 text-red-600 rounded bg-red-50 hover:bg-red-100 transition">
                                  Tolak
                                </button>
                              </form>
                            </div>
                          )}
                          {app.status === "ACCEPTED" && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded flex items-center">
                              ✓ Pelamar Terpilih
                            </span>
                          )}
                          {app.status === "REJECTED" && (
                            <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-2 rounded flex items-center">
                              ✕ Ditolak
                            </span>
                          )}
                          <form action={initiateChat.bind(null, app.freelancerId)}>
                            <button type="submit" className="text-xs font-bold px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 shadow-sm rounded hover:bg-blue-100 transition flex items-center gap-1">
                              💬 Chat
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
