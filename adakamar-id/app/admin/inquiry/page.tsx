"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState, useEffect } from "react";
import { inquiriesApi } from "@/lib/api";
import { ChevronRight, Clock, CheckCircle2, Receipt, Search, Eye, MessageCircle, X } from "lucide-react";

interface InquiryItem {
  id: string;
  code: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  homestay: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

export default function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadInquiries = async () => {
    try {
      const res = await inquiriesApi.list({ limit: 100 });
      if (res && Array.isArray(res.data)) {
        const mapped: InquiryItem[] = res.data.map((i: any) => {
          const nights = i.checkInDate && i.checkOutDate ? Math.max(1, Math.round((new Date(i.checkOutDate).getTime() - new Date(i.checkInDate).getTime()) / (1000 * 3600 * 24))) : 1;
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
          return {
            id: i.id,
            code: `INQ-${i.id.slice(-6).toUpperCase()}`,
            guestName: i.guestName,
            guestPhone: i.guestPhone,
            guestEmail: i.guestEmail || "-",
            homestay: i.property?.name || "Homestay Terdaftar",
            checkIn: i.checkInDate ? new Date(i.checkInDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
            checkOut: i.checkOutDate ? new Date(i.checkOutDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
            nights,
            guestsCount: i.guestCount || 2,
            totalAmount,
            status: i.status === "NEW" ? "pending" : i.status === "CONTACTED" ? "confirmed" : i.status === "COMPLETED" ? "completed" : "cancelled",
            notes: i.notes || "",
            createdAt: new Date(i.createdAt).toLocaleDateString("id-ID"),
          };
        });
        setInquiries(mapped);
        return;
      }
    } catch (err) {
      console.warn("API load inquiries error:", err);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const filtered = inquiries.filter((inq) => {
    const matchSearch =
      inq.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.homestay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (
    id: string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    const backendStatus =
      newStatus === "pending"
        ? "NEW"
        : newStatus === "confirmed"
        ? "CONTACTED"
        : newStatus === "completed"
        ? "COMPLETED"
        : "CANCELLED";

    try {
      await inquiriesApi.updateStatus(id, backendStatus);
    } catch (err) {
      console.warn("API update status error:", err);
    }
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data inquiry ini secara permanen dari database?")) return;
    try {
      await inquiriesApi.remove(id);
    } catch (err) {
      console.warn("API delete inquiry error:", err);
    }
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }
  };

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-18 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[10px] font-bold tracking-wider uppercase text-[#9f3c16]">
              Operasional Tamu
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              • Reservasi & Layanan Wisatawan
            </span>
          </div>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1400px] w-full flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Inquiry & Pemesanan Tamu
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Pantau pesan masuk, permintaan reservasi homestay, dan konfirmasi ketersediaan kamar kepada tamu.
            </p>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Menunggu Respon
                </span>
                <p className="text-2xl font-extrabold text-[#9f3c16] mt-1">
                  {inquiries.filter((i) => i.status === "pending").length} Tamu
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/60 text-[#9f3c16] flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6 text-[#9f3c16]" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Dikonfirmasi
                </span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {inquiries.filter((i) => i.status === "confirmed").length} Unit
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Total Estimasi Gross
                </span>
                <p className="text-xl font-extrabold text-zinc-900 mt-1">
                  {(() => {
                    const gross = inquiries.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
                    return `Rp ${gross.toLocaleString("id-ID")}`;
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-xs">
                <Receipt className="w-6 h-6 text-zinc-600" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Total Tamu Reservasi
                </span>
                <p className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {inquiries.reduce((sum, i) => sum + (i.guestsCount || 0), 0)} Tamu
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
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
              className="h-10 px-3 rounded-xl bg-surface-container-low border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Respon</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Inquiries Table */}
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low/50 border-b border-surface-variant/40 text-on-surface-variant uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Kode & Tamu</th>
                    <th className="px-4 py-3.5">Homestay Tujuan</th>
                    <th className="px-4 py-3.5">Periode Menginap</th>
                    <th className="px-4 py-3.5">Total Biaya</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-on-surface-variant block">
                          {item.code}
                        </span>
                        <h4 className="font-bold text-on-surface text-xs mt-0.5">
                          {item.guestName}
                        </h4>
                        <span className="text-[11px] text-on-surface-variant">
                          {item.guestPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-on-surface block">
                          {item.homestay}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {item.guestsCount} Tamu
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-on-surface block">
                          {item.checkIn} – {item.checkOut}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {item.nights} Malam
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-primary">
                          Rp {item.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.status === "confirmed" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-success-forest/10 text-success-forest text-[11px] font-semibold">
                            Dikonfirmasi
                          </span>
                        )}
                        {item.status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-terracotta-soft text-primary text-[11px] font-semibold animate-pulse">
                            Menunggu Respon
                          </span>
                        )}
                        {item.status === "completed" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                            Selesai
                          </span>
                        )}
                        {item.status === "cancelled" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-error/10 text-error text-[11px] font-semibold">
                            Dibatalkan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#ffdbcf]/60 hover:text-[#9f3c16] text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Inquiry"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-40 block">inbox</span>
                        <p className="font-semibold text-sm">Belum ada inquiry reservasi</p>
                        <p className="text-xs text-on-surface-variant/70 mt-0.5">
                          Inquiry pemesanan dari tamu homestay akan muncul otomatis di sini.
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

      {/* Detail Modal Box (Centered Dialog) */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-extrabold text-[#9f3c16] bg-[#ffdbcf]/70 px-3 py-1 rounded-xl">
                  {selectedInquiry.code}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">
                    Detail Reservasi & Tamu
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Dibuat pada {selectedInquiry.createdAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guest Info Card */}
            <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Data Tamu
                </span>
                <span className="text-xs font-bold text-zinc-900">
                  {selectedInquiry.guestsCount} Orang
                </span>
              </div>
              <h4 className="font-extrabold text-base text-zinc-950">
                {selectedInquiry.guestName}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 pt-1 border-t border-zinc-200/60">
                <a
                  href={`https://wa.me/${selectedInquiry.guestPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#9f3c16] font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedInquiry.guestPhone}</span>
                </a>
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[15px] text-zinc-400 shrink-0">
                    mail
                  </span>
                  <span className="truncate">{selectedInquiry.guestEmail || "Tidak ada email"}</span>
                </div>
              </div>
            </div>

            {/* Homestay & Stay Details */}
            <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Rincian Menginap
              </span>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60">
                <span className="text-zinc-500 font-medium">Unit Homestay:</span>
                <span className="font-extrabold text-zinc-900 text-right">
                  {selectedInquiry.homestay}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60">
                <span className="text-zinc-500 font-medium">Jadwal Menginap:</span>
                <span className="font-bold text-zinc-900 text-right">
                  {selectedInquiry.checkIn !== "-" ? `${selectedInquiry.checkIn} – ${selectedInquiry.checkOut} (${selectedInquiry.nights} malam)` : "Tanggal Fleksibel"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-700 font-bold">Total Pembayaran / Estimasi:</span>
                <span className="font-black text-base text-[#9f3c16]">
                  Rp {selectedInquiry.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Notes & Promo Information */}
            {selectedInquiry.notes && (
              <div className="p-4 rounded-2xl bg-[#ffdbcf]/30 border border-[#9f3c16]/20 text-xs">
                <span className="font-bold text-[#9f3c16] block mb-1">
                  Catatan Tamu & Kupon Promo:
                </span>
                <p className="leading-relaxed text-zinc-800 whitespace-pre-line font-medium">
                  {selectedInquiry.notes}
                </p>
              </div>
            )}

            {/* Change Status Fast Buttons */}
            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-zinc-700">
                Perbarui Status Reservasi:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "confirmed")}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                    selectedInquiry.status === "confirmed"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  ✓ Konfirmasi
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "completed")}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                    selectedInquiry.status === "completed"
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Selesai
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "cancelled")}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                    selectedInquiry.status === "cancelled"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  Batalkan
                </button>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-100">
              <a
                href={`https://wa.me/${selectedInquiry.guestPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Tamu via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry.id)}
                className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                title="Hapus Inquiry"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
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
