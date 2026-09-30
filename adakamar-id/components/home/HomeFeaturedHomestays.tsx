"use client";

import { useState, useEffect } from "react";
import PropertyCard from "@/components/ui/PropertyCard";
import { propertiesApi } from "@/lib/api";

function mapBackendProperty(p: any) {
  const image =
    p.images?.[0]?.imageUrl ||
    p.image ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800";
  const location = p.locationArea?.name || p.area || p.address || "Yogyakarta";
  const capacity =
    typeof p.capacity === "number"
      ? `${p.capacity} Tamu · ${p.bedroomCount || 2} Kamar Tidur`
      : p.capacity || "4 Tamu · 2 Kamar Tidur";

  return {
    id: p.id,
    slug: p.slug,
    image,
    name: p.name,
    location,
    rating: p.rating ?? 4.9,
    reviewCount: p.reviewCount ?? p.reviews ?? 0,
    capacity,
    price: p.price,
    originalPrice: p.originalPrice,
    badge: p.isFeatured || p.featured ? "Pilihan Kurator" : (p.category?.name || p.type || "Homestay"),
    badgeType: (p.isFeatured || p.featured ? "best-seller" : "superhost") as "best-seller" | "superhost",
    extraBadge: location.toLowerCase().includes("kraton") || location.toLowerCase().includes("malioboro") ? "Dekat Malioboro" : undefined,
    footerTag: p.status === "ACTIVE" || p.status === "active" ? "Instan Book" : undefined,
  };
}

export default function HomeFeaturedHomestays() {
  const [homestays, setHomestays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("semua");

  const fetchHomestays = async (categorySlug?: string) => {
    setLoading(true);
    try {
      const cat = categorySlug && categorySlug !== "semua" ? categorySlug : undefined;
      const res = await propertiesApi.list({ category: cat, limit: 12 });
      if (res && Array.isArray(res.data)) {
        setHomestays(res.data.map(mapBackendProperty));
      } else {
        setHomestays([]);
      }
    } catch (err) {
      console.warn("Gagal memuat properti unggulan:", err);
      setHomestays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("kategori") || "semua";
      setActiveCategory(cat);
      fetchHomestays(cat);
    } else {
      fetchHomestays();
    }

    const handleUpdate = () => {
      fetchHomestays(activeCategory);
    };

    const handleCategoryFilter = (e: any) => {
      const cat = e.detail || "semua";
      setActiveCategory(cat);
      fetchHomestays(cat);
    };

    window.addEventListener("adakamar_homestays_updated", handleUpdate);
    window.addEventListener("adakamar_category_filter", handleCategoryFilter);
    return () => {
      window.removeEventListener("adakamar_homestays_updated", handleUpdate);
      window.removeEventListener("adakamar_category_filter", handleCategoryFilter);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-zinc-200/70" />
        ))}
      </div>
    );
  }

  if (homestays.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-zinc-200/80 p-8">
        <p className="text-sm font-semibold text-zinc-800">
          Belum ada homestay di kategori ini
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Silakan pilih kategori lain atau jelajahi seluruh koleksi penginapan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {homestays.map((h) => (
        <PropertyCard
          key={h.id}
          id={h.id}
          slug={h.slug}
          image={h.image}
          name={h.name}
          location={h.location}
          rating={h.rating}
          reviewCount={h.reviewCount}
          capacity={h.capacity}
          price={h.price}
          originalPrice={h.originalPrice}
          badge={h.badge}
          badgeType={h.badgeType}
          extraBadge={h.extraBadge}
          footerTag={h.footerTag}
        />
      ))}
    </div>
  );
}
