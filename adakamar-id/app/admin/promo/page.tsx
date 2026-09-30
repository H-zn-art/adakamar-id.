"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { promosApi, propertiesApi } from "@/lib/api";
import { ChevronRight, Plus, Ticket, Percent, Flame, Search, Edit3, Trash2, Building2, X } from "lucide-react";

interface PromoItem {
  id: string;
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minBooking: number;
  usedCount: number;
  totalQuota: number;
  validUntil: string;
  status: "active" | "expired" | "draft";
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoItem | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("percentage");
  const [formVal, setFormVal] = useState(20);
  const [formMax, setFormMax] = useState(200000);
  const [formMin, setFormMin] = useState(500000);
  const [formQuota, setFormQuota] = useState(50);
  const [formDate, setFormDate] = useState("31 Des 2025");
  // PRD Seksi 13: Pilih Penginapan terkait promo
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [propertySearch, setPropertySearch] = useState("");

  const loadPromos = async () => {
    try {
      const data = await promosApi.listAdminAll();
      if (Array.isArray(data)) {
        const mapped: PromoItem[] = data.map((p: any) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          discountType: p.discountPercent ? "percentage" : "fixed",
          discountValue: p.discountPercent || p.discountAmount || 0,
          maxDiscount: p.discountAmount || undefined,
          minBooking: p.minTransaction || 0,
          usedCount: p.usedCount || 0,
          totalQuota: p.quota || 0,
          validUntil: p.endDate ? new Date(p.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
          status: !p.isActive ? "draft" : new Date(p.endDate) < new Date() ? "expired" : "active",
        }));
        setPromos(mapped);
      } else {
        setPromos([]);
      }
    } catch (err) {
      console.warn("Gagal memuat promo:", err);
      setPromos([]);
    }
  };

  useEffect(() => {
    loadPromos();
    // Load all properties for promo linking
    propertiesApi.list({ limit: 200 }).then((res: any) => {
      if (Array.isArray(res?.data)) setAllProperties(res.data);
    }).catch(() => {});
    const handleUpdate = () => {
      loadPromos();
    };
    window.addEventListener("adakamar_promos_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_promos_updated", handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormCode("");
    setFormTitle("");
    setFormType("percentage");
    setFormVal(20);
    setFormMax(200000);
    setFormMin(500000);
    setFormQuota(50);
    setFormDate("31 Des 2025");
    setSelectedPropertyIds([]);
    setPropertySearch("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PromoItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormTitle(item.title);
    setFormType(item.discountType);
    setFormVal(item.discountValue);
    setFormMax(item.maxDiscount || 0);
    setFormMin(item.minBooking);
    setFormQuota(item.totalQuota);
    setFormDate(item.validUntil);
    setSelectedPropertyIds([]);
    setPropertySearch("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedPromoId = editingItem?.id || "";
      if (editingItem) {
        await promosApi.update(editingItem.id, {
          code: formCode.toUpperCase(),
          title: formTitle,
          discountPercent: formType === "percentage" ? Number(formVal) : null,
          discountAmount: formType === "fixed" ? Number(formVal) : null,
          minTransaction: Number(formMin) || 0,
          quota: Number(formQuota) || 100,
        });
      } else {
        const created: any = await promosApi.create({
          code: formCode.toUpperCase(),
          title: formTitle,
          discountPercent: formType === "percentage" ? Number(formVal) : null,
          discountAmount: formType === "fixed" ? Number(formVal) : null,
          minTransaction: Number(formMin) || 0,
          quota: Number(formQuota) || 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          isActive: true,
        });
        savedPromoId = created?.id || "";
      }

      // PRD Seksi 13: Simpan relasi promo ↔ penginapan
      if (savedPromoId && selectedPropertyIds.length > 0) {
        await promosApi.setPromoProperties(savedPromoId, selectedPropertyIds).catch(() => {});
      }

      setModalOpen(false);
      await loadPromos();
    } catch (err: any) {
      alert(`Gagal menyimpan promo: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kupon promo ini?")) return;
    try {
      await promosApi.remove(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Gagal hapus promo: ${err?.message || "Cek koneksi backend"}`);
    }
  };

  const filtered = promos.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Konten & Artikel</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-semibold">
              Voucher & Promo
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kupon Baru</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">
                Penawaran Spesial
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Diskon & Kampanye Musiman
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Kupon Diskon & Promo Homestay
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Atur kampanye promosi, potongan harga musiman, dan pantau
              penggunaan kode voucher oleh tamu.
            </p>
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Kupon Aktif
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {promos.filter((p) => p.status === "active").length} Kupon
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Voucher Digunakan
                </span>
                <p className="text-3xl font-extrabold text-[#9f3c16] mt-1 tracking-tight">
                  {promos.reduce((acc, p) => acc + p.usedCount, 0)} Klaim
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Promo Terpopuler
                </span>
                <p className="text-base font-bold text-zinc-900 mt-1 truncate max-w-[200px]">
                  {(() => {
                    const sortedByUsage = [...promos].sort((a, b) => b.usedCount - a.usedCount);
                    const top = sortedByUsage[0];
                    if (!top) return "Belum Ada";
                    if (top.usedCount > 0) {
                      const pct = top.totalQuota > 0 ? Math.round((top.usedCount / top.totalQuota) * 100) : 0;
                      return `${top.code} (${top.usedCount} klaim${pct > 0 ? ` • ${pct}%` : ""})`;
                    }
                    return `${top.code} (Aktif)`;
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari kode promo atau judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">
              Total {filtered.length} Kupon Terdaftar
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/60 border-b border-zinc-100 text-zinc-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Kode Kupon & Judul</th>
                    <th className="px-5 py-4">Diskon</th>
                    <th className="px-5 py-4">Min. Booking</th>
                    <th className="px-5 py-4">Pemakaian Kuota</th>
                    <th className="px-5 py-4">Berlaku Sampai</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-[#9f3c16] text-xs bg-[#ffdbcf]/60 px-2.5 py-1 rounded-md">
                          {item.code}
                        </span>
                        <h4 className="font-bold text-zinc-900 text-xs mt-1.5">
                          {item.title}
                        </h4>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-zinc-900">
                          {item.discountType === "percentage"
                            ? `${item.discountValue}%`
                            : `Rp ${item.discountValue.toLocaleString("id-ID")}`}
                        </span>
                        {item.maxDiscount && (
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            Maks. Rp {item.maxDiscount.toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-700 font-medium">
                        Rp {item.minBooking.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-zinc-800">
                          {item.usedCount} / {item.totalQuota}
                        </span>
                        <div className="w-24 bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-[#9f3c16] h-full rounded-full"
                            style={{
                              width: `${item.totalQuota > 0 ? (item.usedCount / item.totalQuota) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 font-medium">
                        {item.validUntil}
                      </td>
                      <td className="px-5 py-4">
                        {item.status === "active" ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5 w-fit border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-semibold w-fit">
                            Kedaluwarsa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-zinc-400">
                        <Ticket className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="font-semibold text-sm text-zinc-600">Belum ada kupon promo</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Klik &quot;Buat Kupon Baru&quot; untuk menambahkan kode promo ke database.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingItem ? "Edit Kupon Diskon" : "Buat Kupon Diskon Baru"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Atur parameter promo potongan harga homestay
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Kode Kupon *
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: JOGJANYAMAN"
                  className="w-full h-10 px-3.5 font-mono font-bold rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Judul Promosi *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Flash Sale Akhir Pekan"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Tipe Diskon
                  </label>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(e.target.value as "percentage" | "fixed")
                    }
                    className="w-full h-10 px-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Nilai Diskon *
                  </label>
                  <input
                    type="number"
                    required
                    value={formVal}
                    onChange={(e) => setFormVal(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Maks. Potongan (Rp)
                  </label>
                  <input
                    type="number"
                    value={formMax}
                    onChange={(e) => setFormMax(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none text-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Min. Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    value={formMin}
                    onChange={(e) => setFormMin(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none text-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Total Kuota Klaim
                  </label>
                  <input
                    type="number"
                    value={formQuota}
                    onChange={(e) => setFormQuota(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none text-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-800 block mb-1">
                    Masa Berlaku
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="31 Des 2025"
                    className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none text-zinc-800"
                  />
                </div>
              </div>

              {/* PRD Seksi 13: Pilih Penginapan Terkait */}
              <div>
                <label className="font-semibold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#9f3c16]" />
                  Penginapan Terkait
                  <span className="text-zinc-400 font-normal">(opsional)</span>
                </label>
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari penginapan..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none"
                  />
                </div>
                {/* List */}
                <div className="max-h-36 overflow-y-auto rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100">
                  {allProperties
                    .filter((p) => !propertySearch || p.name?.toLowerCase().includes(propertySearch.toLowerCase()))
                    .slice(0, 30)
                    .map((p: any) => {
                      const checked = selectedPropertyIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer hover:bg-zinc-50 text-xs transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedPropertyIds((prev) =>
                                checked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                              )
                            }
                            className="rounded-md accent-[#9f3c16] w-3.5 h-3.5"
                          />
                          <span className="flex-1 truncate font-medium text-zinc-800">{p.name}</span>
                          <span className="text-zinc-400 shrink-0 text-[11px]">{p.locationArea?.name || ""}</span>
                        </label>
                      );
                    })}
                  {allProperties.length === 0 && (
                    <div className="px-3 py-4 text-center text-zinc-400">Belum ada penginapan</div>
                  )}
                </div>
                {selectedPropertyIds.length > 0 && (
                  <p className="text-[11px] text-[#9f3c16] font-semibold mt-1.5">
                    ✓ {selectedPropertyIds.length} penginapan dipilih
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 mt-2">
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
                  Simpan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
