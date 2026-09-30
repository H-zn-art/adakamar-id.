"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import Link from "next/link";

const POPULAR_TAGS = ["Dekat Tugu", "Prawirotaman", "View Merapi", "Private Pool"];

export default function HomeSearchForm() {
  const router = useRouter();
  const [locationQuery, setLocationQuery] = useState("Malioboro, Kota Yogyakarta");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationQuery.trim()) params.set("q", locationQuery.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests !== 2) params.set("guests", String(guests));
    router.push(`/homestay?${params.toString()}`);
  };

  const formatTanggal = (d: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const tanggalLabel = checkIn
    ? `${formatTanggal(checkIn)}${checkOut ? " – " + formatTanggal(checkOut) : ""}`
    : "Pilih Tanggal Menginap";

  return (
    <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/80 p-3 sm:p-4 text-left">
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 items-center"
      >
        {/* Lokasi */}
        <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50/80 hover:bg-zinc-100 border border-zinc-200/60 transition-colors">
          <MapPin className="w-5 h-5 text-[#9f3c16] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <label htmlFor="search-input" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Lokasi / Kawasan
            </label>
            <input
              id="search-input"
              name="q"
              type="text"
              placeholder="Malioboro, Sleman, dll"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-zinc-900 w-full placeholder:text-zinc-400 truncate"
            />
          </div>
        </div>

        {/* Tanggal */}
        <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50/80 hover:bg-zinc-100 border border-zinc-200/60 transition-colors">
          <Calendar className="w-5 h-5 text-[#9f3c16] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Check-in &amp; Check-out
            </span>
            <div className="flex gap-1 items-center">
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-zinc-900 w-full placeholder:text-zinc-400 cursor-pointer"
                style={{ colorScheme: "light" }}
                aria-label="Tanggal Check-in"
              />
            </div>
            {checkIn && (
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] text-zinc-500 w-full cursor-pointer"
                style={{ colorScheme: "light" }}
                aria-label="Tanggal Check-out"
              />
            )}
            {!checkIn && (
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 truncate">{tanggalLabel}</span>
            )}
          </div>
        </div>

        {/* Tamu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50/80 hover:bg-zinc-100 border border-zinc-200/60 transition-colors text-left"
          >
            <Users className="w-5 h-5 text-[#9f3c16] shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tamu &amp; Kamar</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                {guests} Dewasa · 1 Kamar
              </span>
            </div>
          </button>
          {showGuestPicker && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 z-20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-800">Jumlah Tamu</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold"
                  >−</button>
                  <span className="w-6 text-center font-bold text-zinc-900">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold"
                  >+</button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuestPicker(false)}
                className="mt-3 w-full py-1.5 rounded-xl bg-[#9f3c16] text-white text-xs font-bold"
              >Selesai</button>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Cari Sekarang</span>
        </button>
      </form>

      {/* Quick Popular Tags */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100 flex-wrap text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Populer:</span>
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/homestay?q=${encodeURIComponent(tag)}`}
            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-[#ffdbcf] text-zinc-700 hover:text-[#9f3c16] border border-zinc-200/80 text-[11px] font-medium transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
