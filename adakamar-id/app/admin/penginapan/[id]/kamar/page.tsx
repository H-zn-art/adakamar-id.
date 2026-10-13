"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { propertiesApi, roomTypesApi, facilitiesApi } from "@/lib/api";
import {
  Plus, Pencil, Trash2, Loader2, BedDouble,
  Users, CheckCircle2, XCircle, ArrowLeft, Save, X, Info, Check, FileUp, ImageOff,
} from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  totalUnits?: number;
  pricePerNight: number;
  facilities?: string;
  isAvailable: boolean;
  sortOrder: number;
  imageUrls?: string[];
}

function fmtRp(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

const EMPTY_FORM = {
  name: "",
  description: "",
  capacity: 2,
  totalUnits: 1,
  pricePerNight: 0,
  facilities: "",
  isAvailable: true,
  sortOrder: 0,
};

export default function KamarManagementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const propertyId = params?.id || "";

  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [availableFacilities, setAvailableFacilities] = useState<any[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [roomImageUrls, setRoomImageUrls] = useState<string[]>([]);
  const [roomPhotoUploading, setRoomPhotoUploading] = useState(false);
  const roomPhotoInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [propData, roomData, facData] = await Promise.all([
        propertiesApi.getById(propertyId),
        roomTypesApi.list(propertyId),
        facilitiesApi.list().catch(() => []),
      ]);
      setProperty(propData);
      setRooms(Array.isArray(roomData) ? roomData : []);
      if (Array.isArray(facData)) setAvailableFacilities(facData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [propertyId]);

  const openCreate = () => {
    setEditingRoom(null);
    setForm(EMPTY_FORM);
    setSelectedFacilities([]);
    setRoomImageUrls([]);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (room: RoomType) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      description: room.description || "",
      capacity: room.capacity,
      totalUnits: room.totalUnits || 1,
      pricePerNight: room.pricePerNight,
      facilities: room.facilities || "",
      isAvailable: room.isAvailable,
      sortOrder: room.sortOrder,
    });
    // Load existing images
    let imgs: string[] = [];
    if (Array.isArray(room.imageUrls)) {
      imgs = room.imageUrls.filter(Boolean);
    } else if (typeof (room as any).imageUrls === "string") {
      try { imgs = JSON.parse((room as any).imageUrls).filter(Boolean); } catch { imgs = []; }
    }
    setRoomImageUrls(imgs);
    // Parse existing facilities string back to selected array
    const existingNames = (room.facilities || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSelectedFacilities(existingNames);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRoom(null);
    setSelectedFacilities([]);
    setRoomImageUrls([]);
    setFormError("");
  };

  const toggleFacility = (name: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleRoomPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Pilih file berformat gambar (JPG, PNG, WebP).");
      return;
    }
    setRoomPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data?.url) {
        setRoomImageUrls((prev) => [...prev, data.url]);
      } else {
        alert(data?.error || "Gagal mengunggah foto.");
      }
    } catch {
      alert("Gagal mengunggah foto ke server.");
    } finally {
      setRoomPhotoUploading(false);
      if (roomPhotoInputRef.current) roomPhotoInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Nama kamar wajib diisi."); return; }
    if (!form.pricePerNight || form.pricePerNight <= 0) { setFormError("Harga per malam wajib diisi."); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        totalUnits: Math.max(1, form.totalUnits || 1),
        facilities: selectedFacilities.join(", "),
        imageUrls: roomImageUrls,
      };
      if (editingRoom) {
        await roomTypesApi.update(propertyId, editingRoom.id, payload);
      } else {
        await roomTypesApi.create(propertyId, payload);
      }
      closeModal();
      await load();
    } catch {
      setFormError("Gagal menyimpan. Periksa koneksi server.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (room: RoomType) => {
    try {
      await roomTypesApi.update(propertyId, room.id, {
        isAvailable: !room.isAvailable,
      });
      await load();
    } catch {
      alert("Gagal memperbarui status ketersediaan kamar.");
    }
  };

  const handleDelete = async (room: RoomType) => {
    if (!confirm(`Hapus tipe kamar "${room.name}"?`)) return;
    setDeleting(room.id);
    try {
      await roomTypesApi.remove(propertyId, room.id);
      await load();
    } catch {
      alert("Gagal menghapus kamar.");
    } finally {
      setDeleting(null);
    }
  };

  const availableRooms = rooms.filter(r => r.isAvailable);
  const minPrice = availableRooms.length > 0
    ? Math.min(...availableRooms.map(r => r.pricePerNight))
    : null;

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/penginapan")}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-200" />
            <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf] flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-[#9f3c16]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-zinc-900">Kelola Tipe Kamar</h1>
              {property && (
                <p className="text-xs text-zinc-400 leading-none mt-0.5">{property.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold transition-all shadow-lg shadow-[#9f3c16]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Tipe Kamar
          </button>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 p-8">

          {/* Info Banner — min price */}
          {minPrice !== null && (
            <div className="mb-6 flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-[#ffdbcf]/30 border border-[#9f3c16]/15">
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Info className="w-4 h-4 text-[#9f3c16]" />
                Harga yang ditampilkan di kartu penginapan:
              </div>
              <span className="font-extrabold text-[#9f3c16] text-sm">
                Mulai dari Rp {fmtRp(minPrice)}/malam
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#9f3c16]" />
            </div>
          ) : rooms.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-zinc-200">
              <BedDouble className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="text-base font-bold text-zinc-700 mb-1">Belum Ada Tipe Kamar</h3>
              <p className="text-xs text-zinc-400 mb-6 text-center max-w-xs">
                Tambahkan tipe kamar agar customer dapat melihat pilihan dan ketersediaan kamar saat memesan.
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#9f3c16] text-white text-sm font-bold hover:bg-[#853010] transition shadow-lg shadow-[#9f3c16]/20"
              >
                <Plus className="w-4 h-4" />
                Tambah Tipe Kamar Pertama
              </button>
            </div>
          ) : (
            /* ── Table ── */
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipe Kamar</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Kapasitas</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Jumlah Unit</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Fasilitas</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Harga/Malam</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Name & Description */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900 text-sm">{room.name}</div>
                        {room.description && (
                          <div className="text-xs text-zinc-400 mt-0.5 max-w-xs truncate">{room.description}</div>
                        )}
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-full">
                          <Users className="w-3 h-3" />
                          {room.capacity} org
                        </span>
                      </td>

                      {/* Total Units */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9f3c16] bg-[#ffdbcf]/40 px-2.5 py-1 rounded-full border border-[#9f3c16]/20">
                          <BedDouble className="w-3 h-3 text-[#9f3c16]" />
                          {room.totalUnits || 1} unit
                        </span>
                      </td>

                      {/* Facilities */}
                      <td className="px-4 py-4">
                        {room.facilities ? (
                          <div className="text-xs text-zinc-500 max-w-[200px] truncate" title={room.facilities}>
                            {room.facilities}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-300 italic">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-extrabold text-[#9f3c16] text-sm">
                          Rp {fmtRp(room.pricePerNight)}
                        </span>
                      </td>

                      {/* Status with quick toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(room)}
                          title="Klik untuk ubah status Tersedia / Penuh"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer hover:shadow-xs ${
                            room.isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                          }`}
                        >
                          {room.isAvailable
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />}
                          {room.isAvailable ? `Tersedia (${room.totalUnits || 1} unit)` : "Penuh"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(room)}
                            className="p-1.5 rounded-lg hover:bg-[#ffdbcf]/60 text-zinc-400 hover:text-[#9f3c16] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            disabled={deleting === room.id}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            {deleting === room.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table footer */}
              <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between">
                <span className="text-xs text-zinc-400">{rooms.length} tipe kamar · {availableRooms.length} tersedia</span>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3c16] hover:underline transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Tipe Kamar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modal Tambah/Edit ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ffdbcf] flex items-center justify-center">
                  <BedDouble className="w-4 h-4 text-[#9f3c16]" />
                </div>
                <h2 className="text-sm font-extrabold text-zinc-900">
                  {editingRoom ? "Edit Tipe Kamar" : "Tambah Tipe Kamar"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {formError && (
                <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Nama Tipe Kamar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Kamar Standard, Kamar VIP, Suite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Deskripsi singkat tipe kamar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm resize-none focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                />
              </div>

              {/* Capacity + Units + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Kapasitas (Orang) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: +e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Jumlah Unit Kamar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalUnits}
                    onChange={e => setForm(p => ({ ...p, totalUnits: +e.target.value }))}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Misal: 1 kamar VIP</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Harga/Malam (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={form.pricePerNight}
                    onChange={e => setForm(p => ({ ...p, pricePerNight: +e.target.value }))}
                    placeholder="500000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                  />
                  {form.pricePerNight > 0 && (
                    <p className="text-[11px] text-zinc-400 mt-1">Rp {fmtRp(form.pricePerNight)}/malam</p>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-700">Fasilitas Kamar</label>
                  {selectedFacilities.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9f3c16] text-white">
                      {selectedFacilities.length} dipilih
                    </span>
                  )}
                </div>
                {availableFacilities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {availableFacilities.map((fac: any) => {
                        const isChecked = selectedFacilities.includes(fac.name);
                        return (
                          <button
                            key={fac.id}
                            type="button"
                            onClick={() => toggleFacility(fac.name)}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-center group ${
                              isChecked
                                ? "bg-[#ffdbcf]/30 border-[#9f3c16] shadow-sm"
                                : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                            }`}
                          >
                            {isChecked && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#9f3c16] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-[#9f3c16] text-white"
                                : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                            }`}>
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                {fac.icon || "check_circle"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold leading-tight line-clamp-2 ${
                              isChecked ? "text-[#9f3c16]" : "text-zinc-600"
                            }`}>
                              {fac.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedFacilities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedFacilities([])}
                        className="mt-2 text-[10px] text-zinc-400 hover:text-rose-500 font-medium transition-colors"
                      >
                        × Hapus semua pilihan fasilitas
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={form.facilities}
                      onChange={e => setForm(p => ({ ...p, facilities: e.target.value }))}
                      placeholder="AC, TV, Kamar Mandi Dalam, Air Panas, WiFi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">Pisahkan dengan koma</p>
                  </>
                )}
              </div>

              {/* ── Foto Kamar ── */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-2">Foto Kamar</label>

                {/* Preview thumbnails */}
                {roomImageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {roomImageUrls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-16 rounded-xl overflow-hidden border border-zinc-200 group">
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setRoomImageUrls(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#9f3c16]/80 text-white text-[8px] font-bold text-center py-0.5">Utama</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* File upload button */}
                <input
                  ref={roomPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleRoomPhotoUpload(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => roomPhotoInputRef.current?.click()}
                  disabled={roomPhotoUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#9f3c16]/40 hover:bg-[#ffdbcf]/10 text-zinc-500 hover:text-[#9f3c16] text-xs font-semibold transition-all disabled:opacity-60"
                >
                  {roomPhotoUploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah foto...</>
                    : <><FileUp className="w-4 h-4" /> Pilih Foto dari Perangkat</>}
                </button>
                <p className="text-[10px] text-zinc-400 mt-1.5">Klik untuk memilih file JPG/PNG/WebP. Foto pertama = foto utama tipe kamar.</p>
              </div>

              {/* Sort + Availability */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Urutan Tampil</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={e => setForm(p => ({ ...p, sortOrder: +e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#9f3c16] focus:ring-2 focus:ring-[#9f3c16]/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, isAvailable: true }))}
                      className={`flex-1 h-10 rounded-xl text-xs font-bold border transition ${
                        form.isAvailable
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      Tersedia
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, isAvailable: false }))}
                      className={`flex-1 h-10 rounded-xl text-xs font-bold border transition ${
                        !form.isAvailable
                          ? "bg-zinc-700 text-white border-zinc-700"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      Penuh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold transition shadow-lg shadow-[#9f3c16]/20 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
