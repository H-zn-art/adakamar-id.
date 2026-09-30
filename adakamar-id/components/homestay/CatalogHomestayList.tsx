"use client";

import { useState, useEffect } from "react";
import PropertyCard from "@/components/ui/PropertyCard";
import { propertiesApi } from "@/lib/api";

interface CatalogListProps {
  initialProperties: any[];
}

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
    imageAlt: p.name,
    name: p.name,
    location,
    rating: p.rating || 4.95,
    reviewCount: p.reviewCount || p.reviews || 12,
    capacity,
    price: p.price,
    originalPrice: p.originalPrice,
    badge:
      p.isFeatured || p.featured
        ? "Pilihan Kurator"
        : p.category?.name || p.type || "Homestay",
    badgeType: (p.isFeatured || p.featured
      ? "best-seller"
      : "superhost") as any,
    extraBadge:
      location.toLowerCase().includes("kraton") ||
      location.toLowerCase().includes("malioboro")
        ? "Dekat Malioboro"
        : undefined,
    footerTag:
      p.status === "ACTIVE" || p.status === "active"
        ? "Instan Book"
        : undefined,
  };
}

export default function CatalogHomestayList({ initialProperties }: CatalogListProps) {
  const [homestays, setHomestays] = useState<any[]>(initialProperties);

  const fetchHomestays = async () => {
    try {
      const res = await propertiesApi.list({ limit: 50 });
      if (res && Array.isArray(res.data)) {
        setHomestays(res.data.map(mapBackendProperty));
      } else {
        setHomestays(initialProperties);
      }
    } catch (err) {
      console.warn("Gagal memuat catalog properti, pakai data awal:", err);
      setHomestays(initialProperties);
    }
  };

  useEffect(() => {
    fetchHomestays();

    const handleUpdate = () => {
      fetchHomestays();
    };

    window.addEventListener("adakamar_homestays_updated", handleUpdate);
    return () =>
      window.removeEventListener("adakamar_homestays_updated", handleUpdate);
  }, [initialProperties]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(1, 1fr)",
        gap: "24px",
      }}
      className="listing-grid"
    >
      {homestays.map((p) => (
        <PropertyCard key={p.id || p.slug} {...p} />
      ))}
    </div>
  );
}
