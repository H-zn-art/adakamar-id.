"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "adakamar_rule_templates";

interface RuleTemplate {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_RULES: RuleTemplate[] = [
  { id: "r1",  icon: "login",             label: "Check-in: mulai pukul 14.00 WIB" },
  { id: "r2",  icon: "logout",            label: "Check-out: sebelum pukul 12.00 WIB" },
  { id: "r3",  icon: "smoke_free",        label: "Dilarang merokok di dalam kamar" },
  { id: "r4",  icon: "pets",              label: "Tidak diperbolehkan membawa hewan peliharaan" },
  { id: "r5",  icon: "cleaning_services", label: "Harap jaga kebersihan area bersama" },
  { id: "r6",  icon: "badge",             label: "Tamu wajib menunjukkan identitas saat check-in" },
  { id: "r7",  icon: "celebration",       label: "Dilarang mengadakan pesta / keramaian" },
  { id: "r8",  icon: "no_drinks",         label: "Dilarang membawa minuman beralkohol" },
  { id: "r9",  icon: "volume_off",        label: "Harap menjaga ketenangan setelah pukul 22.00" },
  { id: "r10", icon: "group",             label: "Tamu maksimal sesuai kapasitas kamar" },
  { id: "r11", icon: "local_parking",     label: "Parkir kendaraan di area yang tersedia" },
  { id: "r12", icon: "handyman",          label: "Kerusakan fasilitas menjadi tanggung jawab tamu" },
  { id: "r13", icon: "no_meals",          label: "Dilarang memasak di dalam kamar" },
  { id: "r14", icon: "key",              label: "Kunci kamar dikembalikan saat check-out" },
];

function loadTemplates(): RuleTemplate[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_RULES;
}

interface Props {
  selectedRules: string[];
  onChange: (rules: string[]) => void;
  className?: string;
}

/**
 * RuleSelector — compact accordion checkbox picker.
 * Collapsed by default, expands to show the template grid.
 */
export default function RuleSelector({ selectedRules, onChange, className = "" }: Props) {
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const filtered = templates.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (label: string) => {
    onChange(
      selectedRules.includes(label)
        ? selectedRules.filter((r) => r !== label)
        : [...selectedRules, label]
    );
  };

  const selectAll = () => onChange(filtered.map((t) => t.label));
  const clearAll = () => onChange([]);

  return (
    <div className={`rounded-xl border border-zinc-200 overflow-hidden ${className}`}>
      {/* ── Header / Toggle ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9f3c16] text-[16px]">rule</span>
          <span className="text-xs font-semibold text-zinc-800">
            Pilih Peraturan
            {selectedRules.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-[#9f3c16] text-white text-[10px] font-bold">
                {selectedRules.length}
              </span>
            )}
          </span>
        </div>
        <span className={`material-symbols-outlined text-zinc-400 text-[18px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* ── Selected chips (always visible if any) ── */}
      {!open && selectedRules.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-zinc-200 bg-white">
          {selectedRules.map((r) => {
            const tpl = templates.find((t) => t.label === r);
            return (
              <span key={r}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FDF6F3] border border-[#ffdbcf] text-[10px] font-medium text-zinc-700">
                {tpl && (
                  <span className="material-symbols-outlined text-[#9f3c16] text-[11px]">{tpl.icon}</span>
                )}
                {r}
                <button type="button" onClick={(e) => { e.stopPropagation(); toggle(r); }}
                  className="ml-0.5 text-zinc-400 hover:text-rose-500 cursor-pointer leading-none">
                  <span className="material-symbols-outlined text-[11px]">close</span>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* ── Expanded panel ── */}
      {open && (
        <div className="border-t border-zinc-200 bg-white">
          {/* Search + actions */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[14px]">search</span>
              <input
                type="text"
                placeholder="Cari peraturan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#9f3c16]/30"
              />
            </div>
            <button type="button" onClick={selectAll}
              className="shrink-0 text-[10px] font-bold text-[#9f3c16] hover:underline cursor-pointer px-1">
              Semua
            </button>
            <span className="text-zinc-300 text-xs">|</span>
            <button type="button" onClick={clearAll}
              className="shrink-0 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 hover:underline cursor-pointer px-1">
              Hapus
            </button>
          </div>

          {/* Checkbox grid — 2 cols compact */}
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="col-span-2 text-center text-xs text-zinc-400 py-3">Tidak ditemukan</p>
            )}
            {filtered.map((rule) => {
              const checked = selectedRules.includes(rule.label);
              return (
                <label key={rule.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                    checked ? "bg-[#FDF6F3] border-[#9f3c16]/25" : "bg-white border-zinc-150 hover:bg-zinc-50 hover:border-zinc-200"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-[#9f3c16] border-[#9f3c16]" : "bg-white border-zinc-300"
                    }`}
                    onClick={() => toggle(rule.label)}
                  >
                    {checked && <span className="material-symbols-outlined text-white leading-none" style={{ fontSize: "10px" }}>check</span>}
                  </div>
                  {/* Icon */}
                  <span className="material-symbols-outlined text-[#9f3c16] shrink-0" style={{ fontSize: "12px" }}>
                    {rule.icon}
                  </span>
                  {/* Label */}
                  <span
                    className={`text-[10.5px] leading-snug truncate ${checked ? "font-semibold text-zinc-900" : "text-zinc-600"}`}
                    onClick={() => toggle(rule.label)}
                    title={rule.label}
                  >
                    {rule.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}