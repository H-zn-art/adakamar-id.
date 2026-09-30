"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { facilitiesApi } from "@/lib/api";

interface FacilityItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  usageCount: number;
  description: string;
}

export default function AdminFasilitasPage() {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FacilityItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Kenyamanan Ruang");
  const [formIcon, setFormIcon] = useState("star");
  const [formDesc, setFormDesc] = useState("");

  const loadFacilities = async () => {
    try {
      const data = await facilitiesApi.list();
      if (Array.isArray(data)) {
        const mapped = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          category: f.category || "Umum",
          icon: f.icon || "check_circle",
          usageCount: f._count?.properties ?? f.usageCount ?? 0,
          description: f.description || "",
        }));
        setFacilities(mapped);
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.warn("Gagal memuat fasilitas:", err);
      setFacilities([]);
    }
  };

  useEffect(() => {
    loadFacilities();
    const handleUpdate = () => {
      loadFacilities();
    };
    window.addEventListener("adakamar_facilities_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_facilities_updated", handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("Kenyamanan Ruang");
    setFormIcon("star");
    setFormDesc("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FacilityItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormIcon(item.icon);
    setFormDesc(item.description);
    setModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await facilitiesApi.update(editingItem.id, {
          name: formName,
          category: formCategory,
          icon: formIcon,
          description: formDesc,
        });
      } else {
        await facilitiesApi.create({
          name: formName,
          category: formCategory,
          icon: formIcon,
          description: formDesc,
        });
      }
      setModalOpen(false);
      await loadFacilities();
    } catch (err: any) {
      alert(`Gagal menyimpan fasilitas: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus fasilitas ini dari sistem?")) {
      try {
        await facilitiesApi.remove(id);
        await loadFacilities();
      } catch (err: any) {
        alert(`Gagal hapus: ${err?.message || "Cek koneksi backend"}`);
      }
    }
  };

  const filtered = facilities.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || f.category === selectedCategory;
    return matchSearch && matchCat;
  });

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
            <span className="material-symbols-outlined text-[14px] text-zinc-400">
              chevron_right
            </span>
            <span className="text-zinc-500">Pengelolaan Homestay</span>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">
              chevron_right
            </span>
            <span className="text-[#9f3c16] font-semibold">
              Fasilitas & Amenitas
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Tambah Fasilitas Baru</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">
                Standar Amenitas
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Fitur Kenyamanan Homestay
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Katalog Fasilitas & Amenitas
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Atur daftar amenitas standar yang dapat dipilih oleh tuan rumah saat
              mendaftarkan unit homestay di Daerah Istimewa Yogyakarta.
            </p>
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Fasilitas
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {facilities.length} Amenitas
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  category
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Paling Banyak Digunakan
                </span>
                <p className="text-base font-bold text-zinc-900 mt-1 truncate max-w-[200px]">
                  {(() => {
                    const mostUsed = [...facilities].sort((a, b) => b.usageCount - a.usageCount)[0];
                    return mostUsed ? `${mostUsed.name} (${mostUsed.usageCount} unit)` : "Belum Ada";
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  star
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Kategori
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {new Set(facilities.map(f => f.category)).size} Kategori
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  architecture
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama atau deskripsi fasilitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs font-semibold text-zinc-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="Air & Rekreasi">Air & Rekreasi</option>
              <option value="Kenyamanan Ruang">Kenyamanan Ruang</option>
              <option value="Konektivitas">Konektivitas</option>
              <option value="Arsitektur Heritage">Arsitektur Heritage</option>
              <option value="Gastronomi">Gastronomi</option>
              <option value="Aksesibilitas">Aksesibilitas</option>
            </select>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/60 border-b border-zinc-100 text-zinc-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Fasilitas</th>
                    <th className="px-5 py-4">Kategori</th>
                    <th className="px-5 py-4">Deskripsi</th>
                    <th className="px-5 py-4">Digunakan Di</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center shrink-0 border border-zinc-200/60">
                            <span className="material-symbols-outlined text-[20px]">
                              {f.icon}
                            </span>
                          </div>
                          <span className="font-bold text-zinc-900 text-xs">
                            {f.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium text-[11px]">
                          {f.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 max-w-sm leading-relaxed">
                        {f.description}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#9f3c16]">
                        {f.usageCount} homestay
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(f)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Edit Fasilitas"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(f.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-zinc-400">
                        <span className="material-symbols-outlined text-[40px] opacity-20 block mb-2">
                          category
                        </span>
                        <p className="font-semibold text-sm text-zinc-600">Belum ada fasilitas yang cocok</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Ubah kata kunci pencarian atau tambahkan fasilitas baru.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingItem ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Katalog amenitas kamar dan fasilitas umum
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Nama Fasilitas *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kolam Renang Privat"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Kategori
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                >
                  <option>Kenyamanan Ruang</option>
                  <option>Air & Rekreasi</option>
                  <option>Konektivitas</option>
                  <option>Arsitektur Heritage</option>
                  <option>Gastronomi</option>
                  <option>Aksesibilitas</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Icon (Google Material Symbol)
                </label>
                <input
                  type="text"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="pool, wifi, ac_unit, deck, etc."
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-mono text-[11px] text-zinc-800"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Penjelasan fasilitas..."
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none resize-none leading-relaxed text-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  Simpan Fasilitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
