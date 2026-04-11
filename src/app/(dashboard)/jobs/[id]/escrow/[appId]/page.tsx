import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { acceptAndDeposit } from "@/app/actions/payments";
import Link from "next/link";

async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  if (!sessionValue) return null;
  return JSON.parse(sessionValue);
}

export default async function EscrowPaymentPage({ params }: { params: Promise<{ id: string, appId: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  const appId = resolvedParams.appId;

  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
  });

  const app = await db.application.findUnique({
    where: { id: appId },
    include: { freelancer: true },
  });

  if (!job || job.companyId !== session.userId || !app || app.jobId !== jobId) {
    redirect("/jobs/my-jobs");
  }

  // Jika sudah tidak open, kembali ke dashboard
  if (job.status !== "OPEN" || app.status !== "PENDING") {
    redirect("/jobs/my-jobs");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Escrow Deposit</h2>
          <p className="text-green-100 text-sm mt-1">Pembayaran Aman via Rekening Bersama</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Detail Escrow</h3>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-700">Proyek:</span>
              <span className="font-medium text-right max-w-[200px] truncate">{job.title}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-700">Freelancer:</span>
              <span className="font-medium text-right">{app.freelancer.name}</span>
            </div>
            <div className="border-t my-3"></div>
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total Deposit:</span>
              <span>Rp {new Intl.NumberFormat("id-ID").format(job.budget)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">* Dana ini akan ditahan oleh sistem dan baru diteruskan ke Freelancer (setelah dipotong fee aplikasi 5%) persis setelah Anda menyetujui hasil kerja atau mencairkannya di dashboard.</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <p className="text-sm text-yellow-900">
                Dengan menekan "Setor Dana", sistem (mockup) akan menganggap dana Anda sudah kami terima dan status proyek berubah menjadi <strong>Sedang Berjalan (ONGOING)</strong>.
              </p>
            </div>

            <form action={acceptAndDeposit} className="flex flex-col gap-3 pt-2">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Metode Pembayaran</label>
                <select className="block w-full border border-gray-300 rounded-md py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white shadow-sm">
                  <option>Transfer Bank (BCA Virtual Account)</option>
                  <option>Transfer Bank (Mandiri Virtual Account)</option>
                  <option>E-Wallet (GoPay)</option>
                  <option>E-Wallet (OVO)</option>
                  <option>Escrow Balance Platform</option>
                </select>
              </div>
              <input type="hidden" name="appId" value={appId} />
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-colors"
              >
                Setor Dana Terjamin Rp {new Intl.NumberFormat("id-ID").format(job.budget)}
              </button>
              <Link
                href="/jobs/my-jobs"
                className="text-center w-full py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batalkan & Kembali
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
