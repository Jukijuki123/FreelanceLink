import { db } from "@/lib/db";
import { applyToJob } from "@/app/actions/applications";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
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

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "FREELANCER") {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return notFound();
  }

  // Cek apakah sudah pernah melamar
  const existingApp = await db.application.findFirst({
    where: {
      jobId: id,
      freelancerId: session.userId,
    },
  });

  if (existingApp) {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-8 border-b pb-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Lamar Pekerjaan
          </h2>
          <p className="mt-4 text-xl font-semibold text-blue-600">{job.title}</p>
          <p className="mt-1 text-sm text-gray-500">Perusahaan: {job.company.name}</p>
          <div className="mt-4 text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
            {job.description}
          </div>
        </div>

        <form action={applyToJob} className="space-y-6">
          <input type="hidden" name="jobId" value={job.id} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Proposal / Penawaran Anda</label>
            <p className="mt-1 text-xs text-gray-500">
              Jelaskan alasan Anda adalah kandidat terbaik dan bagaimana Anda akan menyelesaikan proyek ini.
            </p>
            <textarea
              name="proposal"
              rows={6}
              required
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Saya memiliki pengalaman 5 tahun di bidang..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link CV / Portofolio (Opsional)</label>
            <p className="mt-1 text-xs text-gray-500">
              Masukkan link Google Drive, Dropbox, atau website portofolio Anda.
            </p>
            <input
              name="resumeUrl"
              type="url"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="flex items-center justify-between pt-6">
            <Link
              href="/jobs"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Kirim Lamaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
