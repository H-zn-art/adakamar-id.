"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articlesApi, propertiesApi } from "@/lib/api";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  author: {
    name: string;
    role: string;
    initials: string;
  };
  category: string;
  status: "published" | "review" | "revision" | "draft";
  date: string;
  readTime: string;
  views: number;
}

function mapBackendArticleAdmin(item: any): ArticleItem {
  const authorName = item.author?.name || "Penulis";
  const initials =
    authorName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SK";

  let st: ArticleItem["status"] = "draft";
  if (item.status === "PUBLISHED") st = "published";
  else if (item.status === "PENDING_REVIEW") st = "review";
  else if (item.status === "REVISION_REQUIRED") st = "revision";
  else if (item.status === "DRAFT") st = "draft";

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnail:
      item.thumbnailUrl ||
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    author: {
      name: authorName,
      role: item.author?.role === "ADMIN" ? "Admin" : "Penulis",
      initials,
    },
    category: item.category?.name || "Panduan Kawasan",
    status: st,
    date: item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    readTime: item.readingTime || "5 mnt baca",
    views: item.views || 0,
  };
}

const initialArticles: ArticleItem[] = [];

export default function AdminArtikelPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewArticle, setReviewArticle] = useState<ArticleItem | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [checklist, setChecklist] = useState({
    location: true,
    photos: true,
    tone: false,
    seo: false,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // PRD Seksi 28: Penginapan terkait per artikel
  const [availableProperties, setAvailableProperties] = useState<{id:string; name:string; locationArea?:{name:string}}[]>([]);
  const [articlePropertyIds, setArticlePropertyIds] = useState<string[]>([]);
  const [propSearch, setPropSearch] = useState("");
  // Pagination
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = async () => {
    try {
      const res = await articlesApi.findAllForAdmin();
      if (res && Array.isArray(res.data)) {
        setArticles(res.data.map(mapBackendArticleAdmin));
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.warn("Failed to fetch admin articles:", err);
      setArticles([]);
    }
  };

  useEffect(() => {
    fetchArticles();
    // Load all properties for linking
    propertiesApi.list().then((data: any) => {
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setAvailableProperties(list);
    }).catch(() => {});

    const handleUpdate = () => {
      fetchArticles();
    };
    window.addEventListener("adakamar_articles_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_articles_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered list
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || art.category === categoryFilter;
    const matchStatus = statusFilter === "all" || art.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  // Reset halaman ke 1 saat filter/search berubah
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedArticles = filteredArticles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await Promise.allSettled(
      selectedIds.map((id) => articlesApi.remove(id, "ADMIN"))
    );
    setSelectedIds([]);
    await fetchArticles();
    showToast("Artikel yang dipilih berhasil dihapus.");
  };

  const handleApprove = async (id: string) => {
    try {
      // Simpan penginapan terkait terlebih dahulu jika ada
      if (articlePropertyIds.length > 0) {
        await articlesApi.setRelatedProperties(id, articlePropertyIds);
      }
      await articlesApi.reviewArticle(id, "PUBLISHED");
      setReviewArticle(null);
      setArticlePropertyIds([]);
      await fetchArticles();
      showToast("Artikel berhasil disetujui dan dijadwalkan terbit ke publik!");
    } catch (err: any) {
      showToast(`Gagal approve: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const handleRequestRevision = async (id: string) => {
    try {
      await articlesApi.reviewArticle(id, "REVISION_REQUIRED", revisionNotes);
      setReviewArticle(null);
      await fetchArticles();
      showToast("Catatan revisi telah dikirimkan ke dashboard penulis.");
    } catch (err: any) {
      showToast(`Gagal kirim revisi: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await articlesApi.remove(id, "ADMIN");
      setDeleteConfirmId(null);
      await fetchArticles();
      showToast("Artikel berhasil dihapus dari sistem.");
    } catch (err: any) {
      showToast(`Gagal hapus: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const getStatusBadge = (status: ArticleItem["status"]) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Published
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pending Review
          </span>
        );
      case "revision":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Perlu Revisi
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draf
          </span>
        );
    }
  };

  const totalPublished = articles.filter((a) => a.status === "published").length;
  const totalPending = articles.filter((a) => a.status === "review").length;
  const totalDraft = articles.filter(
    (a) => a.status === "draft" || a.status === "revision"
  ).length;

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  const categoryCounts: Record<string, number> = {};
  articles.forEach((a) => {
    if (a.category) {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topCategoryName = sortedCategories[0]?.[0] || "Belum Ada Kategori";
  const topCategoryCount = sortedCategories[0]?.[1] || 0;
  const topCategoryRatio =
    articles.length > 0
      ? Math.round((topCategoryCount / articles.length) * 100)
      : 0;
  const uniqueCategories = Array.from(new Set(articles.map((a) => a.category))).filter(Boolean);

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">
              chevron_right
            </span>
            <span className="text-zinc-500">Konten & Artikel</span>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">
              chevron_right
            </span>
            <span className="text-[#9f3c16] font-semibold">Artikel & Cerita</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-zinc-400">
                search
              </span>
              <input
                type="text"
                placeholder="Cari naskah artikel..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-64 h-9.5 pl-10 pr-4 text-xs rounded-full bg-zinc-100/80 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-800"
              />
            </div>

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Meja Editorial & Review</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          {/* Breadcrumb & Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">
                  Edisi Kebudayaan DIY
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • Kurasi Javanese Hospitality
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900">
                Manajemen Artikel & Cerita Jogja
              </h1>
              <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
                Kelola naskah panduan wisata, kurasi homestay, tips budaya Jogja,
                serta moderasi editorial sebelum dipublikasikan ke pembaca publik.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() =>
                  showToast("Data artikel berhasil diekspor ke format CSV.")
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 text-xs font-semibold shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-zinc-500">
                  download
                </span>
                <span>Ekspor Data (CSV)</span>
              </button>
              <Link
                href="/panduan-jogja"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
                <span>Lihat Blog Tamu</span>
              </Link>
            </div>
          </div>

          {/* 4 Bento Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1: Total Artikel */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden group hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between text-zinc-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Artikel
                </span>
                <span className="material-symbols-outlined text-[#9f3c16] text-[20px] p-2 rounded-2xl bg-[#ffdbcf]/50">
                  auto_stories
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                  {articles.length}
                </span>
                <span className="text-xs font-medium text-zinc-500">Naskah</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {totalPublished} Terbit
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {totalPending} Review
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  {totalDraft} Draf
                </span>
              </div>
            </div>

            {/* Stat 2: Menunggu Review */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/70 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between text-zinc-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Menunggu Review
                </span>
                <span className="material-symbols-outlined text-amber-700 text-[20px] p-2 rounded-2xl bg-amber-50">
                  pending_actions
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900 tracking-tight">
                  {totalPending}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Prioritas Redaksi
                </span>
              </div>
              <p className="mt-3 text-xs text-amber-800/80 line-clamp-1">
                Butuh tinjauan & persetujuan tim redaksi
              </p>
            </div>

            {/* Stat 3: Total Pembaca */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden group hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between text-zinc-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Pembaca
                </span>
                <span className="material-symbols-outlined text-[#9f3c16] text-[20px] p-2 rounded-2xl bg-[#ffdbcf]/50">
                  visibility
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                  {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-[14px]">
                    trending_up
                  </span>
                  Database
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Akumulasi tayangan pembaca artikel publik
              </p>
            </div>

            {/* Stat 4: Top Kategori */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden group hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between text-zinc-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Top Kategori
                </span>
                <span className="material-symbols-outlined text-[#9f3c16] text-[20px] p-2 rounded-2xl bg-[#ffdbcf]/50">
                  hub
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-zinc-900 truncate">
                  {topCategoryName}
                </span>
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                  <span>{topCategoryCount} Naskah Terhubung</span>
                  <span className="text-[#9f3c16] font-bold">{topCategoryRatio}% konten</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-50/50">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[260px] flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-zinc-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari judul, penulis, slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-2xl bg-white border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
                  />
                </div>

                {/* Kategori Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
                  className="h-10 px-3.5 rounded-2xl bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
                  className="h-10 px-3.5 rounded-2xl bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="published">Published</option>
                  <option value="review">Pending Review</option>
                  <option value="revision">Perlu Revisi</option>
                  <option value="draft">Draf</option>
                </select>

                {(searchQuery ||
                  categoryFilter !== "all" ||
                  statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                    className="h-10 px-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      restart_alt
                    </span>
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Bulk Selection Actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-2xl bg-[#ffdbcf]/60 text-[#9f3c16] text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9f3c16] animate-pulse"></span>
                    <span>{selectedIds.length} artikel dipilih</span>
                  </div>
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    title="Hapus Terpilih"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                    <th className="py-4 px-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredArticles.length &&
                          filteredArticles.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded-md accent-[#9f3c16] w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 min-w-[320px]">Artikel & Slug</th>
                    <th className="py-4 px-4 min-w-[160px]">Penulis</th>
                    <th className="py-4 px-4 min-w-[140px]">Kategori</th>
                    <th className="py-4 px-4 min-w-[130px]">Status</th>
                    <th className="py-4 px-4 min-w-[140px]">
                      Waktu & Pembaca
                    </th>
                    <th className="py-4 px-5 text-right min-w-[130px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-14 text-center text-zinc-400 text-sm font-medium"
                      >
                        Tidak ada artikel yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    pagedArticles.map((article) => {
                      const isSelected = selectedIds.includes(article.id);
                      return (
                        <tr
                          key={article.id}
                          className={`hover:bg-zinc-50/80 transition-colors group ${
                            isSelected ? "bg-[#ffdbcf]/20" : ""
                          }`}
                        >
                          <td className="py-4 px-5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(article.id)}
                              className="rounded-md accent-[#9f3c16] w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-14 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 shadow-xs border border-zinc-200/60">
                                <img
                                  src={article.thumbnail}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm text-zinc-900 group-hover:text-[#9f3c16] transition-colors line-clamp-1">
                                  {article.title}
                                </span>
                                <span className="text-[11px] text-zinc-400 font-mono truncate">
                                  /panduan-jogja/{article.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] font-bold text-xs flex items-center justify-center shrink-0">
                                {article.author.initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-zinc-800">
                                  {article.author.name}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {article.author.role}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700">
                              {article.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(article.status)}
                          </td>
                          <td className="py-4 px-4 text-zinc-500">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-800">
                                {article.date}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {article.readTime}{" "}
                                {article.views > 0 &&
                                  `• ${article.views.toLocaleString(
                                    "id-ID"
                                  )} views`}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              {/* Review & Moderasi Action */}
                              <button
                                onClick={() => setReviewArticle(article)}
                                title="Tinjau & Moderasi"
                                className="p-2 rounded-xl hover:bg-amber-100 text-amber-800 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  rate_review
                                </span>
                              </button>

                              {/* Preview Public Article */}
                              <Link
                                href={`/panduan-jogja/${article.slug}`}
                                target="_blank"
                                title="Lihat di Web"
                                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-[#9f3c16] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  open_in_new
                                </span>
                              </Link>

                              {/* Hapus Action */}
                              <button
                                onClick={() => setDeleteConfirmId(article.id)}
                                title="Hapus Naskah"
                                className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
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
            <div className="p-5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <span>
                  Menampilkan{" "}
                  <strong className="text-zinc-800">
                    {filteredArticles.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredArticles.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-zinc-800">{filteredArticles.length}</strong>{" "}
                  artikel
                </span>
                {totalPages > 1 && (
                  <span>• {PAGE_SIZE} per halaman</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200/80 text-zinc-600 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                  >
                    Sebelumnya
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                        pg === safePage
                          ? "bg-[#9f3c16] text-white shadow-xs"
                          : "bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200/80 text-zinc-600 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* Review Dialog Modal (Moderasi Editorial)                */}
      {/* ======================================================== */}
      {reviewArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Accent Gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#9f3c16] via-amber-500 to-emerald-600"></div>

            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-zinc-100">
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    rate_review
                  </span>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    Tinjau & Moderasi Artikel
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Verifikasi kelayakan standar kurasi editorial sebelum
                    diterbitkan ke publik adakamar.id.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewArticle(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
              {/* Article Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9f3c16] tracking-wider">
                      Artikel yang Ditinjau
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 mt-0.5">
                      {reviewArticle.title}
                    </h3>
                  </div>
                  {getStatusBadge(reviewArticle.status)}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">
                      person
                    </span>
                    Penulis:{" "}
                    <strong className="text-zinc-800">
                      {reviewArticle.author.name}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">
                      label
                    </span>
                    Kategori:{" "}
                    <strong className="text-zinc-800">
                      {reviewArticle.category}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">
                      schedule
                    </span>
                    {reviewArticle.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-zinc-200/60 mt-1">
                  <Link
                    href={`/panduan-jogja/${reviewArticle.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#9f3c16] hover:underline"
                  >
                    <span>Buka Pratinjau Naskah</span>
                    <span className="material-symbols-outlined text-[14px]">
                      north_east
                    </span>
                  </Link>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      history
                    </span>
                    Riwayat 2 Revisi
                  </span>
                </div>
              </div>

              {/* Checklist Standar Redaksi */}
              <div>
                <label className="text-xs font-bold text-zinc-800 flex items-center justify-between mb-2">
                  <span>Checklist Kurasi Standar Redaksi</span>
                  <span className="text-zinc-400 font-normal">
                    {Object.values(checklist).filter(Boolean).length} dari 4
                    kriteria terpenuhi
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.location}
                      onChange={(e) =>
                        setChecklist({ ...checklist, location: e.target.checked })
                      }
                      className="rounded-md accent-[#9f3c16] w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800">
                        Akurasi Lokasi & Homestay
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Fakta homestay sesuai titik peta Jogja
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.photos}
                      onChange={(e) =>
                        setChecklist({ ...checklist, photos: e.target.checked })
                      }
                      className="rounded-md accent-[#9f3c16] w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800">
                        Kualitas Foto Resolusi Tinggi
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Bebas hak cipta & teroptimasi WebP
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.tone}
                      onChange={(e) =>
                        setChecklist({ ...checklist, tone: e.target.checked })
                      }
                      className="rounded-md accent-[#9f3c16] w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800">
                        Pedoman Bahasa & Tone Budaya
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        PUEBI & nuansa Javanese hospitality
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.seo}
                      onChange={(e) =>
                        setChecklist({ ...checklist, seo: e.target.checked })
                      }
                      className="rounded-md accent-[#9f3c16] w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800">
                        Optimasi SEO On-Page
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Meta title, slug, & ringkasan terisi
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* PRD Seksi 28: Penginapan Terkait */}
              <div>
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">hotel</span>
                  <span>Penginapan Terkait Artikel</span>
                  <span className="font-normal text-zinc-400 ml-auto">{articlePropertyIds.length} dipilih</span>
                </label>
                <input
                  type="text"
                  placeholder="Cari penginapan..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="w-full mb-2 px-3.5 py-2 rounded-2xl text-xs bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
                  {availableProperties
                    .filter(p => p.name.toLowerCase().includes(propSearch.toLowerCase()) || (p.locationArea?.name || "").toLowerCase().includes(propSearch.toLowerCase()))
                    .slice(0, 20)
                    .map((prop) => {
                      const selected = articlePropertyIds.includes(prop.id);
                      return (
                        <label
                          key={prop.id}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            selected ? "bg-[#ffdbcf]/40 border border-[#9f3c16]/30" : "bg-zinc-50 hover:bg-zinc-100 border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setArticlePropertyIds(prev =>
                              selected ? prev.filter(id => id !== prop.id) : [...prev, prop.id]
                            )}
                            className="accent-[#9f3c16] w-3.5 h-3.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-zinc-800 truncate">{prop.name}</div>
                            {prop.locationArea?.name && (
                              <div className="text-[11px] text-zinc-400">{prop.locationArea.name}</div>
                            )}
                          </div>
                          {selected && <span className="material-symbols-outlined text-[14px] text-[#9f3c16]">check_circle</span>}
                        </label>
                      );
                    })}
                  {availableProperties.length === 0 && (
                    <p className="text-[11px] text-zinc-400 text-center py-3">Belum ada data penginapan</p>
                  )}
                </div>
              </div>

              {/* Revision Notes */}
              <div>
                <label className="text-xs font-bold text-zinc-800 flex items-center justify-between mb-1.5">
                  <span>Catatan / Alasan Revisi</span>
                  <span className="text-[#9f3c16] text-[11px] font-semibold">
                    *Wajib jika minta revisi
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Tuliskan catatan perbaikan spesifik untuk penulis..."
                  className="w-full p-3.5 text-xs rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 resize-none text-zinc-900"
                />
                <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#9f3c16]">
                    info
                  </span>
                  Catatan ini akan dikirimkan otomatis ke notifikasi &amp; email
                  penulis naskah.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setReviewArticle(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Batal
              </button>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleRequestRevision(reviewArticle.id)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    assignment_return
                  </span>
                  <span>Tolak & Minta Revisi</span>
                </button>
                <button
                  onClick={() => handleApprove(reviewArticle.id)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  <span>Setujui & Terbitkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-zinc-200/80">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[26px]">
                delete_forever
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              Hapus Artikel Editorial?
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus naskah artikel ini? Tindakan ini
              akan menghapus artikel secara permanen dari basis data editorial.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-2xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteOne(deleteConfirmId)}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Ya, Hapus Artikel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-950 text-white shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
