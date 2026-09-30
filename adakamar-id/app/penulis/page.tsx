"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PenulisSidebar from "@/components/layout/PenulisSidebar";
import { articlesApi } from "@/lib/api";
import {
  Sparkles,
  FileText,
  Clock,
  AlertCircle,
  PenSquare,
  ArrowRight,
  Eye,
  CheckCircle2,
  Calendar,
  ChevronRight,
  BookOpen,
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

function mapBackendStatus(status: string): "published" | "review" | "revision" | "draft" {
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

function mapArticle(item: any): ArticleData {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnail:
      item.thumbnailUrl ||
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    author: item.author?.name || "Sekar Ayu Kinanti",
    category: item.category?.name || "Budaya & Tradisi",
    status: mapBackendStatus(item.status),
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

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  published: {
    label: "Diterbitkan",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200/80",
  },
  draft: {
    label: "Draf Mandiri",
    dot: "bg-zinc-400",
    text: "text-zinc-700",
    bg: "bg-zinc-100 border-zinc-200/80",
  },
  review: {
    label: "Menunggu Review",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200/80",
  },
  revision: {
    label: "Perlu Revisi",
    dot: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50 border-rose-200/80",
  },
};

export default function PenulisDashboardPage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getMyArticles();
      if (Array.isArray(data)) {
        setArticles(data.map(mapArticle));
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

  const statCards = [
    {
      label: "Artikel Diterbitkan",
      value: totalPublished.toString(),
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Menunggu Review",
      value: totalReview.toString(),
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Perlu Revisi",
      value: totalRevision.toString(),
      icon: AlertCircle,
      color: "text-rose-700",
      bg: "bg-rose-50",
    },
    {
      label: "Dalam Draf",
      value: totalDraft.toString(),
      icon: PenSquare,
      color: "text-zinc-600",
      bg: "bg-zinc-100",
    },
  ];

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
            <span className="text-[#9f3c16] font-bold">Dashboard Penulis</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/penulis/artikel/baru"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
            >
              <PenSquare className="w-4 h-4" />
              <span>Tulis Naskah Baru</span>
            </Link>
          </div>
        </header>

        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#9f3c16] via-[#bf542c] to-[#9f3c16] p-7 sm:p-9 text-white relative overflow-hidden shadow-md shadow-[#9f3c16]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-3 backdrop-blur-xs border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kinerja Redaksi Penulis</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Sugeng rawuh di Meja Penulis!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-100/90 mt-2 leading-relaxed">
                Platform adakamar.id mengapresiasi karya tulisan budaya dan panduan homestay Anda.
                Tuliskan kisah kehangatan kearifan lokal Jogja untuk para wisatawan.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-6 bg-white/10 backdrop-blur-md px-7 py-5 rounded-3xl border border-white/20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {totalPublished}
                </div>
                <div className="text-[10px] text-zinc-200 font-bold uppercase tracking-wider mt-0.5">
                  Tayang
                </div>
              </div>
              <div className="w-[1px] h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {articles.length}
                </div>
                <div className="text-[10px] text-zinc-200 font-bold uppercase tracking-wider mt-0.5">
                  Total Naskah
                </div>
              </div>
            </div>
          </div>

          {/* 4 Bento Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {s.label}
                    </span>
                    <p className="text-3xl font-extrabold text-zinc-950 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Articles Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-zinc-950">
                  Naskah Artikel Saya Terkini
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Status publikasi dan antrean kurasi naskah yang Anda ajukan ke meja redaksi
                </p>
              </div>
              <Link
                href="/penulis/artikel"
                className="text-xs font-bold text-[#9f3c16] hover:underline flex items-center gap-1.5"
              >
                <span>Kelola Semua Naskah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Artikel & Judul</th>
                    <th className="px-4 py-4">Kategori Topik</th>
                    <th className="px-4 py-4">Tanggal Pengajuan</th>
                    <th className="px-4 py-4">Status Redaksi</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {articles.length > 0 ? (
                    articles.slice(0, 5).map((a) => {
                      const st = statusConfig[a.status] || statusConfig.draft;
                      return (
                        <tr key={a.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-14 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200/80">
                                <img
                                  src={a.thumbnail}
                                  alt={a.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-md">
                                <h4 className="font-bold text-zinc-950 text-xs truncate" title={a.title}>
                                  {a.title}
                                </h4>
                                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                                  {a.readTime}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-zinc-600 font-semibold">
                            {a.category}
                          </td>
                          <td className="px-4 py-4 text-zinc-500 font-medium">
                            {a.date}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/penulis/artikel/baru?id=${a.id}`}
                              className="text-xs font-bold text-[#9f3c16] hover:underline"
                            >
                              Edit Naskah →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs font-medium">
                        {loading ? (
                          "Memuat naskah artikel..."
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen className="w-8 h-8 text-zinc-300" />
                            <span>Belum ada naskah. Mulai tulis artikel pertamamu sekarang!</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
