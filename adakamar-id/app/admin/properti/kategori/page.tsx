"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { categoriesApi } from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Loader2,
  Check,
  X,
  AlertCircle,
  Home,
  Waves,
  Tag,
  Users,
  Trees,
  Camera,
  Heart,
  Crown,
  Building2,
  Coffee,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";

export const ICON_OPTIONS = [
  { value: "cottage", label: "Joglo / Heritage", Icon: Home, desc: "Rumah joglo & limasan klasik" },
  { value: "pool", label: "Private Pool", Icon: Waves, desc: "Fasilitas kolam renang pribadi" },
  { value: "family", label: "Family Friendly", Icon: Users, desc: "Kapasitas besar untuk rombongan" },
  { value: "nature", label: "Nuansa Alam", Icon: Trees, desc: "Pedesaan asri & pemandangan alam" },
  { value: "budget", label: "Budget Friendly", Icon: Tag, desc: "Penginapan hemat berkualitas" },
  { value: "luxury", label: "Luxury & Exclusive", Icon: Crown, desc: "Vila mewah dengan servis premium" },
  { value: "aesthetic", label: "Estetik & Vintage", Icon: Camera, desc: "Interior unik & spot fotogenik" },
  { value: "romantic", label: "Honeymoon", Icon: Heart, desc: "Suasana tenang untuk pasangan" },
  { value: "urban", label: "Pusat Kota", Icon: Building2, desc: "Akses dekat titik sentral Jogja" },
  { value: "bnb", label: "Bed & Breakfast", Icon: Coffee, desc: "Termasuk sarapan khas lokal" },
];

export const getCategoryIcon = (iconKey?: string) => {
  if (!iconKey) return Home;
  const key = iconKey.toLowerCase();
  const found = ICON_OPTIONS.find((opt) => opt.value === key || key.includes(opt.value));
  return found ? found.Icon : Home;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  _count?: { properties: number };
}

interface FormState {
  name: string;
  icon: string;
  description: string;
}

const emptyForm: FormState = { name: "", icon: "cottage", description: "" };

export default function AdminKategoriPropertiPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal Box State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      icon: cat.icon || "cottage",
      description: cat.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await categoriesApi.update(editingId, form);
        showToast("success", "✓ Kategori berhasil diperbarui.");
      } else {
        await categoriesApi.create(form);
        showToast("success", "✓ Kategori baru berhasil ditambahkan.");
      }
      closeModal();
      fetchCategories();
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan kategori.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await categoriesApi.remove(id);
      showToast("success", `✓ Kategori "${name}" berhasil dihapus.`);
      fetchCategories();
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus kategori.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProperties = categories.reduce((sum, c) => sum + (c._count?.properties || 0), 0);
  const mostPopular = [...categories].sort(
    (a, b) => (b._count?.properties || 0) - (a._count?.properties || 0)
  )[0];

  return (
    <div className="min-h-screen bg-[#f8f7fb] text-zinc-900 flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/admin/penginapan" className="hover:text-zinc-900 transition-colors">
              Penginapan
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">Kategori Homestay</span>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </header>

        <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold shadow-sm animate-in fade-in duration-150 ${
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                  Taksonomi & Arsitektur
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • Pengelompokan Penginapan Jogja
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Kategori Homestay & Vila
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
                Kelola kategori tematik arsitektur (Joglo, Modern, Private Pool, dsb) untuk mempermudah pencarian tamu di homepage.
              </p>
            </div>
          </div>

          {/* 3 Bento Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Kategori</span>
                <span className="p-2.5 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16]">
                  <FolderOpen className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{categories.length}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Klasifikasi arsitektur terdaftar</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Homestay Terkategori</span>
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <Home className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{totalProperties}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Unit terhubung dengan kategori</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Kategori Terpopuler</span>
                <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#9f3c16] tracking-tight truncate">
                  {mostPopular ? mostPopular.name : "-"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {mostPopular ? `${mostPopular._count?.properties || 0} unit homestay aktif` : "Belum ada data"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari kategori berdasarkan nama atau penjelasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
              />
            </div>
            <span className="text-xs font-bold text-zinc-400">
              Menampilkan {filteredCategories.length} dari {categories.length} kategori
            </span>
          </div>

          {/* Categories Grid or Empty/Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
              <p className="text-xs text-zinc-500 font-medium">Memuat kategori dari database...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-white rounded-3xl border border-zinc-200/80 p-8">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm text-rose-600 font-medium">{error}</p>
              <button
                onClick={fetchCategories}
                className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white rounded-3xl border border-zinc-200/80 p-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">
                  {searchTerm ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                </h3>
                <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                  {searchTerm
                    ? "Coba gunakan kata kunci pencarian yang lain."
                    : "Tambahkan kategori penginapan untuk mengelompokkan homestay berdasarkan arsitektur & kenyamanan tamu."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openAddModal}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 hover:opacity-95 cursor-pointer"
                  >
                    Tambah Kategori Sekarang
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const propertyCount = cat._count?.properties ?? 0;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 flex flex-col justify-between gap-4 hover:shadow-lg hover:border-zinc-300 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/60">
                          {propertyCount} homestay
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-zinc-950 leading-snug tracking-tight">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                        slug: /{cat.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors cursor-pointer border border-zinc-200/60"
                      >
                        <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors disabled:opacity-60 cursor-pointer border border-rose-200/60"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal Box: Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-zinc-200/80 flex flex-col gap-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">
                    {editingId ? "Edit Kategori Homestay" : "Tambah Kategori Baru"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {editingId
                      ? "Perbarui informasi kategori arsitektur di basis data"
                      : "Kategori baru akan tersimpan di database dan langsung aktif"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              {/* Category Name */}
              <div>
                <label className="font-bold text-zinc-800 block mb-1.5">
                  Nama Kategori <span className="text-[#9f3c16]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Joglo Autentik Heritage, Villa Private Pool"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                />
              </div>

              {/* Visual Icon Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-zinc-800 block">
                    Pilih Ikon Representasi
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Klik untuk memilih ikon
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const IconComp = opt.Icon;
                    const isSelected = form.icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, icon: opt.value })}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#9f3c16] bg-[#ffdbcf]/40 ring-2 ring-[#9f3c16]/30 text-[#9f3c16] shadow-xs font-bold"
                            : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSelected ? "text-[#9f3c16]" : "text-zinc-500"}`} />
                        <span className="text-[10px] leading-tight line-clamp-1">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-zinc-800 block mb-1.5">
                  Deskripsi Kategori (opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan keunikan & karakteristik homestay dalam kategori ini..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all resize-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white font-bold shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? "Simpan Perubahan" : "Tambah Kategori"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
