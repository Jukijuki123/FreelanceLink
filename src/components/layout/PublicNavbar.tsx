import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function PublicNavbar() {
  const session = await getSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xl font-black shadow-md">
              F
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
              FreelanceLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#cara-kerja" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Cara Kerja
            </Link>
            <Link href="#kategori" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Cari Jasa
            </Link>
            <Link href="#mengapa-kami" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Tentang Kami
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/jobs"
                className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-blue-600 font-bold hover:text-blue-800 transition px-2"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 text-sm sm:text-base"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
