import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomeFeaturedHomestays from "@/components/home/HomeFeaturedHomestays";
import HomeArticlesSection from "@/components/home/HomeArticlesSection";
import HomeCategoryPills from "@/components/home/HomeCategoryPills";
import HomePopularHomestays from "@/components/home/HomePopularHomestays";
import HomeNeighborhoodsSection from "@/components/home/HomeNeighborhoodsSection";
import HomePromosSection from "@/components/home/HomePromosSection";
import HomePropertyCount from "@/components/home/HomePropertyCount";
import { WebsiteJsonLd } from "@/components/seo/SeoComponents";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  ReceiptText,
  Headphones,
  DoorOpen,
  Home,
  PlusCircle,
  MessageCircle,
  CheckCircle2,
  Heart,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "adakamar.id — Temukan Kamar Nyaman untuk Perjalananmu di Jogja",
  description:
    "Platform booking homestay #1 di Yogyakarta. Kurasi homestay autentik bergaya Joglo, villa private pool, hingga penginapan budget friendly di sekitar Malioboro, Prawirotaman, dan Kaliurang.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "adakamar.id — Temukan Kamar Nyaman untuk Perjalananmu di Jogja",
    description: "Platform booking homestay #1 di Yogyakarta. Kurasi homestay autentik bergaya Joglo, villa private pool, hingga penginapan budget friendly.",
    url: "https://adakamar.id",
    siteName: "adakamar.id",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "adakamar.id Homestay Yogyakarta" }],
  },
};

const whyItems = [
  {
    icon: ShieldCheck,
    title: "Kurasi & Verifikasi 100%",
    desc: "Setiap homestay dikunjungi langsung oleh tim kurator lokal Jogja yang berpengalaman.",
  },
  {
    icon: ReceiptText,
    title: "Harga Transparan & Pas",
    desc: "Tidak ada biaya tersembunyi. Harga yang tampil adalah harga final yang Anda bayar.",
  },
  {
    icon: Headphones,
    title: "Dukungan Host Lokal 24/7",
    desc: "Tim concierge kami berbasis di Prawirotaman siap membantu dalam bahasa Indonesia.",
  },
  {
    icon: DoorOpen,
    title: "Garansi Kamar Tersedia",
    desc: "Sistem real-time kami memastikan kamar yang Anda pesan benar-benar tersedia.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Website Structured Data — PRD Seksi 20 */}
      <WebsiteJsonLd />
      <Navbar />
      <main className="w-full bg-[#fbf8ff]">
        {/* ─── HERO SECTION ─── */}
        <section className="relative w-full overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-24">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQkRIcJlvibVhgokAsvDunnK-ScGwgtt1DspBTQRdicV-kNVoeboHq0arq7C6aAUJW_cVb_TbKRv16XPq3GiwttJQsP0DuUoHIa-We1vzo-ZiQUvJJmBpaEGJATAL8Ykbr8dlC39KD6zV3DpxXKfLInxtRYZ9Q7zlPyYiAp6GWO4KsROTQEaE7C-u5SqXCCWzQIX9T7H8Xka7k7tmjyZoBNoDk45iaXJ9fp8g0DIxHE7A8WWXHhiwp"
              alt="Joglo villa interior Yogyakarta"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/65 to-[#fbf8ff]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9f3c16]/30 via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center pt-4 sm:pt-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-white/40 mb-6 animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-[#9f3c16]" />
              <span className="text-[11px] font-bold text-[#9f3c16] tracking-wider uppercase">
                Platform Booking Homestay #1 di Yogyakarta
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white max-w-3xl leading-[1.12] tracking-tight mb-4 drop-shadow-sm">
              Temukan Kamar Nyaman untuk Perjalananmu di Jogja
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-lg text-zinc-200/90 max-w-xl mb-8 leading-relaxed">
              Rasakan kehangatan keramahan khas Jogja. Dari joglo autentik di pedesaan asri hingga private pool villa modern di pusat kota.
            </p>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
              <Link
                href="/homestay"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Search className="w-4 h-4 text-amber-200" />
                <span>Jelajahi Homestay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/promo"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-zinc-950/70 hover:bg-zinc-950/90 border border-white/20 backdrop-blur-md text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Promo Spesial</span>
              </Link>
              <Link
                href="/panduan-jogja"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-semibold transition-all hover:scale-105"
              >
                <span>Panduan Wisata</span>
              </Link>
            </div>

            {/* Hero Trust & Stats Capsule */}
            <div className="inline-flex flex-wrap items-center justify-center gap-5 sm:gap-8 px-6 py-3.5 rounded-2xl bg-zinc-950/75 border border-white/15 backdrop-blur-xl text-white shadow-2xl text-xs">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#ffdbcf]" />
                <span className="font-semibold text-zinc-200">500+ Homestay Autentik</span>
              </div>
              <div className="hidden sm:block w-px h-3.5 bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold text-sm">★</span>
                <span className="font-semibold text-zinc-200">4.9/5 Rating Tamu</span>
              </div>
              <div className="hidden sm:block w-px h-3.5 bg-white/20" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-zinc-200">100% Host Lokal Terverifikasi</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CATEGORY FILTER PILLS (Non-sticky modern toolbar) ─── */}
        <section className="w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 py-3.5 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
              <HomeCategoryPills />
            </div>

            <Link
              href="/homestay"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Filter Lengkap</span>
            </Link>
          </div>
        </section>

        {/* ─── FEATURED PROPERTIES (Pilihan Istimewa) ─── */}
        <section className="w-full py-14 sm:py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16]" />
                  Koleksi Teratas
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Pilihan Istimewa Pekan Ini
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
                  Kurasi homestay dengan ulasan tertinggi dan keramahan host terpercaya di sekeliling Yogyakarta.
                </p>
              </div>

              <Link
                href="/homestay"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3c16] hover:underline underline-offset-4"
              >
                <HomePropertyCount />
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <HomeFeaturedHomestays />
          </div>
        </section>

        {/* ─── PROMO BANNER & VOUCHER ─── */}
        <section className="w-full py-16 bg-gradient-to-b from-[#fff6f0] via-zinc-100/60 to-[#fbf8ff] border-y border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-[#9f3c16]" />
                  Penawaran Eksklusif
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Promo & Keuntungan Eksklusif
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
                  Gunakan kode voucher saat reservasi untuk menikmati potongan harga terbaik.
                </p>
              </div>
              <Link
                href="/promo"
                className="text-xs font-bold text-[#9f3c16] hover:underline underline-offset-4 flex items-center gap-1"
              >
                <span>Lihat Semua Promo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <HomePromosSection />
          </div>
        </section>

        {/* ─── POPULAR PROPERTIES (Favorit Komunitas) ─── */}
        <section className="w-full py-14 sm:py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16]" />
                  Favorit Komunitas
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Homestay Terfavorit Wisatawan
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
                  Pilihan dengan frekuensi pemesanan ulang tertinggi dan layanan istimewa dari warga lokal.
                </p>
              </div>

              <Link
                href="/homestay"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3c16] hover:underline underline-offset-4"
              >
                <span>Jelajah Seluruhnya</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <HomePopularHomestays />
          </div>
        </section>

        {/* ─── NEIGHBORHOOD SECTION ─── */}
        <section className="w-full py-18 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 text-white relative overflow-hidden">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#9f3c16]/20 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                <MapPin className="w-3 h-3" />
                Kawasan di Jogja
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Jelajahi Sudut Terbaik Jogja
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Setiap pojok di Yogyakarta punya pesona khas yang menanti untuk dijelajahi.
              </p>
            </div>

            <HomeNeighborhoodsSection />
          </div>
        </section>

        {/* ─── WHY CHOOSE US (Bento-style Features) ─── */}
        <section className="w-full py-18 bg-gradient-to-b from-[#fbf8ff] via-[#fff5f0] to-[#fbf8ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
              Keunggulan adakamar.id
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Kenapa Memilih adakamar.id?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto mb-10 leading-relaxed">
              Karena kami percaya bahwa menginap di Yogyakarta seharusnya menjadi pengalaman hangat, bukan sekadar transaksi akomodasi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-7 rounded-3xl bg-white border border-orange-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffdbcf] to-[#ffd0be] text-[#9f3c16] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── ARTICLES SECTION ─── */}
        <section className="w-full py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
                  Inspirasi & Panduan
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  Cerita & Panduan Wisata Jogja
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
                  Ditulis oleh penulis lokal Jogja untuk memastikan petualanganmu berkesan & autentik.
                </p>
              </div>

              <Link
                href="/panduan-jogja"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3c16] hover:underline underline-offset-4"
              >
                <span>Semua Artikel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <HomeArticlesSection />
          </div>
        </section>

        {/* ─── TENTANG KAMI BANNER SECTION ─── */}
        <section className="w-full pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#9f3c16] via-[#b6491e] to-[#7a2e10] p-8 sm:p-14 text-white overflow-hidden shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/3 w-60 h-60 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#ffdbcf] text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Kisah & Kurasi adakamar.id
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
                    Menghidupkan Kehangatan Rumah & Jiwa Jogja
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-100/90 leading-relaxed mb-4">
                    adakamar.id lahir dari kecintaan terhadap warisan arsitektur Jawa dan filosofi &quot;Ngaso&quot;. Kami mengurasi setiap rumah joglo, limasan, dan villa private pool dengan standar butik modern serta kemitraan langsung bersama warga lokal di seluruh penjuru Yogyakarta.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-amber-100/90">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      100% Homestay Terkurasi
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      Pemberdayaan Komunitas Warga
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      Standar Butik & Higienis
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    href="/tentang-kami"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#9f3c16] text-xs font-bold shadow-xl hover:bg-zinc-100 hover:scale-105 transition-all"
                  >
                    <Info className="w-4 h-4 text-[#9f3c16]" />
                    <span>Pelajari Kisah Kami</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/homestay"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-all"
                  >
                    <span>Jelajahi Homestay</span>
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="relative z-10 flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/20 text-xs text-white/90">
                {[
                  "Pelayanan Ramah & Keramahan Khas Jogja",
                  "Restorasi Kayu Jati Lawasan & Ubin Tegel Asli",
                  "Didukung Komunitas & Warga Lokal Yogyakarta",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
