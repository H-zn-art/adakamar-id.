"use client";

import PenulisSidebar from "@/components/layout/PenulisSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articlesApi } from "@/lib/api";
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  PenSquare,
  FileText,
  MessageSquare,
  X,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  author: string | { name: string; role: string; initials: string };
  category: string;
  status: "published" | "review" | "revision" | "draft";
  revisionNotes?: string;
  date: string;
  readTime: string;
  views: number;
  content?: string;
  excerpt?: string;
}

function mapBackendStatusToFrontend(
  status: string
): "published" | "review" | "revision" | "draft" {
  switch (status) {
    case "PUBLISHED":
      return "published";
    case "PENDING_REVIEW":
      return "review";
    case "REVISION_REQUIRED":
      return "revision";
    case "DRAFT":
    default:
      return "draft";
  }
}

function mapBackendArticle(item: any): ArticleData {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnail:
      item.thumbnailUrl ||
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    author: item.author?.name || "Sekar Ayu Kinanti",
    category: item.category?.name || "Budaya & Tradisi",
    status: mapBackendStatusToFrontend(item.status),
    date: item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : new Date(item.createdAt || Date.now()).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    readTime: item.readingTime || "5 mnt baca",
    views: item.views || 0,
    revisionNotes: item.revisionNotes || undefined,
  };
}

export default function PenulisArticlesPage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeRevisionModal, setActiveRevisionModal] = useState<{
    note: string;
    id: string;
  } | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getMyArticles();
      if (Array.isArray(data)) {
        setArticles(data.map(mapBackendArticle));
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.warn("Gagal memuat artikel penulis:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    const handleUpdate = () => fetchArticles();
    window.addEventListener("adakamar_articles_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_articles_updated", handleUpdate);
  }, []);

  const totalPublished = articles.filter(
    (a) => a.status === "published" || (a.status as any) === "live"
  ).length;
  const totalReview = articles.filter((a) => a.status === "review").length;
  const totalRevision = articles.filter((a) => a.status === "revision").length;
  const totalDraft = articles.filter((a) => a.status === "draft").length;
  const totalViews = articles.reduce(
    (acc, a) => acc + (typeof a.views === "number" ? a.views : 0),
    0
  );

  const filteredArticles = articles
    .filter((art) => {
      if (filter === "all") return true;
      if (filter === "live" || filter === "published") {
        return art.status === "published" || (art.status as any) === "live";
      }
      return art.status === filter;
    })
    .filter((art) => {
      if (!searchQuery.trim()) return true;
      return (
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleDelete = async (id: string) => {
    if (confirm("Hapus naskah artikel ini? Tindakan ini tidak bisa dibatalkan.")) {
      try {
        await articlesApi.remove(id, "PENULIS");
        await fetchArticles();
      } catch (err: any) {
        alert(`Gagal hapus artikel: ${err?.message || "Cek koneksi server"}`);
      }
    }
  };

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <PenulisSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/penulis" className="hover:text-zinc-900 transition-colors">
              Meja Redaksi
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">Artikel Saya</span>
          </div>

          <Link
            href="/penulis/artikel/baru"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </Link>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                Karya Kepenulisan
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • {articles.length} Total Naskah Terdaftar
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Koleksi Naskah Artikel Saya
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
              Pantau status peninjauan redaksi, lakukan revisi catatan tim redaksi, dan publikasikan panduan wisata autentik Yogyakarta.
            </p>
          </div>

          {/* 5 Bento Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Terbit / Live
                </span>
                <p className="text-3xl font-extrabold text-zinc-950 mt-1">{totalPublished}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Menunggu Review
                </span>
                <p className="text-3xl font-extrabold text-amber-700 mt-1">{totalReview}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Perlu Revisi
                </span>
                <p className="text-3xl font-extrabold text-rose-700 mt-1">{totalRevision}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Draf Mandiri
                </span>
                <p className="text-3xl font-extrabold text-zinc-950 mt-1">{totalDraft}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <PenSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-[#ffdbcf]/40 p-6 rounded-3xl border border-[#ffdbcf] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9f3c16]">
                  Total Pembaca
                </span>
                <p className="text-3xl font-extrabold text-[#9f3c16] mt-1">
                  {totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* List & Filter Card */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
            {/* Filter Tabs & Search */}
            <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: `Semua (${articles.length})` },
                  { id: "live", label: `Terbit (${totalPublished})` },
                  { id: "review", label: `Menunggu Review (${totalReview})` },
                  { id: "revision", label: `Perlu Revisi (${totalRevision})` },
                  { id: "draft", label: `Draf (${totalDraft})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      filter === item.id
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px] max-w-xs">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari judul artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-100">
              {loading ? (
                <div className="p-16 text-center text-xs text-zinc-400 font-medium">
                  Memuat naskah artikel...
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center gap-3">
                  <FileText className="w-10 h-10 text-zinc-300" />
                  <span className="font-bold text-zinc-700 text-sm">
                    Belum ada artikel dalam filter ini
                  </span>
                  <p className="text-zinc-400 max-w-xs text-xs">
                    {searchQuery
                      ? "Coba gunakan kata kunci pencarian yang lain."
                      : "Mulai tulis naskah baru untuk dikurasi oleh redaksi."}
                  </p>
                </div>
              ) : (
                filteredArticles.map((art) => {
                  const isLive =
                    art.status === "published" || (art.status as any) === "live";
                  const isReview = art.status === "review";
                  const isRevision = art.status === "revision";
                  const isDraft = art.status === "draft";

                  return (
                    <div
                      key={art.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-zinc-50/60 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-20 h-16 rounded-2xl overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200/80">
                          <img
                            src={art.thumbnail}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#9f3c16] uppercase tracking-wider bg-[#ffdbcf]/60 px-2 py-0.5 rounded-md">
                              {art.category}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              • {art.date}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-zinc-950 line-clamp-1 leading-snug">
                            {art.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            <span>{art.readTime}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Eye className="w-3.5 h-3.5 text-zinc-400" />
                              {art.views.toLocaleString()} pembaca
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {/* Status Badges */}
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Terbit
                          </span>
                        )}
                        {isReview && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Dalam Review
                          </span>
                        )}
                        {isRevision && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveRevisionModal({
                                note:
                                  art.revisionNotes ||
                                  "Perbaiki kelengkapan foto & narasi sesuai standar editorial.",
                                id: art.id,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                            <span>Catatan Revisi</span>
                          </button>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Draf Mandiri
                          </span>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          {isLive && (
                            <Link
                              href={`/panduan-jogja/${art.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors"
                              title="Lihat Pratinjau Publik"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          {isReview ? (
                            <span
                              title="Tidak dapat diedit saat sedang dalam proses review redaksi"
                              className="p-2 rounded-xl text-zinc-300 cursor-not-allowed"
                            >
                              <Edit3 className="w-4 h-4" />
                            </span>
                          ) : (
                            <Link
                              href={`/penulis/artikel/baru?id=${art.id}`}
                              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors"
                              title="Edit Naskah"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(art.id)}
                            disabled={isReview}
                            className={`p-2 rounded-xl transition-colors ${
                              isReview
                                ? "text-zinc-200 cursor-not-allowed"
                                : "hover:bg-rose-50 text-zinc-400 hover:text-rose-600 cursor-pointer"
                            }`}
                            title={
                              isReview
                                ? "Tidak dapat dihapus saat sedang direview"
                                : "Hapus Naskah"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Revision Modal Box */}
      {activeRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 border border-zinc-200/80 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950">
                    Catatan Revisi Redaksi
                  </h3>
                  <p className="text-[11px] text-zinc-400">Dari editor pusat adakamar.id</p>
                </div>
              </div>
              <button
                onClick={() => setActiveRevisionModal(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 p-4 bg-rose-50/70 rounded-2xl border border-rose-200/60 leading-relaxed text-xs text-rose-900 font-medium">
              {activeRevisionModal.note}
            </div>
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setActiveRevisionModal(null)}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <Link
                href={`/penulis/artikel/baru?id=${activeRevisionModal.id}`}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all"
              >
                Buka Editor & Perbaiki
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
