"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";

const participatingHomestays = [
  {
    id: "1",
    name: "Omah Joglo Lawas Prawirotaman",
    location: "Prawirotaman, Kota Yogyakarta",
    category: "Heritage Joglo",
    rating: 4.95,
    reviewCount: 142,
    originalPrice: 680000,
    discountedPrice: 442000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDP5jY9kFbrxyaA8utKPs2zRkLLBnVNXxvjQKT3x7kGMXrFQiiXtGsgKydaaZNpoJLg_yE-t5gZDhg0LsBE6whKhZ6PNultVXtTWQ6TXo7Yz-blL9g12fJnLTBZE2D9top74-wtnGTYFNvIfL8iPCIStxme3PdkGstzu0UFGl2N4MRKVgnao-u5IkqL_z1R9b_jSkNyll1ziK77qj2c78sMQWCm0d1yyBBNE3c_P6Pq6iXiSnZtyYX3",
    slug: "omah-joglo-lawas-prawirotaman",
    capacity: "4 Tamu • 2 Kamar Tidur",
  },
  {
    id: "2",
    name: "Ndalem Tembi Asri Heritage",
    location: "Tembi, Sewon, Bantul",
    category: "Boutique Joglo",
    rating: 4.96,
    reviewCount: 128,
    originalPrice: 520000,
    discountedPrice: 338000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDUA4FMs4Dhi3LXS5eQYraTzhTRqshyDzZ2g759JCttHd-9_VbvK6OBrVxdemDCeN3b1VUwdpVucxqYTmZbfPl_vSV1EuuMlgA-42x4ZVIyxC8CDqYPf7WQdhgJP8Y5hIe0rcXly_qCWXN4aT2oSM-GVe6IxsnMwsnpxQ4mgq7rToUJkh8Q43znNcER8rOgmdfhEk_1oQWi_sePmFmpOjohOs-xq-bIqBQguXVxpsauvyDDgSIBw8TH",
    slug: "ndalem-tembi-asri-heritage",
    capacity: "2 Tamu • 1 Kamar Tidur",
  },
  {
    id: "3",
    name: "Villa Sawah Tembi Private Pool",
    location: "Sewon, Bantul",
    category: "Villa Private Pool",
    rating: 4.98,
    reviewCount: 89,
    originalPrice: 1250000,
    discountedPrice: 812500,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6_7J4f2D1h2Vm28tSPyxEfE9dE3KiUzSi4fZSINemO4pG77OPK_k3mJk4WAhuRddJnDWf2GMEClfBAVcpKeeQsyE2xL05M22odcKalEZiNahRdXpaKXhlW4S5K8xDhmG57NE4-pehq0JAKOeWmxGO0I25I3lpoB6MsRMpg3m2qb3fXv-lLeGOYBOfxuyQ8Rywb60yjFKomojOghk5hn1iPg4H5p4ww7I-wG4BiH_JNwffoh6yedap",
    slug: "villa-sawah-tembi-private-pool",
    capacity: "6 Tamu • 3 Kamar Tidur",
  },
];

const terms = [
  "Periode pemesanan berlaku hingga 31 Oktober 2025.",
  "Periode menginap berlaku untuk hari Jumat, Sabtu, dan Minggu di bulan November – Desember 2025.",
  "Diskon sebesar 35% dengan nilai potongan maksimal Rp 250.000 per transaksi.",
  "Minimum transaksi pemesanan adalah Rp 500.000 (tidak termasuk biaya layanan tambahan).",
  "Kupon hanya berlaku untuk homestay dengan label 'Promo Spesial'.",
  "Kebijakan pembatalan gratis dan reschedule hingga H-2 sebelum tanggal check-in.",
  "Satu akun pengguna berhak menggunakan kupon ini maksimal 2 (dua) kali transaksi.",
];

export default function PromoDetailPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText("JOGJANYAMAN");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-20 flex-1">
        {/* Top Breadcrumb & Status */}
        <section className="w-full bg-surface-container-lowest border-b border-surface-variant/40 py-3 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  home
                </span>
                <span>Beranda</span>
              </Link>
              <span className="material-symbols-outlined text-[14px] text-outline-variant">
                chevron_right
              </span>
              <Link
                href="/promo"
                className="hover:text-primary transition-colors"
              >
                Promo Spesial
              </Link>
              <span className="material-symbols-outlined text-[14px] text-outline-variant">
                chevron_right
              </span>
              <span className="font-semibold text-on-surface truncate max-w-xs">
                Flash Sale Akhir Pekan Jogja Seru
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-forest/10 text-success-forest text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-success-forest animate-pulse"></span>
                <span>Promo Aktif</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-soft text-primary text-xs font-semibold">
                <span className="material-symbols-outlined text-[15px]">
                  local_fire_department
                </span>
                <span>Sisa Kuota: 18 Booking Hari Ini</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Banner Section */}
        <section className="w-full px-6 lg:px-12 pt-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-surface-container-lowest via-terracotta-soft/40 to-surface-container-low p-8 lg:p-12 border border-surface-variant/40">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left pitch */}
                <div className="lg:col-span-7 flex flex-col items-start gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary text-on-primary text-xs uppercase tracking-wider px-3 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        bolt
                      </span>{" "}
                      Flash Sale Jogja
                    </span>
                    <span className="bg-surface-container text-on-surface-variant text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        schedule
                      </span>{" "}
                      Berakhir dlm 4 Hari
                    </span>
                    <span className="bg-surface-container text-on-surface-variant text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        check_circle
                      </span>{" "}
                      Min. Transaksi Rp 500.000
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-tight">
                    Liburan Akhir Pekan Jogja: Diskon Spesial{" "}
                    <span className="text-primary">Hingga 35%</span>
                  </h1>

                  <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                    Lepaskan penat di penginapan joglo otentik, villa private pool
                    tersembunyi di pedesaan Bantul, atau retreat sejuk kaki Gunung
                    Merapi dengan potongan tarif eksklusif.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        calendar_month
                      </span>
                      <span>
                        Periode Menginap: <strong>Nov – Des 2025</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold">
                      <span className="material-symbols-outlined text-success-forest text-[18px]">
                        lock_reset
                      </span>
                      <span>Bebas Reschedule H-2</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Coupon Card */}
                <div className="lg:col-span-5">
                  <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
                          Kupon Diskon Resmi
                        </span>
                        <p className="text-xl text-primary font-bold">
                          Potongan Maksimal Rp 250.000
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-terracotta-soft text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[26px]">
                          confirmation_number
                        </span>
                      </div>
                    </div>

                    {/* Code Box */}
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-variant/50">
                      <span className="text-xs text-on-surface-variant">
                        Kode Voucher
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-on-surface tracking-wider font-mono">
                            JOGJANYAMAN
                          </span>
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-semibold">
                            -35%
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container active:scale-95 text-on-primary text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copied ? "check" : "content_copy"}
                          </span>
                          <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
                        </button>
                      </div>
                    </div>

                    <a
                      href="#homestay-list"
                      className="w-full text-center py-3 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Lihat Homestay Terpilih</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_downward
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="w-full px-6 lg:px-12 py-8 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-on-surface mb-6 text-center">
              Cara Menggunakan Kupon
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-primary font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-on-surface">
                  Salin Kode Kupon
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Klik tombol &quot;Salin Kode&quot; di atas untuk menyalin kode voucher
                  JOGJANYAMAN.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-primary font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-on-surface">
                  Pilih Homestay
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Cari homestay berpartisipasi dengan tanggal menginap akhir pekan
                  di Nov – Des 2025.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-primary font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-on-surface">
                  Tempel Kode Kupon
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Masukkan kode di ringkasan pembayaran reservasi sebelum checkout
                  selesai.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-primary font-bold flex items-center justify-center text-sm">
                  4
                </div>
                <h4 className="text-sm font-bold text-on-surface">
                  Nikmati Liburan
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Harga total Anda otomatis terpotong 35% hingga Rp 250.000.
                  Selamat berlibur di Jogja!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Participating Homestays Grid */}
        <section id="homestay-list" className="w-full px-6 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  Homestay Berpartisipasi
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                  Pilihan Penginapan Flash Sale
                </h2>
              </div>
              <Link
                href="/homestay"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Semua Homestay</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatingHomestays.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-on-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      HEMAT 35%
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">
                        star
                      </span>
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                        <span>{item.location}</span>
                        <span className="bg-surface-container px-2 py-0.5 rounded font-medium">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {item.capacity}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-surface-variant/40">
                      <div>
                        <span className="text-xs text-on-surface-variant line-through block">
                          Rp {item.originalPrice.toLocaleString("id-ID")}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-primary">
                            Rp {item.discountedPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            /malam
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/homestay/${item.slug}`}
                        className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors shadow-sm"
                      >
                        Pesan Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terms and conditions */}
        <section className="w-full px-6 lg:px-12 py-10 bg-surface-container-low/40 border-t border-surface-variant/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                policy
              </span>
              Syarat & Ketentuan Promo
            </h3>
            <ul className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
              {terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
