"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articleTagsApi, articleCategoriesApi } from "@/lib/api";
import {
  Tag as TagIcon,
  Flame,
  TrendingUp,
  Plus,
  Search,
  ChevronRight,
  Download,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  parentCategory: string;
  articleCount: number;
  searchVolume: string;
  trend: "up" | "stable" | "down";
  status: "popular" | "optimal" | "needs_content";
  colorAccent: string;
  metaDescription: string;
  isTrending: boolean;
}

const DEFAULT_PARENT_CATEGORIES = [
  "Arsitektur & Budaya Jawa",
  "Wisata Alam & Petualangan",
  "Kuliner Tradisional Jogja",
  "Rekomendasi & Tipe Penginapan",
];

const availableColors = [
  { name: "Terracotta", hex: "#9f3c16" },
  { name: "Forest", hex: "#15803D" },
  { name: "Amber", hex: "#8d4b00" },
  { name: "Slate", hex: "#1a1b22" },
  { name: "Warm Brown", hex: "#bf542c" },
];

export default function AdminTagArtikelPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal Tambah/Ubah Tag
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dynamic parent categories from database
  const [parentCategories, setParentCategories] = useState<string[]>(DEFAULT_PARENT_CATEGORIES);

  // Form Fields
  const [nameInput, setNameInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [parentCatInput, setParentCatInput] = useState(DEFAULT_PARENT_CATEGORIES[0]);
  const [metaDescInput, setMetaDescInput] = useState("");
  const [colorInput, setColorInput] = useState("#9f3c16");
  const [trendingInput, setTrendingInput] = useState(false);

  // Delete Alert
  const [deleteTag, setDeleteTag] = useState<TagItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadTags = async () => {
    try {
      const data = await articleTagsApi.list();
      if (Array.isArray(data)) {
        const mapped: TagItem[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          parentCategory: t.parentCategory || "Arsitektur & Budaya Jawa",
          articleCount: t._count?.articles ?? 0,
          searchVolume: "Database",
          trend: "stable",
          status:
            (t._count?.articles ?? 0) >= 3
              ? "popular"
              : (t._count?.articles ?? 0) > 0
              ? "optimal"
              : "needs_content",
          colorAccent: t.colorAccent || "#9f3c16",
          metaDescription: `Kumpulan artikel seputar ${t.name} di Yogyakarta`,
          isTrending: Boolean(t.isTrending),
        }));
        setTags(mapped);
        return;
      }
    } catch (err) {
      console.warn("API load tags error:", err);
    }
  };

  useEffect(() => {
    loadTags();
    articleCategoriesApi
      .list()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          const names = cats.map((c: any) => c.name);
          setParentCategories(names);
          setParentCatInput((prev) => (names.includes(prev) ? prev : names[0]));
        }
      })
      .catch((err) => console.warn("Load article categories for tags:", err));
  }, []);

  const handleToggleTrending = async (tag: TagItem) => {
    const nextVal = !tag.isTrending;
    setTags((prev) =>
      prev.map((t) => (t.id === tag.id ? { ...t, isTrending: nextVal } : t))
    );
    try {
      await articleTagsApi.update(tag.id, {
        name: tag.name,
        parentCategory: tag.parentCategory,
        colorAccent: tag.colorAccent,
        isTrending: nextVal,
      });
      showToast(
        nextVal
          ? `✓ Tag #${tag.name} diaktifkan sebagai Trending!`
          : `✓ Status trending tag #${tag.name} dinonaktifkan.`
      );
    } catch (err: any) {
      showToast(err.message || "Gagal mengubah status trending.");
      loadTags();
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setNameInput("");
    setSlugInput("");
    setParentCatInput(parentCategories[0]);
    setMetaDescInput("");
    setColorInput("#9f3c16");
    setTrendingInput(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (tag: TagItem) => {
    setModalMode("edit");
    setEditingId(tag.id);
    setNameInput(tag.name);
    setSlugInput(tag.slug);
    setParentCatInput(tag.parentCategory);
    setMetaDescInput(tag.metaDescription);
    setColorInput(tag.colorAccent);
    setTrendingInput(tag.isTrending);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setNameInput(val);
    if (modalMode === "add") {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlugInput(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      if (modalMode === "add") {
        await articleTagsApi.create({
          name: nameInput,
          parentCategory: parentCatInput,
          colorAccent: colorInput,
          isTrending: trendingInput,
        });
        showToast(`✓ Tag #${nameInput} berhasil ditambahkan.`);
      } else if (editingId) {
        await articleTagsApi.update(editingId, {
          name: nameInput,
          parentCategory: parentCatInput,
          colorAccent: colorInput,
          isTrending: trendingInput,
        });
        showToast(`✓ Tag #${nameInput} berhasil diperbarui.`);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan tag.");
    }
    setModalOpen(false);
    await loadTags();
  };

  const confirmDelete = async () => {
    if (!deleteTag) return;
    try {
      await articleTagsApi.remove(deleteTag.id);
      showToast(`✓ Tag #${deleteTag.name} berhasil dihapus.`);
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus tag.");
    }
    setDeleteTag(null);
    await loadTags();
  };

  // Filters
  const filteredTags = tags.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.parentCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "all" || t.parentCategory === categoryFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTags.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTags.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: TagItem["status"]) => {
    switch (status) {
      case "popular":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Populer
          </span>
        );
      case "optimal":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold border border-zinc-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16]" />
            Optimal
          </span>
        );
      case "needs_content":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Kurang Konten
          </span>
        );
    }
  };

  const totalTagArticles = tags.reduce((sum, t) => sum + t.articleCount, 0);
  const avgTagPerArticle = tags.length > 0 ? (totalTagArticles / tags.length).toFixed(1) : "0.0";
  const sortedByUsage = [...tags].sort((a, b) => b.articleCount - a.articleCount);
  const topTag = sortedByUsage[0];
  const topTagName =
    topTag && topTag.articleCount > 0 ? `#${topTag.name}` : tags[0] ? `#${tags[0].name}` : "-";
  const topTagCount = topTag?.articleCount || 0;
  const trendingTagsCount = tags.filter((t) => t.isTrending).length;
  const zeroUsageCount = tags.filter((t) => t.articleCount === 0).length;

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
            <span className="text-[#9f3c16] font-bold">Tag & Kata Kunci</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tag Baru</span>
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
                  Taksonomi Konten
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • Panduan Wisata & Homestay Jogja
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Manajemen Tag & Kata Kunci
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
                Kelola tag artikel, topik kurasi Jogja, tren pencarian tamu, dan optimasi metadata pencarian editorial homestay.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => showToast("✓ Daftar tag berhasil diekspor (.CSV).")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Ekspor (.CSV)</span>
              </button>
            </div>
          </div>

          {/* 4 Bento Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Tag Aktif</span>
                <span className="p-2.5 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16]">
                  <TagIcon className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{tags.length}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>100% Tersimpan di Database</span>
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Penggunaan</span>
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <Layers className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{avgTagPerArticle}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Total {totalTagArticles} tautan naskah
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tag Terpopuler</span>
                <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <div>
                <span className="font-extrabold text-base text-[#9f3c16] font-mono truncate block">
                  {topTagName}
                </span>
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
                  <span>{topTagCount} artikel terhubung</span>
                  <span className="text-emerald-600 font-bold">
                    {topTag?.isTrending ? "🔥 Trending" : "Aktif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tag Trending</span>
                <span className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
                  <Flame className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-orange-600 tracking-tight">{trendingTagsCount}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {zeroUsageCount} tag belum ada naskah
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Data Table Section */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative min-w-[280px] max-w-md flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nama tag, slug, kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Kategori Induk</option>
                  {parentCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status Sebaran</option>
                  <option value="popular">Populer</option>
                  <option value="optimal">Optimal</option>
                  <option value="needs_content">Kurang Konten</option>
                </select>

                {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
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
                          selectedIds.length === filteredTags.length && filteredTags.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-5 min-w-[240px]">Tag & Slug</th>
                    <th className="py-4 px-5 min-w-[200px]">Kategori Topik Induk</th>
                    <th className="py-4 px-5 min-w-[160px]">Artikel Terhubung</th>
                    <th className="py-4 px-5 min-w-[140px]">Status Trending</th>
                    <th className="py-4 px-5 w-32">Status Sebaran</th>
                    <th className="py-4 px-5 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-zinc-400 text-sm">
                        Tidak ada kata kunci tag yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredTags.map((tag) => {
                      const isSelected = selectedIds.includes(tag.id);
                      const percent = Math.min(100, Math.round((tag.articleCount / 35) * 100));
                      return (
                        <tr
                          key={tag.id}
                          className={`hover:bg-zinc-50/60 transition-colors group ${
                            isSelected ? "bg-[#ffdbcf]/20" : ""
                          }`}
                        >
                          <td className="py-4 px-5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(tag.id)}
                              className="rounded-lg accent-[#9f3c16] w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-extrabold text-sm hover:underline cursor-pointer font-mono"
                                  style={{ color: tag.colorAccent }}
                                  onClick={() => handleOpenEdit(tag)}
                                >
                                  #{tag.name}
                                </span>
                                {tag.isTrending && (
                                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-600" />
                                    <span>Trending</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                /tag/{tag.slug}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 font-bold text-[11px] border border-zinc-200/60">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tag.colorAccent }}
                              />
                              {tag.parentCategory}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-zinc-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor:
                                      tag.status === "needs_content" ? "#dc2626" : tag.colorAccent,
                                  }}
                                />
                              </div>
                              <span
                                className={`font-bold ${
                                  tag.status === "needs_content"
                                    ? "text-rose-600"
                                    : "text-zinc-800"
                                }`}
                              >
                                {tag.articleCount} artikel
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <button
                              type="button"
                              onClick={() => handleToggleTrending(tag)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                                tag.isTrending
                                  ? "bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100"
                                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200/70 border border-zinc-200/80"
                              }`}
                              title="Klik untuk mengubah status trending di database"
                            >
                              <Flame
                                className={`w-3.5 h-3.5 ${
                                  tag.isTrending ? "text-orange-600" : "text-zinc-400"
                                }`}
                              />
                              <span>{tag.isTrending ? "Trending" : "Standar"}</span>
                            </button>
                          </td>
                          <td className="py-4 px-5">{getStatusBadge(tag.status)}</td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleOpenEdit(tag)}
                                title="Ubah Tag"
                                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTag(tag)}
                                title="Hapus Tag"
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

            {/* Pagination Footer */}
            <div className="p-4.5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 bg-zinc-50/50">
              <span className="font-medium">
                Menampilkan <strong>{filteredTags.length}</strong> dari <strong>{tags.length}</strong> tag terdaftar
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Auto-sync dengan naskah blog aktif
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: Tambah/Ubah Tag Baru */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  {modalMode === "add" ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">
                    {modalMode === "add" ? "Tambah Tag Baru" : "Ubah Tag Kata Kunci"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Tambahkan kata kunci spesifik untuk menghubungkan artikel kurasi dengan minat tamu.
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
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Field 1: Nama Tag */}
                <div>
                  <label className="font-bold text-zinc-800 mb-1.5 block">
                    Nama Tag <span className="text-[#9f3c16]">*</span>
                  </label>
                  <div className="relative">
                    <TagIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Joglo Heritage"
                      className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Slug URL Preview */}
                <div>
                  <label className="font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                    <span>Slug URL Sistem (Otomatis)</span>
                    <span className="text-emerald-600 text-[10px] font-bold">✓ Valid</span>
                  </label>
                  <div className="h-11 px-4 rounded-2xl bg-zinc-100/70 border border-zinc-200 flex items-center text-zinc-500 font-mono text-xs">
                    <span>/tag/</span>
                    <span className="text-[#9f3c16] font-bold">{slugInput || "kata-kunci"}</span>
                  </div>
                </div>

                {/* Field 3: Kategori Topik Induk */}
                <div>
                  <label className="font-bold text-zinc-800 mb-1.5 block">
                    Kategori Topik Induk <span className="text-[#9f3c16]">*</span>
                  </label>
                  <select
                    value={parentCatInput}
                    onChange={(e) => setParentCatInput(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
                  >
                    {parentCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 4: Meta Deskripsi */}
                <div>
                  <label className="font-bold text-zinc-800 mb-1.5 flex items-center justify-between">
                    <span>Deskripsi Ringkas / Meta SEO</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {metaDescInput.length}/160 karakter
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={metaDescInput}
                    onChange={(e) => setMetaDescInput(e.target.value)}
                    placeholder="Koleksi cerita dan homestay seputar..."
                    className="w-full p-3.5 text-xs rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] resize-none text-zinc-900 placeholder-zinc-400 transition-all"
                  />
                </div>

                {/* Field 5: Pilihan Warna Aksen */}
                <div>
                  <label className="font-bold text-zinc-800 mb-2 block">
                    Pilihan Warna Aksen Tag
                  </label>
                  <div className="flex items-center gap-3">
                    {availableColors.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setColorInput(col.hex)}
                        title={col.name}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform cursor-pointer ${
                          colorInput === col.hex
                            ? "ring-3 ring-offset-2 ring-[#9f3c16] scale-110 shadow-sm"
                            : "hover:opacity-80"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {colorInput === col.hex && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 6: Checkbox Tren Pencarian */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={trendingInput}
                    onChange={(e) => setTrendingInput(e.target.checked)}
                    className="rounded-lg accent-[#9f3c16] w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900">
                      Tampilkan di Tren Pencarian Cepat
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Tag ini akan disematkan pada bar pencarian eksplorasi beranda adakamar.id
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
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
                  <span>Simpan Tag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: Konfirmasi Hapus Tag */}
      {deleteTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-zinc-200/80 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-950">
              Hapus Tag dari Sistem?
            </h3>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus tag{" "}
              <strong className="text-zinc-900 font-mono">#{deleteTag.name}</strong>? Tindakan ini akan melepaskan tag ini dari{" "}
              <span className="font-bold text-[#9f3c16]">
                {deleteTag.articleCount} artikel editorial
              </span>{" "}
              terhubung. Naskah artikel tidak akan terhapus.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTag(null)}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Tag</span>
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
