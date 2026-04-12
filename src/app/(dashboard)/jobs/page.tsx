import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function JobsPage() {
  const session = await getSession();

  const jobs = await db.job.findMany({
    where: { 
      isPaidAd: true,
      expiresAt: { gt: new Date() }
    },
    orderBy: { id: "desc" },
    include: { company: true }
  });

  const userApps = session?.role === "FREELANCER"
    ? await db.application.findMany({ where: { freelancerId: session.userId } })
    : [];
  const appliedJobIds = new Set(userApps.map(app => app.jobId));

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Papan Lowongan Kerja</h1>
          <p className="mt-2 text-sm text-gray-600">
            Temukan proyek menarik atau posting lowongan baru.
          </p>
        </div>
        {session?.role === "COMPANY" && (
          <Link
            href="/jobs/create"
            className="inline-flex items-center justify-center px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            + Buat Lowongan Baru
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Belum ada lowongan pekerjaan.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:border-blue-200 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {job.company.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    {job.status}
                  </span>
                  {appliedJobIds.has(job.id) && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Sudah Dilamar
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-lg font-black text-emerald-600">
                  Rp {new Intl.NumberFormat("id-ID").format(job.budget)}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition"
                  >
                    Detail
                  </Link>
                  {session?.role === "FREELANCER" && !appliedJobIds.has(job.id) && (
                    <Link
                      href={`/jobs/${job.slug}/apply`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
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
  );
}
