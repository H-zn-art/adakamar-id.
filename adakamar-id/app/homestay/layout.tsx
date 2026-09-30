/**
 * Layout untuk halaman /homestay
 * Memberikan metadata SEO karena page.tsx adalah "use client"
 * PRD Seksi 20: SEO, canonical URL, OG tags
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Homestay Yogyakarta | adakamar.id",
  description:
    "Temukan dan bandingkan ratusan homestay, villa, dan penginapan autentik di Yogyakarta. Filter berdasarkan lokasi, kategori, fasilitas, dan harga.",
  alternates: {
    canonical: "/homestay",
  },
  openGraph: {
    title: "Cari Homestay Yogyakarta — adakamar.id",
    description:
      "Temukan ratusan homestay, villa, dan penginapan autentik di Yogyakarta. Filter berdasarkan lokasi, fasilitas, dan harga.",
    url: "https://adakamar.id/homestay",
    siteName: "adakamar.id",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Homestay Yogyakarta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cari Homestay Yogyakarta — adakamar.id",
    description: "Ratusan pilihan homestay autentik di Yogyakarta.",
    images: ["/og-image.jpg"],
  },
};

export default function HomestayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
