"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Heart,
  MessageCircle,
} from "lucide-react";

const initialCategories = [
  { name: "Villa Private Pool", slug: "villa-private-pool" },
  { name: "Joglo Autentik Heritage", slug: "joglo-autentik" },
  { name: "Limasan Pedesaan", slug: "limasan-pedesaan" },
  { name: "Family Retreat", slug: "family-retreat" },
];

export default function Footer() {
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(
            data.slice(0, 5).map((c: any) => ({
              name: c.name,
              slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Brand & Active Links Grid */}
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

          {/* Column 2: Jelajah Navigasi */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigasi Utama
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/homestay"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Jelajah Homestay
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/semua"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Kategori Penginapan
                </Link>
              </li>
              <li>
                <Link
                  href="/promo"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Promo & Voucher
                </Link>
              </li>
              <li>
                <Link
                  href="/panduan-jogja"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Panduan Wisata Jogja
                </Link>
              </li>
              <li>
                <Link
                  href="/cek-reservasi"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Cek Status Reservasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kategori Penginapan */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Kategori Pilihan
            </h4>
            <ul className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/kategori/semua"
                  className="text-xs text-[#ffdbcf] font-medium hover:underline transition-colors mt-0.5 inline-block"
                >
                  Lihat Semua Kategori →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Bantuan & Kontak */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Layanan Tamu
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/tentang-kami"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/cek-reservasi"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Lacak Reservasi
                </Link>
              </li>
              <li>
                <Link
                  href="/hubungi-kami"
                  className="text-xs text-zinc-400 hover:text-[#ffdbcf] transition-colors"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6285795445463?text=Halo%20Admin%20adakamar.id,%20saya%20butuh%20bantuan%20seputar%20pemesanan%20homestay."
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 mt-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} adakamar.id — Platform Booking Homestay Terkurasi Yogyakarta.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/homestay" className="hover:text-white transition-colors">
              Homestay
            </Link>
            <Link href="/panduan-jogja" className="hover:text-white transition-colors">
              Panduan
            </Link>
            <Link href="/cek-reservasi" className="hover:text-white transition-colors">
              Cek Reservasi
            </Link>
            <a
              href="https://wa.me/6285795445463"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              CS WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
