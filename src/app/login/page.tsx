"use client";

import { loginUser } from "@/app/actions/login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Tampilkan toast loading
    const loadingToast = toast.loading("Sedang masuk...");
    
    try {
      const res = await loginUser(formData);
      
      if (res?.error) {
        toast.error(res.error, { id: loadingToast });
      } else if (res?.success) {
        toast.success("Berhasil masuk!", { id: loadingToast });
        setTimeout(() => {
          router.push(res.redirectUrl || "/jobs");
        }, 1000);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: loadingToast });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-[100px] md:rounded-b-[200px] -z-10"></div>

      <Link href="/" className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 font-medium transition">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Image
              src="/logo.png"
              alt="FreelanceLink Logo"
              width={60}
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Masuk FreelanceLink
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Masuk untuk memulai petualangan Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
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
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Masuk
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
