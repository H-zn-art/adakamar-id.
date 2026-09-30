"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect, lazy, Suspense } from "react";
import { locationsApi } from "@/lib/api";

// Lazy load MapPicker (Leaflet tidak bisa SSR)
const MapPicker = lazy(() => import("@/components/admin/MapPicker"));

interface LocationItem {
  id: string;
  name: string;
  regency: string;
  slug: string;
  homestayCount: number;
  landmarks: string;
  status: "active" | "inactive";
  coverUrl: string;
  lat?: number;
  lng?: number;
}

// Kawasan DIY preset untuk quick-fill
const KAWASAN_PRESETS = [
  { name: "Malioboro & Keraton", regency: "Kota Jogja", lat: -7.7956, lng: 110.3695 },
  { name: "Prawirotaman", regency: "Kota Jogja", lat: -7.8112, lng: 110.3690 },
  { name: "Sleman Utara (Kaliurang)", regency: "Sleman", lat: -7.5981, lng: 110.4296 },
  { name: "Prambanan", regency: "Sleman", lat: -7.7519, lng: 110.4914 },
  { name: "Bantul Selatan", regency: "Bantul", lat: -7.9149, lng: 110.3284 },
  { name: "Parangtritis & Pantai Selatan", regency: "Bantul", lat: -8.0228, lng: 110.3320 },
];

export default function AdminLokasiPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formRegency, setFormRegency] = useState("Kota Jogja");
  const [formSlug, setFormSlug] = useState("");
  const [formLandmarks, setFormLandmarks] = useState("");
  const [formLat, setFormLat] = useState<number>(0);
  const [formLng, setFormLng] = useState<number>(0);

  const showToast = (text: string, ok: boolean) => {
    setToastMsg({ text, ok });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadLocations = async () => {
    try {
      const data = await locationsApi.list();
      if (Array.isArray(data)) {
        const mapped: LocationItem[] = data.map((l: any) => ({
          id: l.id,
          name: l.name,
          regency: l.district || "Yogyakarta",
          slug: l.slug,
          homestayCount: l._count?.properties ?? 0,
          landmarks: l.description || "Kawasan wisata & budaya",
          status: "active",
          coverUrl:
            l.imageUrl ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDP5jY9kFbrxyaA8utKPs2zRkLLBnVNXxvjQKT3x7kGMXrFQiiXtGsgKydaaZNpoJLg_yE-t5gZDhg0LsBE6whKhZ6PNultVXtTWQ6TXo7Yz-blL9g12fJnLTBZE2D9top74-wtnGTYFNvIfL8iPCIStxme3PdkGstzu0UFGl2N4MRKVgnao-u5IkqL_z1R9b_jSkNyll1ziK77qj2c78sMQWCm0d1yyBBNE3c_P6Pq6iXiSnZtyYX3",
          lat: l.latitude ?? 0,
          lng: l.longitude ?? 0,
        }));
        setLocations(mapped);
      }
    } catch (err) {
      console.warn("API error loading locations:", err);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormRegency("Kota Jogja");
    setFormSlug("");
    setFormLandmarks("");
    setFormLat(0);
    setFormLng(0);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormRegency(item.regency);
    setFormSlug(item.slug);
    setFormLandmarks(item.landmarks);
    setFormLat(item.lat ?? 0);
    setFormLng(item.lng ?? 0);
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingItem) setFormSlug(autoSlug(name));
  };

  const applyPreset = (preset: typeof KAWASAN_PRESETS[0]) => {
    setFormName(preset.name);
    setFormRegency(preset.regency);
    setFormSlug(autoSlug(preset.name));
    setFormLat(preset.lat);
    setFormLng(preset.lng);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast("⚠ Nama kawasan wajib diisi!", false);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        district: formRegency,
        description: formLandmarks,
        latitude: formLat || undefined,
        longitude: formLng || undefined,
      };
      if (editingItem) {
        await locationsApi.update(editingItem.id, payload);
      } else {
        await locationsApi.create(payload);
      }
      setModalOpen(false);
      await loadLocations();
      showToast(
        editingItem
          ? `✓ Kawasan "${formName}" berhasil diperbarui.`
          : `✓ Kawasan "${formName}" berhasil ditambahkan.`,
        true
      );
    } catch (err: any) {
      showToast(`✕ Gagal menyimpan: ${err?.message || "Cek koneksi backend"}`, false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await locationsApi.remove(id);
      setDeleteConfirmId(null);
      await loadLocations();
      showToast("✓ Kawasan berhasil dihapus.", true);
    } catch (err: any) {
      showToast(`✕ Gagal hapus: ${err?.message || "Cek koneksi backend"}`, false);
    }
  };

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.regency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">chevron_right</span>
            <span className="text-[#9f3c16] font-semibold">Manajemen Lokasi & Area</span>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
            <span>Tambah Kawasan Baru</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">
                Geografis & Destinasi
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Titik Koordinat DIY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Area & Destinasi Wisata DIY
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Kelola pembagian wilayah kabupaten, kota, serta sub-kawasan unggulan homestay di seluruh Daerah Istimewa Yogyakarta.
            </p>
          </div>

          {/* Search bar */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari kawasan atau kabupaten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">
              Total {filtered.length} Destinasi Terdaftar
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col group"
              >
                {/* Cover image with map pin overlay if has coords */}
                <div className="relative h-48 overflow-hidden bg-zinc-100">
                  <img
                    src={item.coverUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-sm text-[#9f3c16] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-zinc-200/60">
                    {item.regency}
                  </div>
                  <div className="absolute top-3.5 right-3.5 bg-zinc-950/70 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full font-semibold">
                    {item.homestayCount} Homestay
                  </div>
                  {item.lat && item.lng ? (
                    <div className="absolute bottom-3.5 left-3.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                      {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </div>
                  ) : (
                    <div className="absolute bottom-3.5 left-3.5 bg-amber-500/85 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-semibold shadow-xs">
                      Belum ada koordinat
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#9f3c16] transition-colors">{item.name}</h3>
                    <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">
                      adakamar.id/area/{item.slug}
                    </span>
                    <p className="text-xs text-zinc-500 mt-2.5 line-clamp-2 leading-relaxed">
                      <strong className="text-zinc-700">Landmark:</strong> {item.landmarks}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-zinc-100 text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Aktif di Direktori
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                        title="Edit Kawasan"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center text-zinc-400 bg-white rounded-3xl border border-zinc-200/80">
                <span className="material-symbols-outlined text-[48px] opacity-20 block mb-3 text-zinc-400">location_off</span>
                <p className="text-sm font-semibold text-zinc-600">Belum ada kawasan yang terdaftar</p>
                <p className="text-xs text-zinc-400 mt-0.5">Tambahkan kawasan baru atau ubah kata kunci pencarian Anda.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══ MODAL BOX TAMBAH / EDIT KAWASAN ═══ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#9f3c16] via-amber-500 to-emerald-600" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 flex items-center justify-center text-[#9f3c16]">
                  <span className="material-symbols-outlined text-[18px]">
                    add_location_alt
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingItem ? "Edit Kawasan Lokasi" : "Tambah Kawasan Baru"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Klik peta untuk mengatur koordinat kawasan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">

              {/* Quick Preset Pills */}
              {!editingItem && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Isi Cepat Kawasan Populer Jogja
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {KAWASAN_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-[#ffdbcf]/50 hover:text-[#9f3c16] border border-zinc-200/80 text-[11px] font-medium text-zinc-700 transition-colors"
                      >
                        📍 {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Fields — 2 col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Nama Kawasan / Sub-Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Prawirotaman & Mergangsan"
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Kabupaten / Kota <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRegency}
                    onChange={(e) => setFormRegency(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                  >
                    <option>Kota Jogja</option>
                    <option>Sleman</option>
                    <option>Bantul</option>
                    <option>Kulon Progo</option>
                    <option>Gunungkidul</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">Slug URL</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="prawirotaman"
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-mono text-[11px] text-zinc-800"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    /area/{formSlug || "…"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Landmark Populer
                  </label>
                  <textarea
                    rows={2}
                    value={formLandmarks}
                    onChange={(e) => setFormLandmarks(e.target.value)}
                    placeholder="Tempo Gelato, Keraton, Pasar Beringharjo, dll."
                    className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none resize-none leading-relaxed text-zinc-900"
                  />
                </div>
              </div>

              {/* Koordinat display */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLat || ""}
                    onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                    placeholder="-7.7956"
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-mono text-[11px] text-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLng || ""}
                    onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                    placeholder="110.3695"
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-mono text-[11px] text-zinc-800"
                  />
                </div>
                <p className="col-span-2 text-[10px] text-zinc-400 -mt-1">
                  💡 Klik langsung di peta untuk mengisi koordinat otomatis
                </p>
              </div>

              {/* ─── PETA OPENSTREETMAP ─── */}
              <div>
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">map</span>
                  Peta Lokasi Kawasan
                  <span className="font-normal text-zinc-400 ml-1">(OpenStreetMap — klik untuk pin lokasi)</span>
                </label>
                <Suspense
                  fallback={
                    <div className="h-[280px] rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-xs text-zinc-400 gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      Memuat peta Yogyakarta...
                    </div>
                  }
                >
                  <MapPicker
                    lat={formLat}
                    lng={formLng}
                    onPick={(lat, lng) => {
                      setFormLat(lat);
                      setFormLng(lng);
                    }}
                  />
                </Suspense>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {editingItem ? "Simpan Perubahan" : "Tambah Kawasan"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM MODAL ═══ */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200/80 p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-150">
            <span className="material-symbols-outlined text-rose-600 text-[40px] block mb-3">delete_forever</span>
            <h3 className="font-bold text-zinc-900 mb-1">Hapus Kawasan?</h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              Kawasan yang dihapus tidak dapat dikembalikan. Penginapan yang terhubung mungkin kehilangan data lokasi.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold text-white flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 ${
            toastMsg.ok ? "bg-zinc-950" : "bg-rose-600"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {toastMsg.ok ? "check_circle" : "error"}
          </span>
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
