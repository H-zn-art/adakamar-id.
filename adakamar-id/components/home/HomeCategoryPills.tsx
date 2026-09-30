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
  LucideIcon,
} from "lucide-react";

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

  const handleSelect = (slug: string) => {
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
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
      {pills.map((pill) => {
        const isSelected = active === pill.slug || (pill.slug === "semua" && active === "semua");
        const Icon = getCategoryIcon(pill.iconName);

        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => handleSelect(pill.slug)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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

