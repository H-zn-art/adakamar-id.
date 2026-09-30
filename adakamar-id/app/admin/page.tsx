"use client";

import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState, useEffect } from "react";
import { propertiesApi, inquiriesApi, articlesApi, promosApi, usersApi } from "@/lib/api";
import {
  Home,
  Mail,
  FileText,
  Star,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
  Ticket,
  MapPin,
} from "lucide-react";

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  confirmed: { label: "Dikonfirmasi", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200/60" },
  pending: { label: "Menunggu", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200/60" },
  completed: { label: "Selesai", dot: "bg-zinc-400", text: "text-zinc-700", bg: "bg-zinc-100 border-zinc-200/60" },
  cancelled: { label: "Dibatalkan", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50 border-rose-200/60" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    propertyCount: number;
    inquiryCount: number;
    articleCount: number;
    avgRating: number | null;
    totalReviews: number;
    activePromoCount: number;
    penulisCount: number;
  }>({
    propertyCount: 0,
    inquiryCount: 0,
    articleCount: 0,
    avgRating: null,
    totalReviews: 0,
    activePromoCount: 0,
    penulisCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [propsRes, inqRes, artRes, promoRes, usersRes] = await Promise.allSettled([
          propertiesApi.list({ limit: 50 }),
          inquiriesApi.list({ limit: 10 }),
          articlesApi.list({ limit: 10 }),
          promosApi.listActive(),
          usersApi.findAll('PENULIS'),
        ]);

        let propCount = 0;
        let avgR: number | null = null;
        let totalRev = 0;
        if (propsRes.status === "fulfilled" && propsRes.value) {
          propCount = propsRes.value.meta?.total ?? propsRes.value.data?.length ?? 0;
          if (Array.isArray(propsRes.value.data) && propsRes.value.data.length > 0) {
            const reviewed = propsRes.value.data.filter(
              (p: any) => (p.reviewCount ?? 0) > 0 && typeof p.rating === "number"
            );
            totalRev = reviewed.reduce((acc: number, p: any) => acc + (p.reviewCount || 0), 0);
            if (totalRev > 0) {
              avgR = Number(
                (
                  reviewed.reduce(
                    (acc: number, p: any) => acc + p.rating * (p.reviewCount || 0),
                    0
                  ) / totalRev
                ).toFixed(1)
              );
            }
          }
        }

        let inqCount = 0;
        let bookings: any[] = [];
        if (inqRes.status === "fulfilled" && inqRes.value) {
          inqCount = inqRes.value.meta?.total ?? inqRes.value.data?.length ?? 0;
          if (Array.isArray(inqRes.value.data)) {
            bookings = inqRes.value.data.map((i: any) => {
              const nights =
                i.checkInDate && i.checkOutDate
                  ? Math.max(
                      1,
                      Math.round(
                        (new Date(i.checkOutDate).getTime() -
                          new Date(i.checkInDate).getTime()) /
                          (1000 * 3600 * 24)
                      )
                    )
                  : 1;
              const unitPrice = i.property?.price || 0;
              const totalAmount = unitPrice * nights;
              return {
                id: `INQ-${i.id.slice(-6).toUpperCase()}`,
                guest: i.guestName,
                property: i.property?.name || "Homestay Jogja",
                checkin: i.checkInDate
                  ? new Date(i.checkInDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : "-",
                nights,
                amount: `Rp ${totalAmount.toLocaleString("id-ID")}`,
                status:
                  i.status === "NEW"
                    ? "pending"
                    : i.status === "CONTACTED"
                    ? "confirmed"
                    : i.status === "COMPLETED"
                    ? "completed"
                    : "cancelled",
              };
            });
          }
        }

        let artCount = 0;
        let pendings: any[] = [];
        if (artRes.status === "fulfilled" && artRes.value) {
          artCount = artRes.value.meta?.total ?? artRes.value.data?.length ?? 0;
          if (Array.isArray(artRes.value.data)) {
            pendings = artRes.value.data
              .filter(
                (a: any) =>
                  a.status === "PENDING_REVIEW" || a.status === "DRAFT"
              )
              .slice(0, 3)
              .map((a: any) => ({
                title: a.title,
                author: a.author?.name || "Penulis",
                category: a.category?.name || "Umum",
                submitted: new Date(a.createdAt).toLocaleDateString("id-ID"),
              }));
          }
        }

        // Hitung promo aktif (PRD Seksi 6)
        let activePromoCount = 0;
        if (promoRes.status === "fulfilled" && Array.isArray(promoRes.value)) {
          activePromoCount = promoRes.value.filter(
            (p: any) => p.isActive && new Date(p.endDate) > new Date()
          ).length;
        }

        // Hitung total penulis (PRD Seksi 14)
        let penulisCount = 0;
        if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
          penulisCount = usersRes.value.length;
        }

        setStats({
          propertyCount: propCount,
          inquiryCount: inqCount,
          articleCount: artCount,
          avgRating: avgR,
          totalReviews: totalRev,
          activePromoCount,
          penulisCount,
        });
        setRecentBookings(bookings);
        setPendingArticles(pendings);
      } catch (err) {
        console.warn("Dashboard sync warning:", err);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Unit Homestay",
      value: String(stats.propertyCount),
      desc: "Tersimpan di MySQL",
      icon: Home,
      color: "text-[#9f3c16]",
      bg: "bg-[#ffdbcf]/60",
      href: "/admin/penginapan",
    },
    {
      label: "Inquiry & Reservasi",
      value: String(stats.inquiryCount),
      desc: "Terkoneksi langsung",
      icon: Mail,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      href: "/admin/inquiry",
    },
    {
      label: "Artikel & Panduan",
      value: String(stats.articleCount),
      desc: "Konten terdaftar",
      icon: FileText,
      color: "text-amber-700",
      bg: "bg-amber-50",
      href: "/admin/artikel",
    },
    {
      label: "Promo Aktif",
      value: String(stats.activePromoCount),
      desc: "Kupon masih berlaku",
      icon: Ticket,
      color: "text-violet-700",
      bg: "bg-violet-50",
      href: "/admin/promo",
    },
    {
      label: "Total Penulis",
      value: String(stats.penulisCount),
      desc: "Penulis artikel aktif",
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
      href: "/admin/pengguna",
    },
    {
      label: "Rata-rata Rating",
      value: stats.avgRating ? `${stats.avgRating} ★` : (stats.propertyCount > 0 ? "Baru" : "—"),
      desc: stats.avgRating ? `${stats.totalReviews} ulasan terverifikasi` : (stats.propertyCount > 0 ? "Belum ada ulasan tamu" : "Kepuasan tamu"),
      icon: Star,
      color: "text-[#9f3c16]",
      bg: "bg-[#ffdbcf]/60",
      href: "/admin/penginapan",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7fb]">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[10px] font-bold tracking-wider uppercase text-[#9f3c16]">
                <Sparkles className="w-3 h-3 text-[#9f3c16]" />
                CMS Admin
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistem Terhubung Real-Time
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 mt-1 tracking-tight">
              Dashboard Utama
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/penginapan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white text-xs font-bold shadow-lg shadow-[#9f3c16]/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Kelola Penginapan</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-8 space-y-8 max-w-[1500px] w-full">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className="relative p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#9f3c16]/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  {/* Subtle top ambient glow */}
                  <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#ffdbcf]/25 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold text-zinc-500 line-clamp-1">
                      {s.label}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} transition-transform group-hover:scale-110 shadow-xs shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-xs font-bold text-[#9f3c16] mt-2 flex items-center gap-1 group-hover:underline underline-offset-2">
                      <span className="truncate">{s.desc}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex flex-wrap gap-2.5 items-center p-4 bg-white/90 rounded-3xl border border-zinc-200/80 backdrop-blur-md shadow-xs">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider px-2">
              Aksi Cepat:
            </span>
            {[
              { label: "Kelola Penginapan", href: "/admin/penginapan", icon: Home },
              { label: "Buat Promo Baru", href: "/admin/promo", icon: Ticket },
              { label: "Review Naskah", href: "/admin/artikel", icon: FileText },
              { label: "Tambah Lokasi", href: "/admin/lokasi", icon: MapPin },
              { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-50 hover:bg-[#ffdbcf]/40 border border-zinc-200 text-xs font-semibold text-zinc-700 hover:text-[#9f3c16] hover:border-[#9f3c16]/30 transition-all shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#9f3c16]" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Dual Panel: Recent Bookings & Pending Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings Table (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900">
                    Inquiry & Reservasi Terbaru
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Permintaan booking yang masuk dari tamu via WhatsApp & web
                  </p>
                </div>
                <Link
                  href="/admin/inquiry"
                  className="text-xs font-bold text-[#9f3c16] hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Tamu</th>
                      <th className="py-3.5 px-6">Homestay</th>
                      <th className="py-3.5 px-6">Check-in</th>
                      <th className="py-3.5 px-6">Total</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((b) => {
                        const st = statusConfig[b.status] || statusConfig.pending;
                        return (
                          <tr key={b.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-4 px-6 font-semibold text-zinc-900">
                              {b.guest}
                            </td>
                            <td className="py-4 px-6 text-zinc-600 truncate max-w-[180px]">
                              {b.property}
                            </td>
                            <td className="py-4 px-6 text-zinc-500">
                              {b.checkin} ({b.nights} mlm)
                            </td>
                            <td className="py-4 px-6 font-bold text-zinc-900">
                              {b.amount}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${st.bg} ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          Belum ada inquiry yang masuk.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Articles Review Card (1 col) */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-zinc-900">
                    Antrean Review Naskah
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-500 mb-5">
                  Naskah yang diajukan oleh Penulis Jogja untuk dipublikasikan
                </p>

                <div className="space-y-3.5">
                  {pendingArticles.length > 0 ? (
                    pendingArticles.map((a, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-zinc-50/90 border border-zinc-200/80 hover:border-[#9f3c16]/30 hover:bg-[#ffdbcf]/20 transition-all flex flex-col gap-2"
                      >
                        <span className="text-[10px] font-bold text-[#9f3c16] uppercase tracking-wider">
                          {a.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
                          {a.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200/60 mt-1">
                          <span className="font-medium text-zinc-700">Oleh {a.author}</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Clock className="w-3 h-3" />
                            {a.submitted}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-zinc-400 text-xs">
                      Tidak ada naskah yang menunggu review.
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/admin/artikel"
                className="mt-6 w-full py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <span>Buka Meja Redaksi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
