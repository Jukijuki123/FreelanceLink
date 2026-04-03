import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

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
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(job.budget)}</p>
                    <p className="text-sm text-blue-600">{job.apps.length} Pelamar</p>
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
                            <button className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700">Terima & Chat</button>
                            <button className="text-xs font-semibold px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-100">Tolak</button>
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
