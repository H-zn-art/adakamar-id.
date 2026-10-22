"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface RuleTemplate {
  id: string;
  label: string;
  icon: string;
}

const AVAILABLE_ICONS: { icon: string; label: string }[] = [
  { icon: "ac_unit", label: "AC" },
  { icon: "bathroom", label: "Kamar Mandi" },
  { icon: "tv", label: "TV" },
  { icon: "kitchen", label: "Dapur" },
  { icon: "bed", label: "Kamar Tidur" },
  { icon: "hot_tub", label: "Water Heater" },
  { icon: "local_laundry_service", label: "Mesin Cuci" },
  { icon: "wifi", label: "Wi-Fi" },
  { icon: "desk", label: "Meja Kerja" },
  { icon: "router", label: "Router" },
  { icon: "pool", label: "Kolam Renang" },
  { icon: "yard", label: "Taman" },
  { icon: "spa", label: "Spa/Relaksasi" },
  { icon: "restaurant", label: "Sarapan" },
  { icon: "outdoor_grill", label: "BBQ Area" },
  { icon: "local_cafe", label: "Kafe/Kopi" },
  { icon: "local_parking", label: "Parkir" },
  { icon: "security", label: "CCTV" },
  { icon: "elevator", label: "Lift" },
  { icon: "accessible", label: "Ramah Difabel" },
  { icon: "deck", label: "Pendopo" },
  { icon: "cottage", label: "Joglo" },
  { icon: "nature", label: "Alam Terbuka" },
  { icon: "check_circle", label: "Umum" },
  { icon: "star", label: "Unggulan" },
  { icon: "pets", label: "Pet Friendly" },
  { icon: "child_friendly", label: "Ramah Anak" },
  { icon: "smoke_free", label: "Non-Merokok" },
  { icon: "login", label: "Check-in" },
  { icon: "logout", label: "Check-out" },
  { icon: "group", label: "Tamu" },
  { icon: "badge", label: "Identitas" },
  { icon: "celebration", label: "Pesta" },
  { icon: "no_drinks", label: "Minuman Keras" },
  { icon: "volume_off", label: "Ketenangan" },
  { icon: "delete_sweep", label: "Kebersihan" },
  { icon: "lock", label: "Kunci/Akses" },
  { icon: "payments", label: "Pembayaran" },
  { icon: "soup_kitchen", label: "Memasak" },
  { icon: "schedule", label: "Waktu/Jam" },
  { icon: "handyman", label: "Kerusakan" },
  { icon: "rule", label: "Peraturan" },
];

const CATEGORIES = [
  "Kenyamanan Ruang",
  "Konektivitas",
  "Air & Rekreasi",
  "Gastronomi",
  "Aksesibilitas",
  "Arsitektur Heritage",
  "Umum",
];

const DEFAULT_RULE_TEMPLATES: RuleTemplate[] = [
  { id: "r1",  label: "Check-in: mulai pukul 14.00 WIB",                       icon: "login" },
  { id: "r2",  label: "Check-out: sebelum pukul 12.00 WIB",                    icon: "logout" },
  { id: "r3",  label: "Dilarang merokok di dalam kamar",                        icon: "smoke_free" },
  { id: "r4",  label: "Tidak diperbolehkan membawa hewan peliharaan",           icon: "pets" },
  { id: "r5",  label: "Harap jaga kebersihan area bersama",                     icon: "delete_sweep" },
  { id: "r6",  label: "Tamu wajib menunjukkan identitas saat check-in",         icon: "badge" },
  { id: "r7",  label: "Dilarang mengadakan pesta / keramaian",                  icon: "celebration" },
  { id: "r8",  label: "Dilarang membawa minuman beralkohol",                    icon: "no_drinks" },
  { id: "r9",  label: "Harap menjaga ketenangan setelah pukul 22.00",           icon: "volume_off" },
  { id: "r10", label: "Tamu maksimal sesuai kapasitas kamar",                   icon: "group" },
  { id: "r11", label: "Parkir kendaraan di area yang tersedia",                 icon: "local_parking" },
  { id: "r12", label: "Kerusakan fasilitas menjadi tanggung jawab tamu",        icon: "handyman" },
  { id: "r13", label: "Dilarang memasak di dalam kamar",                        icon: "soup_kitchen" },
  { id: "r14", label: "Kunci kamar dikembalikan saat check-out",                icon: "lock" },
];

function resolveRuleIcon(rule: string): string {
  const r = rule.toLowerCase();
  if (r.includes("check-in")  || r.includes("masuk"))     return "login";
  if (r.includes("check-out") || r.includes("keluar"))    return "logout";
  if (r.includes("rokok")     || r.includes("merokok"))   return "smoke_free";
  if (r.includes("hewan")     || r.includes("binatang") || r.includes("pet")) return "pets";
  if (r.includes("pesta")     || r.includes("keramaian")) return "celebration";
  if (r.includes("alkohol")   || r.includes("miras"))     return "no_drinks";
  if (r.includes("bising")    || r.includes("tenang"))    return "volume_off";
  if (r.includes("tamu")      || r.includes("pengunjung")) return "group";
  if (r.includes("parkir")    || r.includes("kendaraan")) return "local_parking";
  if (r.includes("sampah")    || r.includes("kebersihan") || r.includes("bersih")) return "delete_sweep";
  if (r.includes("kunci")     || r.includes("akses"))     return "lock";
  if (r.includes("bayar")     || r.includes("deposit"))   return "payments";
  if (r.includes("identitas") || r.includes("ktp"))       return "badge";
  if (r.includes("masak")     || r.includes("memasak"))   return "soup_kitchen";
  if (r.includes("jam")       || r.includes("malam"))     return "schedule";
  if (r.includes("rusak")     || r.includes("kerusakan")) return "handyman";
  if (r.includes("wifi")      || r.includes("internet"))  return "wifi";
  if (r.includes("cuci")      || r.includes("laundry"))   return "local_laundry_service";
  return "check_circle";
}

const LS_KEY = "adakamar_rule_templates";
function loadRuleTemplates(): RuleTemplate[] {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch {}
  return DEFAULT_RULE_TEMPLATES;
}
function saveRuleTemplates(t: RuleTemplate[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(t)); } catch {}
}

// ─── IconPicker sub-component ─────────────────────────────────────────────
function IconPicker({
  value, onChange, search, setSearch, show, setShow, icons,
}: {
  value: string;
  onChange: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  icons: { icon: string; label: string }[];
}) {
  return (
    <div>
      <button type="button" onClick={() => setShow(!show)}
        className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-[#9f3c16]/40 bg-[#ffdbcf]/20 hover:bg-[#ffdbcf]/30 transition-colors cursor-pointer mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#9f3c16] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">{value}</span>
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-[#9f3c16] text-xs">Ikon: {value}</p>
          <p className="text-[10px] text-zinc-500">{AVAILABLE_ICONS.find((i) => i.icon === value)?.label || "Kustom"}</p>
        </div>
        <span className="material-symbols-outlined text-zinc-400 text-[18px]">{show ? "expand_less" : "expand_more"}</span>
      </button>
      {show && (
        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50 mb-2">
          <div className="p-3 border-b border-zinc-200 bg-white">
            <input type="text" placeholder="Cari ikon..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-none" />
          </div>
          <div className="grid grid-cols-6 gap-1 p-3 max-h-48 overflow-y-auto">
            {icons.map((item) => (
              <button key={item.icon} type="button" title={item.label}
                onClick={() => { onChange(item.icon); setShow(false); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${value === item.icon ? "bg-[#9f3c16] text-white" : "hover:bg-zinc-200 text-zinc-500"}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[8px] font-medium leading-none text-center line-clamp-1">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-200 bg-white">
            <label className="text-[10px] text-zinc-400 font-medium block mb-1">Atau ketik nama ikon kustom:</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="pool, wifi, ac_unit..."
              className="w-full h-8 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono focus:outline-none" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminFasilitasPage() {
  const [activeTab, setActiveTab] = useState<"fasilitas" | "peraturan">("fasilitas");

  // Fasilitas state
  const [facilities, setFacilities]             = useState<FacilityItem[]>([]);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen]               = useState(false);
  const [editingItem, setEditingItem]           = useState<FacilityItem | null>(null);
  const [showIconPicker, setShowIconPicker]     = useState(false);
  const [iconSearch, setIconSearch]             = useState("");
  const [formName, setFormName]                 = useState("");
  const [formCategory, setFormCategory]         = useState("Kenyamanan Ruang");
  const [formIcon, setFormIcon]                 = useState("check_circle");
  const [formDesc, setFormDesc]                 = useState("");

  // Peraturan state
  const [ruleTemplates, setRuleTemplates]             = useState<RuleTemplate[]>([]);
  const [ruleModalOpen, setRuleModalOpen]             = useState(false);
  const [editingRule, setEditingRule]                 = useState<RuleTemplate | null>(null);
  const [ruleFormLabel, setRuleFormLabel]             = useState("");
  const [ruleFormIcon, setRuleFormIcon]               = useState("check_circle");
  const [showRuleIconPicker, setShowRuleIconPicker]   = useState(false);
  const [ruleIconSearch, setRuleIconSearch]           = useState("");
  const [ruleSearch, setRuleSearch]                   = useState("");

  const loadFacilities = async () => {
    try {
      const data = await facilitiesApi.list();
      if (Array.isArray(data)) {
        setFacilities(data.map((f: any) => ({
          id: f.id, name: f.name, category: f.category || "Umum",
          icon: f.icon || "check_circle", usageCount: f._count?.properties ?? 0, description: f.description || "",
        })));
      } else { setFacilities([]); }
    } catch { setFacilities([]); }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "peraturan") setActiveTab("peraturan");
  }, [searchParams]);

  useEffect(() => {
    loadFacilities();
    setRuleTemplates(loadRuleTemplates());
    const h = () => loadFacilities();
    window.addEventListener("adakamar_facilities_updated", h);
    return () => window.removeEventListener("adakamar_facilities_updated", h);
  }, []);

  // Fasilitas handlers
  const handleOpenAdd = () => {
    setEditingItem(null); setFormName(""); setFormCategory("Kenyamanan Ruang");
    setFormIcon("check_circle"); setFormDesc(""); setIconSearch(""); setShowIconPicker(false); setModalOpen(true);
  };
  const handleOpenEdit = (item: FacilityItem) => {
    setEditingItem(item); setFormName(item.name); setFormCategory(item.category);
    setFormIcon(item.icon); setFormDesc(item.description); setIconSearch(""); setShowIconPicker(false); setModalOpen(true);
  };
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await facilitiesApi.update(editingItem.id, { name: formName, category: formCategory, icon: formIcon, description: formDesc });
      } else {
        await facilitiesApi.create({ name: formName, category: formCategory, icon: formIcon, description: formDesc });
      }
      setModalOpen(false); await loadFacilities();
    } catch (err: any) { alert(`Gagal menyimpan: ${err?.message || "Cek koneksi backend"}`); }
  };
  const handleDelete = async (id: string) => {
    if (confirm("Hapus fasilitas ini dari sistem?")) {
      try { await facilitiesApi.remove(id); await loadFacilities(); }
      catch (err: any) { alert(`Gagal hapus: ${err?.message}`); }
    }
  };

  // Peraturan handlers
  const handleOpenAddRule = () => {
    setEditingRule(null); setRuleFormLabel(""); setRuleFormIcon("check_circle");
    setRuleIconSearch(""); setShowRuleIconPicker(false); setRuleModalOpen(true);
  };
  const handleOpenEditRule = (rule: RuleTemplate) => {
    setEditingRule(rule); setRuleFormLabel(rule.label); setRuleFormIcon(rule.icon);
    setRuleIconSearch(""); setShowRuleIconPicker(false); setRuleModalOpen(true);
  };
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormLabel.trim()) return;
    const updated: RuleTemplate[] = editingRule
      ? ruleTemplates.map((r) => r.id === editingRule.id ? { ...r, label: ruleFormLabel.trim(), icon: ruleFormIcon } : r)
      : [...ruleTemplates, { id: `r${Date.now()}`, label: ruleFormLabel.trim(), icon: ruleFormIcon }];
    setRuleTemplates(updated); saveRuleTemplates(updated); setRuleModalOpen(false);
  };
  const handleDeleteRule = (id: string) => {
    if (confirm("Hapus template peraturan ini?")) {
      const updated = ruleTemplates.filter((r) => r.id !== id);
      setRuleTemplates(updated); saveRuleTemplates(updated);
    }
  };
  const handleResetRules = () => {
    if (confirm("Reset ke template peraturan bawaan?")) {
      setRuleTemplates(DEFAULT_RULE_TEMPLATES); saveRuleTemplates(DEFAULT_RULE_TEMPLATES);
    }
  };
  const handleRuleLabelChange = (val: string) => {
    setRuleFormLabel(val); setRuleFormIcon(resolveRuleIcon(val));
  };

  // Computed
  const filtered = facilities.filter((f) => {
    const ms = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const mc = selectedCategory === "all" || f.category === selectedCategory;
    return ms && mc;
  });
  const filteredIcons     = AVAILABLE_ICONS.filter((i) => iconSearch === "" || i.label.toLowerCase().includes(iconSearch.toLowerCase()) || i.icon.includes(iconSearch.toLowerCase()));
  const filteredRuleIcons = AVAILABLE_ICONS.filter((i) => ruleIconSearch === "" || i.label.toLowerCase().includes(ruleIconSearch.toLowerCase()) || i.icon.includes(ruleIconSearch.toLowerCase()));
  const filteredRules     = ruleTemplates.filter((r) => r.label.toLowerCase().includes(ruleSearch.toLowerCase()));

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">CMS Admin</Link>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">chevron_right</span>
            <span className="text-zinc-500">Pengelolaan Homestay</span>
            <span className="material-symbols-outlined text-[14px] text-zinc-400">chevron_right</span>
            <span className="text-[#9f3c16] font-semibold">
              {activeTab === "fasilitas" ? "Fasilitas & Amenitas" : "Peraturan Penginapan"}
            </span>
          </div>
          {activeTab === "fasilitas" ? (
            <button type="button" onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95">
              <span className="material-symbols-outlined text-[16px]">add</span><span>Tambah Fasilitas</span>
            </button>
          ) : (
            <button type="button" onClick={handleOpenAddRule}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95">
              <span className="material-symbols-outlined text-[16px]">add</span><span>Tambah Peraturan</span>
            </button>
          )}
        </header>

        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">Manajemen Homestay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Fasilitas &amp; Peraturan</h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">Kelola katalog amenitas dan template peraturan penginapan di Daerah Istimewa Yogyakarta.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-zinc-200/80 shadow-xs w-fit">
            {(["fasilitas", "peraturan"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === tab ? "bg-[#9f3c16] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>
                <span className="material-symbols-outlined text-[15px]">{tab === "fasilitas" ? "category" : "rule"}</span>
                {tab === "fasilitas" ? "Fasilitas & Amenitas" : "Peraturan Penginapan"}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                  {tab === "fasilitas" ? facilities.length : ruleTemplates.length}
                </span>
              </button>
            ))}
          </div>

          {/* ═══ TAB FASILITAS ═══ */}
          {activeTab === "fasilitas" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:border-zinc-300 transition-all">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Fasilitas</span>
                    <p className="text-3xl font-extrabold text-zinc-900 mt-1">{facilities.length} Amenitas</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">category</span>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:border-zinc-300 transition-all">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Paling Banyak Digunakan</span>
                    <p className="text-base font-bold text-zinc-900 mt-1 truncate max-w-[200px]">
                      {(() => { const m = [...facilities].sort((a, b) => b.usageCount - a.usageCount)[0]; return m ? `${m.name} (${m.usageCount} unit)` : "Belum Ada"; })()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">star</span>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between hover:border-zinc-300 transition-all">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Kategori</span>
                    <p className="text-3xl font-extrabold text-zinc-900 mt-1">{new Set(facilities.map(f => f.category)).size} Kategori</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">architecture</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
                  <input type="text" placeholder="Cari nama atau deskripsi fasilitas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", ...CATEGORIES].map((cat) => (
                    <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${selectedCategory === cat ? "bg-[#9f3c16] text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                      {cat === "all" ? "Semua" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filtered.map((f) => (
                    <div key={f.id} className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col items-center text-center p-4 gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center border border-[#ffdbcf] group-hover:bg-[#ffdbcf] transition-colors">
                        <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 text-[11px] leading-snug line-clamp-2">{f.name}</p>
                        <span className="text-[10px] text-zinc-400 font-medium mt-0.5 inline-block">{f.category}</span>
                        {f.usageCount > 0 && <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{f.usageCount} homestay</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => handleOpenEdit(f)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button type="button" onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs py-16 text-center">
                  <span className="material-symbols-outlined text-[48px] text-zinc-200 block mb-3">category</span>
                  <p className="font-semibold text-sm text-zinc-600">Belum ada fasilitas yang cocok</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Ubah kata kunci atau tambahkan fasilitas baru.</p>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB PERATURAN ═══ */}
          {activeTab === "peraturan" && (
            <>
              <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">rule</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-800">Template Peraturan Penginapan</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Kelola template peraturan yang tampil di halaman detail setiap penginapan. Setiap aturan dilengkapi icon Material Symbols.
                  </p>
                </div>
                <button type="button" onClick={handleResetRules}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-semibold shrink-0 border border-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
                  Reset Default
                </button>
              </div>

              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
                <input type="text" placeholder="Cari peraturan..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-2xl bg-white border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all" />
              </div>

              <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  {filteredRules.length} template &mdash; pratinjau tampilan di halaman detail penginapan
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                  {filteredRules.map((rule) => (
                    <div key={rule.id}
                      className="flex items-start gap-3 border border-[#f0e4df] rounded-2xl p-3 group hover:border-[#9f3c16]/30 hover:shadow-sm transition-all"
                      style={{ background: "linear-gradient(135deg, #FDF6F3 0%, #fff8f5 100%)" }}>
                      <div className="w-8 h-8 rounded-lg bg-[#ffdbcf] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[#9f3c16]" style={{ fontSize: "16px" }}>{rule.icon}</span>
                      </div>
                      <span className="flex-1 text-xs text-zinc-700 font-medium leading-relaxed pt-1">{rule.label}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button type="button" onClick={() => handleOpenEditRule(rule)} className="p-1.5 rounded-lg hover:bg-white text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button type="button" onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal Fasilitas */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{editingItem ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}</h3>
                  <p className="text-[11px] text-zinc-400">Katalog amenitas kamar dan fasilitas umum</p>
                </div>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveModal} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Nama Fasilitas *</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contoh: Kolam Renang Privat"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900" />
              </div>
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Kategori</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800">
                  <option>Kenyamanan Ruang</option><option>Air &amp; Rekreasi</option>
                  <option>Konektivitas</option><option>Arsitektur Heritage</option>
                  <option>Gastronomi</option><option>Aksesibilitas</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-800 block mb-2">Pilih Ikon</label>
                <IconPicker value={formIcon} onChange={setFormIcon} search={iconSearch} setSearch={setIconSearch}
                  show={showIconPicker} setShow={setShowIconPicker} icons={filteredIcons} />
              </div>
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Deskripsi Singkat</label>
                <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Penjelasan fasilitas..."
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none resize-none leading-relaxed text-zinc-900" />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white font-semibold shadow-sm transition-all active:scale-[0.98]">Simpan Fasilitas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Peraturan */}
      {ruleModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">rule</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{editingRule ? "Edit Peraturan" : "Tambah Peraturan Baru"}</h3>
                  <p className="text-[11px] text-zinc-400">Template peraturan penginapan dengan icon</p>
                </div>
              </div>
              <button type="button" onClick={() => setRuleModalOpen(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRule} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">Teks Peraturan *</label>
                <input type="text" required value={ruleFormLabel} onChange={(e) => handleRuleLabelChange(e.target.value)}
                  placeholder="Contoh: Dilarang merokok di dalam kamar"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900" />
                <p className="text-[10px] text-zinc-400 mt-1">Icon otomatis dari kata kunci — bisa diganti manual di bawah.</p>
              </div>
              {ruleFormLabel.trim() && (
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#f0e4df]"
                  style={{ background: "linear-gradient(135deg, #FDF6F3 0%, #fff8f5 100%)" }}>
                  <div className="w-8 h-8 rounded-lg bg-[#ffdbcf] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#9f3c16]" style={{ fontSize: "16px" }}>{ruleFormIcon}</span>
                  </div>
                  <span className="text-xs text-zinc-700 font-medium">{ruleFormLabel}</span>
                </div>
              )}
              <div>
                <label className="font-semibold text-zinc-800 block mb-2">
                  Pilih Ikon <span className="text-zinc-400 font-normal">(opsional — override otomatis)</span>
                </label>
                <IconPicker value={ruleFormIcon} onChange={setRuleFormIcon} search={ruleIconSearch} setSearch={setRuleIconSearch}
                  show={showRuleIconPicker} setShow={setShowRuleIconPicker} icons={filteredRuleIcons} />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button type="button" onClick={() => setRuleModalOpen(false)} className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white font-semibold shadow-sm transition-all active:scale-[0.98]">Simpan Peraturan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
