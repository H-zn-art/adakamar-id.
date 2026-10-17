"use client";

import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import { propertiesApi, inquiriesApi, articlesApi, promosApi, usersApi } from "@/lib/api";
import {
  Home,
  Mail,
  FileText,
  Star,
  MessageSquare,
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
  Bell,
  BellRing,
  Receipt,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  Check,
  X,
  CalendarCheck,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  confirmed: { label: "Dikonfirmasi", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200/60" },
  pending: { label: "Menunggu", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200/60" },
  completed: { label: "Selesai", dot: "bg-zinc-400", text: "text-zinc-700", bg: "bg-zinc-100 border-zinc-200/60" },
  cancelled: { label: "Dibatalkan", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50 border-rose-200/60" },
};

export interface ReservationNotification {
  id: string;
  rawId: string;
  code: string;
  type: "checkout_due" | "new_booking";
  guest: string;
  guestPhone: string;
  guestEmail?: string;
  property: string;
  propertySlug?: string;
  roomTypeName?: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  checkInFormatted: string;
  checkOutFormatted: string;
  nights: number;
  amount: string;
  amountNumber: number;
  status: string;
  statusLabel: string;
  createdAt: string;
  urgency: "high" | "normal";
  reasonText: string;
  daysOverdue?: number;
}

function toWaNumber(phone: string): string {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.substring(1);
  return digits;
}

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
  const [notifications, setNotifications] = useState<ReservationNotification[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [dropdownFilter, setDropdownFilter] = useState<"all" | "checkout_due" | "new_booking">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [propsRes, inqRes, artRes, promoRes, usersRes] = await Promise.allSettled([
        propertiesApi.list({ limit: 50 }),
        inquiriesApi.list({ limit: 60 }),
        articlesApi.list({ limit: 10 }),
        promosApi.listActive(),
        usersApi.findAll("PENULIS"),
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
      const bookings: any[] = [];
      const notifs: ReservationNotification[] = [];

      if (inqRes.status === "fulfilled" && inqRes.value) {
        inqCount = inqRes.value.meta?.total ?? inqRes.value.data?.length ?? 0;
        if (Array.isArray(inqRes.value.data)) {
          const now = new Date();
          const nowTime = now.getTime();

          inqRes.value.data.forEach((i: any) => {
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

            let totalAmount = 0;
            if (i.notes) {
              const match = i.notes.match(/Total(?: Estimasi)?:\s*Rp\s*([\d\.,]+)/i);
              if (match && match[1]) {
                const parsed = parseInt(match[1].replace(/[.,]/g, ""), 10);
                if (!isNaN(parsed) && parsed > 0) totalAmount = parsed;
              }
            }
            if (!totalAmount) {
              const unitPrice = i.property?.price || 500000;
              totalAmount = unitPrice * nights;
            }

            let roomTypeName = i.roomTypeName || "";
            if (!roomTypeName && i.notes) {
              const match = i.notes.match(/\[Kamar:\s*([^\]\-]+)/);
              if (match) roomTypeName = match[1].trim();
            }

            const code = `INQ-${i.id.slice(-6).toUpperCase()}`;
            const checkInFormatted = i.checkInDate
              ? new Date(i.checkInDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Fleksibel";
            const checkOutFormatted = i.checkOutDate
              ? new Date(i.checkOutDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Fleksibel";

            // 1. Kondisi Selesai Reservasi / Checkout Due (Perlu Proses Nota)
            const checkOutTime = i.checkOutDate ? new Date(i.checkOutDate).getTime() : null;
            const isCheckoutDue =
              checkOutTime !== null &&
              checkOutTime <= nowTime &&
              i.status !== "COMPLETED" &&
              i.status !== "CANCELLED";

            // 2. Kondisi Reservasi Baru Masuk (NEW)
            const isNewBooking = i.status === "NEW";

            if (isCheckoutDue) {
              const diffMs = nowTime - checkOutTime!;
              const daysOver = Math.floor(diffMs / (1000 * 3600 * 24));
              const overdueText =
                daysOver === 0
                  ? "Selesai menginap hari ini"
                  : `Selesai ${daysOver} hari lalu (${checkOutFormatted})`;

              notifs.push({
                id: `notif-due-${i.id}`,
                rawId: i.id,
                code,
                type: "checkout_due",
                guest: i.guestName,
                guestPhone: i.guestPhone,
                guestEmail: i.guestEmail,
                property: i.property?.name || "Homestay Jogja",
                propertySlug: i.property?.slug,
                roomTypeName,
                checkInDate: i.checkInDate,
                checkOutDate: i.checkOutDate,
                checkInFormatted,
                checkOutFormatted,
                nights,
                amount: `Rp ${totalAmount.toLocaleString("id-ID")}`,
                amountNumber: totalAmount,
                status: i.status,
                statusLabel:
                  i.status === "CONTACTED"
                    ? "Dikonfirmasi"
                    : i.status === "IN_PROGRESS"
                    ? "Berlangsung"
                    : "Menunggu",
                createdAt: new Date(i.createdAt).toLocaleDateString("id-ID"),
                urgency: "high",
                reasonText: `${overdueText} — Waktu menginap telah berakhir. Segera proses nota pelunasan untuk tamu.`,
                daysOverdue: daysOver,
              });
            } else if (isNewBooking) {
              notifs.push({
                id: `notif-new-${i.id}`,
                rawId: i.id,
                code,
                type: "new_booking",
                guest: i.guestName,
                guestPhone: i.guestPhone,
                guestEmail: i.guestEmail,
                property: i.property?.name || "Homestay Jogja",
                propertySlug: i.property?.slug,
                roomTypeName,
                checkInDate: i.checkInDate,
                checkOutDate: i.checkOutDate,
                checkInFormatted,
                checkOutFormatted,
                nights,
                amount: `Rp ${totalAmount.toLocaleString("id-ID")}`,
                amountNumber: totalAmount,
                status: i.status,
                statusLabel: "Menunggu Respon",
                createdAt: new Date(i.createdAt).toLocaleDateString("id-ID"),
                urgency: "normal",
                reasonText: `Pesanan reservasi baru masuk via web/WhatsApp. Harap konfirmasi ketersediaan unit.`,
              });
            }

            // Recent Bookings list
            if (bookings.length < 8) {
              bookings.push({
                id: code,
                rawId: i.id,
                guest: i.guestName,
                property: i.property?.name || "Homestay Jogja",
                roomTypeName,
                checkin: checkInFormatted,
                nights,
                amount: `Rp ${totalAmount.toLocaleString("id-ID")}`,
                status:
                  i.status === "NEW"
                    ? "pending"
                    : i.status === "CONTACTED" || i.status === "IN_PROGRESS"
                    ? "confirmed"
                    : i.status === "COMPLETED"
                    ? "completed"
                    : "cancelled",
              });
            }
          });

          // Urutkan notifikasi: prioritas checkout_due di paling atas agar admin segera memproses nota
          notifs.sort((a, b) => {
            if (a.urgency === "high" && b.urgency !== "high") return -1;
            if (b.urgency === "high" && a.urgency !== "high") return 1;
            return 0;
          });
        }
      }

      let artCount = 0;
      let pendings: any[] = [];
      if (artRes.status === "fulfilled" && artRes.value) {
        artCount = artRes.value.meta?.total ?? artRes.value.data?.length ?? 0;
        if (Array.isArray(artRes.value.data)) {
          pendings = artRes.value.data
            .filter((a: any) => a.status === "PENDING_REVIEW" || a.status === "DRAFT")
            .slice(0, 3)
            .map((a: any) => ({
              title: a.title,
              author: a.author?.name || "Penulis",
              category: a.category?.name || "Umum",
              submitted: new Date(a.createdAt).toLocaleDateString("id-ID"),
            }));
        }
      }

      let activePromoCount = 0;
      if (promoRes.status === "fulfilled" && Array.isArray(promoRes.value)) {
        activePromoCount = promoRes.value.filter(
          (p: any) => p.isActive && new Date(p.endDate) > new Date()
        ).length;
      }

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
      setNotifications(notifs);
    } catch (err) {
      console.warn("Dashboard sync warning:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh periodically every 45s
    const timer = setInterval(() => {
      loadDashboardData(true);
    }, 45000);
    return () => clearInterval(timer);
  }, [loadDashboardData]);

  // Aksi Tandai Selesai Langsung dari Dashboard
  const handleMarkCompleted = async (rawId: string) => {
    try {
      setUpdatingId(rawId);
      await inquiriesApi.updateStatus(rawId, "COMPLETED");
      setToastMessage("✓ Reservasi berhasil diselesaikan dan status nota diperbarui!");
      await loadDashboardData(true);
    } catch (err: any) {
      setToastMessage(`✕ Gagal update: ${err?.message || "Cek koneksi backend"}`);
    } finally {
      setUpdatingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Aksi Kirim Nota ke WhatsApp Tamu & Otomatis Selesaikan Reservasi
  const handleSendNotaWa = async (n: ReservationNotification) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://adakamar.id";
    const notaUrl = `${origin}/nota/${n.rawId}`;
    const phone = toWaNumber(n.guestPhone);
    const roomInfo = n.roomTypeName ? `\n🛏️ Tipe Kamar: ${n.roomTypeName}` : "";
    const text = encodeURIComponent(
      `Halo Kak ${n.guest}, terima kasih telah menginap di ${n.property} melalui adakamar.id.\n\n` +
      `Masa menginap Anda telah selesai. Berikut tautan nota resmi reservasi Anda:\n` +
      `${notaUrl}${roomInfo}\n` +
      `💰 Total: ${n.amount}\n` +
      `📋 Kode Reservasi: ${n.code}\n\n` +
      `Silakan buka link di atas untuk menyimpan atau mencetak nota. Terima kasih dan semoga berkunjung kembali ke Jogja! 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");

    // Otomatis ubah status reservasi menjadi COMPLETED (Selesai) di sistem
    try {
      setUpdatingId(n.rawId);
      await inquiriesApi.updateStatus(n.rawId, "COMPLETED");
      setToastMessage("✓ Nota berhasil dikirim ke WhatsApp & status menginap otomatis SELESAI!");
      await loadDashboardData(true);
    } catch (err: any) {
      console.warn("Auto complete reservation error:", err);
    } finally {
      setUpdatingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Aksi Hubungi Tamu WhatsApp (Inquiry Baru)
  const handleContactGuestWa = (n: ReservationNotification) => {
    const phone = toWaNumber(n.guestPhone);
    const roomInfo = n.roomTypeName ? ` (Tipe Kamar: ${n.roomTypeName})` : "";
    const text = encodeURIComponent(
      `Halo Kak ${n.guest}, kami dari tim adakamar.id / Pengelola ${n.property}.\n\n` +
      `Permintaan reservasi Anda telah kami terima:${roomInfo}\n` +
      `- Check-in: ${n.checkInFormatted}\n` +
      `- Check-out: ${n.checkOutFormatted}\n` +
      `- Total Estimasi: ${n.amount}\n` +
      `- Kode: ${n.code}\n\n` +
      `Apakah jadwal menginap sudah sesuai? Kami siap membantu proses konfirmasi reservasi Anda. Terima kasih!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  // Filtered notifications
  const checkoutDueNotifs = notifications.filter((n) => n.type === "checkout_due");
  const newBookingNotifs = notifications.filter((n) => n.type === "new_booking");
  const totalAlertCount = notifications.length;

  const dropdownDisplayNotifs =
    dropdownFilter === "checkout_due"
      ? checkoutDueNotifs
      : dropdownFilter === "new_booking"
      ? newBookingNotifs
      : notifications;

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
      label: "Total Ulasan",
      value: String(stats.totalReviews),
      desc: stats.avgRating ? `Rata-rata ${stats.avgRating} ★ kepuasan` : (stats.propertyCount > 0 ? "Belum ada ulasan tamu" : "Ulasan tamu"),
      icon: MessageSquare,
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
            {/* ── NOTIFICATION BELL & DROPDOWN ── */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`relative p-2.5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200/80 transition-all shadow-2xs cursor-pointer flex items-center justify-center ${
                  showNotificationDropdown ? "ring-2 ring-[#9f3c16]/20 border-[#9f3c16]" : ""
                }`}
                title="Notifikasi Inquiry & Reservasi Tamu"
              >
                <Bell
                  className={`w-5 h-5 transition-transform ${
                    totalAlertCount > 0 ? "text-[#9f3c16]" : "text-zinc-500"
                  }`}
                />
                {totalAlertCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9f3c16] px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white animate-pulse">
                    {totalAlertCount > 99 ? "99+" : totalAlertCount}
                  </span>
                )}
              </button>

              {/* Dropdown Popover */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2.5 w-96 sm:w-[420px] rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header Dropdown */}
                  <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <BellRing className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold">Notifikasi Reservasi Tamu</h4>
                        <p className="text-[10px] text-zinc-300">
                          {checkoutDueNotifs.length} perlu proses nota · {newBookingNotifs.length} booking baru
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadDashboardData()}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-zinc-300 hover:text-white"
                      title="Segarkan notifikasi"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Filter Tabs in Dropdown */}
                  <div className="flex items-center gap-1 p-2 bg-zinc-50 border-b border-zinc-100 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDropdownFilter("all")}
                      className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                        dropdownFilter === "all"
                          ? "bg-white text-zinc-900 shadow-2xs border border-zinc-200/60"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDropdownFilter("checkout_due")}
                      className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                        dropdownFilter === "checkout_due"
                          ? "bg-white text-[#9f3c16] shadow-2xs border border-zinc-200/60 font-black"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Perlu Nota ({checkoutDueNotifs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDropdownFilter("new_booking")}
                      className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                        dropdownFilter === "new_booking"
                          ? "bg-white text-emerald-700 shadow-2xs border border-zinc-200/60"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Baru ({newBookingNotifs.length})
                    </button>
                  </div>

                  {/* List Notifikasi */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 p-1">
                    {dropdownDisplayNotifs.length > 0 ? (
                      dropdownDisplayNotifs.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 rounded-2xl transition-all hover:bg-zinc-50 flex flex-col gap-2 ${
                            n.type === "checkout_due" ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  n.type === "checkout_due"
                                    ? "bg-[#9f3c16] animate-pulse"
                                    : "bg-emerald-500"
                                }`}
                              />
                              <Link
                                href={`/admin/inquiry?id=${n.rawId}`}
                                onClick={() => setShowNotificationDropdown(false)}
                                className="text-[11px] font-black text-zinc-900 hover:text-[#9f3c16] hover:underline transition-colors"
                                title="Buka detail pemesanan"
                              >
                                {n.guest}
                              </Link>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {n.code}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                n.type === "checkout_due"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {n.type === "checkout_due" ? "Perlu Proses Nota" : "Booking Baru"}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-600">
                            <span className="font-semibold text-zinc-900">{n.property}</span>
                            {n.roomTypeName && (
                              <span className="text-[#9f3c16] font-bold"> · {n.roomTypeName}</span>
                            )}
                            <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center justify-between">
                              <span>
                                {n.checkInFormatted} → {n.checkOutFormatted} ({n.nights} mlm)
                              </span>
                              <span className="font-extrabold text-zinc-900">{n.amount}</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-500 italic bg-white/80 p-1.5 rounded-lg border border-zinc-200/50">
                            {n.reasonText}
                          </p>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {n.type === "checkout_due" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSendNotaWa(n)}
                                  disabled={updatingId === n.rawId}
                                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                  title="Kirim Nota via WhatsApp ke Tamu & Otomatis Selesaikan Reservasi"
                                >
                                  {updatingId === n.rawId ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  )}
                                  <span>Kirim Nota &amp; Selesaikan</span>
                                </button>
                                <Link
                                  href={`/nota/${n.rawId}`}
                                  target="_blank"
                                  className="py-1.5 px-2.5 rounded-xl bg-[#ffdbcf]/60 hover:bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold flex items-center gap-1 transition-colors"
                                  title="Buka / Cetak Lembar Nota Resmi"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Lihat Nota</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(n.rawId)}
                                  disabled={updatingId === n.rawId}
                                  className="py-1.5 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Tandai Selesai Langsung"
                                >
                                  {updatingId === n.rawId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  )}
                                  <span>Selesai</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/admin/inquiry?id=${n.rawId}`}
                                  onClick={() => setShowNotificationDropdown(false)}
                                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-zinc-900 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1.5 hover:bg-zinc-800 shadow-xs transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Detail Pemesanan</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleContactGuestWa(n)}
                                  className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                  title="Chat Tamu via WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Chat Tamu</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-zinc-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                        <p className="font-bold text-zinc-700">Semua reservasi terkendali</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Tidak ada nota tertunda yang perlu diproses.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Dropdown */}
                  <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                    <Link
                      href="/admin/inquiry"
                      onClick={() => setShowNotificationDropdown(false)}
                      className="text-xs font-bold text-[#9f3c16] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Manajemen Inquiry & Nota Lengkap</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
                      <th className="py-3.5 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((b) => {
                        const st = statusConfig[b.status] || statusConfig.pending;
                        return (
                          <tr key={b.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-4 px-6 font-semibold text-zinc-900">
                              <Link
                                href={`/admin/inquiry?id=${b.rawId}`}
                                className="hover:text-[#9f3c16] hover:underline transition-colors"
                                title="Buka Detail Pemesanan"
                              >
                                {b.guest}
                              </Link>
                            </td>
                            <td className="py-4 px-6 text-zinc-600 truncate max-w-[200px]">
                              <span className="font-semibold text-zinc-900 block truncate">{b.property}</span>
                              {b.roomTypeName && (
                                <span className="inline-block text-[10px] font-bold text-[#9f3c16] bg-[#ffdbcf]/60 px-1.5 py-0.5 rounded mt-0.5 truncate max-w-full">
                                  {b.roomTypeName}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-zinc-500">
                              {b.checkin === "Fleksibel" ? (
                                <span className="text-zinc-400 italic">Fleksibel</span>
                              ) : (
                                `${b.checkin} (${b.nights} mlm)`
                              )}
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
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/admin/inquiry?id=${b.rawId}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors"
                                  title="Lihat Detail Pemesanan"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Detail</span>
                                </Link>
                                {b.status === "completed" && (
                                  <Link
                                    href={`/nota/${b.rawId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#ffdbcf]/60 hover:bg-[#ffdbcf] text-[#9f3c16] text-[11px] font-bold transition-colors"
                                    title="Buka Nota Resmi"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    <span>Nota</span>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400">
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

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-zinc-900/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
