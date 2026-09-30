import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo & Kupon Hemat Menginap di Jogja | adakamar.id",
  description:
    "Temukan promo dan kupon hemat untuk homestay terbaik di Yogyakarta. Cashback, diskon akhir pekan, long stay special, dan banyak penawaran eksklusif lainnya.",
};

export default function PromoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
