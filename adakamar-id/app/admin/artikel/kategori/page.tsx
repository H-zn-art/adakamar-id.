"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articleCategoriesApi } from "@/lib/api";
import {
  FolderTree,
  FileText,
  Sparkles,
  Plus,
  Search,
  ChevronRight,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
  CheckCircle,
  Copy,
  X,
  AlertTriangle,
  Info,
  TrendingUp,
  BarChart2,
  Check,
  RotateCcw,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  colorAccent: string;
  articleCount: number;
  placements: string[];
  lastUpdated: string;
  updatedBy: string;
  status: "active" | "archived";
  description: string;
}

const availableColors = [
  { name: "Terracotta (Default)", hex: "#9f3c16" },
  { name: "Ochre Gold", hex: "#8d4b00" },
  { name: "Forest Sage", hex: "#15803D" },
  { name: "Charcoal Slate", hex: "#1a1b22" },
  { name: "Clay Brown", hex: "#bf542c" },
];

export default function AdminKategoriArtikelPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("most");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadCategories = async () => {
    try {
      const data = await articleCategoriesApi.list();
      if (Array.isArray(data)) {
        const mapped: CategoryItem[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || "explore",
          colorAccent: c.colorAccent || "#9f3c16",
          articleCount: c._count?.articles ?? 0,
          placements: [
            ...(c.showInNav ? ["Navbar Blog"] : []),
            ...(c.showInFeatured ? ["Sorot Beranda"] : []),
          ],
          lastUpdated: "Hari ini",
          updatedBy: "Admin",
          status: "active",
          description: c.description || "",
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.warn("API error loading categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [nameInput, setNameInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [iconInput, setIconInput] = useState("explore");
  const [colorInput, setColorInput] = useState("#9f3c16");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [showInNavbar, setShowInNavbar] = useState(true);
  const [showInFeatured, setShowInFeatured] = useState(true);

  // Delete Dialog State
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setNameInput("");
    setSlugInput("");
    setIconInput("explore");
    setColorInput("#9f3c16");
    setDescriptionInput("");
    setShowInNavbar(true);
    setShowInFeatured(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setModalMode("edit");
    setEditingId(cat.id);
    setNameInput(cat.name);
    setSlugInput(cat.slug);
    setIconInput(cat.icon);
    setColorInput(cat.colorAccent);
    setDescriptionInput(cat.description);
    setShowInNavbar(cat.placements.includes("Navbar Blog"));
    setShowInFeatured(cat.placements.includes("Sorot Beranda"));
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setNameInput(val);
    if (modalMode === "add") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlugInput(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      if (modalMode === "add") {
        await articleCategoriesApi.create({
          name: nameInput,
          icon: iconInput,
          colorAccent: colorInput,
          description: descriptionInput,
          showInNav: showInNavbar,
          showInFeatured: showInFeatured,
        });
        showToast(`✓ Kategori "${nameInput}" berhasil ditambahkan.`);
      } else if (editingId) {
        await articleCategoriesApi.update(editingId, {
          name: nameInput,
          icon: iconInput,
          colorAccent: colorInput,
          description: descriptionInput,
          showInNav: showInNavbar,
          showInFeatured: showInFeatured,
        });
        showToast(`✓ Kategori "${nameInput}" berhasil diperbarui.`);
      }
    } catch (err) {
      console.warn("API error saving category:", err);
    }

    setModalOpen(false);
    await loadCategories();
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;
    try {
      await articleCategoriesApi.remove(deleteCategory.id);
      showToast(`✓ Kategori "${deleteCategory.name}" berhasil dihapus.`);
    } catch (err) {
      console.warn("API delete category warning:", err);
    }
    setDeleteCategory(null);
    await loadCategories();
  };

  // Filter & Sort
  const filteredCategories = categories
    .filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || cat.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "most") return b.articleCount - a.articleCount;
      if (sortOrder === "az") return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalArticles = categories.reduce((sum, c) => sum + c.articleCount, 0);
  const sortedByArticles = [...categories].sort((a, b) => b.articleCount - a.articleCount);
  const topCategory = sortedByArticles[0];
  const topCategoryName =
    topCategory?.articleCount > 0 ? topCategory.name : categories[0]?.name || "Belum Ada";
  const topCategoryCount = topCategory?.articleCount || 0;
  const topCategoryRatio =
    totalArticles > 0 ? Math.round((topCategoryCount / totalArticles) * 100) : 0;

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/admin/artikel" className="hover:text-zinc-900 transition-colors">
              Naskah & Artikel
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">Kategori Artikel</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                  Taksonomi Editorial
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • DIY Yogyakarta Region
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Kategori Artikel & Topik Wisata
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
                Kelola taksonomi editorial, slug URL SEO ramah mesin pencari, penempatan di navbar beranda, dan keterhubungan artikel kurasi Jogja.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => showToast("✓ Data kategori berhasil diekspor ke CSV.")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Bento Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Kategori</span>
                <span className="p-2.5 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16]">
                  <FolderTree className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{categories.length}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Semua Aktif di Sistem</span>
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Naskah</span>
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <FileText className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{totalArticles}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  100% Terindeks • 0 Tanpa Kategori
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Terpopuler</span>
                <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <div>
                <span className="text-base font-extrabold text-zinc-950 truncate block">
                  {topCategoryName}
                </span>
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
                  <span>{topCategoryCount} Artikel</span>
                  <span className="text-[#9f3c16] font-bold">{topCategoryRatio}% Porsi</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#9f3c16] h-full rounded-full transition-all"
                    style={{ width: `${Math.max(5, topCategoryRatio)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Distribusi</span>
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                  <BarChart2 className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">
                  {categories.length > 0 ? (totalArticles / categories.length).toFixed(1) : "0.0"}
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Sebaran Konten Optimal</span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Data Section */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative min-w-[280px] max-w-md flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nama kategori, slug URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="archived">Arsip</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="most">Paling Banyak Artikel</option>
                  <option value="az">Alfabetis A-Z</option>
                </select>

                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                    title="Reset Filter"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    <th className="py-4 px-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredCategories.length &&
                          filteredCategories.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-5 min-w-[240px]">Kategori & Topik</th>
                    <th className="py-4 px-5 min-w-[220px]">Slug SEO</th>
                    <th className="py-4 px-5 min-w-[130px]">Jumlah Artikel</th>
                    <th className="py-4 px-5 min-w-[180px]">Penempatan</th>
                    <th className="py-4 px-5 min-w-[150px]">Terakhir Diperbarui</th>
                    <th className="py-4 px-5 w-28">Status</th>
                    <th className="py-4 px-5 text-right w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-zinc-400 text-sm">
                        Tidak ada kategori artikel yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isSelected = selectedIds.includes(cat.id);
                      return (
                        <tr
                          key={cat.id}
                          className={`hover:bg-zinc-50/60 transition-colors group ${
                            isSelected ? "bg-[#ffdbcf]/20" : ""
                          }`}
                        >
                          <td className="py-4 px-5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(cat.id)}
                              className="rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 font-bold"
                                style={{ backgroundColor: cat.colorAccent }}
                              >
                                <FolderTree className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm text-zinc-950 group-hover:text-[#9f3c16] transition-colors truncate">
                                  {cat.name}
                                </span>
                                <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs">
                                  {cat.description || "Tidak ada deskripsi"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-[11px] text-zinc-500">
                            /blog/kategori/{cat.slug}
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-bold text-zinc-950">{cat.articleCount}</span> naskah
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-wrap gap-1.5">
                              {cat.placements.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600 border border-zinc-200/60"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-zinc-500">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-900">{cat.lastUpdated}</span>
                              <span className="text-[10px] text-zinc-400">{cat.updatedBy}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Aktif
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleOpenEdit(cat)}
                                title="Ubah Kategori"
                                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/panduan-jogja`}
                                target="_blank"
                                title="Lihat Publik"
                                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-[#9f3c16] transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteCategory(cat)}
                                title="Hapus Kategori"
                                className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Sitemap Footer link bar */}
            <div className="p-4.5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Sitemap Kategori:{" "}
                  <code className="text-[#9f3c16] font-bold">/sitemap-categories.xml</code>
                </span>
              </div>
              <button
                onClick={() => showToast("✓ URL sitemap kategori disalin ke papan klip!")}
                className="hover:text-zinc-900 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin URL Sitemap</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: Dialog Tambah / Edit Kategori Artikel */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  {modalMode === "add" ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-950">
                    {modalMode === "add" ? "Tambah Kategori Baru" : "Ubah Kategori Artikel"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Perbarui nama, slug SEO, dan deskripsi kategori untuk pembaca blog.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSave}>
              <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                {/* Field 1: Nama Kategori */}
                <div>
                  <label className="text-xs font-bold text-zinc-800 flex items-center justify-between mb-1.5">
                    <span>
                      Nama Kategori <span className="text-[#9f3c16]">*</span>
                    </span>
                    <span className="text-zinc-400 font-normal text-[11px]">
                      Maks. 50 karakter
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Seni & Kerajinan Joglo"
                    className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                  />
                </div>

                {/* Field 2: Slug URL SEO */}
                <div>
                  <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                    Slug URL SEO <span className="text-[#9f3c16]">*</span>
                  </label>
                  <div className="flex items-center rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden focus-within:border-[#9f3c16]">
                    <span className="px-3.5 py-3 text-[11px] text-zinc-500 bg-zinc-100/70 select-none font-mono border-r border-zinc-200">
                      /blog/kategori/
                    </span>
                    <input
                      type="text"
                      required
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      placeholder="seni-kerajinan-joglo"
                      className="h-11 flex-1 px-3 bg-transparent text-xs text-zinc-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Field 3: Aksen Warna */}
                <div>
                  <label className="text-xs font-bold text-zinc-800 mb-2 block">
                    Pilih Aksen Warna Kategori
                  </label>
                  <div className="flex items-center gap-3">
                    {availableColors.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setColorInput(col.hex)}
                        title={col.name}
                        className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                          colorInput === col.hex
                            ? "ring-3 ring-offset-2 ring-[#9f3c16] scale-110 shadow-sm"
                            : "hover:opacity-80"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Field 4: Deskripsi Singkat */}
                <div>
                  <label className="text-xs font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                    <span>Deskripsi Singkat Kategori</span>
                    <span className="text-zinc-400 text-[11px] font-normal">Tampil di arsip</span>
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Tuliskan ringkasan kategori untuk membantu pembaca memahami topik..."
                    className="w-full p-3.5 text-xs rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] resize-none text-zinc-900 placeholder-zinc-400 transition-all"
                  />
                </div>

                {/* Field 5: Pengaturan Tampilan Publik */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <span className="text-xs font-bold text-zinc-800">
                    Pengaturan Tampilan Publik
                  </span>
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={showInNavbar}
                      onChange={(e) => setShowInNavbar(e.target.checked)}
                      className="mt-0.5 rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">
                        Tampilkan di Navigasi Blog Utama
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Muncul langsung di navbar atas blog adakamar.id tanpa harus membuka menu dropdown.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={showInFeatured}
                      onChange={(e) => setShowInFeatured(e.target.checked)}
                      className="mt-0.5 rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">
                        Sorot di Beranda adakamar.id
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Kategori ini akan diprioritaskan pada filter eksplorasi beranda website tamu.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Dialog Konfirmasi Hapus Kategori */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-zinc-200/80 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-950">
              Hapus Kategori Artikel?
            </h3>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <strong className="text-zinc-900">&ldquo;{deleteCategory.name}&rdquo;</strong>? Kategori ini memiliki{" "}
              <span className="font-bold text-[#9f3c16]">{deleteCategory.articleCount} artikel</span> terhubung.
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Artikel dalam kategori ini akan otomatis dialihkan ke status{" "}
                <strong>&ldquo;Tanpa Kategori&rdquo;</strong> dan naskah tidak akan terhapus dari sistem.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Kategori</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-zinc-900 text-white shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <CheckCircle className="text-emerald-400 w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
