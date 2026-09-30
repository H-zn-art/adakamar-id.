"use client";

import PenulisSidebar from "@/components/layout/PenulisSidebar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition, Suspense } from "react";
import { articlesApi, articleCategoriesApi, articleTagsApi } from "@/lib/api";
import {
  ChevronRight,
  FileText,
  CheckCircle,
  Save,
  Send,
  Image as ImageIcon,
  Tag as TagIcon,
  Settings,
  X,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Table,
  Loader2,
  Sparkles,
  UploadCloud,
  Plus,
  Hash,
  Globe,
  ArrowLeft,
  Check,
} from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug?: string;
}

function PenulisArtikelEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // Form Fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug?: string }[]>([]);

  // Tags State
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Thumbnail State
  const [thumbnail, setThumbnail] = useState(
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"
  );
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Editor Refs & State
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [statusChoice, setStatusChoice] = useState<"review" | "draft">("review");
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Load Categories & Master Tags on Mount
  useEffect(() => {
    Promise.all([
      articleCategoriesApi.list().catch(() => []),
      articleTagsApi.list().catch(() => []),
    ]).then(([cats, tagsData]) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats);
        setCategoryId((prev) => prev || cats[0].id);
      }
      if (Array.isArray(tagsData) && tagsData.length > 0) {
        setAvailableTags(tagsData);
      }
    });

    // If editing existing article
    if (editId) {
      articlesApi
        .getMyArticles()
        .then((list: any[]) => {
          const found = Array.isArray(list) ? list.find((a: any) => a.id === editId) : null;
          if (found) {
            setTitle(found.title || "");
            setExcerpt(found.excerpt || "");
            setContent(found.content || "");
            if (found.categoryId) setCategoryId(found.categoryId);
            if (found.thumbnailUrl || found.thumbnail) {
              setThumbnail(found.thumbnailUrl || found.thumbnail);
            }
            if (found.tags && Array.isArray(found.tags)) {
              setSelectedTags(
                found.tags.map((t: any) => ({
                  id: t.tag?.id || t.id,
                  name: t.tag?.name || t.name,
                  slug: t.tag?.slug || t.slug,
                }))
              );
            }
            if (found.seoTitle) setSeoTitle(found.seoTitle);
            if (found.metaDescription) setMetaDescription(found.metaDescription);
          }
        })
        .catch(() => {});
    }
  }, [editId]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 160))} menit baca`;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Insert formatting into textarea
  const insertFormat = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newText =
      content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const cursor = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 10);
  };

  // Tag Management
  const handleToggleTag = (tag: TagItem) => {
    if (selectedTags.some((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase())) {
      setSelectedTags((prev) =>
        prev.filter((t) => t.id !== tag.id && t.name.toLowerCase() !== tag.name.toLowerCase())
      );
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleAddCustomTag = async () => {
    const cleanName = tagInput.trim().replace(/^#/, "");
    if (!cleanName) return;

    // Check if tag already exists in availableTags
    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      if (!selectedTags.some((t) => t.id === existing.id)) {
        setSelectedTags((prev) => [...prev, existing]);
      }
      setTagInput("");
      return;
    }

    // Create new tag in backend via articleTagsApi
    setCreatingTag(true);
    try {
      const created = await articleTagsApi.create({ name: cleanName }, "PENULIS");
      if (created && created.id) {
        setAvailableTags((prev) => [...prev, created]);
        setSelectedTags((prev) => [...prev, created]);
        showToast(`✓ Tagar #${cleanName} berhasil dibuat & dipasang!`, "success");
      }
    } catch {
      // Local fallback tag if backend creation encountered duplicate or offline
      const fallbackTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: cleanName,
      };
      setSelectedTags((prev) => [...prev, fallbackTag]);
      showToast(`Tagar #${cleanName} ditambahkan`, "success");
    } finally {
      setCreatingTag(false);
      setTagInput("");
    }
  };

  // Thumbnail File Upload
  const handleThumbUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      showToast("Format file harus berupa gambar (JPG, PNG, WebP).", "error");
      return;
    }

    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        setThumbnail(data.url);
        showToast("✓ Foto sampul berhasil diunggah dari komputer!", "success");
      } else {
        // Fallback to local DataURL
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) setThumbnail(e.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setThumbnail(e.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingThumb(false);
    }
  };

  // Save / Submit Article
  const handleSave = async (status: "review" | "draft") => {
    if (!title.trim()) {
      showToast("Judul artikel tidak boleh kosong!", "error");
      return;
    }
    if (!categoryId) {
      showToast("Pilih kategori editorial artikel terlebih dahulu!", "error");
      return;
    }

    const finalTitle = title.trim();
    setSaving(true);

    // Extract valid tagIds (filtering temporary id if any)
    const validTagIds = selectedTags
      .map((t) => t.id)
      .filter((id) => id && !id.startsWith("tag-"));

    const payload = {
      title: finalTitle,
      content: content.trim() || "Konten naskah cerita dan panduan homestay adakamar.id.",
      excerpt: excerpt.trim() || undefined,
      thumbnailUrl: thumbnail,
      categoryId: categoryId,
      tagIds: validTagIds,
      readingTime,
      seoTitle: seoTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    };

    try {
      if (editId) {
        await articlesApi.update(editId, payload, "PENULIS");
        if (status === "review") {
          await articlesApi.submitForReview(editId);
        }
      } else {
        const created = await articlesApi.create(payload, "PENULIS");
        if (status === "review" && created?.id) {
          await articlesApi.submitForReview(created.id);
        }
      }

      showToast(
        status === "review"
          ? "✓ Naskah berhasil diajukan untuk proses review redaksi!"
          : "✓ Draf naskah berhasil disimpan ke database.",
        "success"
      );

      setTimeout(() => {
        startTransition(() => {
          router.push("/penulis/artikel");
        });
      }, 1200);
    } catch (err: any) {
      const errMsg = err?.message || "Terjadi kesalahan saat menyimpan artikel.";
      showToast(`✕ Gagal menyimpan: ${errMsg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f7fb] text-zinc-900 min-h-screen flex font-sans">
      <PenulisSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/penulis/artikel"
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              title="Kembali ke Daftar Artikel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <Link href="/penulis/artikel" className="hover:text-zinc-900 transition-colors">
                Artikel Saya
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[#9f3c16] font-bold">
                {editId ? "Sunting Naskah" : "Tulis Artikel Baru"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Word Count Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 font-bold">
              <FileText className="w-3.5 h-3.5 text-[#9f3c16]" />
              <span>{wordCount} kata</span>
              <span className="text-zinc-300">•</span>
              <span>{readingTime}</span>
            </div>

            {/* Simpan Draf Button */}
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving || isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-60 shadow-2xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-zinc-500" />}
              <span>Simpan Draf</span>
            </button>

            {/* Ajukan Review Button */}
            <button
              type="button"
              onClick={() => handleSave("review")}
              disabled={saving || isPending}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ajukan Review</span>
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200 ${
              toastType === "error"
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {toastType === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Workspace Body: 2 Columns */}
        <main className="p-6 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1440px] w-full mx-auto">
          {/* Editor Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Card 1: Main Content Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-6">
              {/* Title Input */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Judul Artikel / Kurasi Naskah <span className="text-[#9f3c16]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: 10 Hidden Gem Homestay Tradisional di Bantul & Tembi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black text-zinc-950 bg-transparent border-b border-zinc-200 focus:border-[#9f3c16] pb-3 outline-none transition-colors placeholder:text-zinc-300"
                />
              </div>

              {/* Excerpt Textarea */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Ringkasan Naskah (Lead / Excerpt)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan 1-2 kalimat pengantar menarik tentang artikel ini untuk cuplikan ringkas pembaca..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-[#9f3c16] transition-all resize-none leading-relaxed placeholder:text-zinc-400"
                />
              </div>

              {/* Functional Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-zinc-50 border border-zinc-200">
                <button
                  type="button"
                  onClick={() => insertFormat("**", "**", "teks tebal")}
                  title="Tebal (Bold)"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("*", "*", "teks miring")}
                  title="Miring (Italic)"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("<u>", "</u>", "teks bergaris bawah")}
                  title="Garis Bawah (Underline)"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-zinc-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormat("\n# ", "\n", "Judul Bab")}
                  title="Heading 1"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("\n## ", "\n", "Sub-judul")}
                  title="Heading 2"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Heading2 className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-zinc-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormat("\n- ", "\n", "Poin daftar")}
                  title="Daftar Poin"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("\n1. ", "\n", "Poin nomor")}
                  title="Daftar Nomor"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("\n> ", "\n", "Kutipan panduan...")}
                  title="Kutipan (Quote)"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Quote className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-zinc-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormat("[", "](https://adakamar.id)", "Teks Tautan")}
                  title="Sisipkan Tautan"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertFormat("\n| Homestay | Lokasi | Keunggulan |\n| --- | --- | --- |\n| Omah Tembi | Bantul | Joglo 1928 |\n")
                  }
                  title="Sisipkan Tabel"
                  className="p-2 rounded-xl hover:bg-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Isi Konten Artikel <span className="text-[#9f3c16]">*</span>
                </label>
                <textarea
                  ref={contentRef}
                  rows={16}
                  placeholder="Mulai tuliskan naskah kurasi budaya atau panduan menginap di sini...&#10;&#10;Tips Editorial: Bagikan suasana autentik arsitektur omah joglo, ketenangan suasana desa, keramahan tuan rumah lokal, dan panduan akses transportasi bagi wisatawan."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-[#9f3c16] transition-all leading-relaxed font-sans placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Card 2: SEO Optimization */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                <Globe className="w-4 h-4 text-[#9f3c16]" />
                <span className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider">
                  Optimasi Mesin Pencari (SEO & Metadata)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Judul SEO (Google Search Title)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 10 Rekomendasi Homestay Jogja Nuansa Tradisional | adakamar.id"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#9f3c16]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Meta Deskripsi (Snippet Penelusuran)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ringkasan informatif yang akan dibaca pengguna saat mencari artikel ini di Google (maks. 160 karakter)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#9f3c16] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Card 1: Editorial Settings */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 text-zinc-950 font-bold text-sm">
                <Settings className="text-[#9f3c16] w-4 h-4" />
                <span>Pengaturan Naskah</span>
              </div>

              {/* Status Select */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Tujuan Pengiriman
                </label>
                <select
                  value={statusChoice}
                  onChange={(e) => setStatusChoice(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#9f3c16] cursor-pointer"
                >
                  <option value="review">Ajukan ke Redaksi Pusat (Review)</option>
                  <option value="draft">Simpan Draf Mandiri (Draf)</option>
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Kategori Editorial <span className="text-[#9f3c16]">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 outline-none focus:border-[#9f3c16] cursor-pointer"
                >
                  {categoriesList.length > 0 ? (
                    categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Memuat kategori...</option>
                  )}
                </select>
              </div>
            </div>

            {/* Card 2: Cover Photo / Thumbnail with Direct Upload */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-950 font-bold text-sm">
                  <ImageIcon className="text-[#9f3c16] w-4 h-4" />
                  <span>Foto Sampul (Thumbnail)</span>
                </div>
                <div className="flex bg-zinc-100 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setThumbMode("upload")}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      thumbMode === "upload" ? "bg-white text-[#9f3c16] shadow-2xs" : "text-zinc-500"
                    }`}
                  >
                    Unggah
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbMode("url")}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      thumbMode === "url" ? "bg-white text-[#9f3c16] shadow-2xs" : "text-zinc-500"
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>
              </div>

              {/* Mode Upload File */}
              {thumbMode === "upload" && (
                <div>
                  <input
                    type="file"
                    ref={thumbInputRef}
                    accept="image/*"
                    onChange={(e) => handleThumbUpload(e.target.files)}
                    className="hidden"
                  />
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-zinc-200 hover:border-[#9f3c16] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#ffdbcf]/10 transition-all"
                  >
                    {uploadingThumb ? (
                      <Loader2 className="w-5 h-5 text-[#9f3c16] animate-spin mb-1" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-[#9f3c16] mb-1" />
                    )}
                    <span className="text-xs font-bold text-zinc-800">
                      {uploadingThumb ? "Mengunggah foto..." : "Klik untuk Pilih Foto dari Perangkat"}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      JPG, PNG, WEBP (Maksimal 5MB)
                    </span>
                  </div>
                </div>
              )}

              {/* Mode URL */}
              {thumbMode === "url" && (
                <div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 outline-none focus:border-[#9f3c16]"
                  />
                </div>
              )}

              {/* Preview Thumbnail */}
              {thumbnail && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                  <img
                    src={thumbnail}
                    alt="Thumbnail naskah"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-[11px] font-bold shadow-md cursor-pointer hover:bg-zinc-100"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Article Tags (Fully Functional & Interactive) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-950 font-bold text-sm">
                  <TagIcon className="text-[#9f3c16] w-4 h-4" />
                  <span>Tagar & Topik Artikel</span>
                </div>
                <span className="text-[11px] font-bold text-[#9f3c16]">
                  {selectedTags.length} Dipilih
                </span>
              </div>

              {/* Input for custom tag */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tambah tagar baru..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    className="w-full h-10 pl-8 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#9f3c16]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  disabled={creatingTag || !tagInput.trim()}
                  className="px-3 h-10 rounded-xl bg-[#9f3c16] text-white text-xs font-bold hover:bg-[#853111] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {creatingTag ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Tambah</span>
                </button>
              </div>

              {/* Selected Active Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Tagar Aktif Naskah:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf] text-[#9f3c16] text-xs font-bold border border-[#9f3c16]/30 shadow-2xs"
                      >
                        <span>#{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className="hover:text-rose-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested / Available Tags from System */}
              {availableTags.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Saran Tagar Populer (Klik untuk Pasang):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.some(
                        (t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase()
                      );
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#9f3c16] text-white shadow-2xs"
                              : "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>#{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Box */}
            <div className="p-6 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSave(statusChoice)}
                disabled={saving || isPending}
                className="w-full py-3.5 bg-gradient-to-r from-[#9f3c16] to-[#bf542c] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#9f3c16]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {statusChoice === "review"
                    ? "Ajukan Naskah ke Redaksi"
                    : "Simpan Draf Naskah"}
                </span>
              </button>

              <Link
                href="/penulis/artikel"
                className="w-full py-2.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 text-xs font-bold rounded-2xl text-center transition-colors"
              >
                Batal / Kembali
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PenulisArtikelEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center text-xs text-zinc-400 font-bold">
          Memuat editor naskah...
        </div>
      }
    >
      <PenulisArtikelEditorContent />
    </Suspense>
  );
}
