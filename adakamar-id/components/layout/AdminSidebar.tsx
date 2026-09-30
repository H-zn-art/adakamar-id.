"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sparkles,
  LayoutDashboard,
  Home,
  Waves,
  MapPin,
  Image as ImageIcon,
  FileText,
  FolderTree,
  Tag,
  Percent,
  Mail,
  Users,
  Settings,
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
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Raditya Danu");
  const [userRole, setUserRole] = useState("Administrator");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adakamar_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
        if (u.role) setUserRole(u.role === "ADMIN" ? "Super Admin" : u.role);
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

  const sections: NavSection[] = [
    {
      title: "Ringkasan",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Pengelolaan Homestay",
      items: [
        { label: "Penginapan", href: "/admin/penginapan", icon: Home },
        { label: "Kategori Properti", href: "/admin/properti/kategori", icon: FolderTree },
        { label: "Fasilitas Kamar", href: "/admin/fasilitas", icon: Waves },
        { label: "Lokasi & Peta Jogja", href: "/admin/lokasi", icon: MapPin },
        { label: "Promo & Kupon", href: "/admin/promo", icon: Percent },
        { label: "Gallery Pustaka", href: "/admin/media", icon: ImageIcon },
      ],
    },
    {
      title: "Konten & Artikel",
      items: [
        { label: "Semua Artikel", href: "/admin/artikel", icon: FileText },
        { label: "Kategori Artikel", href: "/admin/artikel/kategori", icon: FolderTree },
        { label: "Tag Artikel", href: "/admin/artikel/tag", icon: Tag },
      ],
    },
    {
      title: "Operasional Tamu",
      items: [
        { label: "Inquiry & Reservasi", href: "/admin/inquiry", icon: Mail },
      ],
    },
    {
      title: "Sistem & Keamanan",
      items: [
        { label: "Pengguna & Staf", href: "/admin/pengguna", icon: Users },
        { label: "Pengaturan Sistem", href: "/admin/pengaturan", icon: Settings },
        { label: "Profil Akun", href: "/admin/pengaturan/profil", icon: User },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-white/10 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white leading-tight tracking-tight">
                adakamar<span className="text-[#ffdbcf]">.id</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-bold uppercase tracking-wider">
                  Admin CMS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 flex flex-col gap-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 px-3 py-1">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : item.href === "/admin/artikel"
                    ? pathname === "/admin/artikel"
                    : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white font-bold shadow-lg shadow-[#9f3c16]/20 scale-[1.01]"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/70 backdrop-blur-md flex flex-col gap-3 sticky bottom-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#ffdbcf]" />
          <span>Lihat Website Tamu</span>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-zinc-400 truncate">
                {userRole}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari Admin"
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
