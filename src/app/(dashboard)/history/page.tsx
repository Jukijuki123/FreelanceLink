import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

export const metadata = {
  title: "Riwayat Transaksi - FreelanceLink",
};

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const transactions = await db.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="mt-2 text-sm text-gray-600">
          Transparansi aliran dana Anda. Semua riwayat escrow, pencairan, dan pembayaran tercatat di sini.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Belum ada transaksi sama sekali.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((trx) => {
              // Menentukan apakah uang masuk atau keluar
              const isIncome = trx.type === "PAYOUT";
              const isExpense = trx.type === "DEPOSIT_ESCROW" || trx.type === "BUY_AD";

              return (
                <li key={trx.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isIncome ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {isIncome ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{trx.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {trx.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${isIncome ? "text-emerald-600" : "text-gray-900"}`}>
                      {isIncome ? "+" : "-"} Rp {new Intl.NumberFormat("id-ID").format(trx.amount)}
                    </p>
                    <p className="text-xs font-semibold text-emerald-500 mt-1 uppercase">
                      {trx.status}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
