import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminLogout } from "@/app/actions/admin-auth";
import { ShieldAlert, Wallet, TrendingUp, AlertCircle, Database, LogOut } from "lucide-react";

export const metadata = {
  title: "Admin Super Secret Panel",
};

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

  // Verifikasi Otoritas Admin
  if (!isAdmin) {
    redirect("/admin/login");
  }

  // 1. Kalkulasi Uang yang Sedang Tertahan (Escrow Aktif)
  const ongoingJobs = await db.job.aggregate({
    where: { status: "ONGOING" },
    _sum: { budget: true },
  });
  const totalEscrowHeld = ongoingJobs._sum.budget ?? 0;

  // 2. Kalkulasi Estimasi Keuntungan Escrow (Berdasarkan pekerjaan selesai * 5%)
  const completedJobs = await db.job.aggregate({
    where: { status: "COMPLETED" },
    _sum: { budget: true },
    _count: true,
  });

  const totalCompletedVolume = completedJobs._sum.budget ?? 0;
  const escrowRevenue = totalCompletedVolume * 0.05; // 5% Admin Fee

  // 3. Kalkulasi Pendapatan Iklan Bersih
  const adRevenueAggr = await db.job.aggregate({
    _sum: { adFeePaid: true }
  });
  const adRevenue = adRevenueAggr._sum.adFeePaid ?? 0;

  const totalRevenue = escrowRevenue + adRevenue;

  // 4. Info Semua Pekerjaan
  const totalJobsCount = await db.job.count();

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100 font-sans selection:bg-indigo-500">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Otoritas Platform</h1>
              <p className="text-slate-400 text-sm font-medium">Halaman Laporan Arus Kas Eksklusif Pemilik Aplikasi.</p>
            </div>
          </div>
          
          <form action={adminLogout}>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-sm font-bold transition border border-slate-700 hover:border-red-500/50">
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </form>
        </div>

        {/* Notifikasi Rahasia */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start text-blue-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">Halaman ini <strong>TIDAK DAPAT DIBACA</strong> oleh publik. Nilai yang ditampilkan adalah kalkulasi mutakhir (Real-Time) berdasar jumlah anggaran pada database di seluruh perputaran aplikasi.</p>
        </div>

        {/* Kartu Finansial (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Escrow Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-500">
              <Database className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-center gap-3 text-orange-400 mb-4 font-semibold text-sm tracking-widest uppercase">
              <Wallet className="w-4 h-4" />
              Dana Escrow Ditahan
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              Rp {new Intl.NumberFormat("id-ID").format(totalEscrowHeld)}
            </div>
            <p className="text-slate-500 text-xs mt-2">Dana yang wajib Anda tahan untuk mengamankan proyek ONGOING.</p>
          </div>

          {/* Revenue Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-500">
              <TrendingUp className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 text-emerald-400 mb-4 font-semibold text-sm tracking-widest uppercase">
              <ShieldAlert className="w-4 h-4" />
              Total Keuntungan Bersih
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              Rp {new Intl.NumberFormat("id-ID").format(totalRevenue)}
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400 font-medium">
              <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                <span>Fee Escrow (5%)</span>
                <span className="text-white">Rp {new Intl.NumberFormat("id-ID").format(escrowRevenue)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                <span>Direct Ads (Paket)</span>
                <span className="text-white">Rp {new Intl.NumberFormat("id-ID").format(adRevenue)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
