"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { settingsApi } from "@/lib/api";
import {
  Globe,
  Share2,
  Sliders,
  Save,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Camera,
  Video,
  MessageCircle,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState("identitas");
  const [savedToast, setSavedToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: "adakamar.id",
    tagline: "Kurasi Penginapan & Homestay Jogja Autentik",
    metaDesc:
      "Platform direktori dan kurasi homestay Yogyakarta. Rasakan kehangatan keramahan Mataram di rumah joglo, limasan, dan villa private pool.",
    supportPhone: "+62 812-3456-7890",
    supportEmail: "halo@adakamar.id",
    officeAddress:
      "Jl. Prawirotaman No. 24, Brontokusuman, Mergangsan, Kota Yogyakarta",
    instagram: "https://instagram.com/adakamar.id",
    tiktok: "https://tiktok.com/@adakamar.id",
    youtube: "https://youtube.com/@adakamar_id",
    whatsappHost: "+62 812-3456-7890",
    maintenanceMode: false,
    directBookingWA: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsApi.getAll();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            tagline: data.tagline || prev.tagline,
            metaDesc: data.metaDesc || prev.metaDesc,
            supportPhone: data.supportPhone || prev.supportPhone,
            supportEmail: data.supportEmail || prev.supportEmail,
            officeAddress: data.officeAddress || prev.officeAddress,
            instagram: data.instagram || prev.instagram,
            tiktok: data.tiktok || prev.tiktok,
            youtube: data.youtube || prev.youtube,
            whatsappHost: data.whatsappHost || prev.whatsappHost,
            maintenanceMode: data.maintenanceMode === "true",
            directBookingWA: data.directBookingWA !== "false",
          }));
        }
      } catch (err) {
        console.warn("API load settings warning:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateMultiple({
        siteName: settings.siteName,
        tagline: settings.tagline,
        metaDesc: settings.metaDesc,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        officeAddress: settings.officeAddress,
        instagram: settings.instagram,
        tiktok: settings.tiktok,
        youtube: settings.youtube,
        whatsappHost: settings.whatsappHost,
        maintenanceMode: String(settings.maintenanceMode),
        directBookingWA: String(settings.directBookingWA),
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan ke server.");
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: "identitas", label: "Identitas Situs & SEO", icon: Globe, desc: "Metadata & kontak resmi" },
    { id: "sosial", label: "Media Sosial & Hotline", icon: Share2, desc: "Instagram, TikTok & WA" },
    { id: "sistem", label: "Status Sistem & Fitur", icon: Sliders, desc: "Gateway & pemeliharaan" },
  ];

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sistem & Keamanan</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">Pengaturan Website</span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                Konfigurasi Platform
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Live System Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Pengaturan Website & Integrasi
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
              Konfigurasikan metadata SEO publik, tautan akun media sosial resmi, dan saluran hotline concierge WhatsApp adakamar.id.
            </p>
          </div>

          {savedToast && (
            <div className="p-4.5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Pengaturan berhasil disimpan dan langsung disinkronkan ke server live!</span>
              </div>
              <button
                onClick={() => setSavedToast(false)}
                className="text-emerald-700 hover:text-emerald-950 cursor-pointer font-bold px-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Nav */}
            <aside className="lg:col-span-4 flex flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-3xl text-left transition-all cursor-pointer border ${
                      isActive
                        ? "bg-white border-zinc-200/80 shadow-md ring-2 ring-[#9f3c16]/10"
                        : "bg-white/60 border-transparent hover:bg-white hover:border-zinc-200/60 shadow-xs"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#ffdbcf] text-[#9f3c16]"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-extrabold ${isActive ? "text-zinc-950" : "text-zinc-700"}`}>
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}

              <div className="p-5 rounded-3xl bg-zinc-950 text-white mt-4 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Keamanan Konfigurasi</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Perubahan pengaturan ini berdampak langsung pada tampilan mesin pencari Google dan integrasi reservasi tamu.
                </p>
              </div>
            </aside>

            {/* Right Form Pane */}
            <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-6">
              {activeTab === "identitas" && (
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-base font-extrabold text-zinc-950">
                      Informasi Publik & SEO
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Identitas brand dan meta tag halaman depan adakamar.id
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Nama Platform
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) =>
                          setSettings({ ...settings, siteName: e.target.value })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Slogan / Tagline
                      </label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) =>
                          setSettings({ ...settings, tagline: e.target.value })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Meta Deskripsi SEO (Google Search Engine)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.metaDesc}
                      onChange={(e) =>
                        setSettings({ ...settings, metaDesc: e.target.value })
                      }
                      className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] leading-relaxed resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Hotline Telepon Tamu
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={settings.supportPhone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              supportPhone: e.target.value,
                            })
                          }
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Email Resmi Layanan
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              supportEmail: e.target.value,
                            })
                          }
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Alamat Kantor Omah Kurasi Jogja
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={settings.officeAddress}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            officeAddress: e.target.value,
                          })
                        }
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sosial" && (
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-base font-extrabold text-zinc-950">
                      Kanal Media Sosial & WhatsApp
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Tautan profil resmi dan gateway pesan instan untuk tamu
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Instagram URL
                    </label>
                    <div className="relative">
                      <Camera className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600" />
                      <input
                        type="url"
                        value={settings.instagram}
                        onChange={(e) =>
                          setSettings({ ...settings, instagram: e.target.value })
                        }
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      TikTok URL
                    </label>
                    <div className="relative">
                      <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-800" />
                      <input
                        type="url"
                        value={settings.tiktok}
                        onChange={(e) =>
                          setSettings({ ...settings, tiktok: e.target.value })
                        }
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      YouTube URL
                    </label>
                    <div className="relative">
                      <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-600" />
                      <input
                        type="url"
                        value={settings.youtube}
                        onChange={(e) =>
                          setSettings({ ...settings, youtube: e.target.value })
                        }
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Nomor WhatsApp Host & Concierge Tamu
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                      <input
                        type="text"
                        value={settings.whatsappHost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            whatsappHost: e.target.value,
                          })
                        }
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sistem" && (
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-base font-extrabold text-zinc-950">
                      Fitur & Mode Sistem
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Kendali alur reservasi tamu dan status ketersediaan website
                    </p>
                  </div>

                  <label className="flex items-start gap-4 p-5 rounded-3xl bg-zinc-50 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.directBookingWA}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          directBookingWA: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-[#9f3c16] rounded-md mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-extrabold text-zinc-900 block text-sm">
                        Direct WhatsApp Booking Gateway
                      </span>
                      <span className="text-zinc-500 mt-1 block leading-relaxed">
                        Tamu otomatis diarahkan langsung chat WhatsApp ke tim concierge saat menekan tombol pesan atau reservasi unit homestay.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-5 rounded-3xl bg-zinc-50 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maintenanceMode: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-[#9f3c16] rounded-md mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-extrabold text-zinc-900 block text-sm">
                        Mode Pemeliharaan (Maintenance Mode)
                      </span>
                      <span className="text-zinc-500 mt-1 block leading-relaxed">
                        Tampilkan laman sementara pemeliharaan sistem bagi pengunjung publik ketika ada pembaruan basis data besar.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
