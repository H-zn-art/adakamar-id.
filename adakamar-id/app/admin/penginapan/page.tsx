"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { propertiesApi, locationsApi, categoriesApi, facilitiesApi, articlesApi } from "@/lib/api";
import {
  Plus,
  Download,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Sparkles,
  Search,
  Eye,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Loader2,
  X,
  FolderPlus,
  Home,
  Tag,
  FileUp,
  Image as ImageIcon,
  Check,
} from "lucide-react";

export default function AdminPenginapanPage() {
  const [homestays, setHomestays] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableFacilities, setAvailableFacilities] = useState<any[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Media Picker and Direct Upload state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "gallery">("cover");
  const [mediaPickerSearch, setMediaPickerSearch] = useState("");
  const [mediaGalleryList, setMediaGalleryList] = useState<any[]>([]);
  const [loadingMediaGallery, setLoadingMediaGallery] = useState(false);
  const [directUploading, setDirectUploading] = useState(false);
  const directCoverFileRef = useRef<HTMLInputElement>(null);
  const directGalleryFileRef = useRef<HTMLInputElement>(null);

  // New Property form state
  const initialForm = {
    name: "",
    categoryId: "",
    locationId: "",
    address: "",
    price: 500000,
    originalPrice: 650000 as number | undefined,
    capacity: 4,
    bedroomCount: 2,
    bathroomCount: 1,
    whatsappNumber: "6285795445463",
    description: "",
    rules: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    isFeatured: false,
    facilityIds: [] as string[],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8",
    additionalImages: [] as string[],
  };
  const [formProp, setFormProp] = useState(initialForm);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live stats computed from DB data
  const totalAll = homestays.length;
  const totalAktif = homestays.filter((h) => h.status === "active").length;
  const totalNonaktif = homestays.filter((h) => h.status === "inactive").length;
  const uniqueAreasCount = new Set(homestays.map((h) => h.area)).size;
  const totalFeatured = homestays.filter((h) => h.featured).length;
  const reviewedHomestays = homestays.filter((h) => h.reviews > 0 && typeof h.rating === "number");
  const totalReviewsCount = reviewedHomestays.reduce((s, h) => s + h.reviews, 0);
  const avgRating = totalReviewsCount > 0
    ? (reviewedHomestays.reduce((s, h) => s + (h.rating * h.reviews), 0) / totalReviewsCount).toFixed(1)
    : "Baru";

  const loadProperties = async () => {
    try {
      const res = await propertiesApi.listAdminAll({ limit: 100 });
      if (res && Array.isArray(res.data)) {
        setHomestays(res.data.map((p: any) => ({
          id: p.id,
          code: `AKM-${p.id.slice(-3).toUpperCase()}`,
          name: p.name,
          slug: p.slug,
          area: p.locationArea?.name || p.address || "Yogyakarta",
          type: p.category?.name || "Joglo Tradisional",
          price: p.price,
          originalPrice: p.originalPrice,
          rating: (p.reviewCount && p.reviewCount > 0) ? p.rating : null,
          reviews: p.reviewCount ?? 0,
          status: p.status === "ACTIVE" ? "active" : "inactive",
          featured: Boolean(p.isFeatured),
          image:
            p.images?.[0]?.imageUrl ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8",
          capacity: `${p.capacity || 4} Tamu`,
        })));
      } else {
        setHomestays([]);
      }
    } catch (e) {
      console.warn("Gagal memuat data penginapan:", e);
      setHomestays([]);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [locs, cats, facs] = await Promise.all([
        locationsApi.list().catch(() => []),
        categoriesApi.list().catch(() => []),
        facilitiesApi.list().catch(() => []),
      ]);
      if (Array.isArray(locs)) {
        setAvailableLocations(locs);
        setFormProp((prev) => ({ ...prev, locationId: prev.locationId || locs[0]?.id || "" }));
      }
      if (Array.isArray(cats)) {
        setAvailableCategories(cats);
        setFormProp((prev) => ({ ...prev, categoryId: prev.categoryId || cats[0]?.id || "" }));
      }
      if (Array.isArray(facs)) {
        setAvailableFacilities(facs);
      }
    } catch (err) {
      console.warn("Gagal mengambil data referensi:", err);
    }
  };

  useEffect(() => {
    loadProperties();
    fetchDependencies();

    const handleUpdate = () => {
      loadProperties();
      fetchDependencies();
    };
    window.addEventListener("adakamar_homestays_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_homestays_updated", handleUpdate);
  }, []);

  const filtered = homestays.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.code && h.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchArea = areaFilter === "all" || h.area.includes(areaFilter);
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchArea && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data penginapan ini?")) {
      try {
        await propertiesApi.remove(id);
        await loadProperties();
        showToast("success", "Penginapan berhasil dihapus dari sistem.");
      } catch (err: any) {
        showToast("error", `Gagal hapus: ${err?.message || "Cek koneksi backend"}`);
      }
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await propertiesApi.update(id, { isFeatured: !current });
      setHomestays((prev) =>
        prev.map((h) => (h.id === id ? { ...h, featured: !current } : h))
      );
      showToast("success", `Status kurator penginapan berhasil diperbarui.`);
    } catch (err: any) {
      showToast("error", `Gagal mengubah status kurator: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const openMediaPicker = async (target: "cover" | "gallery" = "cover") => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
    setLoadingMediaGallery(true);
    try {
      const [propsRes, artsRes, uploadsRes] = await Promise.all([
        propertiesApi.listAdminAll({ limit: 100 }).catch(() => ({ data: [] })),
        articlesApi.findAllForAdmin().catch(() => ({ data: [] })),
        fetch("/api/upload").then((r) => r.json()).catch(() => ({ files: [] })),
      ]);

      const list: { id: string; name: string; url: string; category: string }[] = [];

      // Add local uploads
      if (uploadsRes?.files && Array.isArray(uploadsRes.files)) {
        uploadsRes.files.forEach((f: any) => {
          list.push({
            id: `upload-${f.filename}`,
            name: f.filename,
            url: f.url,
            category: "Unggahan Lokal",
          });
        });
      }

      // Add homestay photos
      if (propsRes?.data && Array.isArray(propsRes.data)) {
        propsRes.data.forEach((p: any) => {
          if (Array.isArray(p.images)) {
            p.images.forEach((img: any, idx: number) => {
              if (img.imageUrl && !list.some((it) => it.url === img.imageUrl)) {
                list.push({
                  id: `prop-${p.id}-${idx}`,
                  name: p.name,
                  url: img.imageUrl,
                  category: p.category?.name || "Homestay",
                });
              }
            });
          }
        });
      }

      setMediaGalleryList(list);
    } catch {
      showToast("error", "Gagal memuat galeri foto.");
    } finally {
      setLoadingMediaGallery(false);
    }
  };

  const handleSelectMediaPhoto = (url: string) => {
    if (mediaPickerTarget === "cover") {
      setFormProp((prev) => ({ ...prev, imageUrl: url }));
      showToast("success", "✓ Foto sampul utama berhasil dipilih!");
    } else {
      setFormProp((prev) => {
        if (prev.additionalImages.includes(url)) return prev;
        return { ...prev, additionalImages: [...prev.additionalImages, url] };
      });
      showToast("success", "✓ Foto ditambahkan ke galeri penginapan!");
    }
    setMediaPickerOpen(false);
  };

  const handleDirectUpload = async (file: File | undefined, target: "cover" | "gallery") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Pilih file berformat gambar (JPG, PNG, WebP).");
      return;
    }

    setDirectUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        if (target === "cover") {
          setFormProp((prev) => ({ ...prev, imageUrl: data.url }));
          showToast("success", "✓ Foto berhasil diunggah & dijadikan sampul!");
        } else {
          setFormProp((prev) => ({
            ...prev,
            additionalImages: [...prev.additionalImages, data.url],
          }));
          showToast("success", "✓ Foto berhasil diunggah & ditambahkan ke galeri!");
        }
      } else {
        showToast("error", data?.error || "Gagal mengunggah foto.");
      }
    } catch {
      showToast("error", "Gagal mengunggah foto ke server.");
    } finally {
      setDirectUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setFormProp({
      ...initialForm,
      locationId: availableLocations[0]?.id || "",
      categoryId: availableCategories[0]?.id || "",
      additionalImages: [],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = async (item: any) => {
    try {
      setSubmitting(true);
      const fullData = await propertiesApi.getById(item.id);
      setEditingProperty(fullData);

      const allImages = (fullData.images || []).map((img: any) => img.imageUrl);
      const primaryPhoto = allImages[0] || item.image || initialForm.imageUrl;
      const otherPhotos = allImages.slice(1);

      setFormProp({
        name: fullData.name || "",
        categoryId: fullData.categoryId || (availableCategories[0]?.id || ""),
        locationId: fullData.locationId || (availableLocations[0]?.id || ""),
        address: fullData.address || "",
        price: fullData.price || 500000,
        originalPrice: fullData.originalPrice || undefined,
        capacity: fullData.capacity || 2,
        bedroomCount: fullData.bedroomCount || 1,
        bathroomCount: fullData.bathroomCount || 1,
        whatsappNumber: fullData.whatsappNumber || "6285795445463",
        description: fullData.description || "",
        rules: fullData.rules || "",
        status: fullData.status || "ACTIVE",
        isFeatured: Boolean(fullData.isFeatured),
        facilityIds: Array.isArray(fullData.facilities)
          ? fullData.facilities.map((f: any) => f.facilityId || f.id)
          : [],
        imageUrl: primaryPhoto,
        additionalImages: otherPhotos,
      });
      setIsAddModalOpen(true);
    } catch {
      setEditingProperty(item);
      const matchedCat = availableCategories.find((c) => c.name === item.type);
      const matchedLoc = availableLocations.find((l) => item.area && item.area.includes(l.name));
      setFormProp({
        name: item.name || "",
        categoryId: matchedCat?.id || (availableCategories[0]?.id || ""),
        locationId: matchedLoc?.id || (availableLocations[0]?.id || ""),
        address: item.area || "Yogyakarta",
        price: item.price || 500000,
        originalPrice: item.originalPrice || undefined,
        capacity: 4,
        bedroomCount: 2,
        bathroomCount: 1,
        whatsappNumber: "6285795445463",
        description: "",
        rules: "",
        status: item.status === "active" ? "ACTIVE" : "INACTIVE",
        isFeatured: Boolean(item.featured),
        facilityIds: [],
        imageUrl: item.image || initialForm.imageUrl,
        additionalImages: [],
      });
      setIsAddModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProp.name.trim()) {
      alert("Nama penginapan wajib diisi!");
      return;
    }
    try {
      setSubmitting(true);
      const combinedImages = Array.from(
        new Set([formProp.imageUrl, ...(formProp.additionalImages || [])].filter(Boolean))
      );

      const payload = {
        name: formProp.name.trim(),
        description: formProp.description.trim() || "Homestay asri bernuansa khas Yogyakarta dengan fasilitas lengkap.",
        rules: formProp.rules.trim() || undefined,
        price: Number(formProp.price) || 500000,
        originalPrice: formProp.originalPrice ? Number(formProp.originalPrice) : undefined,
        address: formProp.address.trim() || "Yogyakarta",
        locationId: formProp.locationId || (availableLocations[0]?.id),
        categoryId: formProp.categoryId || (availableCategories[0]?.id),
        capacity: Number(formProp.capacity) || 2,
        bedroomCount: Number(formProp.bedroomCount) || 1,
        bathroomCount: Number(formProp.bathroomCount) || 1,
        whatsappNumber: formProp.whatsappNumber || "6285795445463",
        status: formProp.status,
        isFeatured: formProp.isFeatured,
        facilityIds: formProp.facilityIds.length > 0 ? formProp.facilityIds : undefined,
        imageUrls: combinedImages.length > 0 ? combinedImages : [formProp.imageUrl],
      };

      if (editingProperty) {
        await propertiesApi.update(editingProperty.id, payload);
        showToast("success", `✓ Data penginapan "${formProp.name}" berhasil diperbarui!`);
      } else {
        await propertiesApi.create(payload);
        showToast("success", `✓ Penginapan "${formProp.name}" berhasil ditambahkan ke database!`);
      }

      setIsAddModalOpen(false);
      setEditingProperty(null);
      setFormProp(initialForm);
      await loadProperties();
    } catch (err: any) {
      showToast("error", `Gagal menyimpan penginapan: ${err?.message || "Cek koneksi backend"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffdbcf]/70 border border-[#9f3c16]/15 text-[10px] font-bold tracking-wider uppercase text-[#9f3c16]">
              <Sparkles className="w-3 h-3 text-[#9f3c16]" />
              Katalog Homestay DIY
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              • {totalAll} Unit Terdaftar
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white text-xs font-bold shadow-lg shadow-[#9f3c16]/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penginapan</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1400px] w-full flex flex-col gap-6">
          {/* Headline & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                Manajemen Penginapan & Villa
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Kelola data homestay, villa private pool, dan omah tradisional di seluruh wilayah Jogja.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Mengekspor data ke format CSV...")}
                className="px-4 py-2 rounded-xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-xs font-bold text-zinc-700 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Top KPIs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Total Aktif
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1">{totalAktif}</p>
                <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Rating avg: {avgRating}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Kawasan Terjangkau
                </span>
                <p className="text-3xl font-extrabold text-amber-700 mt-1">{uniqueAreasCount} Area</p>
                <span className="text-xs text-amber-700 flex items-center gap-1 mt-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  Tersebar di DIY
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Nonaktif / Renovasi
                </span>
                <p className="text-3xl font-extrabold text-rose-700 mt-1">{totalNonaktif}</p>
                <span className="text-xs text-zinc-400 mt-1.5 block">
                  Perlu inspeksi ulang
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                  Pilihan Istimewa
                </span>
                <p className="text-3xl font-extrabold text-[#9f3c16] mt-1">{totalFeatured}</p>
                <span className="text-xs text-[#9f3c16] font-semibold mt-1.5 block">
                  Unggulan di Homepage
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/60 text-[#9f3c16] flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama penginapan atau kode unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 focus:outline-none"
              >
                <option value="all">Semua Kawasan</option>
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} {loc.district ? `(${loc.district})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif / Live</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Properti</th>
                    <th className="px-4 py-3.5">Tipe & Wilayah</th>
                    <th className="px-4 py-3.5">Harga / Malam</th>
                    <th className="px-4 py-3.5">Rating</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.length > 0 ? (
                    filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {item.code}
                              </span>
                              <h4 className="font-bold text-zinc-900 text-xs leading-snug">
                                {item.name}
                              </h4>
                              {item.featured && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatured(item.id, item.featured)}
                                  className="inline-block mt-0.5 text-[10px] text-[#9f3c16] bg-[#ffdbcf] hover:bg-[#ffdbcf]/80 px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors"
                                  title="Klik untuk mengubah status Pilihan Kurator"
                                >
                                  ★ Pilihan Kurator
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-zinc-800 block">
                            {item.type}
                          </span>
                          <span className="text-zinc-500 text-[11px]">
                            {item.area}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-[#9f3c16]">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.reviews > 0 && item.rating !== null ? (
                            <span className="font-bold text-zinc-900 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              {Number(item.rating).toFixed(1)}{" "}
                              <span className="text-zinc-400 font-normal">({item.reviews})</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px] font-medium italic">
                              Belum ada ulasan
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {item.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Aktif Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/homestay/${item.slug}`}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                              title="Pratinjau Publik"
                              target="_blank"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-[#ffdbcf]/50 text-zinc-500 hover:text-[#9f3c16] transition-colors cursor-pointer"
                              title="Edit Data Penginapan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        Tidak ada properti yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:opacity-70 text-zinc-400"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal Box: Tambah Penginapan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200/80 my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900">
                      {editingProperty ? "Edit Data Penginapan" : "Tambah Penginapan Baru"}
                    </h3>
                    {editingProperty && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Mode Edit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {editingProperty
                      ? `Perbarui informasi, harga, fasilitas, dan kurasi untuk unit ini`
                      : "Daftarkan unit homestay / villa ke katalog terkurasi Yogyakarta"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProperty(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleSubmitProperty} className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700">
              {/* Bagian 1: Identitas & Kategori Penginapan */}
              <div className="p-5 rounded-2xl bg-zinc-50/60 border border-zinc-200/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#9f3c16]" />
                    Informasi & Kategori Penginapan
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Langkah 1/3
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Nama Homestay / Villa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Omah Joglo Heritage Prawirotaman"
                    value={formProp.name}
                    onChange={(e) => setFormProp({ ...formProp, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kategori Penginapan */}
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Kategori Penginapan *
                    </label>
                    <select
                      value={formProp.categoryId}
                      onChange={(e) => setFormProp({ ...formProp, categoryId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30 cursor-pointer font-medium"
                    >
                      {availableCategories.length === 0 ? (
                        <option value="">Memuat kategori...</option>
                      ) : (
                        availableCategories.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.description ? `— ${c.description.slice(0, 32)}...` : ""}
                          </option>
                        ))
                      )}
                    </select>
                    {availableCategories.find((c: any) => c.id === formProp.categoryId) && (
                      <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span className="font-medium text-[#9f3c16]">
                          {availableCategories.find((c: any) => c.id === formProp.categoryId)?.name}
                        </span>
                        <span>: {availableCategories.find((c: any) => c.id === formProp.categoryId)?.description || "Kategori aktif di sistem"}</span>
                      </p>
                    )}
                  </div>

                  {/* Kawasan / Lokasi */}
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Wilayah / Kawasan DIY *
                    </label>
                    <select
                      value={formProp.locationId}
                      onChange={(e) => setFormProp({ ...formProp, locationId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30 cursor-pointer font-medium"
                    >
                      {availableLocations.map((l: any) => (
                        <option key={l.id} value={l.id}>
                          {l.name} {l.district ? `(${l.district})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Alamat Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Prawirotaman No. 24, Brontokusuman, Mergangsan, Kota Yogyakarta"
                    value={formProp.address}
                    onChange={(e) => setFormProp({ ...formProp, address: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30"
                  />
                </div>
              </div>

              {/* Bagian 2: Harga & Kapasitas */}
              <div className="p-5 rounded-2xl bg-zinc-50/60 border border-zinc-200/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Harga & Kapasitas Menginap
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Langkah 2/3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Harga Per Malam (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={50000}
                      value={formProp.price}
                      onChange={(e) => setFormProp({ ...formProp, price: Number(e.target.value) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Harga Coret / Normal (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProp.originalPrice || ""}
                      onChange={(e) => setFormProp({ ...formProp, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30"
                      placeholder="Opsional untuk diskon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Maks. Tamu
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formProp.capacity}
                      onChange={(e) => setFormProp({ ...formProp, capacity: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-center font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Kamar Tidur
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formProp.bedroomCount}
                      onChange={(e) => setFormProp({ ...formProp, bedroomCount: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-center font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Kamar Mandi
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formProp.bathroomCount}
                      onChange={(e) => setFormProp({ ...formProp, bathroomCount: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-center font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Fasilitas, Narasi & Foto */}
              <div className="p-5 rounded-2xl bg-zinc-50/60 border border-zinc-200/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/50">
                  <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Fasilitas, Kontak & Media Foto
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Langkah 3/3
                  </span>
                </div>

                {availableFacilities.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold text-zinc-800 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Fasilitas Unit
                      </label>
                      {formProp.facilityIds.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9f3c16] text-white">
                          {formProp.facilityIds.length} dipilih
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableFacilities.map((fac: any) => {
                        const isChecked = formProp.facilityIds.includes(fac.id);
                        return (
                          <button
                            key={fac.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setFormProp({ ...formProp, facilityIds: formProp.facilityIds.filter((id) => id !== fac.id) });
                              } else {
                                setFormProp({ ...formProp, facilityIds: [...formProp.facilityIds, fac.id] });
                              }
                            }}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-center group ${
                              isChecked
                                ? "bg-[#ffdbcf]/30 border-[#9f3c16] shadow-sm"
                                : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                            }`}
                          >
                            {/* Checkmark badge */}
                            {isChecked && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#9f3c16] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-[#9f3c16] text-white"
                                : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                            }`}>
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                                {fac.icon || "check_circle"}
                              </span>
                            </div>
                            {/* Name */}
                            <span className={`text-[10px] font-semibold leading-tight line-clamp-2 ${
                              isChecked ? "text-[#9f3c16]" : "text-zinc-600"
                            }`}>
                              {fac.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {formProp.facilityIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormProp({ ...formProp, facilityIds: [] })}
                        className="mt-2 text-[10px] text-zinc-400 hover:text-rose-500 font-medium transition-colors"
                      >
                        × Hapus semua pilihan fasilitas
                      </button>
                    )}
                  </div>
                )}

                {/* Foto Utama Listing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-zinc-800 text-xs">
                      Foto Utama Listing (Sampul) <span className="text-[#9f3c16]">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openMediaPicker("cover")}
                        className="px-2.5 py-1 rounded-lg bg-[#ffdbcf]/60 hover:bg-[#ffdbcf] text-[#9f3c16] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Pilih dari Galeri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => directCoverFileRef.current?.click()}
                        disabled={directUploading}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {directUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                        <span>Upload File</span>
                      </button>
                      <input
                        type="file"
                        ref={directCoverFileRef}
                        accept="image/*"
                        onChange={(e) => handleDirectUpload(e.target.files?.[0], "cover")}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Contoh: /uploads/media-..., https://..."
                    value={formProp.imageUrl}
                    onChange={(e) => setFormProp({ ...formProp, imageUrl: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30 font-mono"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Mendukung tautan foto lokal (/uploads/...), link web lengkap (http://...), maupun link Cloudinary/Unsplash.
                  </p>

                  {formProp.imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                        <img
                          src={formProp.imageUrl}
                          alt="Preview Foto Utama"
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400";
                          }}
                        />
                      </div>
                      <div className="min-w-0 text-xs">
                        <span className="font-bold text-zinc-900 block truncate">Foto Utama Terpasang</span>
                        <span className="text-[11px] text-zinc-500 font-mono block truncate mt-0.5">{formProp.imageUrl}</span>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">✓ Siap Ditampilkan</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Galeri Foto Tambahan */}
                <div className="pt-3 border-t border-zinc-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 block text-xs">
                        Galeri Foto Tambahan ({formProp.additionalImages?.length || 0} foto)
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Foto-foto suasana kamar, fasilitas, dan area sekitar homestay.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openMediaPicker("gallery")}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Pilih dari Galeri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => directGalleryFileRef.current?.click()}
                        disabled={directUploading}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FileUp className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                      <input
                        type="file"
                        ref={directGalleryFileRef}
                        accept="image/*"
                        onChange={(e) => handleDirectUpload(e.target.files?.[0], "gallery")}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {formProp.additionalImages && formProp.additionalImages.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {formProp.additionalImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                          <img src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setFormProp((prev) => ({
                                ...prev,
                                additionalImages: prev.additionalImages.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                            title="Hapus foto ini dari galeri"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">
                      Belum ada foto tambahan. Klik "Pilih dari Galeri" atau "Upload File" untuk menambahkan.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Nomor WhatsApp Host / Reservasi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="6285795445463"
                      value={formProp.whatsappNumber}
                      onChange={(e) => setFormProp({ ...formProp, whatsappNumber: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1">
                      Status Publikasi
                    </label>
                    <select
                      value={formProp.status}
                      onChange={(e) => setFormProp({ ...formProp, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none font-semibold"
                    >
                      <option value="ACTIVE">Aktif (Live Terpublikasi)</option>
                      <option value="INACTIVE">Nonaktif (Dalam Kurasi / Draf)</option>
                    </select>
                  </div>
                </div>

                {/* PRD Seksi 7: Aturan Penginapan */}
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Aturan Penginapan
                    <span className="ml-1.5 text-zinc-400 font-normal text-[11px]">(opsional — satu aturan per baris)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`Contoh:\n- Dilarang merokok\n- Check-in 14.00, check-out 12.00\n- Tamu sesuai kapasitas`}
                    value={formProp.rules}
                    onChange={(e) => setFormProp({ ...formProp, rules: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none resize-none"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Ditampilkan di halaman detail penginapan untuk tamu.</p>
                </div>

                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Deskripsi Ringkas Homestay
                  </label>
                  <textarea
                    rows={3}
                    value={formProp.description}
                    onChange={(e) => setFormProp({ ...formProp, description: e.target.value })}
                    placeholder="Jelaskan suasana tradisional, arsitektur kayu jati, atau kenyamanan yang ditawarkan untuk tamu..."
                    className="w-full p-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/30 leading-relaxed"
                  />
                </div>

                {/* Pilihan Kurator Section dengan Penjelasan Detail */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProp.isFeatured}
                      onChange={(e) => setFormProp({ ...formProp, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-[#9f3c16] rounded mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Jadikan Rekomendasi Utama (Pilihan Kurator)
                      </span>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                        <strong>Maksud Pilihan Kurator:</strong> Opsi ini digunakan untuk menandai properti istimewa yang telah ditinjau dan diverifikasi langsung oleh <em>Tim Kurator Adakamar</em>. Jika dicentang, unit homestay ini akan mendapatkan lencana emas <em>"Pilihan Kurator"</em> di katalog publik dan diprioritaskan tampil di halaman Beranda depan serta urutan teratas pencarian tamu.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProperty(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {submitting
                      ? editingProperty
                        ? "Memperbarui..."
                        : "Menyimpan..."
                      : editingProperty
                      ? "Simpan Perubahan Penginapan"
                      : "Simpan Penginapan Baru"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-zinc-900">
                      Pustaka Galeri Media
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdbcf] text-[#9f3c16]">
                      {mediaPickerTarget === "cover" ? "Target: Foto Sampul" : "Target: Galeri Tambahan"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Klik pada salah satu foto untuk langsung menerapkannya ke formulir penginapan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-zinc-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari foto berdasarkan nama..."
                  value={mediaPickerSearch}
                  onChange={(e) => setMediaPickerSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 font-medium"
                />
              </div>

              {/* Direct upload inside picker */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const pickerInput = document.getElementById("picker-direct-upload-penginapan") as HTMLInputElement;
                    pickerInput?.click();
                  }}
                  disabled={directUploading}
                  className="px-4 py-2 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {directUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  <span>Upload Foto Baru</span>
                </button>
                <input
                  id="picker-direct-upload-penginapan"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleDirectUpload(file, mediaPickerTarget);
                      setMediaPickerOpen(false);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Grid of Images */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[60vh] bg-zinc-50/30">
              {loadingMediaGallery ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16] mb-3" />
                  <p className="text-xs font-medium text-zinc-500">Memuat pustaka galeri media...</p>
                </div>
              ) : (
                (() => {
                  const filtered = mediaGalleryList.filter((m) => {
                    const matchQ =
                      m.name.toLowerCase().includes(mediaPickerSearch.toLowerCase()) ||
                      m.category.toLowerCase().includes(mediaPickerSearch.toLowerCase());
                    return matchQ;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center">
                        <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-zinc-700">Tidak ada foto ditemukan</h4>
                        <p className="text-xs text-zinc-400 mt-1">Coba kata kunci lain atau upload foto baru dari komputer.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filtered.map((item) => {
                        const isSelectedCover = mediaPickerTarget === "cover" && formProp.imageUrl === item.url;
                        const isSelectedGallery = mediaPickerTarget === "gallery" && formProp.additionalImages.includes(item.url);
                        const isSelected = isSelectedCover || isSelectedGallery;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectMediaPhoto(item.url)}
                            className={`group relative rounded-2xl overflow-hidden border-2 bg-white transition-all cursor-pointer hover:shadow-md ${
                              isSelected
                                ? "border-[#9f3c16] ring-2 ring-[#9f3c16]/30 shadow-xs"
                                : "border-zinc-200/80 hover:border-zinc-400"
                            }`}
                          >
                            <div className="aspect-video relative overflow-hidden bg-zinc-100">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e: any) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400";
                                }}
                              />
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#9f3c16] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                  ✓
                                </div>
                              )}
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-medium text-white truncate max-w-[85%]">
                                {item.category}
                              </span>
                            </div>

                            <div className="p-3">
                              <p className="text-xs font-bold text-zinc-900 truncate" title={item.name}>
                                {item.name}
                              </p>
                              <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">
                                  {item.url.startsWith("/") ? "Upload Lokal" : "Web URL"}
                                </span>
                                <span className="text-[11px] font-bold text-[#9f3c16] group-hover:underline">
                                  {isSelected ? "Terpilih ✓" : "Pilih Foto"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Total {mediaGalleryList.length} foto tersedia dalam galeri pustaka.
              </span>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="px-5 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
