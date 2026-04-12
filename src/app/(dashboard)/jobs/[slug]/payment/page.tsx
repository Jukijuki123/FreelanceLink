import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { payJobAd } from "@/app/actions/payments";
import { buyJobPackage } from "@/app/actions/ads";
import Link from "next/link";

async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  return JSON.parse(sessionValue);
}

export default async function PaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { slug: slug },
  });

  const company = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!job || job.companyId !== session.userId || !company) {
    redirect("/jobs/my-jobs");
  }

  // Jika sudah dibayar (atau tidak expired), kembali ke dashboard
  if (job.isPaidAd && job.expiresAt && job.expiresAt > new Date()) {
    redirect("/jobs/my-jobs");
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promosikan Lowongan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Agar lowongan <strong className="text-gray-900">"{job.title}"</strong> muncul di Papan Publik, pilih masa aktif tayang.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 flex justify-between items-center text-sm">
        <div>
          <span className="text-emerald-700 font-semibold">Tersedia di Dompet Anda: </span>
          <span className="font-black text-emerald-700 text-lg ml-1">Rp {new Intl.NumberFormat("id-ID").format(company.balance)}</span>
        </div>
        <Link href="/jobs/my-jobs" className="text-emerald-600 font-medium hover:underline">Isi Saldo Simulator</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Package 1 */}
        <form action={buyJobPackage.bind(null, job.id, 7, 15000)} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:border-blue-500 transition-all flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Paket 1 Minggu</h3>
            <p className="text-sm text-gray-500 mt-1">Tayang selama 7 Hari.</p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-black text-blue-600">Rp 15.000</p>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors active:scale-95">
            Beli Paket Ini
          </button>
        </form>

        {/* Package 2 */}
        <form action={buyJobPackage.bind(null, job.id, 14, 30000)} className="relative bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:border-blue-500 transition-all flex flex-col">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
            Rekomendasi
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Paket 2 Minggu</h3>
            <p className="text-sm text-gray-500 mt-1">Tayang selama 14 Hari.</p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-black text-blue-600">Rp 30.000</p>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors active:scale-95">
            Beli Paket Ini
          </button>
        </form>

        {/* Package 3 */}
        <form action={buyJobPackage.bind(null, job.id, 30, 50000)} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:border-blue-500 transition-all flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Paket 1 Bulan</h3>
            <p className="text-sm text-gray-500 mt-1">Tayang penuh 30 Hari.</p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-black text-blue-600">Rp 50.000</p>
            <p className="text-xs text-gray-400 mt-1 line-through">Normal: Rp 60.000</p>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors active:scale-95">
            Beli Paket Ini
          </button>
        </form>

      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Pembayaran di atas memotong langsung dari saldo (Dompet) di akun Perusahaan Anda.<br />
        <Link href="/jobs/my-jobs" className="text-blue-600 hover:underline mt-2 inline-block">Batal dan kembali ke Dashboard</Link>
      </div>
    </div>
  );
}
