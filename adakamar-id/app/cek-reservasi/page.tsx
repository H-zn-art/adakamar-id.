"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { inquiriesApi } from "@/lib/api";
import {
  Search,
  Phone,
  Loader2,
  CalendarDays,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  Home,
} from "lucide-react";

// ── Status definitions ──────────────────────────────────────────────
type StatusKey = "NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  NEW: {
    label: "Menunggu Konfirmasi",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
    desc: "Reservasi Anda telah diterima. Tim pengelola akan segera menghubungi Anda.",
  },
  CONTACTED: {
    label: "Dikonfirmasi",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    desc: "Reservasi Anda telah dikonfirmasi oleh pengelola homestay.",
  },
  IN_PROGRESS: {
    label: "Sedang Berlangsung",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: <PlayCircle className="w-4 h-4" />,
    desc: "Anda sedang menginap. Selamat menikmati homestay!",
  },
  COMPLETED: {
    label: "Selesai",
    color: "text-zinc-600 bg-zinc-50 border-zinc-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    desc: "Reservasi telah selesai. Terima kasih telah menginap bersama kami!",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "text-rose-700 bg-rose-50 border-rose-200",
    icon: <XCircle className="w-4 h-4" />,
    desc: "Reservasi ini telah dibatalkan. Hubungi kami jika ada pertanyaan.",
  },
};

interface TrackedInquiry {
  id: string;
  code: string;
  guestName: string;
  guestPhone: string;
  homestay: string;
  homestaySlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  status: StatusKey;
  notes: string;
  createdAt: string;
  propertyPrice: number;
  whatsappNumber: string;
  roomTypeName: string; // ← tipe kamar yang dipesan
  promoCode?: string;
  promoDiscount?: number;
  finalTotal?: number;
  cleanNotes?: string;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatDate(d: string | null) {
  if (!d) return "Fleksibel";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function CekReservasiPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrackedInquiry[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 4) {
      setError("Masukkan Kode Reservasi (contoh: INQ-MM4Z5T) atau nomor WhatsApp yang valid.");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await inquiriesApi.track(phone.trim());
      if (res && Array.isArray(res.data)) {
        const mapped: TrackedInquiry[] = res.data.map((i: any) => {
          const nights =
            i.checkInDate && i.checkOutDate
              ? Math.max(1, Math.round((new Date(i.checkOutDate).getTime() - new Date(i.checkInDate).getTime()) / (1000 * 3600 * 24)))
              : 1;

          const rawTotal = (i.property?.price || 0) * nights;
          const notesStr = i.notes || "";
          const promoMatch = notesStr.match(/\[PROMO:\s*([A-Za-z0-9_-]+)(?:\s*\((?:Hemat|Diskon|Potongan)\s*Rp\s*([\d.,]+)\))?(?:\s*-\s*Total:\s*Rp\s*([\d.,]+))?\]/i);
          const promoCode = promoMatch ? promoMatch[1].trim() : undefined;
          const promoDiscount = promoMatch && promoMatch[2] ? parseInt(promoMatch[2].replace(/[.,]/g, ""), 10) || 0 : 0;

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

          const finalTotal = parsedFinalTotal !== null
            ? parsedFinalTotal
            : promoDiscount > 0
            ? Math.max(0, rawTotal - promoDiscount)
            : rawTotal;

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
            homestay: i.property?.name || "Homestay",
            homestaySlug: i.property?.slug || "",
            checkIn: formatDate(i.checkInDate),
            checkOut: formatDate(i.checkOutDate),
            nights,
            guestsCount: i.guestCount || 2,
            status: (i.status as StatusKey) || "NEW",
            notes: i.notes || "",
            createdAt: formatDate(i.createdAt),
            propertyPrice: i.property?.price || 0,
            whatsappNumber: i.property?.whatsappNumber || "085795445463",
            promoCode,
            promoDiscount,
            finalTotal,
            cleanNotes,
            // Parse tipe kamar: coba dari field roomTypeName, fallback parse dari notes
            roomTypeName: (() => {
              if (i.roomTypeName) return i.roomTypeName;
              const match = (i.notes || "").match(/\[Kamar:\s*([^\]\-]+)/);
              return match ? match[1].trim() : "";
            })(),
          };
        });
        setResults(mapped);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError("Gagal menghubungi server. Pastikan koneksi internet Anda aktif.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f7fb] pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/20 text-[#9f3c16] text-xs font-bold mb-4">
            <Search className="w-3.5 h-3.5" />
            Cek Status Reservasi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
            Lacak Reservasi Anda
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Masukkan Kode Reservasi (contoh: <strong className="text-zinc-700">INQ-MM4Z5T</strong>) atau nomor WhatsApp yang Anda gunakan saat memesan penginapan untuk melihat status reservasi Anda secara langsung.
          </p>
        </section>

        {/* Search Form */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 mb-10">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-3xl border border-zinc-200 shadow-lg p-6 sm:p-8 flex flex-col gap-5"
          >
            <div>
              <label
                htmlFor="search-phone"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2"
              >
                Kode Reservasi atau Nomor WhatsApp Tamu *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="search-phone"
                  type="text"
                  placeholder="Contoh: INQ-MM4Z5T atau 08123456789"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(""); }}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                />
              </div>
              {error && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Mencari Reservasi..." : "Cari Reservasi Saya"}
            </button>
          </form>
        </section>

        {/* Results */}
        {searched && (
          <section className="max-w-2xl mx-auto px-4 sm:px-6">
            {results && results.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="font-bold text-zinc-900">Reservasi Tidak Ditemukan</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Tidak ada reservasi yang terdaftar untuk pencarian{" "}
                  <strong className="text-zinc-700">&ldquo;{phone}&rdquo;</strong>. Pastikan Kode Reservasi atau nomor WhatsApp yang Anda masukkan sesuai dengan yang digunakan saat pemesanan.
                </p>
                <a
                  href="https://wa.me/6285795445463"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi Admin AdaKamar
                </a>
              </div>
            ) : results && results.length > 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-zinc-600">
                  Ditemukan <span className="text-[#9f3c16] font-bold">{results.length} reservasi</span> untuk pencarian &ldquo;{phone}&rdquo;
                </p>
                {results.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.NEW;
                  const totalEstimate = item.finalTotal ?? (item.propertyPrice > 0 ? item.propertyPrice * item.nights : 0);
                  const waNumber = (item.whatsappNumber || "085795445463").replace(/[^0-9]/g, "");
                  const waPhone = waNumber.startsWith("62") ? waNumber : waNumber.startsWith("0") ? "62" + waNumber.substring(1) : "62" + waNumber;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-zinc-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#9f3c16] bg-[#ffdbcf]/60 px-2.5 py-0.5 rounded-lg">
                            {item.code}
                          </span>
                          <h3 className="font-extrabold text-base text-zinc-900 mt-1">{item.guestName}</h3>
                          <p className="text-xs text-zinc-400">Dibuat: {item.createdAt}</p>
                        </div>
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.color} shrink-0`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Status Description */}
                      <div className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 ${statusInfo.color} bg-opacity-40`}>
                        {statusInfo.desc}
                      </div>

                      {/* Details Grid */}
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <Home className="w-4 h-4 text-[#9f3c16] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Penginapan</p>
                            <p className="font-bold text-zinc-900">{item.homestay}</p>
                            {item.homestaySlug && (
                              <Link
                                href={`/homestay/${item.homestaySlug}`}
                                className="text-[11px] text-[#9f3c16] hover:underline"
                              >
                                Lihat detail penginapan →
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CalendarDays className="w-4 h-4 text-[#9f3c16] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Jadwal</p>
                            <p className="font-bold text-zinc-900">{item.checkIn}</p>
                            <p className="text-xs text-zinc-500">s/d {item.checkOut} ({item.nights} malam)</p>
                          </div>
                        </div>

                        {/* Tipe Kamar — tampil jika ada */}
                        {item.roomTypeName && (
                          <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#9f3c16] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <div>
                              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Tipe Kamar</p>
                              <p className="font-bold text-zinc-900">{item.roomTypeName}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-[#9f3c16] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Tamu</p>
                            <p className="font-bold text-zinc-900">{item.guestsCount} Orang</p>
                          </div>
                        </div>

                        {totalEstimate > 0 && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-[#9f3c16] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Estimasi Biaya</p>
                              <p className="font-bold text-zinc-900">Rp {formatRupiah(totalEstimate)}</p>
                              {item.promoCode && (item.promoDiscount || 0) > 0 && (
                                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                                  ✓ Kupon {item.promoCode} (-Rp {formatRupiah(item.promoDiscount || 0)})
                                </p>
                              )}
                              <p className="text-[11px] text-zinc-400">Konfirmasi pembayaran via pengelola</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {(item.cleanNotes || item.notes) && (
                        <div className="px-5 pb-4">
                          <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Catatan Anda</p>
                          <p className="text-xs text-zinc-700 bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-100 whitespace-pre-line">
                            {item.cleanNotes || item.notes}
                          </p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="px-5 pb-5 flex items-center gap-2">
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo, saya ${item.guestName} ingin menghubungi pengelola ${item.homestay}.\n\n🔖 Kode Reservasi: ${item.code}\n📅 Check-in: ${item.checkIn}\n📅 Check-out: ${item.checkOut}${item.roomTypeName ? `\n🛏️ Tipe Kamar: ${item.roomTypeName}` : ""}\n👥 Tamu: ${item.guestsCount} Orang${item.promoCode && (item.promoDiscount || 0) > 0 ? `\n🎟️ Kupon Promo: ${item.promoCode} (-Rp ${formatRupiah(item.promoDiscount || 0)})` : ""}\n💰 Total Estimasi: Rp ${formatRupiah(totalEstimate)}\nStatus: ${statusInfo.label}\n\nAda yang ingin saya tanyakan terkait reservasi saya. Terima kasih!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Hubungi Pengelola
                        </a>
                        {item.homestaySlug && (
                          <Link
                            href={`/homestay/${item.homestaySlug}`}
                            className="h-10 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Home className="w-3.5 h-3.5" />
                            Detail
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        )}

        {/* Help Section */}
        {!searched && (
          <section className="max-w-xl mx-auto px-4 sm:px-6 mt-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-zinc-700">Cara Cek Reservasi</h3>
              <ol className="flex flex-col gap-2 text-xs text-zinc-500">
                {[
                  "Masukkan nomor WhatsApp yang Anda gunakan saat memesan penginapan",
                  "Klik tombol \"Cari Reservasi Saya\"",
                  "Lihat status dan detail reservasi Anda secara real-time",
                  "Hubungi pengelola homestay langsung jika ada pertanyaan",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-400">
                  Butuh bantuan?{" "}
                  <a
                    href="https://wa.me/6285795445463"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9f3c16] font-semibold hover:underline"
                  >
                    Hubungi Tim AdaKamar
                  </a>
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
