import { adminLogin } from "@/app/actions/admin-auth";
import { ShieldAlert } from "lucide-react";

export default async function AdminLoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;
  const hasError = params.error === "InvalidCredentials";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500">
      <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">

        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-orange-500 to-red-500"></div>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Otoritas Master
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Portal eksklusif rahasia untuk pemilik platform.
          </p>
        </div>

        {hasError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-semibold px-4 py-3 rounded-lg text-center">
            Email atau Sandi Otoritas ditolak!
          </div>
        )}

        <form action={adminLogin} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Master</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                className="block w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition sm:text-sm"
                placeholder="admin@freelance.link"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kata Sandi (Passcode)</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="off"
                className="block w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition sm:text-sm"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95"
          >
            Akses Panel Admin &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
