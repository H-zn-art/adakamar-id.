/**
 * HomeHeroStats — Server Component
 * Ambil jumlah properti aktif & total ulasan dari API secara real-time.
 */

import { Home, ShieldCheck, MessageSquare } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchStats(): Promise<{ total: number; reviewCount: number }> {
  try {
    // Ambil semua properti aktif (limit 100 sudah cukup untuk sum reviewCount)
    const res = await fetch(`${API}/properties?limit=100&status=ACTIVE`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { total: 0, reviewCount: 0 };
    const data = await res.json();
    const total = Number(data?.meta?.total) || 0;
    const items: any[] = data?.data || [];
    const reviewCount = items.reduce(
      (sum: number, p: any) => sum + (Number(p.reviewCount) || 0),
      0
    );
    return { total, reviewCount };
  } catch {
    return { total: 0, reviewCount: 0 };
  }
}

export default async function HomeHeroStats() {
  const { total, reviewCount } = await fetchStats();

  const countLabel =
    total === 0
      ? "Homestay Autentik"
      : total >= 100
      ? `${Math.floor(total / 100) * 100}+ Homestay Autentik`
      : `${total} Homestay Autentik`;

  const reviewLabel =
    reviewCount > 0
      ? `${reviewCount.toLocaleString("id-ID")}+ Ulasan Tamu`
      : "Ulasan Tamu Terverifikasi";

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-5 sm:gap-8 px-6 py-3.5 rounded-2xl bg-zinc-950/75 border border-white/15 backdrop-blur-xl text-white shadow-2xl text-xs">
      {/* Jumlah homestay */}
      <div className="flex items-center gap-2">
        <Home className="w-4 h-4 text-[#ffdbcf]" />
        <span className="font-semibold text-zinc-200">{countLabel}</span>
      </div>

      <div className="hidden sm:block w-px h-3.5 bg-white/20" />

      {/* Total ulasan (menggantikan rating) */}
      <div className="flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-zinc-200">{reviewLabel}</span>
      </div>

      <div className="hidden sm:block w-px h-3.5 bg-white/20" />

      {/* Host terverifikasi — kebijakan platform */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-zinc-200">100% Host Lokal Terverifikasi</span>
      </div>
    </div>
  );
}
