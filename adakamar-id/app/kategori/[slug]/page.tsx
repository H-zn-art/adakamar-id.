"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/ui/PropertyCard";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { categoriesApi, propertiesApi } from "@/lib/api";
import {
  Home,
  Waves,
  Tag,
  Users,
  Compass,
  Trees,
  Camera,
  Heart,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronRight,
  Grid3X3,
} from "lucide-react";

// ── Icon map ────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  semua: Sparkles,
  joglo: Home,
  limasan: Home,
  cottage: Home,
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

function getCategoryIcon(iconKey?: string, name?: string): React.ElementType {
  const key = ((iconKey || name) || "").toLowerCase();
  for (const [k, Icon] of Object.entries(iconMap)) {
    if (key.includes(k)) return Icon;
  }
  return Home;
}

// ── Sort properties ─────────────────────────────────────────────────
function sortProps(items: any[], sort: string) {
  const copy = [...items];
  if (sort === "lowest") return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === "highest") return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (sort === "rating") return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return copy; // popular = default
}

// ── Component ───────────────────────────────────────────────────────
export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [priceSort, setPriceSort] = useState("popular");

  // Category detail
  const [category, setCategory] = useState<any | null>(null);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  // All categories for sidebar/pills
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Properties for this category
  const [properties, setProperties] = useState<any[]>([]);
  const [propLoading, setPropLoading] = useState(true);

  useEffect(() => {
    // Load category info
    setCatLoading(true);
    setCatError(null);

    const isAll = slug === "semua" || slug === "all";

    if (isAll) {
      setCategory({
        id: "semua",
        name: "Semua Kategori",
        slug: "semua",
        description:
          "Jelajahi seluruh koleksi homestay, villa, dan penginapan autentik terkurasi di berbagai kawasan Yogyakarta.",
        icon: "Sparkles",
      });
      setCatLoading(false);

      setPropLoading(true);
      propertiesApi
        .list({ limit: 50 })
        .then((res) => {
          setProperties(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setProperties([]))
        .finally(() => setPropLoading(false));
    } else {
      categoriesApi
        .getBySlug(slug)
        .then((data) => {
          setCategory(data);
          setCatLoading(false);

          // Load properties that belong to this category
          setPropLoading(true);
          propertiesApi
            .list({ categoryId: data.id, limit: 50 })
            .then((res) => {
              setProperties(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setProperties([]))
            .finally(() => setPropLoading(false));
        })
        .catch((err: any) => {
          setCatError(err.message || "Kategori tidak ditemukan");
          setCatLoading(false);
          setPropLoading(false);
        });
    }

    // Load all categories for sidebar pills
    categoriesApi
      .list()
      .then((data) => setAllCategories(Array.isArray(data) ? data : []))
      .catch(() => setAllCategories([]));
  }, [slug]);

  const sortedProps = sortProps(properties, priceSort);
  const Icon = getCategoryIcon(category?.icon, category?.name);

  // ── Cover image from first property image
  const coverImage =
    category?.coverImage ||
    properties[0]?.images?.[0]?.imageUrl ||
    properties[0]?.images?.[0]?.url ||
    properties[0]?.image ||
    null;

  // ── Derived stats from real data
  const avgPrice =
    properties.length > 0
      ? Math.round(properties.reduce((s, p) => s + (p.price ?? 0), 0) / properties.length)
      : null;

  const lowestPrice =
    properties.length > 0
      ? Math.min(...properties.map((p) => p.price ?? 0).filter((p) => p > 0))
      : null;

  // Real ratings derived strictly from properties with actual user reviews
  const propertiesWithReviews = properties.filter(
    (p) => (p.reviewCount ?? 0) > 0 && typeof p.rating === "number" && p.rating > 0
  );
  const totalReviews = propertiesWithReviews.reduce(
    (s, p) => s + (p.reviewCount ?? 0),
    0
  );
  const avgRating =
    totalReviews > 0
      ? (
          propertiesWithReviews.reduce(
            (s, p) => s + p.rating * (p.reviewCount ?? 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : null;

  const featuredCount = properties.filter((p) => p.isFeatured || p.featured).length;

  const uniqueLocations = Array.from(
    new Set(
      properties
        .map((p) => p.locationArea?.name || p.locationArea?.district || p.location?.name)
        .filter(Boolean)
    )
  );

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-20 flex-1">
        {/* Breadcrumbs */}
        <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40" />
            <Link href="/kategori/semua" className="hover:text-primary transition-colors">
              Kategori
            </Link>
            {category && slug !== "semua" && slug !== "all" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40" />
                <span className="text-on-surface font-semibold">{category.name}</span>
              </>
            )}
            {(slug === "semua" || slug === "all") && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40" />
                <span className="text-on-surface font-semibold">Semua Kategori</span>
              </>
            )}
          </nav>
        </section>

        {/* ── Loading State */}
        {catLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* ── Error State */}
        {!catLoading && catError && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-medium text-rose-600">{catError}</p>
            <Link href="/" className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* ── Category Content */}
        {!catLoading && !catError && category && (
          <>
            {/* Category Banner Header */}
            <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 mb-8">
              <div className="relative overflow-hidden rounded-3xl bg-surface-container-low shadow-sm border border-surface-variant/40">
                {/* Ambient Background Image */}
                {coverImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-multiply"
                    style={{ backgroundImage: `url('${coverImage}')` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/95 to-transparent" />

                <div className="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col gap-6 max-w-3xl">
                  {/* Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-soft text-primary text-xs font-semibold uppercase tracking-wider shadow-sm">
                      <Icon className="w-3.5 h-3.5" />
                      {slug === "semua" || slug === "all" ? "Kurasi Autentik Yogyakarta" : `Kategori: ${category.name}`}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-medium">
                      <Grid3X3 className="w-3 h-3 text-emerald-500" />
                      {uniqueLocations.length > 0 ? `${uniqueLocations.length} Kawasan di Jogja` : `${properties.length} Unit Aktif`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-tight">
                      {category.name}
                    </h1>
                    {category.description && (
                      <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Stats from real data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3 rounded-xl shadow-sm flex flex-col">
                      <span className="text-xl text-primary font-bold">
                        {propLoading ? "..." : `${properties.length}`}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">Penginapan Tersedia</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3 rounded-xl shadow-sm flex flex-col">
                      <span className="text-xl text-on-surface font-bold">
                        {avgRating ? `${avgRating} ★` : properties.length > 0 ? "Baru" : "—"}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {avgRating ? `${totalReviews} Ulasan Tamu` : properties.length > 0 ? "Belum Ada Ulasan" : "Rating Rata-rata"}
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3 rounded-xl shadow-sm flex flex-col">
                      <span className="text-xl text-on-surface font-bold">
                        {lowestPrice ? `Rp ${Math.round(lowestPrice / 1000)}rb` : (avgPrice ? `Rp ${Math.round(avgPrice / 1000)}rb` : "—")}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {lowestPrice ? "Harga Mulai" : "Harga Rata-rata"}
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3 rounded-xl shadow-sm flex flex-col">
                      <span className="text-xl text-emerald-600 font-bold">
                        {featuredCount > 0 ? `${featuredCount} Unit` : (uniqueLocations.length > 0 ? `${uniqueLocations.length} Area` : "—")}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {featuredCount > 0 ? "Pilihan Kurator" : (uniqueLocations.length > 0 ? "Kawasan Tersebar" : "Koleksi Khusus")}
                      </span>
                    </div>
                  </div>

                  {/* Category pills — other categories */}
                  {allCategories.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <Link
                        href="/kategori/semua"
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                          slug === "semua" || slug === "all"
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm"
                        }`}
                      >
                        Semua
                      </Link>
                      {allCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/kategori/${cat.slug}`}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                            cat.slug === slug
                              ? "bg-primary text-on-primary shadow-sm"
                              : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm"
                          }`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Results Grid */}
            <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 mb-16">
              <div className="flex items-center justify-between pb-6 border-b border-surface-variant/40 mb-6">
                <span className="text-xs text-on-surface-variant">
                  {propLoading
                    ? "Memuat..."
                    : `Menampilkan `}
                  {!propLoading && <strong>{sortedProps.length}</strong>}
                  {!propLoading && " homestay pilihan"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">Urutkan:</span>
                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface focus:outline-none"
                  >
                    <option value="popular">Paling Populer</option>
                    <option value="lowest">Harga Terendah</option>
                    <option value="highest">Harga Tertinggi</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>

              {propLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                </div>
              ) : sortedProps.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
                    <Icon className="w-8 h-8 text-on-surface-variant/40" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">
                      Belum ada penginapan di kategori ini
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Kategori <strong>{category.name}</strong> belum memiliki penginapan yang terdaftar.
                    </p>
                    <Link
                      href="/homestay"
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Jelajahi Semua Penginapan
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProps.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      id={prop.id}
                      slug={prop.slug}
                      title={prop.name}
                      name={prop.name}
                      location={prop.locationArea?.name || prop.address || prop.location?.name || "Yogyakarta"}
                      price={prop.price}
                      originalPrice={prop.originalPrice}
                      rating={prop.rating ?? 4.9}
                      reviewCount={prop.reviewCount ?? 0}
                      imageUrl={prop.images?.[0]?.imageUrl || prop.images?.[0]?.url || prop.imageUrl || prop.image}
                      image={prop.images?.[0]?.imageUrl || prop.images?.[0]?.url || prop.imageUrl || prop.image}
                      category={prop.category?.name || category.name}
                      badge={prop.isFeatured ? "Pilihan Kurator" : (prop.category?.name || category.name)}
                      badgeType={prop.isFeatured ? "best-seller" : "superhost"}
                      capacity={
                        typeof prop.capacity === "number"
                          ? `${prop.capacity} Tamu · ${prop.bedroomCount || 2} Kamar Tidur`
                          : (prop.capacity || "4 Tamu · 2 Kamar Tidur")
                      }
                      tags={
                        Array.isArray(prop.facilities)
                          ? prop.facilities.slice(0, 3).map((f: any) => f.name || f)
                          : []
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
