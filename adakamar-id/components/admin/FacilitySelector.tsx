"use client";

import React, { useState, useMemo } from "react";
import { Search, Check, Plus, X, Sparkles } from "lucide-react";

export interface FacilityItem {
  id?: string;
  name: string;
  category?: string;
  icon?: string;
  description?: string;
}

export interface FacilitySelectorProps {
  /** Daftar fasilitas dari backend (opsional, ada fallback preset standar) */
  availableFacilities?: FacilityItem[];
  /** Nilai yang sedang dipilih */
  selectedValues: string[];
  /** Callback saat pilihan berubah */
  onChange: (values: string[]) => void;
  /** Tipe nilai yang disimpan: "name" (default) atau "id" */
  valueType?: "name" | "id";
  /** Judul label input */
  label?: string;
  /** Subtitle / panduan */
  description?: string;
  /** Placeholder input pencarian */
  placeholderSearch?: string;
  /** Ukuran tampilan: "compact" (untuk modal) atau "normal" (untuk halaman form) */
  size?: "compact" | "normal";
  /** Izinkan tambah fasilitas kustom secara mandiri */
  allowCustom?: boolean;
}

const DEFAULT_PRESET_FACILITIES: FacilityItem[] = [
  // Kamar Tidur
  { name: "AC di Setiap Kamar", category: "kamar", icon: "ac_unit" },
  { name: "Kasur King Size", category: "kamar", icon: "bed" },
  { name: "Kasur Twin Bed", category: "kamar", icon: "bed" },
  { name: "Smart TV", category: "kamar", icon: "tv" },
  { name: "Lemari Pakaian", category: "kamar", icon: "inventory_2" },
  { name: "Meja Kerja & Kursi", category: "kamar", icon: "desk" },
  { name: "Kipas Angin", category: "kamar", icon: "mode_fan" },
  { name: "Peralatan Sholat Lengkap", category: "kamar", icon: "mosque" },
  { name: "Balkon / Teras Pribadi", category: "kamar", icon: "balcony" },
  { name: "Cermin Rias", category: "kamar", icon: "face_retouching_natural" },

  // Kamar Mandi
  { name: "Kamar Mandi Dalam", category: "kamar_mandi", icon: "shower" },
  { name: "Water Heater / Air Panas", category: "kamar_mandi", icon: "hot_tub" },
  { name: "Kloset Duduk & Bidet", category: "kamar_mandi", icon: "wc" },
  { name: "Handuk & Perlengkapan Mandi", category: "kamar_mandi", icon: "check_circle" },
  { name: "Wastafel", category: "kamar_mandi", icon: "wash" },

  // Fasilitas Umum & Bersama
  { name: "Wi-Fi Kecepatan Tinggi (50+ Mbps)", category: "bersama", icon: "wifi" },
  { name: "Kolam Renang Privat", category: "bersama", icon: "pool" },
  { name: "Dapur Bersama & Alat Masak", category: "bersama", icon: "kitchen" },
  { name: "Kulkas Bersama", category: "bersama", icon: "kitchen" },
  { name: "Dispenser Air Minum", category: "bersama", icon: "local_drink" },
  { name: "Mesin Cuci", category: "bersama", icon: "local_laundry_service" },
  { name: "Sarapan Tradisional Pincuk", category: "bersama", icon: "restaurant" },
  { name: "Pendopo & Bale Santai", category: "bersama", icon: "deck" },

  // Parkir & Keamanan
  { name: "Area Parkir Mobil Luas", category: "parkir", icon: "local_parking" },
  { name: "Parkir Motor Aman", category: "parkir", icon: "two_wheeler" },
  { name: "CCTV & Keamanan 24 Jam", category: "parkir", icon: "security" },
  { name: "Akses 24 Jam", category: "parkir", icon: "lock_open" },
];

const CATEGORY_TABS = [
  { id: "all", label: "Semua" },
  { id: "kamar", label: "Kamar Tidur" },
  { id: "kamar_mandi", label: "Kamar Mandi" },
  { id: "bersama", label: "Umum & Bersama" },
  { id: "parkir", label: "Parkir & Keamanan" },
];

function detectCategory(name: string, rawCat?: string): "kamar" | "kamar_mandi" | "bersama" | "parkir" {
  const c = (rawCat || "").toLowerCase();
  const n = name.toLowerCase();

  if (
    c.includes("mandi") ||
    n.includes("mandi") ||
    n.includes("toilet") ||
    n.includes("kloset") ||
    n.includes("water heater") ||
    n.includes("air panas") ||
    n.includes("shower") ||
    n.includes("wastafel") ||
    n.includes("bathtub")
  ) {
    return "kamar_mandi";
  }
  if (
    c.includes("parkir") ||
    c.includes("akses") ||
    n.includes("parkir") ||
    n.includes("mobil") ||
    n.includes("motor") ||
    n.includes("cctv") ||
    n.includes("keamanan") ||
    n.includes("satpam") ||
    n.includes("security") ||
    n.includes("akses")
  ) {
    return "parkir";
  }
  if (
    c.includes("konektivitas") ||
    c.includes("rekreasi") ||
    c.includes("gastronomi") ||
    c.includes("heritage") ||
    n.includes("dapur") ||
    n.includes("kolam") ||
    n.includes("renang") ||
    n.includes("wifi") ||
    n.includes("wi-fi") ||
    n.includes("internet") ||
    n.includes("kulkas") ||
    n.includes("dispenser") ||
    n.includes("mesin cuci") ||
    n.includes("sarapan") ||
    n.includes("bale") ||
    n.includes("pendopo") ||
    n.includes("taman") ||
    n.includes("lounge") ||
    n.includes("santai") ||
    n.includes("bbq") ||
    n.includes("alat masak")
  ) {
    return "bersama";
  }
  return "kamar";
}

function getFallbackIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("ac")) return "ac_unit";
  if (n.includes("tv")) return "tv";
  if (n.includes("wifi") || n.includes("wi-fi") || n.includes("internet")) return "wifi";
  if (n.includes("kolam") || n.includes("renang") || n.includes("pool")) return "pool";
  if (n.includes("water heater") || n.includes("air panas")) return "hot_tub";
  if (n.includes("mandi") || n.includes("shower")) return "shower";
  if (n.includes("parkir")) return "local_parking";
  if (n.includes("dapur") || n.includes("masak") || n.includes("kulkas")) return "kitchen";
  if (n.includes("sarapan") || n.includes("makan")) return "restaurant";
  if (n.includes("mesin cuci") || n.includes("cuci")) return "local_laundry_service";
  if (n.includes("kasur") || n.includes("bed")) return "bed";
  if (n.includes("meja") || n.includes("kerja")) return "desk";
  if (n.includes("lemari")) return "inventory_2";
  if (n.includes("sholat") || n.includes("mushola") || n.includes("masjid")) return "mosque";
  if (n.includes("cermin") || n.includes("rias") || n.includes("mirror")) return "face_retouching_natural";
  if (n.includes("cctv") || n.includes("keamanan")) return "security";
  if (n.includes("bale") || n.includes("pendopo") || n.includes("santai")) return "deck";
  return "check_circle";
}

export default function FacilitySelector({
  availableFacilities,
  selectedValues = [],
  onChange,
  valueType = "name",
  label = "Fasilitas & Amenitas",
  description,
  placeholderSearch = "Cari fasilitas (mis: AC, WiFi, Water Heater)...",
  size = "normal",
  allowCustom = false,
}: FacilitySelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [customInput, setCustomInput] = useState("");

  // Ambil fasilitas dari master backend. Hanya gunakan preset jika master data kosong.
  const mergedFacilities = useMemo(() => {
    const list: FacilityItem[] = [];
    const seenNames = new Set<string>();

    if (Array.isArray(availableFacilities) && availableFacilities.length > 0) {
      availableFacilities.forEach((f) => {
        const trimmed = (f.name || "").trim();
        if (trimmed && !seenNames.has(trimmed.toLowerCase())) {
          seenNames.add(trimmed.toLowerCase());
          list.push({
            id: f.id,
            name: trimmed,
            category: detectCategory(trimmed, f.category),
            icon: f.icon || getFallbackIcon(trimmed),
            description: f.description,
          });
        }
      });
    } else {
      // Fallback hanya jika master fasilitas dari backend belum ada
      DEFAULT_PRESET_FACILITIES.forEach((def) => {
        if (!seenNames.has(def.name.toLowerCase())) {
          seenNames.add(def.name.toLowerCase());
          list.push(def);
        }
      });
    }

    // Masukkan juga selectedValues yang mungkin belum ada di list (agar pilihan sebelumnya tidak hilang)
    selectedValues.forEach((val) => {
      if (valueType === "name" && val && !seenNames.has(val.toLowerCase())) {
        seenNames.add(val.toLowerCase());
        list.unshift({
          name: val,
          category: detectCategory(val),
          icon: getFallbackIcon(val),
        });
      }
    });

    return list;
  }, [availableFacilities, selectedValues, valueType]);

  // Filter berdasarkan search dan kategori aktif
  const filteredFacilities = useMemo(() => {
    return mergedFacilities.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        activeCategory === "all" ||
        item.category === activeCategory;

      return matchSearch && matchCat;
    });
  }, [mergedFacilities, search, activeCategory]);

  // Hitung jumlah item per kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mergedFacilities.length };
    mergedFacilities.forEach((item) => {
      const cat = item.category || "kamar";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [mergedFacilities]);

  // Handle klik toggle fasilitas
  const handleToggle = (item: FacilityItem) => {
    const isChecked =
      (Boolean(item.id) && selectedValues.includes(item.id!)) ||
      selectedValues.includes(item.name);

    if (isChecked) {
      onChange(
        selectedValues.filter(
          (v) => (item.id ? v !== item.id : true) && v !== item.name
        )
      );
    } else {
      const identifier = valueType === "id" && item.id ? item.id : item.name;
      onChange([...selectedValues, identifier]);
    }
  };

  // Handle tambah fasilitas custom
  const handleAddCustom = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
    }
    setCustomInput("");
  };

  const isCompact = size === "compact";

  return (
    <div className="flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          {label && (
            <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9f3c16]" />
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedValues.length > 0 && (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9f3c16] text-white shadow-2xs">
                {selectedValues.length} dipilih
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-semibold text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Hapus semua pilihan"
              >
                × Bersihkan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mamikos Style Controls: Pencarian & Kategori Pills */}
      <div className="flex flex-col gap-2">
        {/* Input Pencarian */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholderSearch}
            className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#9f3c16] focus:bg-white transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700 text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Kategori Tabs Horizontal (Mamikos Style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#9f3c16] text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {cat.label}
                <span className={`ml-1 text-[10px] opacity-75 font-normal`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chip Cloud (Ringkas, Hemat Tempat / Ga Ngehabisin Frame) */}
      <div
        className={`flex flex-wrap gap-1.5 p-2 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 ${
          isCompact ? "max-h-48" : "max-h-60"
        } overflow-y-auto`}
      >
        {filteredFacilities.length > 0 ? (
          filteredFacilities.map((item) => {
            const identifier = valueType === "id" && item.id ? item.id : item.name;
            const isChecked =
              (Boolean(item.id) && selectedValues.includes(item.id!)) ||
              selectedValues.includes(item.name);

            return (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => handleToggle(item)}
                className={`group px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                  isChecked
                    ? "bg-[#ffdbcf]/60 border-[#9f3c16] text-[#9f3c16] font-bold shadow-2xs ring-1 ring-[#9f3c16]/30"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                }`}
              >
                {isChecked ? (
                  <Check className="w-3.5 h-3.5 text-[#9f3c16] shrink-0 stroke-[2.5]" />
                ) : (
                  <span
                    className="material-symbols-outlined text-zinc-400 group-hover:text-zinc-600 shrink-0"
                    style={{ fontSize: "14px" }}
                  >
                    {item.icon || "check_circle"}
                  </span>
                )}
                <span className="leading-none">{item.name}</span>
              </button>
            );
          })
        ) : (
          <div className="w-full py-4 text-center text-xs text-zinc-400">
            Tidak ada fasilitas yang cocok dengan &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* Custom Facility Input (Bila admin ingin mengetik fasilitas tambahan) */}
      {allowCustom && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom(e);
              }
            }}
            placeholder="+ Tambah fasilitas lainnya..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-dashed border-zinc-300 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#9f3c16] focus:border-solid transition"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah</span>
          </button>
        </div>
      )}

    </div>
  );
}
