import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { completeProjectAndPayout } from "@/app/actions/payments";
import { rejectApplication } from "@/app/actions/applications";

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Perusahaan</h1>

        <div className="space-y-8">
          {myJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Anda belum memposting lowongan apapun.</p>
              <Link href="/jobs/create" className="text-blue-600 font-medium mt-2 inline-block">Post Lowongan Sekarang</Link>
            </div>
          ) : (
            myJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                    <p className="text-sm text-gray-500">Status: {job.status}</p>
                    {job.status === "OPEN" && !job.isPaidAd && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-200">
                        Belum Bayar Iklan
                      </span>
                    )}
                    {job.isPaidAd && job.status === "OPEN" && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-200">
                        Iklan Aktif
                      </span>
                    )}
                    {job.status === "ONGOING" && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                        Proyek Sedang Berjalan
                      </span>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(job.budget)}</p>
                    <p className="text-sm text-blue-600 mb-2">{job.apps.length} Pelamar</p>
                    {!job.isPaidAd && job.status === "OPEN" && (
                      <Link href={`/jobs/${job.id}/payment`} className="mt-2 text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Bayar Iklan
                      </Link>
                    )}
                    {job.status === "ONGOING" && (
                      <form action={completeProjectAndPayout.bind(null, job.id)} className="mt-2 border-t pt-2 text-right">
                        <button type="submit" className="text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Selesaikan Proyek & Cairkan Dana (Rp {new Intl.NumberFormat("id-ID").format(job.budget * 0.95)})
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Potongan Admin 5% (Rp {new Intl.NumberFormat("id-ID").format(job.budget * 0.05)})</p>
                      </form>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Pelamar:</h3>
                  {job.apps.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Belum ada yang melamar ke lowongan ini.</p>
                  ) : (
                    <div className="grid gap-4">
                      {job.apps.map((app) => (
                        <div key={app.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{app.freelancer.name}</h4>
                            <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                              {app.status}
                            </span>
                          </div>

                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                              <strong>Proposal:</strong> {app.proposal}
                            </p>
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                📎 Lihat CV / Portofolio
                              </a>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            {job.status === "OPEN" && app.status === "PENDING" && (
                              <div className="flex gap-2">
                                <Link href={`/jobs/${job.id}/escrow/${app.id}`} className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700">
                                  Terima & Setor Escrow
                                </Link>
                                <form action={rejectApplication}>
                                  <input type="hidden" name="appId" value={app.id} />
                                  <button type="submit" className="text-xs font-semibold px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50">
                                    Tolak
                                  </button>
                                </form>
                              </div>
                            )}
                            {app.status === "ACCEPTED" && (
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Pelamar Terpilih</span>
                            )}
                            {app.status === "REJECTED" && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Ditolak</span>
                            )}
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
    </div>
  );
}
