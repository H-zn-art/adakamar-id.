"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { propertiesApi, locationsApi, categoriesApi, facilitiesApi, articlesApi } from "@/lib/api";
import {
  ChevronRight,
  Home,
  Save,
  CheckCircle,
  AlertCircle,
  X,
  MapPin,
  Sparkles,
  BedDouble,
  Bath,
  Users,
  Building2,
  DollarSign,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Plus,
  FolderPlus,
  FileUp,
  Search,
} from "lucide-react";

function AddEditPenginapanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [savedToastType, setSavedToastType] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(editId));

  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [backendFacilities, setBackendFacilities] = useState<any[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string>(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8"
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Media Picker and Direct Upload state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "gallery">("cover");
  const [mediaPickerSearch, setMediaPickerSearch] = useState("");
  const [mediaGalleryList, setMediaGalleryList] = useState<any[]>([]);
  const [loadingMediaGallery, setLoadingMediaGallery] = useState(false);
  const [directUploading, setDirectUploading] = useState(false);
  const directCoverFileRef = useRef<HTMLInputElement>(null);
  const directGalleryFileRef = useRef<HTMLInputElement>(null);

  const openMediaPicker = async (target: "cover" | "gallery" = "cover") => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
    setMediaPickerSearch("");
    setLoadingMediaGallery(true);
    try {
      const [propsRes, artsRes, uploadsRes] = await Promise.all([
        propertiesApi.listAdminAll({ limit: 100 }).catch(() => ({ data: [] })),
        articlesApi.findAllForAdmin().catch(() => ({ data: [] })),
        fetch("/api/upload").then((r) => r.json()).catch(() => ({ files: [] })),
      ]);

      const list: { id: string; name: string; url: string; category: string }[] = [];

      // Local uploads
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

      // Properties photos
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
      setSavedToast("Gagal memuat galeri media.");
      setSavedToastType("error");
    } finally {
      setLoadingMediaGallery(false);
    }
  };

  const handleSelectMediaPhoto = (url: string) => {
    if (mediaPickerTarget === "cover") {
      setCoverPhoto(url);
      setSavedToast("✓ Foto sampul utama berhasil dipilih!");
      setSavedToastType("success");
    } else {
      setAdditionalImages((prev) => {
        if (prev.includes(url)) return prev;
        return [...prev, url];
      });
      setSavedToast("✓ Foto ditambahkan ke galeri penginapan!");
      setSavedToastType("success");
    }
    setMediaPickerOpen(false);
  };

  const handleDirectUpload = async (file: File | undefined, target: "cover" | "gallery") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSavedToast("Pilih file berformat gambar (JPG, PNG, WebP).");
      setSavedToastType("error");
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
          setCoverPhoto(data.url);
          setSavedToast("✓ Foto sampul berhasil diunggah & dipasang!");
          setSavedToastType("success");
        } else {
          setAdditionalImages((prev) => [...prev, data.url]);
          setSavedToast("✓ Foto berhasil diunggah & ditambahkan ke galeri!");
          setSavedToastType("success");
        }
      } else {
        setSavedToast(data?.error || "Gagal mengunggah foto.");
        setSavedToastType("error");
      }
    } catch {
      setSavedToast("Gagal mengunggah foto ke server.");
      setSavedToastType("error");
    } finally {
      setDirectUploading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    architectureType: "",
    category: "",
    tagline: "",
    description: "",
    rules: "",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    weekdayPrice: 500000,
    weekendPrice: 650000,
    area: "",
    subdistrict: "",
    address: "",
    status: "active",
    featured: false,
    amenities: [] as string[],
    whatsapp: "6285795445463",
    categoryId: "",
  });

  useEffect(() => {
    Promise.all([
      locationsApi.list().catch(() => []),
      categoriesApi.list().catch(() => []),
      facilitiesApi.list().catch(() => []),
    ]).then(([locs, cats, facs]) => {
      if (Array.isArray(locs) && locs.length > 0) setLocations(locs);
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
        setFormData((prev) => ({ ...prev, categoryId: prev.categoryId || cats[0].id }));
      }
      if (Array.isArray(facs) && facs.length > 0) setBackendFacilities(facs);
    });
  }, []);

  // Fetch existing data if editId is provided
  useEffect(() => {
    if (!editId) {
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);
    propertiesApi
      .getById(editId)
      .then((data: any) => {
        if (data) {
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            architectureType: data.category?.name || "",
            category: data.category?.name || "",
            tagline: "",
            description: data.description || "",
            rules: data.rules || "",
            bedrooms: data.bedroomCount || 1,
            bathrooms: data.bathroomCount || 1,
            guests: data.capacity || 2,
            weekdayPrice: data.price || 0,
            weekendPrice: data.originalPrice || 0,
            area: data.locationArea?.name || "",
            subdistrict: data.address || "",
            address: data.address || "",
            status: data.status === "ACTIVE" ? "active" : "inactive",
            featured: Boolean(data.isFeatured),
            amenities: Array.isArray(data.facilities)
              ? data.facilities
                  .map((f: any) => f.facility?.name || f.name)
                  .filter(Boolean)
              : [],
            whatsapp: data.whatsappNumber || "6285795445463",
            categoryId: data.categoryId || "",
          });

          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const urls = data.images.map((img: any) => img.imageUrl).filter(Boolean);
            if (urls[0]) setCoverPhoto(urls[0]);
            setAdditionalImages(urls.slice(1));
          }
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat detail penginapan:", err);
        setSavedToast("Gagal memuat data penginapan dari server.");
        setSavedToastType("error");
      })
      .finally(() => {
        setLoadingInitial(false);
      });
  }, [editId]);

  const allAmenities = [
    "Kolam Renang Privat",
    "AC di Setiap Kamar",
    "Wi-Fi Kecepatan Tinggi (50 Mbps)",
    "Sarapan Tradisional Pincuk",
    "Dapur Bersama & Alat Masak",
    "Area Parkir Mobil Luas",
    "Water Heater",
    "Bale-Bale Bersantai",
    "Smart TV",
    "Mesin Cuci",
    "Peralatan Sholat Lengkap",
    "Dispenser Air Minum",
  ];

  const handleToggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setSavedToast("Nama homestay wajib diisi!");
      setSavedToastType("error");
      return;
    }

    setSaving(true);
    try {
      let locationId: string | undefined;
      if (locations.length > 0) {
        const foundLoc = locations.find(
          (l) =>
            l.name.toLowerCase().includes(formData.area.toLowerCase()) ||
            formData.area.toLowerCase().includes(l.name.toLowerCase()) ||
            (l.district && formData.subdistrict.toLowerCase().includes(l.district.toLowerCase()))
        );
        locationId = foundLoc ? foundLoc.id : locations[0].id;
      }

      let categoryId: string | undefined = formData.categoryId;
      if (!categoryId && categories.length > 0) {
        categoryId = categories[0].id;
      }

      const facilityIds: string[] = [];
      if (backendFacilities.length > 0) {
        formData.amenities.forEach((amenityName) => {
          const matched = backendFacilities.find(
            (f) =>
              f.name.toLowerCase().includes(amenityName.toLowerCase()) ||
              amenityName.toLowerCase().includes(f.name.toLowerCase())
          );
          if (matched && !facilityIds.includes(matched.id)) {
            facilityIds.push(matched.id);
          }
        });
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || "Homestay asri bernuansa khas Yogyakarta dengan fasilitas lengkap.",
        rules: formData.rules || undefined,
        price: Number(formData.weekdayPrice) || 0,
        originalPrice: formData.weekendPrice ? Number(formData.weekendPrice) : undefined,
        address: formData.address || "Yogyakarta",
        locationId,
        categoryId,
        capacity: Number(formData.guests) || 2,
        bedroomCount: Number(formData.bedrooms) || 1,
        bathroomCount: Number(formData.bathrooms) || 1,
        whatsappNumber: formData.whatsapp || "6285795445463",
        status: formData.status === "active" ? ("ACTIVE" as const) : ("INACTIVE" as const),
        isFeatured: formData.featured,
        facilityIds: facilityIds.length > 0 ? facilityIds : undefined,
        imageUrls: [coverPhoto, ...additionalImages].filter(Boolean),
      };

      if (editId) {
        await propertiesApi.update(editId, payload);
        setSavedToast("✓ Perubahan data penginapan berhasil diperbarui!");
      } else {
        await propertiesApi.create(payload);
        setSavedToast("✓ Unit homestay baru berhasil didaftarkan ke sistem!");
      }

      setSavedToastType("success");
      setTimeout(() => {
        router.push("/admin/penginapan");
      }, 1200);
    } catch (err: any) {
      setSavedToast(`✕ Gagal menyimpan: ${err?.message || "Cek koneksi backend"}`);
      setSavedToastType("error");
      setTimeout(() => setSavedToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/admin/penginapan" className="hover:text-zinc-900 transition-colors">
              Penginapan
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">
              {editId ? "Edit Unit Penginapan" : "Tambah Unit Baru"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/penginapan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>
                {saving
                  ? "Menyimpan..."
                  : editId
                  ? "Perbarui Penginapan"
                  : "Simpan & Publikasikan"}
              </span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {savedToast && (
            <div
              className={`p-4.5 rounded-3xl border flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in duration-200 ${
                savedToastType === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {savedToastType === "error" ? (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{savedToast}</span>
              </div>
              <button
                onClick={() => setSavedToast(null)}
                className="px-2 font-bold hover:opacity-75 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                Katalog Penginapan
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {editId ? `• Edit Mode (${formData.name || "Memuat..."})` : "• Listing Baru Terverifikasi"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {editId ? `Edit Data: ${formData.name || "Penginapan"}` : "Pendaftaran Unit Penginapan Baru"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
              {editId
                ? "Perbarui spesifikasi kamar, harga sewa, fasilitas, dan kurasi homestay di bawah ini."
                : "Lengkapi informasi properti, foto resolusi tinggi, spesifikasi kamar, dan tarif sewa untuk kurasi tamu Adakamar Jogja."}
            </p>
          </div>

          {loadingInitial ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
              <p className="text-xs font-semibold">Memuat rincian data penginapan...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 8-cols: Main Form */}
              <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-6">
                {/* Bagian 1: Informasi Utama */}
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-950">
                          Informasi Utama & Identitas
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Nama, kategori arsitektur, dan deskripsi publik
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 border border-zinc-200/60">
                      Langkah 1/4
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Nama Homestay / Properti <span className="text-[#9f3c16]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Omah Noto Prayan Heritage"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .trim()
                          .replace(/\s+/g, "-");
                        setFormData({ ...formData, name, slug: editId ? formData.slug : slug });
                      }}
                      className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Slug URL Halaman
                    </label>
                    <div className="flex items-center rounded-2xl bg-zinc-50 border border-zinc-200 px-4 py-2.5 text-xs text-zinc-500 font-mono">
                      <span>/homestay/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="bg-transparent font-bold text-[#9f3c16] px-1 flex-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Kategori Penginapan <span className="text-[#9f3c16]">*</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Pilih Kategori Penginapan --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.description ? `— ${c.description.slice(0, 30)}...` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Gaya Arsitektur Bangunan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Joglo Kayu Jati, Limasan Asli"
                        value={formData.architectureType}
                        onChange={(e) =>
                          setFormData({ ...formData, architectureType: e.target.value })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                      />
                    </div>
                  </div>

                  {/* Foto Utama Listing */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800">
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
                      value={coverPhoto}
                      onChange={(e) => setCoverPhoto(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 font-mono"
                    />
                    <p className="text-[11px] text-zinc-400">
                      Mendukung URL foto dari Galeri Pustaka Media (/uploads/...), tautan web (https://...), atau Cloudinary.
                    </p>

                    {coverPhoto && (
                      <div className="mt-2 flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                          <img
                            src={coverPhoto}
                            alt="Preview Foto Utama"
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400";
                            }}
                          />
                        </div>
                        <div className="min-w-0 text-xs">
                          <span className="font-bold text-zinc-900 block truncate">Foto Sampul Utama Terpasang</span>
                          <span className="text-[11px] text-zinc-500 font-mono block truncate mt-0.5">{coverPhoto}</span>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">✓ Siap Ditampilkan</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Galeri Foto Tambahan */}
                  <div className="pt-3 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-800 block text-xs">
                          Galeri Foto Tambahan ({additionalImages.length} foto)
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Foto-foto interior kamar, sudut halaman, fasilitas, dan detail homestay.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openMediaPicker("gallery")}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pilih dari Galeri</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => directGalleryFileRef.current?.click()}
                          disabled={directUploading}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileUp className="w-3.5 h-3.5" />
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

                    {additionalImages.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
                        {additionalImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                            <img src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                              title="Hapus foto dari galeri"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic">
                        Belum ada foto tambahan. Klik "Pilih dari Galeri" atau "Upload File" untuk menambahkan suasana homestay.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Deskripsi Naratif Homestay
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Deskripsikan suasana, sejarah rumah, keistimewaan arsitektur, dan pengalaman menginap..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] leading-relaxed resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Bagian 2: Kapasitas & Tarif */}
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-950">
                          Spesifikasi & Tarif Sewa
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Kapasitas kamar tidur, tamu, dan harga per malam
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 border border-zinc-200/60">
                      Langkah 2/4
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Kamar Tidur
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bedrooms: Number(e.target.value) })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Kamar Mandi
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bathrooms: Number(e.target.value) })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Maks. Tamu
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.guests}
                        onChange={(e) =>
                          setFormData({ ...formData, guests: Number(e.target.value) })
                        }
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Harga Per Malam (IDR) <span className="text-[#9f3c16]">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="number"
                          placeholder="Contoh: 750000"
                          value={formData.weekdayPrice || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, weekdayPrice: Number(e.target.value) })
                          }
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Harga Coret / Normal (IDR)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="number"
                          placeholder="Contoh: 900000"
                          value={formData.weekendPrice || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, weekendPrice: Number(e.target.value) })
                          }
                          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Fasilitas & Amenitas */}
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-950">
                          Fasilitas & Amenitas Terverifikasi
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Pilih amenitas yang tersedia langsung di homestay
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 border border-zinc-200/60">
                      Langkah 3/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allAmenities.map((amenity) => {
                      const isChecked = formData.amenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-[#ffdbcf]/50 border-[#9f3c16] text-[#9f3c16] font-bold shadow-xs"
                              : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAmenity(amenity)}
                            className="w-4 h-4 accent-[#9f3c16] rounded-md cursor-pointer"
                          />
                          <span>{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Bagian 4: Lokasi, Aturan & WhatsApp */}
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-950">
                          Alamat, Kontak & Aturan Homestay
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Wilayah kawasan dan panduan tata tertib hunian
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 border border-zinc-200/60">
                      Langkah 4/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Wilayah Kabupaten / Kota
                      </label>
                      <select
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Pilih Wilayah Jogja --</option>
                        {locations.length > 0 ? (
                          locations.map((loc: any) => (
                            <option key={loc.id} value={loc.name}>
                              {loc.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option>Kota Jogja</option>
                            <option>Sleman</option>
                            <option>Bantul</option>
                            <option>Kulon Progo</option>
                            <option>Gunungkidul</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                        Nomor WhatsApp Host / Reservasi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 085795445463 atau 6285795445463"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Alamat Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan lokasi"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                      Aturan Penginapan (opsional — satu aturan per baris)
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`Contoh:\n- Dilarang merokok di dalam kamar\n- Check-in pukul 14.00, check-out pukul 12.00\n- Tidak diperkenankan membawa hewan peliharaan`}
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] leading-relaxed resize-none transition-all"
                    />
                  </div>
                </div>
              </form>

              {/* Right 4-cols: Sticky Sidebar Actions */}
              <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                <div className="p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-5">
                  <h3 className="text-sm font-extrabold text-zinc-950">
                    Status & Publikasi
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1.5">
                        Status Visibilitas
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="active">Aktif & Siap Dipesan</option>
                        <option value="inactive">Nonaktif Sementara</option>
                      </select>
                    </div>

                    {/* Penjelasan Pilihan Kurator */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 accent-[#9f3c16] rounded-md mt-0.5 cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Unit Unggulan (Pilihan Kurator)
                          </span>
                          <span className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                            <strong>Maksud Pilihan Kurator:</strong> Unit homestay yang dicentang akan mendapatkan lencana khusus <em>"Pilihan Kurator"</em> karena telah lulus kurasi standar autentik Jogja dan akan diprioritaskan tampil di halaman Beranda depan serta bagian atas pencarian tamu.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="w-full py-3 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>
                        {saving
                          ? "Menyimpan..."
                          : editId
                          ? "Perbarui Penginapan"
                          : "Simpan & Publikasikan"}
                      </span>
                    </button>
                    <Link
                      href="/admin/penginapan"
                      className="w-full py-2.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 text-xs font-bold rounded-2xl text-center transition-colors"
                    >
                      Batal
                    </Link>
                  </div>
                </div>

                {/* Photo Preview Widget */}
                <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-3.5">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#9f3c16]" />
                    Pratinjau Foto Sampul
                  </span>
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-zinc-100 relative border border-zinc-200">
                    <img
                      src={coverPhoto}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600";
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold">
                      {editId ? "Foto Saat Ini" : "Default Cover"}
                    </div>
                  </div>

                  {additionalImages.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100">
                      <span className="text-[11px] font-bold text-zinc-700 block mb-1.5">
                        +{additionalImages.length} Foto Galeri Tambahan
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {additionalImages.slice(0, 4).map((url, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                            <img src={url} alt="Galeri" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Foto galeri tambahan dapat dikelola kapan saja melalui formulir ini atau menu <strong>Pustaka Galeri Media</strong>.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>

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
                    const pickerInput = document.getElementById("picker-direct-upload-tambah") as HTMLInputElement;
                    pickerInput?.click();
                  }}
                  disabled={directUploading}
                  className="px-4 py-2 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {directUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  <span>Upload Foto Baru</span>
                </button>
                <input
                  id="picker-direct-upload-tambah"
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
                        const isSelectedCover = mediaPickerTarget === "cover" && coverPhoto === item.url;
                        const isSelectedGallery = mediaPickerTarget === "gallery" && additionalImages.includes(item.url);
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

export default function AddEditPenginapanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
        </div>
      }
    >
      <AddEditPenginapanContent />
    </Suspense>
  );
}
