import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami — Kisah Kurasi Homestay Jogja | adakamar.id",
  description:
    "Mengenal adakamar.id, platform kurasi homestay autentik Yogyakarta. Menghubungkan pelancong berjiwa seni dengan kehangatan rumah joglo dan keramahan warga lokal.",
};

const curationPillars = [
  {
    icon: "architecture",
    title: "Otentisitas Arsitektur Tradisional",
    desc: "Setiap homestay yang lolos kurasi mempertahankan ciri khas arsitektur Jawa: sokoguru kayu jati asli, atap limasan/joglo, hingga ubin tegel klasik bermotif.",
  },
  {
    icon: "diversity_3",
    title: "Kemitraan Komunitas Warga Lokal",
    desc: "Kami memberdayakan warga sekitar sebagai tuan rumah dan penyedia kuliner lokal. Lebih dari 90% perputaran ekonomi mengalir langsung ke desa setempat.",
  },
  {
    icon: "hotel",
    title: "Kenyamanan Standar Butik Modern",
    desc: "Nuansa tradisional tanpa kompromi kenyamanan. Kasur king coil premium, pendingin udara higienis, air panas bertekanan, dan Wi-Fi kencang terjamin.",
  },
  {
    icon: "spa",
    title: "Filosofi 'Ngaso' & Ketenangan Jiwa",
    desc: "Lokasi terhindar dari bising klakson kota. Mengedepankan ruang hijau terbuka, gemericik air, dan ketenangan untuk merestorasi energi tubuh.",
  },
];

const teamMembers = [
  {
    name: "Raditya Danu",
    role: "Pendiri & Lead Homestay Curator",
    bio: "Arsitek lulusan UGM yang mengabdikan 12 tahun meneliti restorasi joglo lawasan di pedesaan Bantul dan Sleman.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADrGq6rpaawrUdXlMuU7oWRBwWVqyABavUykoQQiVe_RRFL5uXf8q45E77pRaFwkIs4roxMyrOkWnKYNcxbG1XLQ7vyWtSb4qmH1pK_jK9JoXHL3CbneJQZFVyVbNRkzo4UyXw_Ss5yscEzwrt6xl7iWR3qc9-MwwZjSnSjPDtuO8yxCW5AzW4kti5AxnZ7POGg_n4xbSBSaqo7r601GrTmeSKgGki523t4HqIFJasPoT7wjmoHYvk",
  },
  {
    name: "Saraswati Putri",
    role: "Kurator Gastronomi & Pengalaman Tamu",
    bio: "Penikmat kuliner tradisional dan pencinta teh melati tubruk. Mengurasi jamuan sarapan khas desa dan workshop membatik.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Bagus Pratama",
    role: "Kepala Dokumentasi & Penulis Panduan",
    bio: "Fotografer dokumenter budaya Jawa yang telah berkeliling ratusan dusun di Daerah Istimewa Yogyakarta.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-20 flex-1">
        {/* Breadcrumb Indicator */}
        <section className="w-full bg-surface-subtle py-3 border-b border-surface-variant/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
            <nav className="flex items-center gap-1.5">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  cottage
                </span>
                <span>Beranda</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-medium">Tentang Kami</span>
            </nav>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-soft text-primary font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Cerita & Nilai Kami</span>
            </div>
          </div>
        </section>

        {/* Hero Narrative Section */}
        <section className="w-full bg-surface py-12 lg:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left narrative */}
              <div className="lg:col-span-6 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold mb-4">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    favorite
                  </span>
                  <span>Semangat Khas Mataram & Filosofi Ngaso</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-tight mb-5">
                  Merajut Kehangatan Keramahan Mataram dalam{" "}
                  <span className="text-primary underline decoration-terracotta-muted underline-offset-8">
                    Setiap Sudut
                  </span>{" "}
                  Penginapan
                </h1>

                <p className="text-base sm:text-lg text-on-surface-variant mb-6 leading-relaxed">
                  <strong className="text-on-surface font-semibold">
                    adakamar.id
                  </strong>{" "}
                  lahir dari kerinduan mendalam akan pengalaman menginap yang
                  bernyawa — bukan sekadar kamar tidur steril dan transaksi
                  dingin, melainkan kehangatan <em>“sugeng rawuh”</em>, aroma
                  kayu jati lawas, seduhan teh nasgitel pagi hari, dan sambutan
                  tulus tuan rumah Jogja.
                </p>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8">
                  <Link
                    href="/homestay"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <span>Jelajahi Koleksi Homestay</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                  <a
                    href="#cerita-kami"
                    className="inline-flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-6 py-3.5 rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      menu_book
                    </span>
                    <span>Cerita di Balik Kami</span>
                  </a>
                </div>

                {/* Trust mini strip */}
                <div className="flex items-center gap-4 text-xs text-on-surface-variant border-t border-surface-variant/40 pt-4 w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-success-forest text-[18px]">
                      verified_user
                    </span>
                    <span>100% Verifikasi Kurator Langsung</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      handshake
                    </span>
                    <span>Kemitraan Adil Berkelanjutan</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Image Showcase */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[16/12]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Interior Joglo Heritage adakamar.id"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAAyoDwqvuAvvy-BmzL4Af6HTGHrWY926UpCSGjGuDdSzI6m4j1YGmV6uzz1554ph7YSr3G58zojMWQPLP2NnOrpCuH5b4S3gz7TPlpo4eVXxwtPCONZHfirD9rQyOdd2WJI2ojt_DZhEdyvTdCPAEIjA0tWHYziP5VMJQz0rj-TrR7-pmHZCyEeFT0mR8joR_1aSNKJlQsELdoQeupZg1ei3RmclWWS-Gzy8_Ezafk67_DqoyTF1I"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-on-surface shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          location_on
                        </span>
                        <span className="text-sm font-bold text-on-surface">
                          Omah Ndeso Tembi Heritage
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-terracotta-soft text-primary text-xs font-bold">
                        ★ 4.98
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Bantul, D.I. Yogyakarta • Restorasi Omah Limasan 1928
                    </p>
                  </div>
                </div>

                {/* Floating Metric 1 */}
                <div className="absolute -top-4 -right-2 md:-right-4 bg-surface-container-lowest rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-surface-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-terracotta-soft flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">
                      verified
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-on-surface leading-none">
                      180+
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      Joglo Fisik Lolos Uji
                    </div>
                  </div>
                </div>

                {/* Floating Metric 2 */}
                <div className="absolute -bottom-4 -left-2 md:-left-4 bg-surface-container-lowest rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-surface-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">
                      savings
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-on-surface leading-none">
                      95%
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      Kembali ke Tuan Rumah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Story Behind Us */}
        <section id="cerita-kami" className="w-full bg-surface-container-low/40 py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col gap-6 text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-primary">
              Misi Kami
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-on-surface">
              Mengapa Yogyakarta Butuh Platform Khusus Homestay Kurasi?
            </h2>
            <div className="text-left text-base sm:text-lg text-on-surface-variant space-y-4 leading-relaxed mt-2">
              <p>
                Ketika platform online travel agency global dibanjiri ribuan
                listing hotel jaringan yang seragam di mana semua kamar terasa
                identik, keunikan arsitektur dan keramahan autentik Yogyakarta
                perlahan terpinggirkan. Banyak rumah joglo dan limasan bersejarah
                yang dirawat oleh keluarga lokal kesulitan menjangkau tamu yang
                tepat.
              </p>
              <p>
                Kami mendirikan <strong>adakamar.id</strong> untuk menjembatani
                dua kutub: pelancong yang haus akan pengalaman kultural yang
                bermakna, dan para tuan rumah Jogja yang menjaga warisan leluhur
                dengan penuh cinta kasih.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Curation */}
        <section className="w-full py-16 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-primary">
              Standar Kurasi
            </span>
            <h2 className="text-3xl font-bold text-on-surface mt-2">
              4 Pilar Penilaian Homestay adakamar.id
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Setiap penginapan yang terdaftar melalui kunjungan fisik langsung
              oleh tim kurator kami sebelum dapat dipesan oleh umum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {curationPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-terracotta-soft text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    {pillar.icon}
                  </span>
                </div>
                <h3 className="text-base font-bold text-on-surface">
                  {pillar.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full bg-surface-container-low/40 py-16 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-wider font-bold text-primary">
                Wajah di Balik Kurasi
              </span>
              <h2 className="text-3xl font-bold text-on-surface mt-2">
                Tim Kurator Mataram Kami
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Para penikmat warisan budaya dan praktisi hospitality yang
                berdedikasi menjaga denyut kearifan lokal Yogyakarta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 overflow-hidden p-6 shadow-sm flex flex-col items-center text-center gap-4"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-terracotta-soft shadow-inner">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-on-surface">
                      {member.name}
                    </h4>
                    <span className="text-xs text-primary font-semibold block mt-0.5">
                      {member.role}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-primary to-primary-container p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                Punya Homestay Joglo Autentik di Jogja?
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                Daftarkan properti Anda dan bergabunglah dengan jaringan tuan
                rumah terkurasi adakamar.id tanpa potongan komisi yang memberatkan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/buka-homestay"
                className="px-6 py-3.5 rounded-xl bg-white text-primary text-xs font-bold shadow-md hover:bg-surface-container-lowest transition-colors"
              >
                Daftar Jadi Tuan Rumah
              </Link>
              <Link
                href="/hubungi-kami"
                className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors"
              >
                Konsultasi Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
