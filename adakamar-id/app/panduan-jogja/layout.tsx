/**
 * Layout untuk halaman /panduan-jogja
 * Memberikan metadata SEO karena page.tsx adalah "use client"
 * PRD Seksi 20: SEO, canonical URL, OG tags
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panduan Wisata & Artikel Jogja | adakamar.id",
  description:
    "Baca panduan wisata Yogyakarta, tips menginap, rekomendasi kuliner, dan destinasi terbaik di Jogja dari kurator lokal berpengalaman.",
  alternates: {
    canonical: "/panduan-jogja",
  },
  openGraph: {
    title: "Panduan Wisata Jogja — adakamar.id",
    description:
      "Panduan wisata, tips menginap, dan rekomendasi terbaik di Yogyakarta dari kurator lokal.",
    url: "https://adakamar.id/panduan-jogja",
    siteName: "adakamar.id",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Panduan Wisata Yogyakarta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panduan Wisata Jogja — adakamar.id",
    description: "Tips wisata, rekomendasi kuliner, dan destinasi terbaik di Yogyakarta.",
    images: ["/og-image.jpg"],
  },
};

export default function PanduanJogjaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
