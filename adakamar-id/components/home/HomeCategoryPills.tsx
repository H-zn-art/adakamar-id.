"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoriesApi } from "@/lib/api";
import {
  Sparkles,
  Home,
  Waves,
  Tag,
  Users,
  Compass,
  Trees,
  Camera,
  Heart,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { useHorizontalScroll } from "@/lib/useHorizontalScroll";

interface CategoryPill {
  id: string;
  slug: string;
  label: string;
  iconName: string;
}

const iconMap: Record<string, LucideIcon> = {
  semua: Sparkles,
  auto_awesome: Sparkles,
  joglo: Home,
  holiday_village: Home,
  cottage: Home,
  limasan: Home,
  pool: Waves,
  waves: Waves,
  villa: Waves,
  budget: Tag,
  sell: Tag,
  family: Users,
  groups: Users,
  rombongan: Users,
  malioboro: Compass,
  explore: Compass,
  dekat: Compass,
  kaliurang: Trees,
  forest: Trees,
  trees: Trees,
  alam: Trees,
  estetik: Camera,
  photo_camera: Camera,
  instagram: Camera,
  pet: Heart,
  pets: Heart,
};

function getCategoryIcon(nameOrKey: string): LucideIcon {
  const key = (nameOrKey || "").toLowerCase();
  for (const [k, Icon] of Object.entries(iconMap)) {
    if (key.includes(k)) return Icon;
  }
  return Home;
}

const SEMUA_PILL: CategoryPill = { id: "semua", slug: "semua", label: "Semua", iconName: "semua" };

function HomeCategoryPillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("kategori") || "semua";
  const [active, setActive] = useState(activeParam);
  const [pills, setPills] = useState<CategoryPill[] | null>(null); // null = loading

  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    hasMovedRef,
    scroll,
    checkScroll,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  } = useHorizontalScroll();

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const dynamicPills: CategoryPill[] = [
            SEMUA_PILL,
            ...data.map((cat) => ({
              id: cat.id,
              slug: cat.slug || cat.id,
              label: cat.name,
              iconName: cat.icon || cat.slug || "cottage",
            })),
          ];
          setPills(dynamicPills);
        } else {
          // Backend returned empty — use default pillls
          setPills(getDefaultPills());
        }
      })
      .catch(() => {
        setPills(getDefaultPills());
      });
  }, []);

  // Update scroll bounds whenever pills are populated
  useEffect(() => {
    if (pills && pills.length > 0) {
      const timer = setTimeout(checkScroll, 80);
      return () => clearTimeout(timer);
    }
  }, [pills, checkScroll]);

  const handleSelect = (slug: string) => {
    if (hasMovedRef.current) return;
    setActive(slug);
    const url = slug === "semua" ? "/" : `/?kategori=${slug}`;
    router.replace(url, { scroll: false });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("adakamar_category_filter", { detail: slug }));
    }
  };

  // Show loading skeleton while fetching
  if (pills === null) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border border-zinc-100 bg-zinc-100 text-transparent animate-pulse"
            style={{ minWidth: `${70 + i * 10}px` }}
          >
            &nbsp;
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex items-center w-full group">
      {/* Tombol Geser Kiri */}
      {canScrollLeft && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center pr-4 bg-gradient-to-r from-white via-white/95 to-transparent h-full">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Geser kategori ke kiri"
            className="w-7 h-7 rounded-full bg-white border border-zinc-200/90 shadow-md hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-700" />
          </button>
        </div>
      )}

      {/* Strip Kategori (Drag & Wheel Scrollable) */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className={`flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full ${
          canScrollLeft ? "pl-9" : ""
        } ${canScrollRight ? "pr-9" : ""}`}
      >
        {pills.map((pill) => {
          const isSelected = active === pill.slug || (pill.slug === "semua" && active === "semua");
          const Icon = getCategoryIcon(pill.iconName);

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleSelect(pill.slug)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white shadow-md font-bold scale-[1.02]"
                  : "bg-white text-zinc-700 border border-zinc-200/80 hover:border-[#9f3c16]/40 hover:bg-zinc-50 shadow-2xs"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-amber-200" : "text-[#9f3c16]"}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tombol Geser Kanan */}
      {canScrollRight && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center pl-4 bg-gradient-to-l from-white via-white/95 to-transparent h-full">
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Geser kategori ke kanan"
            className="w-7 h-7 rounded-full bg-white border border-zinc-200/90 shadow-md hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
          </button>
        </div>
      )}
    </div>
  );
}

function getDefaultPills(): CategoryPill[] {
  return [
    { id: "semua", slug: "semua", label: "Semua", iconName: "semua" },
    { id: "joglo", slug: "joglo-autentik-heritage", label: "Joglo Autentik", iconName: "joglo" },
    { id: "pool", slug: "villa-private-pool", label: "Private Pool", iconName: "pool" },
    { id: "budget", slug: "budget-friendly", label: "Budget Friendly", iconName: "budget" },
    { id: "family", slug: "family-rombongan", label: "Family & Rombongan", iconName: "family" },
    { id: "malioboro", slug: "dekat-malioboro", label: "Dekat Malioboro", iconName: "malioboro" },
    { id: "kaliurang", slug: "nuansa-alam-kaliurang", label: "Nuansa Alam Kaliurang", iconName: "kaliurang" },
    { id: "estetik", slug: "estetik-instagrammable", label: "Estetik Instagrammable", iconName: "estetik" },
    { id: "pet", slug: "pet-friendly", label: "Pet Friendly", iconName: "pet" },
  ];
}

export default function HomeCategoryPills() {
  return (
    <Suspense fallback={<div className="h-12 w-full max-w-5xl mx-auto animate-pulse bg-zinc-100 rounded-full" />}>
      <HomeCategoryPillsContent />
    </Suspense>
  );
}

