import { db } from "@/lib/db";
import { cookies } from "next/headers";
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

export default async function JobsPage() {
  const session = await getSession();
  const jobs = await db.job.findMany({
    orderBy: { id: "desc" }, // Simple sorting
    include: { company: true }
  });

  const userApps = session?.role === "FREELANCER" 
    ? await db.application.findMany({ where: { freelancerId: session.userId } })
    : [];
  const appliedJobIds = new Set(userApps.map(app => app.jobId));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Papan Lowongan Kerja</h1>
            <p className="mt-2 text-sm text-gray-600">
              Temukan proyek menarik atau posting lowongan baru.
            </p>
          </div>
          {session?.role === "COMPANY" && (
            <div className="flex gap-2">
              <Link
                href="/jobs/my-jobs"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
              >
                Dashboard Pelamar
              </Link>
              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Post Lowongan
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">Belum ada lowongan pekerjaan.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {job.company.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.status}
                    </span>
                    {appliedJobIds.has(job.id) && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Sudah Dilamar
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    Rp {new Intl.NumberFormat("id-ID").format(job.budget)}
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Detail
                    </button>
                    {session?.role === "FREELANCER" && !appliedJobIds.has(job.id) && (
                      <Link
                        href={`/jobs/${job.id}/apply`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Lamar
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
  );
}
