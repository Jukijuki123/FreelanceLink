import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { payJobAd } from "@/app/actions/payments";
import Link from "next/link";

async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  return JSON.parse(sessionValue);
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.companyId !== session.userId) {
    redirect("/jobs/my-jobs");
  }

  // Jika sudah dibayar, kembali ke dashboard
  if (job.isPaidAd) {
    redirect("/jobs/my-jobs");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Payment Gateway (Mockup)</h2>
          <p className="text-blue-100 text-sm mt-1">Simulasi Pembayaran Iklan Lowongan</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Detail Tagihan</h3>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-700">Iklan Lowongan:</span>
              <span className="font-medium text-gray-800">{job.title}</span>
            </div>
            <div className="flex justify-between items-center mb-1 text-sm text-gray-500">
              <span>Budget Proyek:</span>
              <span>Rp {new Intl.NumberFormat("id-ID").format(job.budget)}</span>
            </div>
            <div className="border-t my-3"></div>
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total Tagihan:</span>
              <span>Rp 50.000</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">* Biaya flat placement iklan lowongan.</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-900">
                Ini adalah halaman simulasi pembayaran. Klik konfirmasi di bawah untuk memproses status bahwa iklan telah dibayar dan dapat ditampilkan ke publik.
              </p>
            </div>

            <form action={payJobAd.bind(null, jobId)} className="flex flex-col gap-3 pt-2">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Metode Pembayaran</label>
                <select className="block w-full border border-gray-300 text-gray-600 rounded-md py-2.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white shadow-sm">
                  <option>Transfer Bank (BCA Virtual Account)</option>
                  <option>Transfer Bank (Mandiri Virtual Account)</option>
                  <option>E-Wallet (GoPay)</option>
                  <option>E-Wallet (OVO)</option>
                  <option>Kartu Kredit / Debit</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-colors"
              >
                Konfirmasi Pembayaran
              </button>
              <Link
                href="/jobs/my-jobs"
                className="text-center w-full py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batalkan Transaksi
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
