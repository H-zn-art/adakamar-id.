"use client";

import Link from "next/link";
import { MapPin, Users, Sparkles, ShieldCheck } from "lucide-react";

interface PropertyCardProps {
  id?: string;
  slug?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  name?: string;
  title?: string;
  capacity?: string;
  originalPrice?: number;
  price: number;
  badge?: string;
  badgeType?: "superhost" | "best-seller" | "eco" | "tag" | "instant";
  extraBadge?: string;
  footerTag?: string;
  discount?: number;
  category?: string;
  isSuperhost?: boolean;
  tags?: string[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function PropertyCard({
  slug = "#",
  image,
  imageUrl,
  imageAlt,
  location,
  reviewCount = 0,
  name,
  title,
  capacity = "2-4 Tamu",
  originalPrice,
  price,
  badge,
  badgeType = "tag",
  extraBadge,
  category,
  isSuperhost,
}: PropertyCardProps) {
  const displayImage =
    image ||
    imageUrl ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";
  const displayName = name || title || "Homestay Jogja";
  const displayAlt = imageAlt || displayName;
  const displayBadge = badge || (isSuperhost ? "Superhost" : category);

  return (
    <Link
      href={`/homestay/${slug}`}
      className="group flex flex-col no-underline text-inherit h-full"
    >
      {/* Card wrapper — flex-col + h-full ensures consistent height in a grid */}
      <div className="flex flex-col rounded-3xl bg-white border border-zinc-200/70 hover:border-[#9f3c16]/30 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden h-full">
        {/* Image Frame */}
        <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden shrink-0">
          <img
            src={displayImage}
            alt={displayAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Subtle bottom scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 flex-wrap">
            {displayBadge && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                  badgeType === "best-seller"
                    ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white border border-white/20"
                    : badgeType === "superhost"
                    ? "bg-zinc-950/80 text-amber-300 border border-white/20"
                    : badgeType === "eco"
                    ? "bg-emerald-800/90 text-white border border-white/20"
                    : "bg-zinc-950/75 text-white border border-white/15"
                }`}
              >
                {badgeType === "superhost" && (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                {badgeType === "eco" && (
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                )}
                {displayBadge}
              </span>
            )}
            {extraBadge && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#ffdbcf]/90 text-[#9f3c16] border border-[#9f3c16]/20 backdrop-blur-md shadow-2xs">
                {extraBadge}
              </span>
            )}
          </div>
        </div>

        {/* Card Details — flex-1 pushes the CTA to the bottom */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Main content grows to fill space */}
          <div className="flex-1">
            {/* Location row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#9f3c16]" />
                <span className="truncate">{location}</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-[#9f3c16] transition-colors line-clamp-2 leading-snug mb-1.5">
              {displayName}
            </h3>

            {/* Capacity */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>{capacity}</span>
            </div>

            {/* Review count — no stars, just count */}
            {reviewCount > 0 && (
              <p className="text-[11px] text-zinc-400 mt-1">
                {reviewCount} ulasan tamu
              </p>
            )}
          </div>

          {/* Pricing & CTA — always at bottom */}
          <div className="pt-3 border-t border-zinc-100 flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              {originalPrice && originalPrice > price && (
                <span className="text-[11px] text-zinc-400 line-through">
                  Rp {formatPrice(originalPrice)}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] text-zinc-500">Mulai</span>
                <span className="text-base font-bold text-zinc-900">
                  Rp {formatPrice(price)}
                </span>
                <span className="text-[11px] text-zinc-500">/mlm</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9f3c16]/8 text-[#9f3c16] text-xs font-bold group-hover:bg-[#9f3c16] group-hover:text-white transition-all duration-200">
              Detail →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
