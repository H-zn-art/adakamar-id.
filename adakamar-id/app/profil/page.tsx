"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [savedToast, setSavedToast] = useState(false);
  const [formData, setFormData] = useState({
    name: "Raditya Danu",
    email: "raditya.danu@gmail.com",
    phone: "+62 812-3456-7890",
    city: "Yogyakarta",
    bio: "Pencinta arsitektur joglo lawasan dan kopi tubruk khas pedesaan Jawa. Sering menjelajahi sudut tersembunyi Tembi dan Kaliurang.",
    emailNotif: true,
    waNotif: true,
    promoNotif: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-24 pb-16 flex-1 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Top Title & Save Notification */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Profil & Pengaturan Akun
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-terracotta-soft text-primary text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Tamu Terverifikasi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Kelola informasi identitas pribadi, preferensi kontak, dan
              keamanan akun adakamar.id Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            <span>Simpan Perubahan</span>
          </button>
        </div>

        {/* Toast alert */}
        {savedToast && (
          <div className="mb-6 p-4 rounded-2xl bg-success-forest/10 border border-success-forest/30 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success-forest text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  task_alt
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">
                  Perubahan Berhasil Disimpan!
                </h4>
                <p className="text-[11px] text-on-surface-variant">
                  Data profil dan preferensi keamanan Anda telah diperbarui.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSavedToast(false)}
              className="text-on-surface-variant hover:text-on-surface text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sub Navigation Sidebar */}
          <aside className="lg:col-span-3 flex flex-col gap-5 sticky top-24">
            <nav className="p-2 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-1 text-xs">
              {[
                { id: "profil", label: "Profil Pribadi", icon: "person" },
                { id: "reservasi", label: "Riwayat Reservasi", icon: "hotel" },
                { id: "keamanan", label: "Keamanan & Sandi", icon: "lock" },
                { id: "notifikasi", label: "Preferensi Notifikasi", icon: "notifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? "bg-terracotta-soft text-primary font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Membership Card */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">
                  Status Keanggotaan
                </span>
                <span className="text-primary font-bold">Mataram Silver</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-on-surface">3</span>
                <span className="text-xs text-on-surface-variant">
                  kali menginap di Jogja
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-3/5"></div>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                2 reservasi lagi menuju level Gold untuk diskon otomatis 10%
              </span>
            </div>
          </aside>

          {/* Form Content Panes */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {activeTab === "profil" && (
              <section className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-bold text-on-surface">
                  Informasi Profil Pribadi
                </h2>

                {/* Avatar Row */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-surface-variant/40">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary ring-4 ring-terracotta-soft shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuADrGq6rpaawrUdXlMuU7oWRBwWVqyABavUykoQQiVe_RRFL5uXf8q45E77pRaFwkIs4roxMyrOkWnKYNcxbG1XLQ7vyWtSb4qmH1pK_jK9JoXHL3CbneJQZFVyVbNRkzo4UyXw_Ss5yscEzwrt6xl7iWR3qc9-MwwZjSnSjPDtuO8yxCW5AzW4kti5AxnZ7POGg_n4xbSBSaqo7r601GrTmeSKgGki523t4HqIFJasPoT7wjmoHYvk"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 text-center sm:text-left">
                    <span className="text-sm font-bold text-on-surface">
                      Foto Profil
                    </span>
                    <p className="text-xs text-on-surface-variant">
                      Format JPG atau PNG maksimal 2 MB. Terlihat oleh tuan rumah
                      saat Anda reservasi.
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                      >
                        Unggah Foto Baru
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs text-error hover:bg-error-container/20 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kota Domisili
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Bio Singkat
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </form>
              </section>
            )}

            {activeTab === "reservasi" && (
              <section className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-bold text-on-surface">
                  Riwayat Reservasi Anda
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP5jY9kFbrxyaA8utKPs2zRkLLBnVNXxvjQKT3x7kGMXrFQiiXtGsgKydaaZNpoJLg_yE-t5gZDhg0LsBE6whKhZ6PNultVXtTWQ6TXo7Yz-blL9g12fJnLTBZE2D9top74-wtnGTYFNvIfL8iPCIStxme3PdkGstzu0UFGl2N4MRKVgnao-u5IkqL_z1R9b_jSkNyll1ziK77qj2c78sMQWCm0d1yyBBNE3c_P6Pq6iXiSnZtyYX3"
                          alt="Homestay"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-primary uppercase">
                          SELESAI
                        </span>
                        <h4 className="text-sm font-bold text-on-surface">
                          Omah Joglo Lawas Prawirotaman
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          12 – 14 September 2025 • 2 Malam • 4 Tamu
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-on-surface">
                        Rp 1.360.000
                      </span>
                      <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold">
                        Beri Ulasan
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "keamanan" && (
              <section className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-bold text-on-surface">
                  Keamanan & Kata Sandi
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kata Sandi Saat Ini
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container"
                  >
                    Perbarui Kata Sandi
                  </button>
                </div>
              </section>
            )}

            {activeTab === "notifikasi" && (
              <section className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-bold text-on-surface">
                  Preferensi Notifikasi
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.waNotif}
                      onChange={(e) =>
                        setFormData({ ...formData, waNotif: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-on-surface block">
                        Notifikasi WhatsApp Konfirmasi Reservasi
                      </span>
                      <span className="text-on-surface-variant">
                        Menerima kode booking dan panduan check-in langsung ke
                        nomor WA Anda.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.promoNotif}
                      onChange={(e) =>
                        setFormData({ ...formData, promoNotif: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-on-surface block">
                        Kabar Flash Sale & Promo Khusus Jogja
                      </span>
                      <span className="text-on-surface-variant">
                        Menerima buletin voucher diskon menginap dan rekomendasi
                        joglo baru.
                      </span>
                    </div>
                  </label>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
