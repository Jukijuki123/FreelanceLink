import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Calendar, Clock, DollarSign, Wallet } from "lucide-react";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  const job = await db.job.findUnique({
    where: { slug },
    include: { company: true },
  });

  if (!job) {
    redirect("/jobs"); // Atau bisa tampilkan halaman 404
  }

  // Cek apakah freelancer sudah melamar ke lowongan ini
  let hasApplied = false;
  if (session?.role === "FREELANCER") {
    const application = await db.application.findFirst({
      where: {
        jobId: job.id,
        freelancerId: session.userId,
      },
    });
    if (application) hasApplied = true;
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
      <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Papan Lowongan
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 md:p-10 border-b border-gray-100 bg-linear-to-b from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}
                `}>
                  {job.status}
                </span>
                {job.isPaidAd && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    Sponsor
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 mt-4">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {job.company.name}
                </div>
                {job.expiresAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Berakhir: {job.expiresAt.toLocaleDateString('id-ID')}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col md:items-end p-4 md:p-6 bg-emerald-50 rounded-xl border border-emerald-100 h-fit">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Anggaran
              </span>
              <span className="text-2xl md:text-3xl font-black text-emerald-900">
                Rp {new Intl.NumberFormat("id-ID").format(job.budget)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Deskripsi Pekerjaan
              </h3>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Informasi Perusahaan</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                  {job.company.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{job.company.name}</p>
                  <p className="text-xs font-medium text-gray-500 line-clamp-1">{job.company.email}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {session?.role === "FREELANCER" && (
              <div className="sticky top-24 pt-4 border-t border-gray-100">
                {hasApplied ? (
                  <div className="w-full p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                    <p className="text-orange-800 font-bold mb-1">Sudah Dilamar</p>
                    <p className="text-xs text-orange-600">Anda telah mengirim proposal ke lowongan ini.</p>
                    <Link href="/jobs/my-applications" className="mt-3 block w-full py-2 bg-white text-orange-700 text-sm font-bold rounded shadow-sm border border-orange-200 hover:bg-orange-100 transition">
                      Cek Status Lamaran
                    </Link>
                  </div>
                ) : job.status === "OPEN" ? (
                  <Link
                    href={`/jobs/${job.slug}/apply`}
                    className="flex w-full items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                  >
                    Kirim Lamaran Sekarang
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                    Lowongan Ditutup
                  </button>
                )}
              </div>
            )}

            {session?.role === "COMPANY" && session.userId === job.companyId && (
              <div className="pt-4 border-t border-gray-100">
                <Link href="/jobs/my-jobs" className="block w-full py-2.5 bg-gray-900 text-white text-center rounded-lg text-sm font-bold hover:bg-gray-800 transition">
                  Kelola Pelamar
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
