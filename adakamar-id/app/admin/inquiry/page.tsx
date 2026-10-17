"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { inquiriesApi } from "@/lib/api";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Receipt,
  Search,
  Eye,
  MessageCircle,
  X,
  Printer,
  PlayCircle,
  Loader2,
  Share2,
  ExternalLink,
} from "lucide-react";

// ── Status definitions ──────────────────────────────────────────────
type StatusKey = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

const STATUS_MAP: Record<StatusKey, { label: string; backendValue: string; color: string; badge: string }> = {
  pending:     { label: "Menunggu",    backendValue: "NEW",         color: "text-amber-700 bg-amber-50 border-amber-200",   badge: "animate-pulse" },
  confirmed:   { label: "Dikonfirmasi",backendValue: "CONTACTED",   color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "" },
  in_progress: { label: "Berlangsung", backendValue: "IN_PROGRESS", color: "text-blue-700 bg-blue-50 border-blue-200",        badge: "" },
  completed:   { label: "Selesai",     backendValue: "COMPLETED",   color: "text-zinc-700 bg-zinc-100 border-zinc-200",        badge: "" },
  cancelled:   { label: "Dibatalkan",  backendValue: "CANCELLED",   color: "text-rose-700 bg-rose-50 border-rose-200",         badge: "" },
};

function backendToFrontend(s: string): StatusKey {
  if (s === "NEW")         return "pending";
  if (s === "CONTACTED")   return "confirmed";
  if (s === "IN_PROGRESS") return "in_progress";
  if (s === "COMPLETED")   return "completed";
  return "cancelled";
}

// ── Interfaces ──────────────────────────────────────────────────────
interface InquiryItem {
  id: string;
  code: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  homestay: string;
  homestaySlug: string;
  checkIn: string;
  checkOut: string;
  checkInRaw: string;
  checkOutRaw: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  status: StatusKey;
  notes?: string;
  createdAt: string;
  propertyPrice: number;
  roomTypeName: string; // tipe kamar yang dipesan
  promoCode?: string;
  promoDiscount?: number;
  subtotalAmount?: number;
  cleanNotes?: string;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

// Konversi nomor telepon ke format wa.me (62xxx)
function toWaNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.substring(1);
  return digits;
}

function mapInquiryItem(i: any): InquiryItem {
  const nights =
    i.checkInDate && i.checkOutDate
      ? Math.max(1, Math.round((new Date(i.checkOutDate).getTime() - new Date(i.checkInDate).getTime()) / (1000 * 3600 * 24)))
      : 1;
  const unitPrice = i.property?.price || 500000;
  const rawTotal = unitPrice * nights;

  // Ekstraksi promo & kupon diskon
  const notesStr = i.notes || "";
  const promoMatch = notesStr.match(/\[PROMO:\s*([A-Za-z0-9_-]+)(?:\s*\((?:Hemat|Diskon|Potongan)\s*Rp\s*([\d.,]+)\))?(?:\s*-\s*Total:\s*Rp\s*([\d.,]+))?\]/i);
  const promoCode = promoMatch ? promoMatch[1].trim() : undefined;
  const promoDiscount = promoMatch && promoMatch[2] ? parseInt(promoMatch[2].replace(/[.,]/g, ""), 10) || 0 : 0;

  // Ekstraksi total estimasi final
  let parsedFinalTotal: number | null = null;
  if (promoMatch && promoMatch[3]) {
    const p = parseInt(promoMatch[3].replace(/[.,]/g, ""), 10);
    if (!isNaN(p) && p > 0) parsedFinalTotal = p;
  }
  if (parsedFinalTotal === null) {
    const totalMatch = notesStr.match(/\[Total(?: Estimasi)?:\s*Rp\s*([\d.,]+)\]/i);
    if (totalMatch && totalMatch[1]) {
      const p = parseInt(totalMatch[1].replace(/[.,]/g, ""), 10);
      if (!isNaN(p) && p > 0) parsedFinalTotal = p;
    }
  }

  const totalAmount = parsedFinalTotal !== null
    ? parsedFinalTotal
    : promoDiscount > 0
    ? Math.max(0, rawTotal - promoDiscount)
    : rawTotal;

  const subtotalAmount = promoDiscount > 0 ? (totalAmount + promoDiscount) : (rawTotal > 0 ? rawTotal : totalAmount);

  const cleanNotes = notesStr
    .replace(/\[Kamar:[^\]]*\]/gi, "")
    .replace(/\[PROMO:[^\]]*\]/gi, "")
    .replace(/\[Total(?: Estimasi)?:[^\]]*\]/gi, "")
    .replace(/\[Ku?pon:[^\]]*\]/gi, "")
    .trim();

  return {
    id: i.id,
    code: `INQ-${i.id.slice(-6).toUpperCase()}`,
    guestName: i.guestName,
    guestPhone: i.guestPhone,
    guestEmail: i.guestEmail || "-",
    homestay: i.property?.name || "Homestay Terdaftar",
    homestaySlug: i.property?.slug || "",
    checkIn: i.checkInDate ? new Date(i.checkInDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
    checkOut: i.checkOutDate ? new Date(i.checkOutDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
    checkInRaw: i.checkInDate || "",
    checkOutRaw: i.checkOutDate || "",
    nights,
    guestsCount: i.guestCount || 2,
    totalAmount,
    status: backendToFrontend(i.status),
    notes: i.notes || "",
    createdAt: new Date(i.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    propertyPrice: unitPrice,
    promoCode,
    promoDiscount,
    subtotalAmount,
    cleanNotes,
    roomTypeName: (() => {
      if (i.roomTypeName) return i.roomTypeName;
      const match = (i.notes || "").match(/\[Kamar:\s*([^\]\-]+)/);
      return match ? match[1].trim() : "";
    })(),
  };
}

// ── Main Page Content ─────────────────────────────────────────────────
function AdminInquiryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [notaCopied, setNotaCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCloseModal = () => {
    setSelectedInquiry(null);
    if (targetId) {
      router.replace("/admin/inquiry", { scroll: false });
    }
  };

  const getNotaUrl = (item: InquiryItem) => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://adakamar.id";
    return `${base}/nota/${item.id}`;
  };

  const handleShareNota = async (item: InquiryItem) => {
    const url = getNotaUrl(item);
    const waPhone = toWaNumber(item.guestPhone);
    const roomInfo = item.roomTypeName ? `\n🛏️ Tipe Kamar: ${item.roomTypeName}` : "";
    const promoInfo = item.promoCode && (item.promoDiscount || 0) > 0
      ? `\n🎟️ Kupon Promo: ${item.promoCode} (Hemat Rp ${formatRupiah(item.promoDiscount || 0)})`
      : "";
    const totalInfo = `\n💰 Total: Rp ${formatRupiah(item.totalAmount)}`;
    const text = encodeURIComponent(
      `Halo Kak ${item.guestName}, terima kasih telah menginap di ${item.homestay}.\n\n` +
      `Masa menginap Anda telah selesai. Berikut tautan nota resmi reservasi Anda:\n` +
      `${url}${roomInfo}${promoInfo}${totalInfo}\n\n` +
      `📋 Kode: ${item.code}\n` +
      `Status: Selesai / Lunas\n\n` +
      `Silakan buka link di atas untuk menyimpan atau mencetak nota. Terima kasih dan semoga berkunjung kembali ke Jogja! 🙏`
    );
    window.open(`https://wa.me/${waPhone}?text=${text}`, "_blank");

    // Otomatis ubah status menjadi completed jika belum completed
    if (item.status !== "completed") {
      await handleUpdateStatus(item.id, "completed");
    }
  };

  const handleCopyNotaLink = async (item: InquiryItem) => {
    try {
      await navigator.clipboard.writeText(getNotaUrl(item));
      setNotaCopied(true);
      setTimeout(() => setNotaCopied(false), 2000);
    } catch {}
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiriesApi.list({ limit: 100 });
      if (res && Array.isArray(res.data)) {
        const mapped: InquiryItem[] = res.data.map(mapInquiryItem);
        setInquiries(mapped);

        // Auto open modal jika ada parameter ?id=... dari notifikasi dashboard
        if (targetId) {
          const found = mapped.find(
            (i) =>
              i.id === targetId ||
              i.code.toLowerCase() === targetId.toLowerCase() ||
              i.id.slice(-6).toLowerCase() === targetId.toLowerCase()
          );
          if (found) {
            setSelectedInquiry(found);
          }
        }
      }
    } catch (err) {
      console.warn("API load inquiries error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Sinkronisasi targetId jika berubah (misal klik notifikasi saat sudah di halaman ini)
  useEffect(() => {
    if (targetId && inquiries.length > 0) {
      const found = inquiries.find(
        (i) =>
          i.id === targetId ||
          i.code.toLowerCase() === targetId.toLowerCase() ||
          i.id.slice(-6).toLowerCase() === targetId.toLowerCase()
      );
      if (found) {
        setSelectedInquiry(found);
      }
    }
  }, [targetId, inquiries]);

  const filtered = inquiries.filter((inq) => {
    const matchSearch =
      inq.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.homestay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: StatusKey) => {
    setUpdating(id);
    try {
      await inquiriesApi.updateStatus(id, STATUS_MAP[newStatus].backendValue);
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
      if (selectedInquiry?.id === id) setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.warn("API update status error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data reservasi ini secara permanen?")) return;
    try {
      await inquiriesApi.remove(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      if (selectedInquiry?.id === id) handleCloseModal();
    } catch (err) {
      console.warn("API delete inquiry error:", err);
    }
  };

  const statusOrder: StatusKey[] = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[10px] font-bold tracking-wider uppercase text-[#9f3c16]">
              Operasional
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-zinc-700 font-semibold">Manajemen Reservasi</span>
          </div>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1400px] w-full flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Reservasi Tamu</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Pantau dan kelola seluruh permintaan reservasi homestay dari tamu.
            </p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statusOrder.map((s) => {
              const info = STATUS_MAP[s];
              const count = inquiries.filter((i) => i.status === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                  className={`p-4 rounded-2xl bg-white border transition-all text-left hover:shadow-md ${
                    statusFilter === s ? "border-[#9f3c16] shadow-sm" : "border-zinc-200/80 shadow-xs"
                  }`}
                >
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">{info.label}</span>
                  <p className="text-xl font-extrabold text-zinc-900 mt-1">{count}</p>
                </button>
              );
            })}
          </div>

          {/* Search + Filter */}
          <div className="p-4 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari tamu, homestay, atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              {statusOrder.map((s) => (
                <option key={s} value={s}>{STATUS_MAP[s].label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Kode &amp; Tamu</th>
                    <th className="px-4 py-3.5">Penginapan</th>
                    <th className="px-4 py-3.5">Periode</th>
                    <th className="px-4 py-3.5">Est. Biaya</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((item) => {
                    const statusInfo = STATUS_MAP[item.status];
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[11px] text-zinc-400 block">{item.code}</span>
                          <h4 className="font-bold text-zinc-900 text-xs mt-0.5">{item.guestName}</h4>
                          <span className="text-[11px] text-zinc-400">{item.guestPhone}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-zinc-900 block">{item.homestay}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {item.roomTypeName && (
                              <span className="inline-block text-[10px] font-bold text-[#9f3c16] bg-[#ffdbcf]/60 px-1.5 py-0.5 rounded">
                                {item.roomTypeName}
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400">{item.guestsCount} Tamu</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-zinc-900 block">{item.checkIn} – {item.checkOut}</span>
                          <span className="text-[11px] text-zinc-400">{item.nights} Malam</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-[#9f3c16] block">Rp {formatRupiah(item.totalAmount)}</span>
                          {item.promoCode && (
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded mt-0.5">
                              Promo: {item.promoCode}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.color} ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedInquiry(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#ffdbcf]/60 hover:text-[#9f3c16] text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="font-semibold text-sm text-zinc-600">Belum ada reservasi</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Inquiry dari tamu akan muncul otomatis di sini.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-extrabold text-[#9f3c16] bg-[#ffdbcf]/70 px-3 py-1 rounded-xl">
                  {selectedInquiry.code}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">Detail Reservasi</h3>
                  <p className="text-[11px] text-zinc-500">Masuk: {selectedInquiry.createdAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guest Info */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Data Tamu</span>
                <span className="text-xs font-bold text-zinc-900">{selectedInquiry.guestsCount} Orang</span>
              </div>
              <h4 className="font-extrabold text-base text-zinc-950">{selectedInquiry.guestName}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 pt-1 border-t border-zinc-200/60">
                <a
                  href={`https://wa.me/${toWaNumber(selectedInquiry.guestPhone)}?text=${encodeURIComponent(`Halo ${selectedInquiry.guestName}, kami dari AdaKamar.id menghubungi Anda terkait reservasi ${selectedInquiry.homestay} (Kode: ${selectedInquiry.code})${selectedInquiry.roomTypeName ? ` - Tipe Kamar: ${selectedInquiry.roomTypeName}` : ""}. Ada yang bisa kami bantu?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#9f3c16] font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedInquiry.guestPhone}</span>
                </a>
                <div className="flex items-center gap-2 truncate">
                  <span className="text-zinc-400 shrink-0">✉</span>
                  <span className="truncate">{selectedInquiry.guestEmail || "Tidak ada email"}</span>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Rincian Menginap</span>
              {[
                ["Unit Homestay", selectedInquiry.homestay],
                ...(selectedInquiry.roomTypeName ? [["Tipe Kamar", selectedInquiry.roomTypeName]] : []),
                ["Jadwal", selectedInquiry.checkIn !== "-" ? `${selectedInquiry.checkIn} – ${selectedInquiry.checkOut} (${selectedInquiry.nights} mlm)` : "Fleksibel"],
                ["Jumlah Tamu", `${selectedInquiry.guestsCount} Orang`],
                ...((selectedInquiry.promoDiscount || 0) > 0 ? [["Subtotal", `Rp ${formatRupiah(selectedInquiry.subtotalAmount || 0)}`]] : []),
                ...((selectedInquiry.promoDiscount || 0) > 0 ? [[`Kupon Promo (${selectedInquiry.promoCode})`, `-Rp ${formatRupiah(selectedInquiry.promoDiscount || 0)}`]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-100 last:border-0">
                  <span className={label.startsWith("Kupon Promo") ? "text-emerald-700 font-bold" : "text-zinc-500"}>{label}:</span>
                  <span className={`font-semibold text-right ${label.startsWith("Kupon Promo") ? "text-emerald-700 font-bold" : label === "Tipe Kamar" ? "text-[#9f3c16]" : "text-zinc-900"}`}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="font-bold text-zinc-700 block">Total Estimasi:</span>
                  {(selectedInquiry.promoDiscount || 0) > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                      ✓ Kupon {selectedInquiry.promoCode} hemat Rp {formatRupiah(selectedInquiry.promoDiscount || 0)}
                    </span>
                  )}
                </div>
                <span className="font-black text-base text-[#9f3c16]">Rp {formatRupiah(selectedInquiry.totalAmount)}</span>
              </div>
            </div>

            {/* Notes */}
            {(selectedInquiry.cleanNotes || selectedInquiry.notes) && (
              <div className="p-4 rounded-2xl bg-[#ffdbcf]/30 border border-[#9f3c16]/20 text-xs">
                <span className="font-bold text-[#9f3c16] block mb-1">Catatan Tamu:</span>
                <p className="leading-relaxed text-zinc-800 whitespace-pre-line font-medium">
                  {selectedInquiry.cleanNotes || selectedInquiry.notes}
                </p>
              </div>
            )}

            {/* Status Changer */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-700">Perbarui Status:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {statusOrder.map((s) => {
                  const info = STATUS_MAP[s];
                  const isActive = selectedInquiry.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={updating === selectedInquiry.id}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, s)}
                      className={`p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center border ${
                        isActive
                          ? `${info.color} shadow-sm`
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {updating === selectedInquiry.id && isActive
                        ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                        : info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nota Section — highlighted when Selesai */}
            {selectedInquiry.status === "completed" && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ffdbcf]/60 to-amber-50/60 border border-[#9f3c16]/20 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#9f3c16]" />
                  <span className="text-xs font-bold text-[#9f3c16]">Reservasi Selesai — Buat & Bagikan Nota</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Nota otomatis dibuat dari data reservasi ini. Bagikan ke customer melalui WhatsApp atau salin link-nya.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleShareNota(selectedInquiry)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Kirim Nota ke WhatsApp Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyNotaLink(selectedInquiry)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition cursor-pointer"
                  >
                    {notaCopied ? "✓ Tersalin!" : "Salin Link Nota"}
                  </button>
                  <a
                    href={getNotaUrl(selectedInquiry)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Pratinjau Nota
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
              <a
                href={`https://wa.me/${toWaNumber(selectedInquiry.guestPhone)}?text=${encodeURIComponent(
                  `Halo Kak ${selectedInquiry.guestName}, kami dari tim adakamar.id / Pengelola ${selectedInquiry.homestay}.\n\n` +
                  `Permintaan reservasi Anda telah kami terima:${selectedInquiry.roomTypeName ? ` (Tipe Kamar: ${selectedInquiry.roomTypeName})` : ""}\n` +
                  `- Check-in: ${selectedInquiry.checkIn}\n` +
                  `- Check-out: ${selectedInquiry.checkOut}\n` +
                  `- Total Estimasi: Rp ${formatRupiah(selectedInquiry.totalAmount)}\n` +
                  `- Kode: ${selectedInquiry.code}\n\n` +
                  `Apakah jadwal menginap sudah sesuai? Kami siap membantu proses konfirmasi reservasi Anda. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Chat via WhatsApp
              </a>
              {/* Tombol nota juga tersedia untuk status lain */}
              {selectedInquiry.status !== "completed" && (
                <button
                  type="button"
                  onClick={() => handleShareNota(selectedInquiry)}
                  disabled={updating === selectedInquiry.id}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                  title="Kirim Nota ke Tamu via WhatsApp & Otomatis Selesaikan Reservasi"
                >
                  {updating === selectedInquiry.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>Kirim Nota &amp; Selesaikan</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry.id)}
                className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#f8f7fb] min-h-screen flex items-center justify-center font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
        </div>
      }
    >
      <AdminInquiryContent />
    </Suspense>
  );
}
