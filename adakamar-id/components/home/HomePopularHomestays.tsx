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
    badge: p.isPopular || p.isFeatured ? "Terfavorit" : (p.category?.name || "Homestay"),
    badgeType: (p.isPopular ? "superhost" : "best-seller") as "superhost" | "best-seller",
    extraBadge: location.toLowerCase().includes("kraton") || location.toLowerCase().includes("malioboro") ? "Dekat Malioboro" : undefined,
    footerTag: p.status === "ACTIVE" || p.status === "active" ? "Terverifikasi" : undefined,
  };
}

export default function HomePopularHomestays() {
  const [properties, setProperties] = useState<any[]>([]);

  const fetchProperties = async () => {
    try {
      const res = await propertiesApi.list({ limit: 8 });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setProperties(res.data.map(mapBackendProperty));
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.warn("Gagal memuat properti populer:", err);
      setProperties([]);
    }
  };

  useEffect(() => {
    fetchProperties();

    const handleUpdate = () => {
      fetchProperties();
    };

    window.addEventListener("adakamar_homestays_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_homestays_updated", handleUpdate);
  }, []);

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.slice(0, 4).map((p) => (
        <PropertyCard key={p.id} {...p} />
      ))}
    </div>
  );
}
