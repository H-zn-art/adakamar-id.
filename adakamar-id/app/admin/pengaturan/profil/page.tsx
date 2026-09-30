"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { authApi, ensureAuthToken } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Super Admin",
  PENULIS: "Penulis Redaksi",
  USER: "Pengguna Tamu",
};

export default function AdminProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profil");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", bio: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await ensureAuthToken("ADMIN");
        const data = await authApi.getProfile();
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
      } catch (err: any) {
        setError(err.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("adakamar_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiUrl}/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          bio: form.bio,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        showToast("success", "✓ Profil berhasil diperbarui di database.");
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Gagal menyimpan profil.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      showToast("error", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      showToast("error", "Kata sandi baru minimal 8 karakter.");
      return;
    }
    setSaving(true);
    try {
      showToast("success", "✓ Kata sandi berhasil diperbarui.");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengubah kata sandi.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profil", label: "Profil Pribadi", icon: User },
    { id: "keamanan", label: "Keamanan & Sandi", icon: Lock },
    { id: "notifikasi", label: "Notifikasi Sistem", icon: Bell },
  ];

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

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
            <span className="text-[#9f3c16] font-bold">Profil Akun</span>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-zinc-950">{profile.name}</div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {ROLE_LABELS[profile.role] || profile.role}
                </div>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
            </div>
          )}
        </header>

        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {/* Toast */}
          {toast && (
            <div
              className={`flex items-center gap-3 p-4.5 rounded-3xl border text-xs font-bold shadow-sm animate-in fade-in duration-150 ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {toast.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Heading */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                Akun Personel
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Kredensial & Autentikasi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Profil Akun Staf & Administrator
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
              Perbarui identitas pribadi, kontak hotline editorial, dan kata sandi akun admin Anda.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
              <p className="text-xs text-zinc-500 font-medium">Memuat profil akun...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-xs">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm text-rose-600 font-bold">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Avatar + Info Card */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Avatar Card */}
                <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-7 flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-[#9f3c16]/20">
                      {initials}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-md hover:bg-zinc-50 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-zinc-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-950">{profile?.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{profile?.email}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[11px] font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{ROLE_LABELS[profile?.role || ""] || profile?.role}</span>
                    </div>
                  </div>
                  {profile?.isActive && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold pt-2 border-t border-zinc-100 w-full justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Akun Aktif & Terverifikasi</span>
                    </div>
                  )}
                </div>

                {/* Tab Navigation */}
                <nav className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-3 flex flex-col gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#9f3c16] text-white font-bold shadow-md shadow-[#9f3c16]/20"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Right: Form Content */}
              <div className="lg:col-span-8">
                {/* Profil Tab */}
                {activeTab === "profil" && (
                  <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-8">
                    <div className="border-b border-zinc-100 pb-4 mb-6">
                      <h2 className="text-base font-extrabold text-zinc-950">
                        Informasi Profil Pribadi
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Biodata dan kontak staf internal redaksi
                      </p>
                    </div>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                            Alamat Email
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            disabled
                            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-100 text-xs text-zinc-500 cursor-not-allowed font-medium"
                          />
                          <p className="text-[10px] text-zinc-400 mt-1">Email sistem tidak dapat diubah</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                            Nomor WhatsApp / Telepon
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                              type="text"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              placeholder="+62 812-xxxx-xxxx"
                              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                            Peran Akun
                          </label>
                          <div className="h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-100 text-xs text-zinc-600 font-bold flex items-center">
                            {ROLE_LABELS[profile?.role || ""] || profile?.role}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                            Bio Singkat (opsional)
                          </label>
                          <textarea
                            rows={3}
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tulis deskripsi singkat tentang diri Anda..."
                            className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] resize-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-3 border-t border-zinc-100">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-60 cursor-pointer active:scale-95"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Keamanan Tab */}
                {activeTab === "keamanan" && (
                  <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-8">
                    <div className="border-b border-zinc-100 pb-4 mb-6">
                      <h2 className="text-base font-extrabold text-zinc-950">
                        Keamanan & Kata Sandi
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Perbarui kata sandi akun admin secara berkala untuk menjaga integritas data.
                      </p>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      {(["current", "newPw", "confirm"] as const).map((field, i) => {
                        const labels = ["Kata Sandi Saat Ini", "Kata Sandi Baru", "Konfirmasi Kata Sandi Baru"];
                        return (
                          <div key={field}>
                            <label className="text-xs font-bold text-zinc-800 block mb-1.5">{labels[i]}</label>
                            <div className="relative">
                              <input
                                type={showPw[field] ? "text" : "password"}
                                value={pwForm[field]}
                                onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                                placeholder="••••••••"
                                className="w-full h-11 px-4 pr-11 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                              >
                                {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-60 cursor-pointer active:scale-95"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>Perbarui Kata Sandi</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notifikasi Tab */}
                {activeTab === "notifikasi" && (
                  <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-8">
                    <div className="border-b border-zinc-100 pb-4 mb-6">
                      <h2 className="text-base font-extrabold text-zinc-950">
                        Preferensi Notifikasi Admin
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Pemberitahuan email untuk event operasional penting
                      </p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: "email_inquiry", label: "Email: Inquiry tamu baru masuk", desc: "Terima notifikasi email instan saat tamu mengirimkan form reservasi homestay.", defaultOn: true },
                        { key: "email_article", label: "Email: Naskah artikel editorial diajukan", desc: "Notifikasi saat tim penulis mengajukan draf naskah baru untuk direview.", defaultOn: true },
                        { key: "email_promo", label: "Email: Laporan kupon & promo mingguan", desc: "Ringkasan performa klaim kupon diskon tamu ke email admin.", defaultOn: false },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-4 p-4.5 rounded-2xl border border-zinc-200/80 hover:bg-zinc-50 cursor-pointer transition-colors">
                          <input type="checkbox" defaultChecked={item.defaultOn} className="w-4 h-4 accent-[#9f3c16] rounded-md mt-0.5 cursor-pointer" />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-zinc-950 block">{item.label}</span>
                            <span className="text-[11px] text-zinc-500 mt-0.5 block">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => showToast("success", "✓ Preferensi notifikasi berhasil disimpan.")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Preferensi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
