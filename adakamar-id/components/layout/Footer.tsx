import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Heart,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

const footerLinks = {
  destinasiPopuler: [
    { label: "Malioboro & Kraton", href: "/area/malioboro-kraton" },
    { label: "Prawirotaman", href: "/area/prawirotaman" },
    { label: "Kaliurang & Merapi", href: "/area/kaliurang-merapi" },
    { label: "Kotagede Heritage", href: "/area/kotagede" },
    { label: "Sleman Pedesaan", href: "/area/sleman-pedesaan" },
    { label: "Bantul & Kasongan", href: "/area/bantul-kasongan" },
  ],
  kategori: [
    { label: "Rumah Joglo Asli", href: "/kategori/joglo-autentik" },
    { label: "Villa Kolam Renang", href: "/kategori/villa-private-pool" },
    { label: "Homestay Syariah", href: "/kategori/homestay-syariah" },
    { label: "Pondok Tepi Sawah", href: "/kategori/tepi-sawah" },
    { label: "Studio Urban", href: "/kategori/studio-urban" },
  ],
  tuanRumah: [
    { label: "Daftarkan Homestay", href: "/buka-homestay" },
    { label: "Komunitas Host Jogja", href: "/komunitas-host" },
    { label: "Standar Kebersihan", href: "/standar-kebersihan" },
    { label: "Jaminan Perlindungan", href: "/jaminan-perlindungan" },
    { label: "Kalkulator Potensi Sewa", href: "/kalkulator-sewa" },
  ],
  dukungan: [
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Pusat Bantuan 24/7", href: "/bantuan" },
    { label: "Kebijakan Pembatalan", href: "/kebijakan-pembatalan" },
    { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
    { label: "Hubungi CS WhatsApp", href: "https://wa.me/628123456789" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                adakamar<span className="text-[#ffdbcf]">.id</span>
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Platform kurasi homestay autentik nomor satu di Yogyakarta. Menghubungkan wisatawan dengan kehangatan keramahan warga lokal di seluruh penjuru Jogja.
            </p>

            {/* Value Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-white shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Terkurasi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-white shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ffdbcf]" />
                Host Terverifikasi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-white shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Konfirmasi Instan
              </span>
            </div>
          </div>

          {/* Column 2: Destinasi Populer */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Kawasan Wisata
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.destinasiPopuler.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Kategori */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Kategori Penginapan
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.kategori.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Dukungan & Host */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Dukungan & Mitra
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.dukungan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} adakamar.id — Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Jogja Istimewa.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
              Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">
              Ketentuan
            </Link>
            <Link href="/bantuan" className="hover:text-white transition-colors">
              Pusat Bantuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
