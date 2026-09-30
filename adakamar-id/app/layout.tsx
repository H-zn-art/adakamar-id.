import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "adakamar.id — Kurasi Homestay Autentik Yogyakarta",
    template: "%s | adakamar.id",
  },
  description:
    "Platform kurasi homestay autentik Yogyakarta. Temukan kamar nyaman bergaya Joglo, villa private pool, hingga penginapan budget friendly di sekitar Malioboro, Prawirotaman, dan Kaliurang.",
  keywords: [
    "homestay yogyakarta",
    "penginapan jogja",
    "villa private pool yogyakarta",
    "joglo sewa yogyakarta",
    "homestay malioboro",
    "penginapan murah jogja",
    "homestay keluarga yogyakarta",
  ],
  metadataBase: new URL("https://adakamar.id"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "adakamar.id — Kurasi Homestay Autentik Yogyakarta",
    description:
      "Rasakan kehangatan keramahan khas Jogja. Dari joglo autentik di pedesaan asri hingga private pool villa modern.",
    url: "https://adakamar.id",
    siteName: "adakamar.id",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "adakamar.id — Homestay Autentik Yogyakarta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "adakamar.id — Kurasi Homestay Autentik Yogyakarta",
    description:
      "Temukan homestay autentik di Yogyakarta. Joglo, villa, hingga penginapan budget di Malioboro dan sekitarnya.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
