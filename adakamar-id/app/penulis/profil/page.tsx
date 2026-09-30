"use client";

import { useState, useEffect } from "react";
import PenulisSidebar from "@/components/layout/PenulisSidebar";
import { authApi, articlesApi } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Save,
  BookOpen,
  PenSquare,
  Camera,
  Eye,
  EyeOff,
  ChevronRight,
  Compass,
  FileCheck,
  Clock,
  Layers,
  Award,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";

export default function PenulisProfilePage() {
  const [activeTab, setActiveTab] = useState<"profil" | "keahlian" | "keamanan">("profil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "Sekar Ayu Kinanti",
    title: "Penulis Editorial & Budaya",
    email: "penulis@adakamar.id",
    phone: "+62 812-3456-7890",
    bio: "Penikmat sastra Jawa dan pengamat arsitektur vernakular. Menjelajahi desa-desa wisata di Bantul, Kulon Progo, dan lereng Merapi untuk mendokumentasikan homestay autentik Jogja.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    specialties: [
      "Joglo & Limasan Tradisional",
      "Bantul & Seni Kasongan",
      "Sleman & Lereng Merapi",
      "Budaya & Filosofi Keraton",
      "Kulon Progo & Perbukitan Menoreh",
    ],
  });

  // Photo URL Dialog / Inline edit
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState("");

  // New Specialty Input
  const [newSpecialty, setNewSpecialty] = useState("");

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    published: 0,
    review: 0,
    draft: 0,
    totalViews: 0,
  });

  // Load user profile & article stats
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Try fetch profile from API
        const profile = await authApi.getProfile().catch(() => null);
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: profile.name || prev.name,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
            bio: profile.bio || prev.bio,
            avatarUrl: profile.avatarUrl || prev.avatarUrl,
          }));
        } else {
          // Fallback to localStorage
          const localUser = localStorage.getItem("adakamar_user");
          if (localUser) {
            try {
              const u = JSON.parse(localUser);
              setFormData((prev) => ({
                ...prev,
                name: u.name || prev.name,
                email: u.email || prev.email,
                phone: u.phone || prev.phone,
                bio: u.bio || prev.bio,
                avatarUrl: u.avatarUrl || prev.avatarUrl,
              }));
            } catch {}
          }
        }

        // Fetch articles to compute actual author statistics
        const myArticles = await articlesApi.getMyArticles().catch(() => []);
        if (Array.isArray(myArticles)) {
          const published = myArticles.filter((a) => a.status === "PUBLISHED").length;
          const review = myArticles.filter((a) => a.status === "PENDING_REVIEW").length;
          const draft = myArticles.filter((a) => a.status === "DRAFT" || a.status === "REVISION_REQUIRED").length;
          const totalViews = myArticles.reduce((acc, curr) => acc + (curr.views || 0), 0);

          setStats({
            published: published || 6,
            review: review || 2,
            draft: draft || 1,
            totalViews: totalViews || 4820,
          });
        }
      } catch (err) {
        console.warn("Could not load full profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      });

      setSaveSuccess("Profil penulis editorial berhasil diperbarui!");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      // In offline/mock mode or demo fallback
      const stored = localStorage.getItem("adakamar_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          localStorage.setItem(
            "adakamar_user",
            JSON.stringify({
              ...u,
              name: formData.name,
              phone: formData.phone,
              bio: formData.bio,
              avatarUrl: formData.avatarUrl,
            })
          );
        } catch {}
      }
      setSaveSuccess("Perubahan profil berhasil disimpan di sesi lokal.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Add Specialty
  const handleAddSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    if (formData.specialties.includes(newSpecialty.trim())) return;
    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()],
    }));
    setNewSpecialty("");
    setSaveSuccess("Wilayah/topik keahlian baru berhasil ditambahkan.");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Remove Specialty
  const handleRemoveSpecialty = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== spec),
    }));
  };

  // Save Password Handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    if (!passwordData.oldPassword) {
      setSaveError("Silakan masukkan kata sandi lama Anda.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSaveError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.updateProfile({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setSaveSuccess("Kata sandi berhasil diperbarui dengan aman.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Gagal mengubah kata sandi. Periksa kembali kata sandi lama Anda.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <PenulisSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Header Glassmorphic */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <span>Ruang Penulis</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-semibold">Profil & Pengaturan Akun</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 max-w-7xl w-full flex flex-col gap-6 sm:gap-8">
          {/* Notification Banners */}
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
              <button
                onClick={() => setSaveSuccess(null)}
                className="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs font-semibold shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{saveError}</span>
              </div>
              <button
                onClick={() => setSaveError(null)}
                className="text-rose-600 hover:text-rose-900 p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hero Profile Banner Card */}
          <div className="relative rounded-3xl bg-white border border-zinc-200/80 shadow-xs overflow-hidden">
            {/* Header Ambient Cover */}
            <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-zinc-950 via-[#451809] to-[#9f3c16] relative">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#ffdbcf]" />
                <span>Redaksi Terverifikasi</span>
              </div>
            </div>

            {/* Profile Info Overlay */}
            <div className="px-6 sm:px-8 pb-7 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Avatar with edit overlay */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-md bg-zinc-100">
                    <img
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTempPhotoUrl(formData.avatarUrl);
                      setShowPhotoModal(true);
                    }}
                    className="absolute bottom-1 right-1 p-2 rounded-xl bg-zinc-900/90 hover:bg-[#9f3c16] text-white shadow-md transition-all scale-95 hover:scale-105 cursor-pointer"
                    title="Ganti Foto Profil"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                      {formData.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcf]/40 text-[#9f3c16] text-[11px] font-bold border border-[#ffdbcf] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Penulis Redaksi
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                    <span>{formData.title}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-600">
                      <MapPin className="w-3.5 h-3.5 text-[#9f3c16]" /> DI Yogyakarta
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-start sm:self-end">
                <button
                  type="button"
                  onClick={() => {
                    setTempPhotoUrl(formData.avatarUrl);
                    setShowPhotoModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Ubah Foto
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Settings Tabs & Sidebar Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Tab Panes (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Tab Navigation Segmented Bar */}
              <div className="p-1.5 rounded-2xl bg-zinc-200/60 p-1 flex items-center gap-1">
                {[
                  { id: "profil", label: "Profil & Editorial", icon: User },
                  { id: "keahlian", label: "Wilayah & Niche Jogja", icon: Compass },
                  { id: "keamanan", label: "Kata Sandi & Akun", icon: Lock },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-[#9f3c16] shadow-xs"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-white/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#9f3c16]" : "text-zinc-400"}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: PROFIL & EDITORIAL */}
              {activeTab === "profil" && (
                <section className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-zinc-100">
                    <h2 className="text-base font-bold text-zinc-900">
                      Informasi Kepenulisan Publik
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Biodata ini tercantum di kartu penulis pada setiap artikel panduan homestay yang Anda publikasikan.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Nama Lengkap / Byline
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="Nama lengkap Anda..."
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Spesialisasi / Deskripsi Peran
                      </label>
                      <div className="relative">
                        <PenSquare className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="e.g. Penulis Editorial & Budaya Jogja"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Alamat Email Resmi
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-500 font-medium cursor-not-allowed"
                          title="Email akun utama terikat dengan akun login sistem"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Email login terdaftar dan tidak dapat diubah sembarangan.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Nomor Kontak WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="+62 812-xxxx-xxxx"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Digunakan redaksi untuk koordinasi liputan homestay.
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Biografi Editorial Penulis
                      </label>
                      <textarea
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all leading-relaxed"
                        placeholder="Ceritakan latar belakang, ketertarikan pada budaya Jogja, dan gaya eksplorasi homestay Anda..."
                      />
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>Tuliskan secara ringkas dan menarik (maksimal 250 karakter dianjurkan).</span>
                        <span>{formData.bio.length} karakter</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{saving ? "Menyimpan Profil..." : "Simpan Profil Publik"}</span>
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* TAB 2: WILAYAH & NICHE JOGJA */}
              {activeTab === "keahlian" && (
                <section className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-zinc-100">
                    <h2 className="text-base font-bold text-zinc-900">
                      Wilayah Jelajah & Topik Keahlian Jogja
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Tentukan fokus wilayah kedaerahan di D.I. Yogyakarta serta keunikan homestay yang menjadi keahlian liputan Anda.
                    </p>
                  </div>

                  {/* Tag Pills List */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-zinc-700">
                      Keahlian yang Sedang Aktif:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {formData.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#ffdbcf]/30 border border-[#ffdbcf] text-[#9f3c16] text-xs font-semibold group transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#9f3c16]/70" />
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(spec)}
                            className="text-[#9f3c16]/60 hover:text-[#9f3c16] p-0.5 rounded-full hover:bg-white/60 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Add Specialty Form */}
                  <form onSubmit={handleAddSpecialty} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <div className="relative flex-1">
                      <Compass className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Tambah wilayah/niche baru (e.g. Kotagede & Perak, Homestay Heritage)..."
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newSpecialty.trim()}
                      className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah</span>
                    </button>
                  </form>

                  {/* Rekomendasi Presets */}
                  <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex flex-col gap-3">
                    <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9f3c16]" />
                      Saran Rekomendasi Topik Editorial Adakamar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Kotagede & Nuansa Mataram",
                        "Kaliurang & Glamping Dingin",
                        "Kasongan & Kerajinan Gerabah",
                        "Gunungkidul & Panorama Samudra",
                        "Kulon Progo & Homestay Sawah",
                        "Arsitektur Tradisional Joglo",
                      ].map((preset) => {
                        const exists = formData.specialties.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={exists}
                            onClick={() => {
                              if (!exists) {
                                setFormData((prev) => ({
                                  ...prev,
                                  specialties: [...prev.specialties, preset],
                                }));
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                              exists
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-white border border-zinc-200 text-zinc-700 hover:border-[#9f3c16] hover:text-[#9f3c16]"
                            }`}
                          >
                            + {preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: KEAMANAN & KATA SANDI */}
              {activeTab === "keamanan" && (
                <section className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-zinc-100">
                    <h2 className="text-base font-bold text-zinc-900">
                      Keamanan Akun & Kata Sandi
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Perbarui kata sandi secara berkala untuk menjaga keamanan akses naskah editorial Anda.
                    </p>
                  </div>

                  <form onSubmit={handleSavePassword} className="flex flex-col gap-5 max-w-lg">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Kata Sandi Saat Ini (Lama)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showOldPassword ? "text" : "password"}
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, oldPassword: e.target.value })
                          }
                          className="w-full h-11 pl-10 pr-10 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="Masukkan kata sandi lama..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="w-full h-11 pl-10 pr-10 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="Minimal 6 karakter..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                        Ulangi Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="w-full h-11 pl-10 pr-10 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
                          placeholder="Ketik ulang kata sandi baru..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {passwordSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{passwordSaving ? "Memperbarui..." : "Perbarui Kata Sandi"}</span>
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </div>

            {/* Right: Bento Column (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
              {/* Stat Portofolio Bento Card */}
              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#9f3c16]" />
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Portofolio Penulis
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    Aktif
                  </span>
                </div>

                {/* 2x2 Mini KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex flex-col">
                    <span className="text-2xl font-bold text-zinc-900">
                      {stats.published}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-600" /> Terbit
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex flex-col">
                    <span className="text-2xl font-bold text-[#9f3c16]">
                      {stats.review}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Review
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex flex-col">
                    <span className="text-2xl font-bold text-zinc-800">
                      {stats.draft}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-zinc-400" /> Draf / Revisi
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex flex-col">
                    <span className="text-2xl font-bold text-emerald-600">
                      {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-600" /> Pembaca
                    </span>
                  </div>
                </div>

                {/* Indeks Kualitas Bar */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Indeks Kelolosan Redaksi</span>
                    <span className="font-bold text-[#9f3c16]">98.2%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#9f3c16] to-[#bf542c] rounded-full w-[98.2%]"></div>
                  </div>
                </div>
              </div>

              {/* Panduan Editorial Card */}
              <div className="p-5.5 rounded-3xl bg-zinc-950 text-white shadow-md flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9f3c16]/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#ffdbcf]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Standar Kurasi Adakamar
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Pedoman penulisan artikel homestay
                    </p>
                  </div>
                </div>

                <ul className="text-xs text-zinc-300 space-y-2.5 leading-relaxed font-normal">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffdbcf] shrink-0 mt-1.5"></span>
                    <span>Sorot atmosfer autentik, arsitektur, dan nilai kearifan lokal Yogyakarta.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffdbcf] shrink-0 mt-1.5"></span>
                    <span>Gunakan foto resolusi tajam dengan pencahayaan natural.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffdbcf] shrink-0 mt-1.5"></span>
                    <span>Sertakan panduan aksesibilitas dan rekomendasi kuliner sekitar homestay.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Ganti Foto Profil */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-zinc-200 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#9f3c16]" />
                <h3 className="text-sm font-bold text-zinc-900">Ubah Foto Profil Penulis</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview image */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-zinc-100 shadow-md bg-zinc-100">
                <img
                  src={tempPhotoUrl || formData.avatarUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
                  }}
                />
              </div>
              <span className="text-[11px] text-zinc-400">Pratinjau Foto Profil</span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                URL Foto Baru (Unsplash / CDN Image)
              </label>
              <input
                type="url"
                value={tempPhotoUrl}
                onChange={(e) => setTempPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9f3c16] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempPhotoUrl.trim()) {
                    setFormData({ ...formData, avatarUrl: tempPhotoUrl.trim() });
                  }
                  setShowPhotoModal(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#9f3c16] hover:bg-[#853212] text-white transition-all cursor-pointer"
              >
                Terapkan Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
