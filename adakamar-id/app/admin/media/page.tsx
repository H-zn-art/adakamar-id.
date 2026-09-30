"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { propertiesApi, articlesApi } from "@/lib/api";
import {
  Loader2,
  Check,
  Copy,
  Plus,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Eye,
  X,
  Building2,
  BookOpen,
  Sparkles,
  UploadCloud,
  CheckCircle,
  ChevronRight,
  Filter,
  FileUp,
  Link as LinkIcon,
} from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  sourceType: "homestay" | "article";
  sourceName: string;
  sourceId: string;
  category: string;
  isCover: boolean;
  dimensions: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "homestay" | "article">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Apply to Homestay Modal State
  const [applyModalItem, setApplyModalItem] = useState<MediaItem | null>(null);
  const [applyTargetHomestayId, setApplyTargetHomestayId] = useState("");
  const [applyMode, setApplyMode] = useState<"cover" | "gallery">("cover");
  const [applyingToHomestay, setApplyingToHomestay] = useState(false);

  // Form for adding media
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [targetPropertyId, setTargetPropertyId] = useState("");
  const [submittingMedia, setSubmittingMedia] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllMedia = async () => {
    try {
      setLoading(true);
      const [propsRes, artsRes, uploadsRes] = await Promise.all([
        propertiesApi.listAdminAll({ limit: 100 }).catch(() => ({ data: [] })),
        articlesApi.findAllForAdmin().catch(() => ({ data: [] })),
        fetch("/api/upload").then((r) => r.json()).catch(() => ({ files: [] })),
      ]);

      const items: MediaItem[] = [];

      // Parse Properties Images (now returns ALL images per property)
      if (propsRes && Array.isArray(propsRes.data)) {
        setPropertiesList(propsRes.data);
        propsRes.data.forEach((p: any) => {
          if (Array.isArray(p.images)) {
            p.images.forEach((img: any, idx: number) => {
              items.push({
                id: img.id || `prop-${p.id}-${idx}`,
                name: img.caption || `${p.name} #${idx + 1}`,
                url: img.imageUrl,
                sourceType: "homestay",
                sourceName: p.name,
                sourceId: p.id,
                category: p.category?.name || "Homestay",
                isCover: Boolean(img.isCover),
                dimensions: "1920 × 1080",
              });
            });
          }
        });
      }

      // Parse Articles Thumbnails
      if (artsRes && Array.isArray(artsRes.data)) {
        artsRes.data.forEach((a: any) => {
          if (a.thumbnailUrl) {
            items.push({
              id: `art-${a.id}`,
              name: a.title,
              url: a.thumbnailUrl,
              sourceType: "article",
              sourceName: a.title,
              sourceId: a.id,
              category: a.category?.name || "Artikel Editorial",
              isCover: true,
              dimensions: "1280 × 720",
            });
          }
        });
      }

      // Parse Uploads directory images (guarantees manually uploaded images always display)
      if (uploadsRes && Array.isArray(uploadsRes.files)) {
        uploadsRes.files.forEach((f: any, idx: number) => {
          const alreadyInList = items.some((it) => it.url === f.url);
          if (!alreadyInList) {
            items.push({
              id: `upload-${f.filename || idx}`,
              name: f.filename || `Foto Upload #${idx + 1}`,
              url: f.url,
              sourceType: "homestay",
              sourceName: "Pustaka Upload Mandiri",
              sourceId: "local-upload",
              category: "Upload Komputer",
              isCover: false,
              dimensions: f.size ? `${Math.round(f.size / 1024)} KB` : "Lokal",
            });
          }
        });
      }

      setMediaList(items);
      if (propsRes.data && propsRes.data.length > 0 && !targetPropertyId) {
        setTargetPropertyId(propsRes.data[0].id);
      }
    } catch (err: any) {
      console.warn("Error loading media:", err);
      showToast("error", "Gagal memuat pustaka media dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMedia();
  }, []);

  // Filtered List
  const filteredMedia = mediaList.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || m.sourceType === typeFilter;
    const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchType && matchCategory;
  });

  const homestayMediaCount = mediaList.filter((m) => m.sourceType === "homestay").length;
  const articleMediaCount = mediaList.filter((m) => m.sourceType === "article").length;

  const handleCopyLink = (url: string) => {
    if (typeof window !== "undefined") {
      const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      navigator.clipboard.writeText(fullUrl);
      showToast("success", `✓ Tautan foto berhasil disalin: ${fullUrl}`);
    }
  };

  const handleOpenApplyToHomestay = (item: MediaItem) => {
    setApplyModalItem(item);
    setApplyTargetHomestayId(propertiesList[0]?.id || "");
    setApplyMode("cover");
  };

  const handleApplyToHomestaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalItem || !applyTargetHomestayId) {
      showToast("error", "Pilih penginapan tujuan terlebih dahulu.");
      return;
    }

    setApplyingToHomestay(true);
    try {
      const freshProp = await propertiesApi.getById(applyTargetHomestayId);
      const existingUrls = (freshProp.images || []).map((img: any) => img.imageUrl);
      const targetUrl = applyModalItem.url;

      let updatedUrls: string[] = [];
      if (applyMode === "cover") {
        const withoutTarget = existingUrls.filter((u: string) => u !== targetUrl);
        updatedUrls = [targetUrl, ...withoutTarget];
      } else {
        if (!existingUrls.includes(targetUrl)) {
          updatedUrls = [...existingUrls, targetUrl];
        } else {
          updatedUrls = existingUrls;
        }
      }

      await propertiesApi.update(applyTargetHomestayId, {
        imageUrls: updatedUrls,
      });

      showToast("success", `✓ Foto berhasil dipasang ke "${freshProp.name}" sebagai ${applyMode === "cover" ? "Foto Sampul Utama" : "Galeri Foto"}!`);
      setApplyModalItem(null);
      await loadAllMedia();
    } catch (err: any) {
      showToast("error", err?.message || "Gagal memasang foto ke penginapan.");
    } finally {
      setApplyingToHomestay(false);
    }
  };

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFilePreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (validFiles.length === 0) {
      showToast("error", "Pilih file berformat gambar (JPG, PNG, WebP).");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === "file" && selectedFiles.length === 0) {
      showToast("error", "Pilih minimal satu file gambar dari komputer Anda.");
      return;
    }

    if (uploadMode === "url" && !newImageUrl.trim()) {
      showToast("error", "Masukkan tautan URL gambar valid.");
      return;
    }

    setSubmittingMedia(true);
    try {
      const newUrls: string[] = [];

      if (uploadMode === "file") {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fd = new FormData();
          fd.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          if (res.ok && data?.url) {
            newUrls.push(data.url);
          } else {
            throw new Error(data?.error || "Gagal mengunggah file gambar ke server.");
          }
        }
      } else {
        newUrls.push(newImageUrl.trim());
      }

      if (newUrls.length === 0) {
        throw new Error("Gagal memproses gambar.");
      }

      // If attached to a specific homestay
      if (targetPropertyId && targetPropertyId !== "general") {
        let existingUrls: string[] = [];
        try {
          const freshProp = await propertiesApi.getById(targetPropertyId);
          if (freshProp && Array.isArray(freshProp.images)) {
            existingUrls = freshProp.images.map((img: any) => img.imageUrl);
          }
        } catch {
          const targetProp = propertiesList.find((p) => p.id === targetPropertyId);
          if (targetProp && Array.isArray(targetProp.images)) {
            existingUrls = targetProp.images.map((img: any) => img.imageUrl);
          }
        }

        const updatedUrls = [...existingUrls, ...newUrls];
        await propertiesApi.update(targetPropertyId, {
          imageUrls: updatedUrls,
        });

        const propName = propertiesList.find((p) => p.id === targetPropertyId)?.name || "Penginapan";
        showToast("success", `✓ ${newUrls.length} foto berhasil diimpor & disimpan ke "${propName}"!`);
      } else {
        showToast("success", `✓ ${newUrls.length} foto berhasil diunggah ke Pustaka Media!`);
      }

      setSelectedFiles([]);
      setFilePreviews([]);
      setNewImageUrl("");
      setUploadModalOpen(false);
      await loadAllMedia();
    } catch (err: any) {
      showToast("error", err?.message || "Gagal mengimpor gambar ke penginapan.");
    } finally {
      setSubmittingMedia(false);
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (item.sourceType !== "homestay" && item.sourceId !== "local-upload") {
      showToast("error", "Foto artikel dikelola melalui meja editorial naskah.");
      return;
    }

    if (!confirm(`Hapus foto "${item.name}" dari pustaka media?`)) return;

    setDeletingId(item.id);
    try {
      if (item.sourceId === "local-upload" || item.url.startsWith("/uploads/")) {
        const filename = item.url.replace(/^\/uploads\//, "");
        await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
          method: "DELETE",
        });
      }

      if (item.sourceId && item.sourceId !== "local-upload") {
        const freshProp = await propertiesApi.getById(item.sourceId).catch(() => null);
        const targetProp = freshProp || propertiesList.find((p) => p.id === item.sourceId);
        if (targetProp) {
          const remainingUrls = (targetProp.images || [])
            .map((img: any) => img.imageUrl)
            .filter((url: string) => url !== item.url);

          await propertiesApi.update(item.sourceId, {
            imageUrls: remainingUrls,
          });
        }
      }

      showToast("success", `✓ Foto berhasil dihapus.`);
      await loadAllMedia();
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menghapus foto dari database.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pustaka Homestay</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-bold">Galeri & Media</span>
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Impor Foto Manual</span>
          </button>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold shadow-sm animate-in fade-in duration-150 ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold uppercase tracking-wider">
                  Asset Hub Storage
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  • Resolusi Tinggi & Responsif Web
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Pustaka Media & Galeri
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
                Arsip foto arsitektur homestay dan cover editorial naskah terhubung langsung ke basis data Adakamar.
              </p>
            </div>
          </div>

          {/* 4 Bento KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Media</span>
                <span className="p-2.5 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16]">
                  <ImageIcon className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{mediaList.length}</p>
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>100% Aktif & Siap Ditampilkan</span>
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Foto Homestay</span>
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <Building2 className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{homestayMediaCount}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Galeri kamar & sudut autentik hunian
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sampul Artikel</span>
                <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{articleMediaCount}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Cover naskah wisata & panduan Jogja
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Penyimpanan & CDN</span>
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#9f3c16] tracking-tight">Cloud CDN</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  ✓ WebP / Fast Compression
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari foto berdasarkan nama, homestay, atau artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === "all"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70"
                }`}
              >
                Semua ({mediaList.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("homestay")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === "homestay"
                    ? "bg-[#9f3c16] text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70"
                }`}
              >
                Homestay ({homestayMediaCount})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("article")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === "article"
                    ? "bg-[#9f3c16] text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70"
                }`}
              >
                Artikel ({articleMediaCount})
              </button>
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-8 h-8 text-[#9f3c16] animate-spin" />
              <p className="text-xs text-zinc-500 font-medium">
                Memuat galeri berkas media dari database...
              </p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-zinc-900">Tidak ada media yang cocok</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                {searchTerm
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : "Belum ada berkas foto yang terpasang pada listing homestay atau artikel."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 hover:shadow-lg transition-all group flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => setLightboxItem(item)}
                    className="relative h-48 overflow-hidden bg-zinc-100 cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {item.sourceType === "homestay" ? "Homestay" : "Artikel"}
                      </span>
                      {item.isCover && (
                        <span className="px-2 py-1 rounded-xl bg-[#9f3c16] text-white text-[10px] font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2.5 rounded-full bg-white/95 text-zinc-900 shadow-md">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Caption & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-zinc-900 line-clamp-1" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 flex items-center gap-1.5 font-medium">
                        {item.sourceType === "homestay" ? (
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#9f3c16]" />
                        )}
                        <span className="truncate">{item.sourceName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
                      <span className="font-mono text-[10px] bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-200/60">
                        {item.dimensions}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenApplyToHomestay(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#9f3c16] bg-[#ffdbcf]/60 hover:bg-[#ffdbcf] rounded-xl transition-all cursor-pointer shadow-2xs"
                          title="Pasang foto ini langsung ke salah satu penginapan"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>Pasang</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.url)}
                          className="p-1.5 text-zinc-500 hover:text-[#9f3c16] rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Salin Tautan Foto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-[#9f3c16] rounded-xl hover:bg-zinc-100 transition-colors"
                          title="Buka Gambar Asli"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {item.sourceType === "homestay" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus dari Homestay"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Modal Box */}
      {lightboxItem && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200/80 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-[#ffdbcf] text-[#9f3c16] text-[10px] font-bold">
                  {lightboxItem.sourceType === "homestay" ? "Penginapan" : "Artikel"}
                </span>
                <h3 className="text-sm font-bold text-zinc-950 truncate max-w-md">
                  {lightboxItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-80 rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/70 text-xs flex flex-col gap-1.5 font-mono text-zinc-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800">URL Cloud:</span>
                <button
                  onClick={() => handleCopyLink(lightboxItem.url)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9f3c16] hover:underline cursor-pointer font-sans"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Tautan</span>
                </button>
              </div>
              <span className="truncate text-[11px]">{lightboxItem.url}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>
                Sumber: <strong className="text-zinc-900">{lightboxItem.sourceName}</strong>
              </span>
              <a
                href={lightboxItem.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-[#9f3c16] hover:underline"
              >
                <span>Buka Resolusi Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal Box - Manual File Import */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">
                    Impor Foto Manual ke Galeri
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Pilih file foto langsung dari komputer Anda tanpa perlu menyalin tautan link.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFiles([]);
                  setFilePreviews([]);
                  setNewImageUrl("");
                }}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-zinc-100 rounded-2xl gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === "file"
                    ? "bg-white text-[#9f3c16] shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Pilih File Komputer (Manual)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === "url"
                    ? "bg-white text-[#9f3c16] shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Tautan URL (Opsional)</span>
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="flex flex-col gap-4 text-xs">
              {/* Target Property Select */}
              <div>
                <label className="font-bold text-zinc-800 block mb-1.5">
                  Tujuan Penyimpanan Foto <span className="text-[#9f3c16]">*</span>
                </label>
                <select
                  value={targetPropertyId}
                  onChange={(e) => setTargetPropertyId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-[#9f3c16] font-semibold cursor-pointer"
                >
                  <option value="general">
                    📁 Simpan ke Pustaka Media Bebas (Pustaka Umum)
                  </option>
                  <optgroup label="Tautkan Langsung ke Unit Homestay">
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category?.name || "Homestay"})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Pilih "Pustaka Media Bebas" jika foto ingin disimpan secara umum, atau pilih nama homestay agar langsung tampil di galeri unit tersebut.
                </p>
              </div>

              {/* MODE 1: Manual File Upload from Computer */}
              {uploadMode === "file" && (
                <div>
                  <label className="font-bold text-zinc-800 block mb-1.5">
                    Unggah File Foto dari Perangkat <span className="text-[#9f3c16]">*</span>
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesChosen(e.target.files)}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesChosen(e.dataTransfer.files);
                    }}
                    className={`w-full p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#9f3c16] bg-[#ffdbcf]/20 scale-[0.99]"
                        : "border-zinc-300 hover:border-[#9f3c16] hover:bg-[#ffdbcf]/10 bg-zinc-50/70"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/70 text-[#9f3c16] flex items-center justify-center mb-2.5 shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="font-extrabold text-sm text-zinc-900">
                      Klik untuk Pilih File Gambar
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-1">
                      atau seret & letakkan foto langsung ke area ini
                    </span>
                    <span className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-zinc-200/60 text-[10px] font-semibold text-zinc-600">
                      JPG, PNG, WEBP, GIF • Otomatis tersimpan ke pustaka
                    </span>
                  </div>

                  {/* Selected Files Preview List */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                        <span>{selectedFiles.length} file foto dipilih:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles([]);
                            setFilePreviews([]);
                          }}
                          className="text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus Semua
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                        {selectedFiles.map((f, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white p-1.5 flex flex-col gap-1 shadow-2xs"
                          >
                            <div className="w-full h-20 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center">
                              {filePreviews[idx] ? (
                                <img
                                  src={filePreviews[idx]}
                                  alt={f.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-zinc-400" />
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-800 truncate" title={f.name}>
                              {f.name}
                            </span>
                            <span className="text-[9px] text-zinc-400">
                              {(f.size / 1024).toFixed(0)} KB
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedFile(idx);
                              }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: External URL Input (Fallback) */}
              {uploadMode === "url" && (
                <div>
                  <label className="font-bold text-zinc-800 block mb-1.5">
                    URL Gambar (Cloud / HTTPS) <span className="text-[#9f3c16]">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... atau tautan CDN"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 focus:border-[#9f3c16] transition-all"
                  />
                  {newImageUrl.trim() && (
                    <div className="mt-2.5">
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                        Pratinjau Foto Langsung:
                      </label>
                      <div className="w-full h-32 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                        <img
                          src={newImageUrl}
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFiles([]);
                    setFilePreviews([]);
                    setNewImageUrl("");
                  }}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    submittingMedia ||
                    (uploadMode === "file" ? selectedFiles.length === 0 : !newImageUrl.trim())
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white font-bold shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {submittingMedia && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {uploadMode === "file"
                      ? selectedFiles.length > 0
                        ? `Impor ${selectedFiles.length} Foto ke Database`
                        : "Pilih Foto Terlebih Dahulu"
                      : "Simpan URL ke Database"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Pasang Foto Langsung ke Penginapan */}
      {applyModalItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">
                    Pasang Foto ke Penginapan
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Terapkan foto ini langsung ke listing homestay tanpa perlu salin link.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalItem(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                <img
                  src={applyModalItem.url}
                  alt={applyModalItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-zinc-900 truncate">{applyModalItem.name}</p>
                <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                  {applyModalItem.url}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-zinc-200/70 text-[10px] font-semibold text-zinc-700">
                  {applyModalItem.category}
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyToHomestaySubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-zinc-800 block mb-1.5">
                  Pilih Penginapan Target <span className="text-[#9f3c16]">*</span>
                </label>
                <select
                  required
                  value={applyTargetHomestayId}
                  onChange={(e) => setApplyTargetHomestayId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-semibold focus:outline-none focus:border-[#9f3c16] cursor-pointer"
                >
                  {propertiesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category?.name || "Homestay"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-800 block mb-1.5">
                  Posisi Penempatan Foto
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                      applyMode === "cover"
                        ? "bg-[#ffdbcf]/40 border-[#9f3c16] text-[#9f3c16] font-bold shadow-2xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      value="cover"
                      checked={applyMode === "cover"}
                      onChange={() => setApplyMode("cover")}
                      className="accent-[#9f3c16] mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col text-[11px]">
                      <span className="font-bold">Foto Sampul Utama</span>
                      <span className="text-zinc-500 font-normal">Tampil di thumbnail depan</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                      applyMode === "gallery"
                        ? "bg-[#ffdbcf]/40 border-[#9f3c16] text-[#9f3c16] font-bold shadow-2xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applyMode"
                      value="gallery"
                      checked={applyMode === "gallery"}
                      onChange={() => setApplyMode("gallery")}
                      className="accent-[#9f3c16] mt-0.5 cursor-pointer"
                    />
                    <div className="flex flex-col text-[11px]">
                      <span className="font-bold">Galeri Tambahan</span>
                      <span className="text-zinc-500 font-normal">Tambah ke koleksi foto</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApplyModalItem(null)}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={applyingToHomestay || !applyTargetHomestayId}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white font-bold shadow-md shadow-[#9f3c16]/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {applyingToHomestay && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{applyingToHomestay ? "Menerapkan..." : "Terapkan Sekarang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
