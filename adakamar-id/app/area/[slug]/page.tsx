"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/ui/PropertyCard";
import Link from "next/link";
import { useState } from "react";

const areaData: Record<
  string,
  {
    name: string;
    subDistrict: string;
    weather: string;
    temp: string;
    travelTime: string;
    availableCount: number;
    description: string;
    subAreas: string[];
    landmarks: Array<{ name: string; distance: string; type: string }>;
    properties: Array<{
      id: string;
      slug: string;
      title: string;
      location: string;
      price: number;
      originalPrice?: number;
      rating: number;
      reviewCount: number;
      imageUrl: string;
      tags: string[];
      category: string;
      isSuperhost?: boolean;
    }>;
  }
> = {
  "sleman-kaliurang": {
    name: "Sleman & Kaliurang",
    subDistrict: "Jogja Utara",
    weather: "Cerah Berawan • Normal Level II",
    temp: "18–24°C",
    travelTime: "30 Mnt dari Tugu",
    availableCount: 42,
    description:
      "Temukan peristirahatan tenang di lereng Gunung Merapi dengan udara sejuk, kebun pinus rimbun, dan sentuhan arsitektur Joglo kayu jati modern. Sempurna untuk self-healing, liburan keluarga besar, atau workation damai.",
    subAreas: [
      "Semua Sleman",
      "Kaliurang Atas (14)",
      "Pakem & Turi (12)",
      "Palagan & Jakal (11)",
      "Cangkringan (5)",
    ],
    landmarks: [
      { name: "Museum Ullen Sentalu", distance: "5 menit", type: "Museum Budaya" },
      { name: "Lava Tour Merapi", distance: "10 menit", type: "Petualangan Jeep" },
      { name: "Warung Kopi Klothok Pakem", distance: "12 menit", type: "Kuliner Legendaris" },
    ],
    properties: [
      {
        id: "1",
        slug: "merapi-heights-eco-boutique",
        title: "Merapi Heights Eco-Boutique Villa",
        location: "Kaliurang Atas, Sleman, DIY",
        price: 890000,
        originalPrice: 1100000,
        rating: 4.97,
        reviewCount: 92,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAoIMN1x2JVjEdSrM63q9IElL5fzRgkqQV7xIAxPRqyniBRYv2c7gSxfSUqaqFrBngbOsKBdN71rx-5PJ9lrbUGgmtsH05ey9vOFXzb2kvz2ThQUw_tVZwokVhb1UZjqo8vsKZrx0yMqtABJwttFGsAzNhZy6FePWCouHZim2-WjpAoo1Tl-OhP1FpOLJ-GAoB6IPbswq7cjaEMoA3u86jpgd9VjYi13HPEpmUA6e15J0pqgd2tc5Dl",
        tags: ["View Merapi", "Hawa Sejuk", "Perapian"],
        category: "Eco Boutique",
        isSuperhost: true,
      },
      {
        id: "2",
        slug: "omah-joglo-lawas-prawirotaman",
        title: "Omah Joglo Kaliurang Asri",
        location: "Pakem, Sleman, DIY",
        price: 590000,
        rating: 4.93,
        reviewCount: 76,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCAAyoDwqvuAvvy-BmzL4Af6HTGHrWY926UpCSGjGuDdSzI6m4j1YGmV6uzz1554ph7YSr3G58zojMWQPLP2NnOrpCuH5b4S3gz7TPlpo4eVXxwtPCONZHfirD9rQyOdd2WJI2ojt_DZhEdyvTdCPAEIjA0tWHYziP5VMJQz0rj-TrR7-pmHZCyEeFT0mR8joR_1aSNKJlQsELdoQeupZg1ei3RmclWWS-Gzy8_Ezafk67_DqoyTF1I",
        tags: ["Joglo Klasik", "Taman Luas", "Bebas Polusi"],
        category: "Heritage Joglo",
      },
    ],
  },
};

export default function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [activeSubArea, setActiveSubArea] = useState("Semua Sleman");
  const data = areaData["sleman-kaliurang"];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-20 flex-1">
        {/* Breadcrumb + Status Strip */}
        <section className="w-full bg-surface-container-low/70 border-b border-surface-variant/30 py-3 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
            <nav className="flex items-center gap-1.5">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  home
                </span>
                <span>Beranda</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <Link href="/homestay" className="hover:text-primary">
                Destinasi DIY
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">{data.name}</span>
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
                <span className="w-2 h-2 rounded-full bg-success-forest animate-pulse"></span>
                <span>{data.weather}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Area Hero Banner */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-10">
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-low shadow-sm border border-surface-variant/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 relative">
              {/* Left Editorial */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs uppercase px-3 py-1 rounded-full font-semibold">
                      {data.subDistrict}
                    </span>
                    <span className="bg-surface-container-high text-on-surface text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-success-forest">
                        park
                      </span>
                      Hawa Sejuk & View Gunung Merapi
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-tight">
                    Homestay & Villa Asri di{" "}
                    <span className="text-primary">{data.name}</span>
                  </h1>

                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    {data.description}
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
                    <span className="text-xl text-primary font-bold">
                      {data.availableCount}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      Homestay Siap Huni
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
                    <span className="text-xl text-on-surface font-bold">
                      {data.temp}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      Suhu Pegunungan
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
                    <span className="text-xl text-on-surface font-bold">
                      {data.travelTime}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      Akses Kendaraan
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
                    <span className="text-xl text-primary font-bold">100%</span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      Kurasi Fisik
                    </span>
                  </div>
                </div>

                {/* Sub Area Tabs */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                    Sub-Kawasan Sleman:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {data.subAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setActiveSubArea(area)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          activeSubArea === area
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Mini Map Preview & Landmark Points */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-surface-container shadow-sm group">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoIMN1x2JVjEdSrM63q9IElL5fzRgkqQV7xIAxPRqyniBRYv2c7gSxfSUqaqFrBngbOsKBdN71rx-5PJ9lrbUGgmtsH05ey9vOFXzb2kvz2ThQUw_tVZwokVhb1UZjqo8vsKZrx0yMqtABJwttFGsAzNhZy6FePWCouHZim2-WjpAoo1Tl-OhP1FpOLJ-GAoB6IPbswq7cjaEMoA3u86jpgd9VjYi13HPEpmUA6e15J0pqgd2tc5Dl"
                    alt="Kaliurang Sleman"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold">
                      Kawasan Lereng Merapi
                    </span>
                    <h4 className="text-base font-bold mt-1">
                      Kawasan Wisata Kaliurang & Sekitarnya
                    </h4>
                  </div>
                </div>

                {/* Landmarks Card */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Destinasi Terdekat yang Wajib Dikunjungi:
                  </span>
                  <div className="space-y-2">
                    {data.landmarks.map((lm, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 border-b border-surface-variant/30 last:border-b-0"
                      >
                        <span className="font-semibold text-on-surface">
                          {lm.name}
                        </span>
                        <span className="text-primary font-medium">
                          {lm.distance} ({lm.type})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Grid */}
        <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 mb-16">
          <h2 className="text-2xl font-bold text-on-surface mb-6">
            Rekomendasi Homestay di {data.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                id={prop.id}
                slug={prop.slug}
                title={prop.title}
                location={prop.location}
                price={prop.price}
                originalPrice={prop.originalPrice}
                rating={prop.rating}
                reviewCount={prop.reviewCount}
                imageUrl={prop.imageUrl}
                category={prop.category}
                isSuperhost={prop.isSuperhost}
                tags={prop.tags}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
