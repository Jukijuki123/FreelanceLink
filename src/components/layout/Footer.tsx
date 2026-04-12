import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="FreelanceLink Logo"
                width={60}
                height={60}
                priority
                className="object-contain"
              />
              <span className="text-xl font-black tracking-tight text-white">
                FreelanceLink
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Platform marketplace tenaga kerja lepas teraman dan terpercaya di Indonesia. Mempertemukan talenta terbaik dengan peluang tak terbatas.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Untuk Klien</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="hover:text-blue-400 transition">Cara Mempekerjakan</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition">Garansi Uang Kembali</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition">Review Freelancer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Untuk Freelancer</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="hover:text-blue-400 transition">Cara Mendapatkan Proyek</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition">Sistem Escrow Teraman</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition">Tips Sukses</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Bantuan & Info</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition">Pusat Bantuan</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} FreelanceLink Inc. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <span className="text-blue-500 font-bold">Aman.</span>
            <span className="text-emerald-500 font-bold">Cepat.</span>
            <span className="text-orange-500 font-bold">Terpercaya.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
