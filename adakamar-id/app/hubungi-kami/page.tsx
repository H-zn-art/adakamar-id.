"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "reservasi",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const copyAddress = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        "Jl. Prawirotaman No. 24, Brontokusuman, Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55153"
      );
      alert("Alamat kantor berhasil disalin!");
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-20 flex-1">
        {/* Ambient Top Glow & Header */}
        <section className="relative w-full overflow-hidden bg-surface-container-low/30 border-b border-surface-variant/40 pb-12 pt-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  home
                </span>
                <span>Beranda</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-medium">Hubungi Kami</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-soft text-primary text-xs font-semibold mb-3 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>Layanan Tamu & Kemitraan • Respon Cepat &lt; 15 Menit</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight mb-3">
                  Terhubung dengan Kami di Jantung Yogyakarta
                </h1>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Punya pertanyaan seputar kurasi homestay autentik, reservasi
                  rombongan keluarga, atau ingin mendaftarkan Joglo warisan
                  Anda? Tim kurator dan concierge adakamar.id siap menyambut Anda
                  dengan kehangatan khas Mataram.
                </p>
              </div>

              {/* Emergency Hotline Pill */}
              <div className="shrink-0 bg-surface-container-lowest p-4 rounded-2xl shadow-md flex items-center gap-3 border border-surface-variant/40">
                <div className="w-11 h-11 rounded-xl bg-terracotta-soft text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    support_agent
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Layanan Siaga 24 Jam
                  </div>
                  <div className="text-sm font-bold text-on-surface">
                    +62 812-3456-7890
                  </div>
                </div>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-success-forest text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    chat
                  </span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-Column Content */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Office & Channels */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Office Location Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant/40 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">
                        storefront
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-primary uppercase font-bold tracking-wider">
                        Kantor Pusat & Concierge Lounge
                      </span>
                      <h2 className="text-xl font-bold text-on-surface">
                        Omah Kurasi adakamar.id
                      </h2>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-success-forest bg-success-forest/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-forest"></span>{" "}
                    Buka Hari Ini
                  </span>
                </div>

                <div className="space-y-3 text-xs text-on-surface-variant">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                      location_on
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        Jl. Prawirotaman No. 24, Brontokusuman, Mergangsan, Kota
                        Yogyakarta, D.I. Yogyakarta 55153
                      </p>
                      <p className="text-on-surface-variant mt-0.5">
                        Patokan: 50 meter barat Tempo Gelato Prawirotaman, depan
                        Ndalem Gamelan Heritage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                      schedule
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">
                        Layanan Tatap Muka: 08.00 – 21.00 WIB
                      </p>
                      <p className="text-on-surface-variant">
                        Buka setiap hari termasuk hari libur. Concierge WhatsApp
                        aktif 24 jam nonstop.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-variant/30">
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      content_copy
                    </span>
                    <span>Salin Alamat Lengkap</span>
                  </button>
                  <a
                    href="https://maps.google.com/?q=Prawirotaman+Yogyakarta"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      near_me
                    </span>
                    <span>Buka Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    chat
                  </span>
                  <h4 className="text-sm font-bold text-on-surface">
                    WhatsApp Concierge
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Bantuan cepat reservasi dan rekomendasi homestay privat.
                  </p>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary hover:underline mt-1"
                  >
                    +62 812-3456-7890 →
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    mail
                  </span>
                  <h4 className="text-sm font-bold text-on-surface">
                    Email Resmi
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Inquiry rombongan, kemitraan media, & kerjasama korporasi.
                  </p>
                  <a
                    href="mailto:halo@adakamar.id"
                    className="text-xs font-bold text-primary hover:underline mt-1"
                  >
                    halo@adakamar.id →
                  </a>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-bold text-on-surface">
                  Pertanyaan Populer
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">
                      Apakah homestay bisa disewa seluruh bangunan untuk rombongan?
                    </h5>
                    <p className="text-on-surface-variant leading-relaxed">
                      Ya, banyak villa dan joglo di adakamar.id yang mendukung
                      sewa seluruh rumah (whole house private rental) dengan
                      kapasitas 8 hingga 25 orang.
                    </p>
                  </div>
                  <div className="border-t border-surface-variant/40 pt-3">
                    <h5 className="font-semibold text-on-surface mb-1">
                      Bagaimana proses verifikasi bagi calon Tuan Rumah baru?
                    </h5>
                    <p className="text-on-surface-variant leading-relaxed">
                      Setelah mendaftar online, tim kurator kami akan menjadwalkan
                      survei langsung ke lokasi untuk verifikasi fasilitas,
                      kebersihan, dan dokumen legalitas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Message Form */}
            <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-md border border-surface-variant/40">
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Formulir Interaktif
                </span>
                <h3 className="text-2xl font-bold text-on-surface">
                  Kirim Pesan ke Tim adakamar.id
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Kami membalas pesan dalam kurun waktu kurang dari 24 jam kerja.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-terracotta-soft/50 border border-primary/30 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px]">
                      check
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-on-surface">
                    Matur Nuwun! Pesan Anda Telah Terkirim
                  </h4>
                  <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
                    Tim concierge adakamar.id akan segera menghubungi Anda
                    melalui WhatsApp atau Email dalam hitungan jam.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow hover:bg-primary-container transition-colors mt-2"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1.5">
                        Alamat Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1.5">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08123456789"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kategori Pesan *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    >
                      <option value="reservasi">Pertanyaan Reservasi Homestay</option>
                      <option value="host">Ingin Mendaftar Jadi Tuan Rumah</option>
                      <option value="rombongan">Inquiry Acara / Rombongan Keluarga</option>
                      <option value="kerjasama">Kerjasama Bisnis & Media</option>
                      <option value="kendala">Bantuan Kendala Teknis</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Pesan atau Pertanyaan Anda *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Ceritakan rencana perjalanan Anda atau detail properti yang ingin didaftarkan..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full p-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      send
                    </span>
                    <span>Kirim Pesan Sekarang</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
