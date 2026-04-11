import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { MonitorPlay, PenTool, Code2, LineChart, Megaphone, LayoutList, ShieldCheck, Zap, Handshake } from "lucide-react";

const CATEGORIES = [
  { name: "Web Development", icon: Code2, count: "1,200+ Freelancer" },
  { name: "Desain Grafis", icon: PenTool, count: "850+ Freelancer" },
  { name: "Video Editing", icon: MonitorPlay, count: "420+ Freelancer" },
  { name: "Digital Marketing", icon: Megaphone, count: "630+ Freelancer" },
  { name: "Data Analisis", icon: LineChart, count: "310+ Freelancer" },
  { name: "Lainnya", icon: LayoutList, count: "5,000+ Freelancer" }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-blue-200">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-4">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-blue-100 via-emerald-50 to-transparent rounded-full blur-3xl -z-10"></div>

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Pusat Keunggulan Freelance <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-emerald-400">
                Aman, Cepat, dan Profesional.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Jelajahi ribuan freelancer lokal berbakat atau temukan pekerjaan proyek impian Anda dengan sistem pembayaran <span className="font-bold text-gray-800">Escrow</span> 100% aman.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/register" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition duration-300">
                Mulai Mencari Talenta
              </Link>
              <Link href="/register" className="px-8 py-4 rounded-full bg-white text-gray-800 border-2 border-gray-200 font-bold text-lg hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 transition duration-300">
                Pekerjaan Freelance
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST SIGNALS */}
        <section className="border-y border-gray-200 bg-white py-12 px-4 shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Dipercaya oleh ribuan profesional dan startup</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex flex-col items-center pt-8 md:pt-0">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sistem Escrow Teraman</h3>
                <p className="text-gray-500 text-sm max-w-xs">Dana aman ditahan oleh sistem kami hingga proyek Anda selesai sesuai kesepakatan.</p>
              </div>
              <div className="flex flex-col items-center pt-8 md:pt-0">
                <Zap className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Penawaran Kilat</h3>
                <p className="text-gray-500 text-sm max-w-xs">Dapatkan pelamar dan proposal proyek dalam hitungan jam, bukan hari.</p>
              </div>
              <div className="flex flex-col items-center pt-8 md:pt-0">
                <Handshake className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tanpa Biaya Tersembunyi</h3>
                <p className="text-gray-500 text-sm max-w-xs">Kami transparan 100%. Hanya potongan admin kecil saat transaksi berhasil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section id="kategori" className="py-24 bg-gray-50 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Telusuri Spesialisasi</h2>
                <p className="text-gray-600 mt-2 font-medium">Temukan layanan yang paling tepat dari 10.000+ tenaga ahli.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <Link href="/register" key={idx} className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">{category.count}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="cara-kerja" className="py-24 bg-white px-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-16">Tiga Langkah Sederhana</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">

              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-[40px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-0"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white border-8 border-gray-50 shadow-md flex items-center justify-center font-black text-2xl text-blue-600 mb-6 font-mono">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Buat Lowongan</h3>
                <p className="text-gray-500 font-medium">Jelaskan proyek Anda atau target yang ingin dicapai secara detail. Klien/perusahaan bebas mendaftar.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white border-8 border-gray-50 shadow-md flex items-center justify-center font-black text-2xl text-emerald-500 mb-6 font-mono">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pilih Freelancer</h3>
                <p className="text-gray-500 font-medium">Tinjau proposal, cek portofolio, negosiasi lewat Chat Real-Time dan pilih talenta andalan Anda.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white border-8 border-gray-50 shadow-md flex items-center justify-center font-black text-2xl text-orange-500 mb-6 font-mono">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Bayar via Escrow</h3>
                <p className="text-gray-500 font-medium">Lakukan deposit. Dana otomatis dirilis ke freelancer HANYA setelah hasil pekerjaan disetujui.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-400 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Siap mewujudkan proyek sukses Anda berikutnya?</h2>
            <p className="text-blue-100 text-lg mb-10 font-medium max-w-xl mx-auto">Bergabunglah dengan ekosistem kami dan rasakan transformasi kecepatan bekerja.</p>
            <Link href="/register" className="inline-block px-10 py-5 rounded-full bg-white text-blue-900 font-bold text-xl hover:bg-emerald-400 hover:text-white hover:shadow-2xl transition duration-300">
              Buat Akun Gratis Sekarang
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
