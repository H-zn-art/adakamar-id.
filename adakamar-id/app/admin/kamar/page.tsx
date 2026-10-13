"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { propertiesApi } from "@/lib/api";
import {
  BedDouble, Search, Loader2, Home, Users, ChevronRight, Plus,
} from "lucide-react";

function fmtRp(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function AdminKamarHubPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    propertiesApi.listAdminAll({ limit: 200 })
      .then((res: any) => {
        setProperties(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.locationArea?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf] flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-[#9f3c16]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-zinc-900">Kelola Tipe Kamar</h1>
              <p className="text-xs text-zinc-400 leading-none mt-0.5">Pilih penginapan untuk mengelola tipe kamar</p>
            </div>
          </div>
          <Link
            href="/admin/penginapan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition"
          >
            <Home className="w-3.5 h-3.5" />
            Ke Penginapan
          </Link>
        </header>

        <main className="flex-1 p-8">
          {/* Search */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari penginapan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-2xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16]"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-zinc-200">
              <BedDouble className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="text-base font-bold text-zinc-700 mb-1">
                {search ? "Penginapan tidak ditemukan" : "Belum Ada Penginapan"}
              </h3>
              <p className="text-xs text-zinc-400 mb-6 text-center max-w-xs">
                {search ? "Coba kata kunci lain" : "Tambahkan penginapan terlebih dahulu."}
              </p>
              {!search && (
                <Link
                  href="/admin/penginapan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#9f3c16] text-white text-sm font-bold hover:bg-[#853010] transition shadow-lg shadow-[#9f3c16]/20"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Penginapan
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((p) => {
                const roomTypes: any[] = Array.isArray(p.roomTypes) ? p.roomTypes : [];
                const totalUnitsCount = roomTypes.reduce((acc: number, r: any) => acc + (r.totalUnits || 1), 0);
                const availableUnitsCount = roomTypes.filter((r) => r.isAvailable).reduce((acc: number, r: any) => acc + (r.totalUnits || 1), 0);
                const minPrice = roomTypes.length > 0
                  ? Math.min(p.price || Infinity, ...roomTypes.map((r: any) => r.pricePerNight))
                  : p.price;
                const location = p.locationArea?.name || p.address || "Yogyakarta";

                return (
                  <Link
                    key={p.id}
                    href={`/admin/penginapan/${p.id}/kamar`}
                    className="group flex items-center justify-between gap-4 px-6 py-4 bg-white rounded-2xl border border-zinc-200/80 hover:border-[#9f3c16]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#ffdbcf]/60 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-[#9f3c16]" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-sm group-hover:text-[#9f3c16] transition-colors">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                          <span>{location}</span>
                          {p.capacity && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {p.capacity} tamu
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                          <BedDouble className="w-3.5 h-3.5 text-[#9f3c16]" />
                          {roomTypes.length} tipe ({totalUnitsCount} unit)
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{availableUnitsCount} unit tersedia</div>
                      </div>
                      {minPrice && minPrice > 0 && (
                        <div className="text-right hidden md:block">
                          <div className="text-[11px] text-zinc-400">Mulai dari</div>
                          <div className="font-extrabold text-[#9f3c16] text-sm">Rp {fmtRp(minPrice)}</div>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}>
                        {p.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#9f3c16] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
