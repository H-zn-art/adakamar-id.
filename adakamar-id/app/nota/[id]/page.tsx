"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { inquiriesApi } from "@/lib/api";
import {
  Printer,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  Loader2,
  Home,
  MessageCircle,
  Share2,
} from "lucide-react";

// ── Status Label ──────────────────────────────────────────────────
type StatusKey = "NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string }> = {
  NEW:         { label: "Menunggu Konfirmasi", color: "#b45309" },
  CONTACTED:   { label: "Dikonfirmasi",        color: "#15803d" },
  IN_PROGRESS: { label: "Sedang Berlangsung",  color: "#1d4ed8" },
  COMPLETED:   { label: "Selesai / Lunas",     color: "#15803d" },
  CANCELLED:   { label: "Dibatalkan",          color: "#be123c" },
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatDate(d: string | null) {
  if (!d) return "Fleksibel";
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function shortDate(d: string | null) {
  if (!d) return "Fleksibel";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Print CSS injected once ───────────────────────────────────────
const PRINT_CSS = `
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  .nota-card { box-shadow: none !important; border: 1px solid #e4e4e7 !important; }
}
`;

export default function NotaPage() {
  const params = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharingWa, setSharingWa] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    inquiriesApi
      .getNotaById(params.id)
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setError("Nota tidak ditemukan atau telah dihapus.");
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
          <span className="text-sm font-medium">Memuat nota reservasi...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 mb-2">Nota Tidak Ditemukan</h1>
          <p className="text-sm text-zinc-500">{error || "Periksa kembali link yang Anda terima."}</p>
          <a
            href="https://wa.me/6285795445463"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Admin
          </a>
        </div>
      </div>
    );
  }

  // Derived values
  const nights =
    data.checkInDate && data.checkOutDate
      ? Math.max(1, Math.round((new Date(data.checkOutDate).getTime() - new Date(data.checkInDate).getTime()) / (1000 * 3600 * 24)))
      : 1;
  const pricePerNight = data.property?.price || 0;
  const code = `INQ-${data.id.slice(-6).toUpperCase()}`;
  const statusInfo = STATUS_CONFIG[(data.status as StatusKey)] ?? STATUS_CONFIG.NEW;
  const issuedDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const guestRawPhone = (data.guestPhone || "").replace(/[^0-9]/g, "");
  const guestWaPhone = guestRawPhone.startsWith("62")
    ? guestRawPhone
    : guestRawPhone.startsWith("0")
    ? "62" + guestRawPhone.substring(1)
    : "62" + guestRawPhone;

  const propertyRawPhone = (data.property?.whatsappNumber || "085795445463").replace(/[^0-9]/g, "");
  const propertyWaPhone = propertyRawPhone.startsWith("62")
    ? propertyRawPhone
    : propertyRawPhone.startsWith("0")
    ? "62" + propertyRawPhone.substring(1)
    : "62" + propertyRawPhone;

  const checkInFmt = data.checkInDate ? new Date(data.checkInDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Fleksibel";
  const checkOutFmt = data.checkOutDate ? new Date(data.checkOutDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Fleksibel";

  // Ekstraksi tipe kamar
  const roomTypeName = (() => {
    if (data.roomTypeName) return data.roomTypeName;
    const match = (data.notes || "").match(/\[Kamar:\s*([^\]\-]+)/i);
    return match ? match[1].trim() : "";
  })();

  // Ekstraksi promo & kupon diskon dari notes
  const notesStr = data.notes || "";
  const promoMatch = notesStr.match(/\[PROMO:\s*([A-Za-z0-9_-]+)(?:\s*\((?:Hemat|Diskon|Potongan)\s*Rp\s*([\d.,]+)\))?(?:\s*-\s*Total:\s*Rp\s*([\d.,]+))?\]/i);
  const promoCode = promoMatch ? promoMatch[1].trim() : null;
  const promoDiscount = promoMatch && promoMatch[2] ? parseInt(promoMatch[2].replace(/[.,]/g, ""), 10) || 0 : 0;

  // Ekstraksi total estimasi final (setelah diskon promo)
  const parsedFinalTotal = (() => {
    if (promoMatch && promoMatch[3]) {
      const p = parseInt(promoMatch[3].replace(/[.,]/g, ""), 10);
      if (!isNaN(p) && p > 0) return p;
    }
    const totalMatch = notesStr.match(/\[Total(?: Estimasi)?:\s*Rp\s*([\d.,]+)\]/i);
    if (totalMatch && totalMatch[1]) {
      const p = parseInt(totalMatch[1].replace(/[.,]/g, ""), 10);
      if (!isNaN(p) && p > 0) return p;
    }
    return null;
  })();

  const rawSubtotal = pricePerNight > 0 ? pricePerNight * nights : 0;
  const totalAmount = parsedFinalTotal !== null
    ? parsedFinalTotal
    : promoDiscount > 0
    ? Math.max(0, rawSubtotal - promoDiscount)
    : rawSubtotal;

  const subtotalAmount = promoDiscount > 0
    ? (totalAmount + promoDiscount)
    : (rawSubtotal > 0 ? rawSubtotal : totalAmount);

  // Bersihkan catatan asli tamu dari tag teknis sistem
  const cleanNotes = notesStr
    .replace(/\[Kamar:[^\]]*\]/gi, "")
    .replace(/\[PROMO:[^\]]*\]/gi, "")
    .replace(/\[Total(?: Estimasi)?:[^\]]*\]/gi, "")
    .replace(/\[Ku?pon:[^\]]*\]/gi, "")
    .trim();

  const waShareText = encodeURIComponent(
    `Halo Kak ${data.guestName}, terima kasih telah menginap di ${data.property?.name}.\n\n` +
    `Masa menginap Anda telah selesai. Berikut tautan lembar nota resmi reservasi Anda:\n` +
    `${typeof window !== "undefined" ? window.location.href : ""}\n\n` +
    `🔖 Kode Reservasi: ${code}\n` +
    (roomTypeName ? `🛏️ Tipe Kamar: ${roomTypeName}\n` : "") +
    `📅 Check-in: ${checkInFmt}\n` +
    `📅 Check-out: ${checkOutFmt}\n` +
    `🌙 Durasi: ${nights} Malam\n` +
    (promoCode && promoDiscount > 0 ? `🎟️ Kupon Promo: ${promoCode} (Hemat Rp ${new Intl.NumberFormat("id-ID").format(promoDiscount)})\n` : "") +
    (totalAmount > 0 ? `💰 Total: Rp ${new Intl.NumberFormat("id-ID").format(totalAmount)}\n` : "") +
    `Status: Selesai / Lunas\n\n` +
    `Silakan buka tautan di atas untuk melihat rincian, menyimpan, atau mencetak nota. Terima kasih dan semoga berkesan selama di Jogja! 🙏`
  );

  const handleShareToGuestWa = async () => {
    // 1. Buka percakapan WhatsApp ke tamu
    const waUrl = `https://wa.me/${guestWaPhone}?text=${waShareText}`;
    window.open(waUrl, "_blank");

    // 2. Jika status belum COMPLETED, otomatis selesaikan reservasi di sistem
    if (data.status !== "COMPLETED") {
      try {
        setSharingWa(true);
        await inquiriesApi.updateStatus(data.id, "COMPLETED");
        setData((prev: any) => (prev ? { ...prev, status: "COMPLETED" } : prev));
        setShareToast("✓ Nota berhasil dibagikan & status reservasi otomatis SELESAI!");
      } catch (err: any) {
        console.warn("Auto update status error on share:", err);
      } finally {
        setSharingWa(false);
        setTimeout(() => setShareToast(null), 4000);
      }
    }
  };

  return (
    <>
      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="min-h-screen bg-zinc-100 py-8 px-4">
        {/* Toast Notifikasi Berhasil */}
        {shareToast && (
          <div className="no-print max-w-2xl mx-auto mb-4 p-3.5 bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{shareToast}</span>
            </div>
            <button
              onClick={() => setShareToast(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Bar (no-print) */}
        <div className="no-print max-w-2xl mx-auto mb-6 flex items-center justify-between gap-3 flex-wrap">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            AdaKamar.id
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Tersalin!" : "Salin Link"}
            </button>
            <button
              type="button"
              onClick={handleShareToGuestWa}
              disabled={sharingWa}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
              title="Kirim Nota ke WhatsApp Tamu & Otomatis Selesaikan Reservasi"
            >
              {sharingWa ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5" />
              )}
              {data.status === "COMPLETED" ? "Kirim ke WhatsApp Tamu" : "Kirim Nota & Selesaikan"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
          </div>
        </div>

        {/* Nota Card */}
        <div
          ref={printRef}
          className="nota-card max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden"
        >
          {/* Header strip */}
          <div className="bg-gradient-to-r from-[#9f3c16] to-[#bf542c] px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black tracking-tight">AdaKamar.id</div>
                <div className="text-xs text-white/70 mt-0.5">Platform Penginapan Jogja Terpercaya</div>
                <div className="text-[11px] text-white/60 mt-1">WA: 0857-9544-5463 · adakamar.id</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Nota Reservasi</div>
                <div className="text-xl font-black mt-1 font-mono">{code}</div>
                <div className="text-[11px] text-white/60 mt-0.5">Diterbitkan: {issuedDate}</div>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div
            className="px-8 py-3 text-xs font-bold flex items-center gap-2"
            style={{ background: statusInfo.color + "15", color: statusInfo.color }}
          >
            <span>●</span>
            <span>STATUS: {statusInfo.label.toUpperCase()}</span>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-6">
            {/* Guest & Homestay Columns */}
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Data Tamu</p>
                <p className="font-black text-zinc-900 text-sm">{data.guestName}</p>
                <p className="text-xs text-zinc-500 mt-1">{data.guestPhone}</p>
                {data.guestEmail && (
                  <p className="text-xs text-zinc-400">{data.guestEmail}</p>
                )}
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Penginapan</p>
                <p className="font-black text-zinc-900 text-sm">{data.property?.name}</p>
                {data.property?.address && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{data.property.address}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-zinc-200" />

            {/* Invoice Table */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Rincian Pemesanan</p>
              <table className="w-full text-xs">
                <tbody>
                  {[
                    ["Tanggal Masuk (Check-in)", formatDate(data.checkInDate)],
                    ["Tanggal Keluar (Check-out)", formatDate(data.checkOutDate)],
                    ["Durasi Menginap", `${nights} Malam`],
                    ...(roomTypeName ? [["Tipe Kamar", roomTypeName]] : []),
                    ["Jumlah Tamu", `${data.guestCount || 2} Orang`],
                    ...(pricePerNight > 0 ? [["Harga per Malam", `Rp ${formatRupiah(pricePerNight)}`]] : []),
                    ...(promoDiscount > 0 ? [["Subtotal", `Rp ${formatRupiah(subtotalAmount)}`]] : []),
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-zinc-100">
                      <td className="py-2.5 text-zinc-500 font-medium">{label}</td>
                      <td className={`py-2.5 text-right font-semibold ${label === "Tipe Kamar" ? "text-[#9f3c16]" : "text-zinc-900"}`}>{value}</td>
                    </tr>
                  ))}

                  {/* Kupon Diskon Promo */}
                  {promoCode && (
                    <tr className="border-b border-emerald-100 bg-emerald-50/50">
                      <td className="py-2.5 text-emerald-800 font-bold flex items-center gap-1.5">
                        <span>Diskon Kupon Promo</span>
                        <span className="font-mono text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-extrabold uppercase">
                          {promoCode}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-emerald-700">
                        -Rp {formatRupiah(promoDiscount)}
                      </td>
                    </tr>
                  )}

                  {/* Catatan Tamu */}
                  {cleanNotes && (
                    <tr className="border-b border-zinc-100">
                      <td className="py-2.5 text-zinc-500 font-medium align-top">Catatan Tamu</td>
                      <td className="py-2.5 text-right font-medium text-zinc-700 max-w-xs whitespace-pre-line">{cleanNotes}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total */}
              <div className="mt-4 pt-4 border-t-2 border-[#9f3c16] flex items-center justify-between">
                <div>
                  <span className="font-black text-zinc-900 text-sm block">Total Estimasi Biaya</span>
                  {promoDiscount > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                      ✓ Kupon {promoCode} hemat Rp {formatRupiah(promoDiscount)}
                    </span>
                  )}
                </div>
                <span className="font-black text-xl text-[#9f3c16]">
                  {totalAmount > 0 ? `Rp ${formatRupiah(totalAmount)}` : "Dikonfirmasi via pengelola"}
                </span>
              </div>

              <p className="text-[10px] text-zinc-400 mt-2">
                * Total di atas adalah estimasi berdasarkan harga per malam. Pembayaran final dikonfirmasi langsung oleh pengelola homestay.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-zinc-200" />

            {/* Contact & Signature */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Hubungi Pengelola</p>
                <a
                  href={`https://wa.me/${propertyWaPhone}?text=${encodeURIComponent(`Halo Pengelola ${data.property?.name}, saya ${data.guestName} ingin konfirmasi terkait nota reservasi: ${code}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="no-print inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp Pengelola
                </a>
                <p className="text-xs text-zinc-500 mt-1">
                  {(data.property?.whatsappNumber || "085795445463").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Kode Reservasi</p>
                <p className="font-mono font-black text-lg text-zinc-900">{code}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Simpan kode ini untuk konfirmasi</p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="rounded-2xl bg-[#ffdbcf]/30 border border-[#9f3c16]/15 p-4 text-center">
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Nota ini diterbitkan otomatis oleh sistem <strong>AdaKamar.id</strong> berdasarkan data reservasi Anda.<br />
                Pembayaran &amp; konfirmasi ketersediaan dilakukan langsung bersama pengelola homestay.
              </p>
            </div>
          </div>

          {/* Footer strip */}
          <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-4 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">adakamar.id · Penginapan Autentik Jogja</span>
            <span className="text-[11px] text-zinc-400">{issuedDate}</span>
          </div>
        </div>

        {/* Bottom action (no-print) */}
        <div className="no-print max-w-2xl mx-auto mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#9f3c16] hover:bg-[#853010] text-white text-sm font-bold shadow-lg shadow-[#9f3c16]/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Nota / Simpan PDF
          </button>
          <button
            type="button"
            onClick={handleShareToGuestWa}
            disabled={sharingWa}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            title="Kirim Nota ke WhatsApp Tamu & Otomatis Selesaikan Reservasi"
          >
            {sharingWa ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            {data.status === "COMPLETED"
              ? "Bagikan Nota ke WhatsApp Tamu"
              : "Kirim Nota ke WhatsApp Tamu & Selesaikan"}
          </button>
        </div>
      </div>
    </>
  );
}
