import { registerUser } from "@/app/actions/register";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-[100px] md:rounded-b-[200px] -z-10"></div>
      
      <Link href="/" className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 font-medium transition">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 mt-6 md:mt-0">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
              F
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Daftar FreelanceLink
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Mulai karir atau cari talenta terbaik hari ini.
          </p>
        </div>

        <form action={registerUser} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Juki Sadikin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="juki@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Saya mendaftar sebagai:</label>
              <select
                name="role"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="FREELANCER">Freelancer</option>
                <option value="COMPANY">Perusahaan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Keahlian (Pisahkan dengan koma)</label>
              <input
                name="skills"
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="React, Next.js, Tailwind"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Daftar Akun
            </button>
          </div>
          <Link href="/login" className="font-medium flex justify-center text-blue-600 hover:text-blue-500">
            Sudah memiliki akun
          </Link>
        </form>
      </div>
    </div>
  );
}