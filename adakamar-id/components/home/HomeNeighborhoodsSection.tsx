"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { locationsApi } from "@/lib/api";
import {
  MapPin,
  Compass,
  Coffee,
  Mountain,
  Trees,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface NeighborhoodItem {
  id: string;
  slug: string;
  label: string;
  image: string;
  desc: string;
}

const defaultNeighborhoods: NeighborhoodItem[] = [
  {
    id: "malioboro",
    slug: "malioboro",
    label: "Malioboro & Keraton",
    image:
      "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
    desc: "Pusat budaya & penginapan legendaris",
  },
  {
    id: "prawirotaman",
    slug: "prawirotaman",
    label: "Prawirotaman",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    desc: "Seni batik, galeri & kafe atmosferik",
  },
  {
    id: "kaliurang-merapi",
    slug: "kaliurang",
    label: "Kaliurang & Merapi",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    desc: "Udara sejuk lereng Gunung Merapi",
  },
  {
    id: "kotagede",
    slug: "kotagede",
    label: "Kotagede",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
    desc: "Istana perak, makam raja & rumah kalang",
  },
  {
    id: "cangkringan",
    slug: "cangkringan",
    label: "The Cangkringan",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    desc: "Resort asri di kaki Gunung Merapi",
  },
  {
    id: "bantul-kasongan",
    slug: "bantul",
    label: "Bantul & Kasongan",
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    desc: "Seni gerabah, tradisi & wisata Tembi",
  },
];

export default function HomeNeighborhoodsSection() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>(defaultNeighborhoods);

  useEffect(() => {
    locationsApi.list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: NeighborhoodItem[] = data.map((loc, idx) => ({
            id: loc.id,
            slug: loc.slug || loc.id,
            label: loc.name,
            image: loc.imageUrl || defaultNeighborhoods[idx % defaultNeighborhoods.length]?.image,
            desc: loc.description || loc.district || "Kawasan istimewa di Yogyakarta",
          }));
          setNeighborhoods(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback neighborhoods:", err);
      });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {neighborhoods.map((item) => (
        <Link
          key={item.id}
          href={`/homestay?lokasi=${item.slug}`}
          className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/10 shadow-lg flex flex-col justify-end p-3 transition-all duration-300 hover:border-amber-400/40 hover:shadow-2xl hover:-translate-y-1.5"
        >
          {/* Background Image */}
          <img
            src={item.image}
            alt={item.label}
            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 ease-out"
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent pointer-events-none" />

          {/* Card Content in Frosted Glass Capsule */}
          <div className="relative z-10 p-3 rounded-2xl bg-zinc-950/70 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-300">
                <MapPin className="w-3 h-3" />
                Jogja
              </span>
              <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-amber-400 text-white group-hover:text-zinc-950 flex items-center justify-center transition-all">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-amber-200 transition-colors line-clamp-1">
              {item.label}
            </h3>

            <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5 opacity-80">
              {item.desc}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
