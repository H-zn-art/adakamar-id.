"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, Sparkles, ArrowRight, Tag, Zap } from "lucide-react";
import { promosApi } from "@/lib/api";

interface PromoCardData {
  id: string;
  code: string;
  badge: string;
  title: string;
  desc: string;
  minTransaction?: number;
  discountPercent?: number;
  bgGradient: string;
  accentColor: string;
}

const defaultPromos: PromoCardData[] = [];

export default function HomePromosSection() {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCardData[]>(defaultPromos);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  useEffect(() => {
    promosApi.listActive()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const gradients = [
            "from-[#ffdbcf]/50 to-white",
            "from-[#ffdcc3]/50 to-white",
            "from-zinc-100 to-white",
          ];
          const colors = ["#9f3c16", "#8d4b00", "#18181b"];

          const mapped: PromoCardData[] = data.map((p, idx) => ({
            id: p.id,
            code: p.code,
            badge: p.discountPercent
              ? `Diskon ${p.discountPercent}%`
              : p.discountAmount
              ? `Potongan Rp ${Number(p.discountAmount).toLocaleString("id-ID")}`
              : p.code,
            title: p.title || `Promo Spesial ${p.code}`,
            desc: p.description || "Nikmati penawaran eksklusif homestay Jogja terbaik dengan harga hemat dan fasilitas lengkap.",
            minTransaction: p.minTransaction ? Number(p.minTransaction) : undefined,
            discountPercent: p.discountPercent || undefined,
            bgGradient: gradients[idx % gradients.length],
            accentColor: colors[idx % colors.length],
          }));
          setPromos(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback promos:", err);
      });
  }, []);

  const handleCopy = async (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      try {
        await promosApi.usePromo(code);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("adakamar_promos_updated"));
        }
      } catch {}
    }
  };

  const handleUsePromo = (code: string) => {
    router.push(`/homestay?promo=${encodeURIComponent(code)}`);
  };

  if (promos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200/80 p-8">
        <Sparkles className="w-8 h-8 text-[#9f3c16] mx-auto mb-2 opacity-80" />
        <h4 className="text-sm font-semibold text-zinc-900">Promo Baru Segera Hadir</h4>
        <p className="text-xs text-zinc-500 mt-1">Nantikan promo menarik berikutnya untuk perjalanan hematmu di Jogja.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promos.map((p) => (
        <div
          key={p.id}
          className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-[#ffdbcf]/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle gradient wash */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#ffdbcf]/40 via-[#ffdbcf]/10 to-transparent pointer-events-none" />

          {/* Decorative glow in corner */}
          <div
            className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ backgroundColor: p.accentColor }}
          />

          <div className="relative z-10 flex flex-col">
            {/* Top Badges Row */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#9f3c16] to-[#bf542c] shadow-xs">
                <Tag className="w-3.5 h-3.5" />
                {p.badge}
              </span>

              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Voucher Terverifikasi
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#9f3c16] transition-colors leading-snug mb-2">
              {p.title}
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed mb-6 line-clamp-2">
              {p.desc}
            </p>
          </div>

          {/* Dashed Voucher Divider with Semicircular Notches */}
          <div className="relative my-2">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f4f2f0] border-r border-[#ffdbcf]" />
            <div className="w-full border-t-2 border-dashed border-zinc-200/90" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f4f2f0] border-l border-[#ffdbcf]" />
          </div>

          {/* Action Row: Coupon Code + Use Promo Button */}
          <div className="relative z-10 pt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-zinc-50/90 px-3 py-1.5 rounded-xl border border-zinc-200/90 shadow-2xs">
              <span className="font-mono text-xs font-bold text-zinc-900 tracking-wider">
                {p.code}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(p.code)}
                className="text-zinc-400 hover:text-zinc-800 p-1 rounded-md hover:bg-zinc-200/60 transition-colors cursor-pointer"
                title="Salin kode kupon"
              >
                {copiedCode === p.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleUsePromo(p.code)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#9f3c16] hover:bg-[#853010] text-white transition-all shadow-xs hover:shadow-md cursor-pointer ml-auto"
            >
              <span>Gunakan Promo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
