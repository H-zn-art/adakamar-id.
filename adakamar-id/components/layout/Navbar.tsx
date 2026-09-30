"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Shield,
  PenSquare,
  FilePlus,
  LogIn,
  LogOut,
  User,
  Compass,
  Tag,
  BookOpen,
  Info,
  Home,
} from "lucide-react";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";

// Nav items sesuai PRD & UI: Beranda, Jelajah, Kategori, Promo, Panduan, Tentang Kami
const navItems = [
  { name: "Beranda", url: "/", icon: Home },
  { name: "Jelajah", url: "/homestay", icon: Compass },
  { name: "Kategori", url: "/kategori/semua", icon: Tag },
  { name: "Promo", url: "/promo", icon: Sparkles },
  { name: "Panduan", url: "/panduan-jogja", icon: BookOpen },
  { name: "Tentang Kami", url: "/tentang-kami", icon: Info },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Navbar() {
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Baca role dari cookie (di-set saat login)
    const role = getCookie("adakamar_role");
    setUserRole(role);
    // Baca nama user dari localStorage
    try {
      const stored = localStorage.getItem("adakamar_user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user?.name || "");
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    document.cookie = "adakamar_token=; path=/; max-age=0";
    document.cookie = "adakamar_role=; path=/; max-age=0";
    localStorage.removeItem("adakamar_token");
    localStorage.removeItem("adakamar_user");
    setUserRole(null);
    setUserName("");
    setPortalMenuOpen(false);
    window.location.href = "/";
  };

  const isLoggedIn = !!userRole;

  return (
    <>
      {/* ─── Top Floating Header Container ─── */}
      <header className="fixed top-4 sm:top-5 inset-x-0 mx-auto max-w-7xl px-4 sm:px-6 z-[9999] pointer-events-none flex items-center justify-between gap-4">
        {/* Left: Brand Capsule */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            style={{ color: "#ffffff" }}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 h-11 rounded-full bg-zinc-950/85 hover:bg-zinc-900 border border-white/15 backdrop-blur-xl shadow-2xl transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight leading-none" style={{ color: "#ffffff" }}>
                adakamar<span className="text-[#ffdbcf]">.id</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-300 hidden sm:inline" style={{ color: "#e4e4e7" }}>
                Jogja
              </span>
            </div>
          </Link>
        </div>

        {/* Center: TubelightNavBar (Desktop) */}
        <div className="hidden lg:flex items-center pointer-events-auto">
          <TubelightNavBar items={navItems} inline />
        </div>

        {/* Right: Floating Search & Auth Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={() => {
              const el = document.getElementById("search-input");
              if (el) el.focus();
            }}
            style={{ color: "#ffffff" }}
            className="hidden xl:inline-flex items-center gap-2 px-3.5 h-11 rounded-full bg-zinc-950/85 hover:bg-zinc-900 border border-white/15 backdrop-blur-xl text-white text-xs font-medium shadow-2xl transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-white" style={{ color: "#ffffff" }} />
            <span style={{ color: "#ffffff" }}>Cari</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15 font-mono" style={{ color: "#ffffff" }}>
              ⌘K
            </kbd>
          </button>

          {/* Belum login → tampilkan tombol Masuk */}
          {!isLoggedIn && (
            <Link
              href="/masuk"
              style={{ color: "#ffffff" }}
              className="inline-flex items-center justify-center px-4 h-11 rounded-full bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-semibold shadow-2xl border border-white/15 transition-all gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </Link>
          )}

          {/* Sudah login → avatar + dropdown sesuai role */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setPortalMenuOpen(!portalMenuOpen)}
                title={userName || "Menu Akun"}
                className="w-11 h-11 rounded-full bg-[#9f3c16] hover:bg-[#853010] border border-white/15 backdrop-blur-xl flex items-center justify-center text-white transition-colors shadow-2xl focus:outline-none cursor-pointer"
              >
                <User className="w-4 h-4 text-white" />
              </button>

              {portalMenuOpen && (
                <div className="absolute top-13 right-0 w-60 bg-zinc-950/95 border border-white/15 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Info user */}
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <div className="text-xs font-bold text-white truncate">{userName || "Pengguna"}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#ffdbcf] mt-0.5">
                      {userRole === "ADMIN" ? "Administrator" : "Penulis"}
                    </div>
                  </div>

                  {/* Menu khusus ADMIN */}
                  {userRole === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setPortalMenuOpen(false)}
                      style={{ color: "#ffffff" }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-[#ffdbcf]" />
                      <span>Dashboard Admin</span>
                    </Link>
                  )}

                  {/* Menu khusus PENULIS */}
                  {userRole === "PENULIS" && (
                    <>
                      <Link
                        href="/penulis"
                        onClick={() => setPortalMenuOpen(false)}
                        style={{ color: "#ffffff" }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        <PenSquare className="w-4 h-4 text-emerald-400" />
                        <span>Dashboard Penulis</span>
                      </Link>
                      <Link
                        href="/penulis/artikel/baru"
                        onClick={() => setPortalMenuOpen(false)}
                        style={{ color: "#ffffff" }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        <FilePlus className="w-4 h-4 text-amber-400" />
                        <span>Tulis Artikel Baru</span>
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-white/10 my-1" />

                  {/* Keluar */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 text-zinc-300" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ─── Mobile Bottom Tubelight Navigation ─── */}
      <div className="lg:hidden">
        <TubelightNavBar items={navItems} />
      </div>
    </>
  );
}
