"use client";

import { useState } from "react";
import { topUpBalance } from "@/app/actions/topup";
import { Wallet, X, CheckCircle2, Loader2 } from "lucide-react";

export default function TopUpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTopUp = async (amount: number) => {
    setIsLoading(true);
    try {
      await topUpBalance(amount);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (e) {
      alert("Gagal melakukan topup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full absolute inset-0 rounded-full cursor-pointer hover:bg-emerald-100/20 transition z-10"
        title="Isi Saldo Simulator"
        aria-label="Top Up Saldo"
      />

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Simulator Top Up</h3>
              <p className="text-gray-500 text-sm mt-2">Pilih nominal saldo uji coba untuk mensimulasikan sistem escrow.</p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <p className="text-lg font-bold text-gray-900">Top Up Berhasil!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[1000000, 5000000, 10000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTopUp(amount)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition font-bold text-gray-900 group disabled:opacity-50"
                  >
                    <span>Rp {new Intl.NumberFormat("id-ID").format(amount)}</span>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : (
                      <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition text-sm">Pilih &rarr;</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
