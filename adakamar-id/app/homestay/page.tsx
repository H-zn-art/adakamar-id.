"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/ui/PropertyCard";
import {
  propertiesApi,
  categoriesApi,
  locationsApi,
  facilitiesApi,
} from "@/lib/api";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Grid,
  Users,
  Home,
  Waves,
  X,
  Loader2,
  ArrowRight,
  Filter,
} from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID").format(price);
}

function HomestayCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const initialCategory = searchParams.get("kategori") || "";
  const initialLocation = searchParams.get("lokasi") || "";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const promoParam = searchParams.get("promo") || "";
  const activePromo = promoParam.trim().toUpperCase();

  // Data states
  const [properties, setProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter options from backend
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  // Filter states
  const [search, setSearch] = useState<string>(initialSearch);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("rekomendasi");
  const [page, setPage] = useState<number>(1);

  // Load filter options on mount
  useEffect(() => {
    categoriesApi
      .list()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));

    locationsApi
      .list()
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));

    facilitiesApi
      .list()
      .then((data) => setFacilities(Array.isArray(data) ? data : []))
      .catch(() => setFacilities([]));
  }, []);

  // Fetch properties from backend based on filters
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.list({
        search: search || undefined,
        category: selectedCategory || undefined,
        location: selectedLocation || undefined,
        facilityId: selectedFacility || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        capacity: capacity || undefined,
        sortBy: sortBy || undefined,
        page,
        limit: 12,
      });

      if (res && Array.isArray(res.data)) {
        setProperties(res.data);
        setTotalCount(res.meta?.total ?? res.data.length);
        setTotalPages(res.meta?.totalPages ?? 1);
      } else {
        setProperties([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Gagal memuat properti:", err);
      setProperties([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedCategory,
    selectedLocation,
    selectedFacility,
    minPrice,
    maxPrice,
    capacity,
    sortBy,
    page,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle live updates from admin mutations
  useEffect(() => {
    const handleUpdate = () => fetchProperties();
    window.addEventListener("adakamar_homestays_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_homestays_updated", handleUpdate);
  }, [fetchProperties]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedFacility("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCapacity(undefined);
    setSortBy("rekomendasi");
    setPage(1);
    router.replace("/homestay");
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    search ||
      selectedCategory ||
      selectedLocation ||
      selectedFacility ||
      minPrice ||
      maxPrice ||
      capacity
  );

  const getActiveCategoryName = () => {
    const found = categories.find(
      (c) => c.slug === selectedCategory || c.id === selectedCategory
    );
    return found?.name || selectedCategory;
  };

  const getActiveLocationName = () => {
    const found = locations.find(
      (l) => l.slug === selectedLocation || l.id === selectedLocation
    );
    return found?.name || selectedLocation;
  };

  const getActiveFacilityName = () => {
    const found = facilities.find((f) => f.id === selectedFacility);
    return found?.name || selectedFacility;
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 min-h-screen bg-[#fbf8ff]">
        {/* ── Breadcrumb ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-zinc-500"
          >
            <Link href="/" className="hover:text-[#9f3c16] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-600">Yogyakarta</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 font-semibold">Semua Homestay</span>
          </nav>
        </div>

        {/* ── Active Promo Banner if any ── */}
        {activePromo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-1">
            <div className="bg-gradient-to-r from-[#9f3c16] to-[#c84e20] rounded-2xl p-4 text-white flex items-center justify-between shadow-sm border border-[#ffdbcf]/30">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white/90">Kupon Promo Terpasang:</span>
                    <span className="font-mono font-bold bg-white text-[#9f3c16] px-2 py-0.5 rounded-md text-xs tracking-wider shadow-xs">
                      {activePromo}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/85 mt-0.5">
                    Kupon ini akan otomatis diterapkan pada ringkasan pemesanan saat Anda memilih penginapan dan melakukan reservasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.delete("promo");
                  const qs = nextParams.toString();
                  router.replace(`/homestay${qs ? `?${qs}` : ""}`);
                }}
                title="Hapus promo aktif"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                Homestay & Villa di Yogyakarta
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-xs font-bold">
                {loading ? "Memuat..." : `${totalCount} properti ditemukan`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
              Dari pendopo joglo bersejarah di Kraton hingga retreat tenang dengan pemandangan sawah di Tembi & Kaliurang.
            </p>
          </div>
        </div>

        {/* ── Active Filters Bar ── */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-zinc-500 font-medium">Filter Aktif:</span>

              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200 text-zinc-800 font-medium">
                  Cari: &ldquo;{search}&rdquo;
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] font-medium">
                  Kategori: {getActiveCategoryName()}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedLocation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-medium">
                  Kawasan: {getActiveLocationName()}
                  <button
                    onClick={() => setSelectedLocation("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedFacility && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-medium">
                  Fasilitas: {getActiveFacilityName()}
                  <button
                    onClick={() => setSelectedFacility("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {capacity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-medium">
                  Kapasitas: {capacity}+ Tamu
                  <button
                    onClick={() => setCapacity(undefined)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-medium">
                  Harga: {minPrice ? `Rp ${formatPrice(minPrice)}` : "0"} -{" "}
                  {maxPrice ? `Rp ${formatPrice(maxPrice)}` : "Max"}
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                    }}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#9f3c16] hover:underline cursor-pointer ml-1"
              >
                Reset Semua
              </button>
            </div>
          </div>
        )}

        {/* ── Search & Filter Toolbar ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput);
                setPage(1);
              }}
              className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
            >
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama penginapan, alamat, atau fasilitas..."
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
              >
                Cari
              </button>
            </form>

            {/* Quick Toolbar items */}
            <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span>Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[#9f3c16] cursor-pointer"
                >
                  <option value="rekomendasi">Rekomendasi Terbaik</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="terbaru">Terbaru</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout: Sidebar + Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ── Filter Sidebar ── */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                    <Filter className="w-4 h-4 text-[#9f3c16]" />
                    <span>Filter Pencarian</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#9f3c16] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Filter: Kawasan di Jogja */}
                <div className="mb-6">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Kawasan di Jogja
                  </span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer">
                      <input
                        type="radio"
                        name="kawasan"
                        checked={!selectedLocation}
                        onChange={() => {
                          setSelectedLocation("");
                          setPage(1);
                        }}
                        className="accent-[#9f3c16] w-4 h-4"
                      />
                      <span>Semua Kawasan</span>
                    </label>
                    {locations.map((loc) => {
                      const isChecked =
                        selectedLocation === loc.slug || selectedLocation === loc.id;
                      return (
                        <label
                          key={loc.id}
                          className="flex items-center justify-between text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="kawasan"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedLocation(loc.slug || loc.id);
                                setPage(1);
                              }}
                              className="accent-[#9f3c16] w-4 h-4"
                            />
                            <span>{loc.name}</span>
                          </div>
                          {loc.district && (
                            <span className="text-[10px] text-zinc-400">
                              {loc.district}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filter: Tipe / Kategori Akomodasi */}
                <div className="mb-6">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Tipe Kategori
                  </span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer">
                      <input
                        type="radio"
                        name="kategori"
                        checked={!selectedCategory}
                        onChange={() => {
                          setSelectedCategory("");
                          setPage(1);
                        }}
                        className="accent-[#9f3c16] w-4 h-4"
                      />
                      <span>Semua Kategori</span>
                    </label>
                    {categories.map((cat) => {
                      const isChecked =
                        selectedCategory === cat.slug || selectedCategory === cat.id;
                      return (
                        <label
                          key={cat.id}
                          className="flex items-center justify-between text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="kategori"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedCategory(cat.slug || cat.id);
                                setPage(1);
                              }}
                              className="accent-[#9f3c16] w-4 h-4"
                            />
                            <span>{cat.name}</span>
                          </div>
                          {cat._count?.properties !== undefined && (
                            <span className="text-[10px] text-zinc-400">
                              ({cat._count.properties})
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filter: Kapasitas Tamu */}
                <div className="mb-6">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Kapasitas Tamu
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Semua", val: undefined },
                      { label: "1+", val: 1 },
                      { label: "2+", val: 2 },
                      { label: "4+", val: 4 },
                      { label: "6+", val: 6 },
                      { label: "8+", val: 8 },
                    ].map((cap) => {
                      const isSelected = capacity === cap.val;
                      return (
                        <button
                          key={cap.label}
                          type="button"
                          onClick={() => {
                            setCapacity(cap.val);
                            setPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-[#9f3c16] text-white border-[#9f3c16]"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                          }`}
                        >
                          {cap.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter: Rentang Harga */}
                <div className="mb-6">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Rentang Harga (Rp)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-medium">Min</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          setMinPrice(val);
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#9f3c16]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-medium">Max</span>
                      <input
                        type="number"
                        placeholder="Tak terbatas"
                        value={maxPrice ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          setMaxPrice(val);
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#9f3c16]"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter: Fasilitas Utama */}
                {facilities.length > 0 && (
                  <div className="mb-4">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                      Fasilitas Pilihan
                    </span>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                      <label className="flex items-center gap-2.5 text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer">
                        <input
                          type="radio"
                          name="facility"
                          checked={!selectedFacility}
                          onChange={() => {
                            setSelectedFacility("");
                            setPage(1);
                          }}
                          className="accent-[#9f3c16] w-4 h-4"
                        />
                        <span>Semua Fasilitas</span>
                      </label>
                      {facilities.map((fac) => {
                        const isChecked = selectedFacility === fac.id;
                        return (
                          <label
                            key={fac.id}
                            className="flex items-center gap-2.5 text-xs text-zinc-700 hover:text-zinc-900 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="facility"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedFacility(fac.id);
                                setPage(1);
                              }}
                              className="accent-[#9f3c16] w-4 h-4"
                            />
                            <span>{fac.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── Property Grid & Results ── */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16] mb-3" />
                  <p className="text-sm font-medium text-zinc-500">
                    Memuat daftar homestay...
                  </p>
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center mb-4">
                    <Home className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1">
                    Belum Ada Homestay yang Sesuai
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-md mb-6 leading-relaxed">
                    Tidak ditemukan homestay dengan kombinasi filter saat ini. Silakan sesuaikan kawasan, tipe kategori, atau rentang harga Anda.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((p) => {
                      const image =
                        p.images?.[0]?.imageUrl ||
                        p.images?.[0]?.url ||
                        p.image ||
                        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";

                      const locationName =
                        p.locationArea?.name ||
                        p.locationArea?.district ||
                        p.address ||
                        "Yogyakarta";

                      const capacityLabel =
                        typeof p.capacity === "number"
                          ? `${p.capacity} Tamu · ${p.bedroomCount || 2} Kamar Tidur`
                          : p.capacity || "4 Tamu · 2 Kamar Tidur";

                      return (
                        <PropertyCard
                          key={p.id || p.slug}
                          id={p.id}
                          slug={activePromo ? `${p.slug}?promo=${encodeURIComponent(activePromo)}` : p.slug}
                          name={p.name}
                          image={image}
                          imageUrl={image}
                          location={locationName}
                          rating={p.rating ?? 4.9}
                          reviewCount={p.reviewCount ?? 0}
                          capacity={capacityLabel}
                          price={p.price}
                          originalPrice={p.originalPrice}
                          badge={
                            p.isFeatured
                              ? "Pilihan Kurator"
                              : p.category?.name || "Homestay"
                          }
                          badgeType={p.isFeatured ? "best-seller" : "superhost"}
                          extraBadge={
                            locationName.toLowerCase().includes("kraton") ||
                            locationName.toLowerCase().includes("malioboro")
                              ? "Dekat Malioboro"
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  {/* ── Pagination ── */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-zinc-200">
                    <span className="text-xs text-zinc-500">
                      Menampilkan {properties.length} dari {totalCount} homestay terdaftar
                    </span>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={page <= 1}
                          onClick={() => {
                            setPage((prev) => Math.max(prev - 1, 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Sebelumnya</span>
                        </button>

                        <span className="text-xs font-semibold text-zinc-700 px-2">
                          Halaman {page} dari {totalPages}
                        </span>

                        <button
                          disabled={page >= totalPages}
                          onClick={() => {
                            setPage((prev) => Math.min(prev + 1, totalPages));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span>Berikutnya</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Guide CTA ── */}
              <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#ffdbcf]/60 to-white border border-[#ffdbcf] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#9f3c16] uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Panduan Kawasan Jogja</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-1 tracking-tight">
                    Butuh panduan memilih lokasi menginap di Yogyakarta?
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 max-w-xl leading-relaxed">
                    Pelajari perbedaan atmosfer antara pusat kultur Kraton & Prawirotaman, sejuknya perbukitan Kaliurang, hingga ketenangan desa seni Bantul.
                  </p>
                </div>
                <Link
                  href="/panduan-jogja"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold shadow-md transition-all shrink-0"
                >
                  <span>Baca Panduan Kawasan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function HomestayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf8ff] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
        </div>
      }
    >
      <HomestayCatalogContent />
    </Suspense>
  );
}
