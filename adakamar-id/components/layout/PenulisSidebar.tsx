"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  PenSquare,
  User,
  ExternalLink,
  LogOut,
  LucideIcon,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

export default function PenulisSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Sekar Ayu Kinanti");
  const [userRole, setUserRole] = useState("Penulis Redaksi");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adakamar_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
        if (u.role) {
          setUserRole(u.role === "ADMIN" ? "Super Admin" : "Penulis Redaksi");
        }
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    document.cookie = "adakamar_token=; path=/; max-age=0";
    document.cookie = "adakamar_role=; path=/; max-age=0";
    localStorage.removeItem("adakamar_token");
    localStorage.removeItem("adakamar_user");
    router.push("/masuk");
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/penulis",
      icon: LayoutDashboard,
      active: pathname === "/penulis" || pathname === "/penulis/dashboard",
    },
    {
      label: "Artikel Saya",
      href: "/penulis/artikel",
      icon: FileText,
      active: pathname === "/penulis/artikel",
    },
    {
      label: "Tulis Naskah Baru",
      href: "/penulis/artikel/baru",
      icon: PenSquare,
      active: pathname.startsWith("/penulis/artikel/baru"),
    },
    {
      label: "Profil Penulis",
      href: "/penulis/profil",
      icon: User,
      active: pathname === "/penulis/profil",
    },
  ];

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SK";

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/10 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10">
          <Link href="/penulis" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white leading-tight tracking-tight">
                adakamar<span className="text-[#ffdbcf]">.id</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-bold uppercase tracking-wider">
                  Ruang Penulis
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 px-3 py-1">
              Menu Meja Editorial
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 group ${
                    item.active
                      ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white font-bold shadow-lg shadow-[#9f3c16]/20 scale-[1.01]"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        item.active ? "text-white" : "text-zinc-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Profile & Actions */}
      <div className="p-3 border-t border-white/10 bg-zinc-950 flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Lihat Website Tamu</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
            Tab Baru
          </span>
        </Link>

        {/* User Card */}
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{userName}</span>
              <span className="text-[10px] text-[#ffdbcf] font-medium truncate">{userRole}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar Akun"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
