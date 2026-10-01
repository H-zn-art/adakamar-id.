"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { promosApi } from "@/lib/api";
import { Tag, Clock, Zap, CheckCircle2, Copy, Check, ArrowRight, ChevronDown, HelpCircle, Sparkles, Building2 } from "lucide-react";

// Placeholder images cycling for promo cards
const PROMO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBWnn9jWxGX3esTmMMN2O5wIJBXNE6yOkz8UeGmYfAjDpI5FoHH4GRJFEGpKjB6tVhvBZI8yUhSUCEitQn9y98wtDiwcuiwT2NuqjxhvIuZHDo8tYWRj1pQMKMGsy3AJSyAppIrSoYPk7aB2i1Vs1HxsQGuJXUzS5ERAU76ssxlIH7HvqU30LFUeubmXKuRiqPge-pF_lLkDaE3jx45P7I-8VRS9UupElqWTdVu1cH0aezEIPD5ma7D",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCr56NRnYCP1yoh0gas6ajq8QPz_6q_NNLErC5J7XlglzPsTl_kQYptaI81b9RjBl9ACCZ0LTRc6168XrW1pskF7E8YxxXLEXv7ilthbMJphmdiw9i5oljjnUNr9kf2usSggISVC9oyjfxOw4dAZmLQeD5AQjUvLYQeSrf-ZIzPP-00xKYwVr1rbOrl1ZhLo3Qy-msQAig2xJYMNVcR6rdVfBXXt9suiOeX21VIJykCZZyztMU6i7Ia",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDskSGVluJVRS3FB5hpqT34yu1PnuMYiOI7v_8DVTApbo15woCqbQbthIh_jcEM99PYdcv24eINNwGrr8vRY0QthjwMiShJN6vzF6ihAWSoD7-Z1Fn-O8ca8aL77_sWkNzS5VHlaoxBobHkDRdLNKCVYy_plm9UhtRqYNoYbTZI8Ml5X3TXiO0p36rzwAhwFB1OMh4NrjOYz09GTqLZr2GZf-ar0ThAOrKukR71geO84HrQfnsZT0Hp",
];
const BADGE_COLORS = ["#9f3c16", "#8d4b00", "#15803D", "#2f3038"];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function mapPromo(p: any, idx: number) {
  const badge = p.discountPercent
    ? `DISKON ${p.discountPercent}%`
    : p.discountAmount
    ? `HEMAT Rp ${Number(p.discountAmount).toLocaleString("id-ID")}`
    : p.code;
  const saving = p.discountPercent
    ? `${p.discountPercent}% OFF`
    : p.discountAmount
    ? `Rp ${Number(p.discountAmount).toLocaleString("id-ID")}`
    : "-";
  const validUntil = p.endDate ? `Hingga ${formatDate(p.endDate)}` : "Berlaku Tiap Hari";
  const minMalam = p.minTransaction
    ? `Min. transaksi Rp ${Number(p.minTransaction).toLocaleString("id-ID")}`
    : "Tanpa min. transaksi";
  const sisa = p.quota - (p.usedCount || 0);
  // PRD Seksi 10: Penginapan terkait promo
  const relatedProperties: Array<{ id: string; name: string; slug: string; imageUrl?: string; price?: number; locationName?: string }> =
    (p.properties || []).map((pp: any) => ({
      id: pp.property?.id || pp.propertyId || "",
      name: pp.property?.name || "",
      slug: pp.property?.slug || "",
      imageUrl: pp.property?.images?.[0]?.imageUrl || "",
      price: Number(pp.property?.price) || 0,
      locationName: pp.property?.locationArea?.name || "",
    })).filter((p: any) => p.name);

  return {
    id: p.id,
    image: PROMO_IMAGES[idx % PROMO_IMAGES.length],
    badge,
    badgeColor: BADGE_COLORS[idx % BADGE_COLORS.length],
    category: sisa > 0 ? `Sisa ${sisa} kuota` : "Kuota habis",
    title: p.title || `Promo ${p.code}`,
    description: p.description || "Nikmati penawaran eksklusif homestay Jogja terbaik.",
    saving,
    minMalam,
    code: p.code,
    validUntil,
    cta: "Lihat Homestay",
    relatedProperties,
  };
}

const howToSteps = [
  {
    num: "01",
    title: "Pilih Homestay Impian",
    desc: "Temukan homestay favorit sesuai selera dan anggaran dengan mudah di adakamar.id.",
  },
  {
    num: "02",
    title: "Salin & Tempel Voucher",
    desc: "Salin kode voucher dari promo pilihan dan tempel saat konfirmasi WhatsApp ke host.",
  },
  {
    num: "03",
    title: "Nikmati Potongan Langsung",
    desc: "Dapatkan harga terbaik dan nikmati menginap autentik di Yogyakarta.",
  },
];

const faqs = [
  "Apakah kode promo bisa digabungkan dengan diskon homestay lainnya?",
  "Bagaimana jika tanggal menginap saya berubah atau dijadwalkan ulang?",
  "Apakah promo ini berlaku jika saya konfirmasi via WhatsApp host?",
  "Apakah ada batasan kuota penggunaan kode promo per hari?",
];

export default function PromoPage() {
  const [promos, setPromos] = useState<ReturnType<typeof mapPromo>[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    promosApi.listActive()
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setPromos(data.map(mapPromo));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
      // Increment usedCount di backend setiap kali kupon disalin/digunakan
      try {
        await promosApi.usePromo(code);
        // Refresh daftar promo agar sisa kuota terupdate di UI
        const fresh: any[] = await promosApi.listActive().catch(() => []);
        if (Array.isArray(fresh)) {
          setPromos(fresh.map(mapPromo));
        }
      } catch {
        // Jika backend offline, tetap lanjutkan — tidak blok UI
      }
    }
  };

  const filterTabs = [
    { id: "semua", label: `Semua Promo${promos.length > 0 ? ` (${promos.length})` : ""}` },
    { id: "diskon", label: "Diskon %" },
    { id: "cashback", label: "Cashback" },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 min-h-screen bg-[#fbf8ff]">
        {/* ─── Hero Banner Promo ─── */}
        <section
          style={{
            background: "linear-gradient(135deg, #9f3c16 0%, #bf542c 50%, #8d4b00 100%)",
            padding: "48px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "320px",
              height: "320px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.15)",
                  marginBottom: "16px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#ffb59c", fontSize: "15px" }}
                >
                  local_offer
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffdbcf",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Penawaran Terbaru & Kupon Eksklusif
                </span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  marginBottom: "12px",
                }}
              >
                Promo & Kupon Hemat{" "}
                <span style={{ color: "#ffb59c" }}>Menginap di Jogja</span>
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(255,219,207,0.9)",
                  lineHeight: 1.6,
                  maxWidth: "520px",
                  marginBottom: "24px",
                }}
              >
                Nikmati liburan lebih hemat di homestay autentik dan villa private pool Jogja. Salin kode promo favoritmu dan dapatkan potongan harga terbaik.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 20px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#ffdbcf", fontSize: "18px" }}
                >
                  timer
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                  Hemat hingga <span style={{ color: "#ffb59c" }}>40% / Stay</span>
                </span>
                <span style={{ fontSize: "13px", color: "rgba(255,219,207,0.7)" }}>
                  · Update kupon: Setiap hari
                </span>
              </div>
            </div>
            {/* Flash promo card */}
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "28px",
                border: "1.5px solid rgba(255,255,255,0.2)",
                minWidth: "280px",
                maxWidth: "380px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: "#ffdbcf",
                  marginBottom: "12px",
                }}
              >
                <span
                  className="material-symbols-outlined filled"
                  style={{ color: "#9f3c16", fontSize: "13px" }}
                >
                  bolt
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9f3c16",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Flash Akhir Pekan
                </span>
                <span style={{ fontSize: "11px", color: "#57423b", marginLeft: "4px" }}>
                  Periode: 26 – 27 Okt 2025
                </span>
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: "12px",
                  lineHeight: 1.2,
                }}
              >
                Jogja Nyaman Liburan Seru
              </h2>
              <div style={{ marginBottom: "16px" }}>
                {[
                  "Termasuk Welcome Drink Wedang Uwuh",
                  "Gratis Berbincang-bincang 1:1",
                  "Bebas Biaya sarapan Tambahan",
                ].map((b) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "rgba(255,219,207,0.9)",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "15px", color: "#ffb59c" }}
                    >
                      check_circle
                    </span>
                    {b}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px dashed rgba(255,219,207,0.4)",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#ffdbcf",
                    letterSpacing: "0.06em",
                    userSelect: "all",
                    textAlign: "center",
                  }}
                >
                  JOGJANYAMAN
                </div>
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#ffdbcf",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#9f3c16",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Salin
                </button>
              </div>
              <a
                href="/homestay?promo=jogjanyaman"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#9f3c16",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Pakai Kode & Jelajahi →
              </a>
            </div>
          </div>
        </section>

        {/* ─── Filter Tabs ─── */}
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e8e7f1",
            position: "sticky",
            top: "64px",
            zIndex: 20,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              gap: "4px",
              overflowX: "auto",
            }}
            className="scrollbar-none"
          >
            {filterTabs.map((tab, i) => (
              <button
                key={tab.id}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderBottom: `2.5px solid ${i === 0 ? "#9f3c16" : "transparent"}`,
                  background: "transparent",
                  fontSize: "14px",
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? "#9f3c16" : "#57423b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Promo Cards Grid ─── */}
        <section style={{ padding: "48px 0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1a1b22",
                  letterSpacing: "-0.01em",
                  marginBottom: "6px",
                }}
              >
                Kupon Menginap Sesuai Kebutuhanmu
              </h2>
              <p style={{ fontSize: "14px", color: "#57423b" }}>
                Kombinasi promo terbaik untuk jenis menginap favorit Anda di Jogja.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
              }}
              className="promo-cards-grid"
            >
              {loading && (
                <div style={{ textAlign: "center", padding: "40px", color: "#57423b", fontSize: "14px" }}>
                  <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                  Memuat promo...
                </div>
              )}
              {!loading && promos.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#57423b", fontSize: "14px" }}>
                  <Tag className="w-3.5 h-3.5 text-[#ffb59c]" />
                  Belum ada promo aktif saat ini.
                </div>
              )}
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#ffffff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                    border: "1px solid #e8e7f1",
                    transition: "all 0.25s",
                  }}
                  className="promo-card"
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16/7",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={promo.image}
                      alt={promo.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      className="promo-img"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to right, rgba(26,27,34,0.65) 0%, transparent 70%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          background: promo.badgeColor,
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {promo.badge}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "20px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9f3c16",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      {promo.category}
                    </div>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#1a1b22",
                        marginBottom: "8px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {promo.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#57423b",
                        marginBottom: "16px",
                        lineHeight: 1.5,
                      }}
                    >
                      {promo.description}
                    </p>

                    {/* Saving + min */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          background: "#FDF6F3",
                          border: "1px solid #F3D5CA",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#9f3c16",
                        }}
                      >
                        Hemat {promo.saving}
                      </div>
                      <div
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          background: "#e8e7f1",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#57423b",
                        }}
                      >
                        {promo.minMalam}
                      </div>
                    </div>

                    {/* Code + validity */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#f4f2fd",
                        border: "1px dashed #dec0b7",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "#9f3c16", fontSize: "18px" }}
                        >
                          local_offer
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#9f3c16",
                            letterSpacing: "0.06em",
                            userSelect: "all",
                          }}
                        >
                          {promo.code}
                        </span>
                        <span style={{ fontSize: "13px", color: "#8a726a" }}>
                          · {promo.validUntil}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(promo.code)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          background: copiedCode === promo.code ? "#16a34a" : "#9f3c16",
                          color: "#fff",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          transition: "background 0.2s",
                        }}
                      >
                        {copiedCode === promo.code ? "Tersalin!" : "Salin"}
                      </button>
                    </div>

                    <a
                      href={`/homestay?promo=${promo.code.toLowerCase()}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: "#9f3c16",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {promo.cta}
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "17px" }}
                      >
                        arrow_forward
                      </span>
                    </a>

                    {/* PRD Seksi 10: Penginapan Terkait per promo */}
                    {promo.relatedProperties && promo.relatedProperties.length > 0 && (
                      <div style={{ marginTop: "16px", borderTop: "1px solid #f3d5ca", paddingTop: "16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#8a726a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#9f3c16" }}>hotel</span>
                          Penginapan Terkait ({promo.relatedProperties.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {promo.relatedProperties.slice(0, 3).map((prop) => (
                            <Link
                              key={prop.id}
                              href={`/homestay/${prop.slug}`}
                              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "10px", background: "#FDF6F3", border: "1px solid #F3D5CA", textDecoration: "none" }}
                            >
                              {prop.imageUrl ? (
                                <img src={prop.imageUrl} alt={prop.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#dec0b7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "18px" }}>hotel</span>
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1b22", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prop.name}</div>
                                <div style={{ fontSize: "11px", color: "#8a726a" }}>
                                  {prop.locationName}
                                  {prop.price && prop.price > 0 && (
                                    <span>{" · "}<span style={{ color: "#9f3c16", fontWeight: 700 }}>Rp {prop.price.toLocaleString("id-ID")}</span>/malam</span>
                                  )}
                                </div>
                              </div>
                              <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "16px", flexShrink: 0 }}>chevron_right</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How To Use ─── */}
        <section
          style={{
            background: "#f4f2fd",
            padding: "56px 0",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#9f3c16",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Panduan Cepat
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 700,
                color: "#1a1b22",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Cara Menggunakan Kode Promo adakamar.id
            </h2>
            <p style={{ fontSize: "15px", color: "#57423b", marginBottom: "40px" }}>
              Tiga langkah praktis untuk menikmati penginapan terbaik Mataram dengan harga terbaik.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
              className="howto-grid"
            >
              {howToSteps.map((step) => (
                <div
                  key={step.num}
                  style={{
                    padding: "28px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    textAlign: "left",
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background:
                        step.num === "03"
                          ? "#9f3c16"
                          : "#FDF6F3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: step.num === "03" ? "#fff" : "#9f3c16",
                      }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1b22", marginBottom: "6px" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#57423b", lineHeight: 1.6, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "28px",
                padding: "14px 20px",
                borderRadius: "10px",
                background: "#FDF6F3",
                border: "1px solid #F3D5CA",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                maxWidth: "500px",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "18px" }}>
                shield
              </span>
              <span style={{ fontSize: "13px", color: "#57423b" }}>
                Garansi Harga Transparan & Bersih — semua promo yang ada di adakamar.id selalu terotorisasi dengan etis dari warga Jogja.
              </span>
              <a
                href="/bantuan"
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#9f3c16",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Butuh Bantuan? →
              </a>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section style={{ padding: "56px 0" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#9f3c16",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              FAQ Promo
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#1a1b22",
                marginBottom: "8px",
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              Pertanyaan yang Sering Diajukan
            </h2>
            <p style={{ fontSize: "14px", color: "#57423b", marginBottom: "32px", textAlign: "center" }}>
              Semua informasi detail perihal syarat, ketentuan, dan masa berlaku voucher.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    border: "1px solid #e8e7f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#1a1b22", fontWeight: 500 }}>
                    {faq}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#57423b", fontSize: "18px", flexShrink: 0 }}
                  >
                    expand_more
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section style={{ padding: "0 0 64px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div
              style={{
                borderRadius: "20px",
                background: "linear-gradient(135deg, #1a1b22 0%, #2f3038 100%)",
                padding: "40px 36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#f1effa",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Punya Pertanyaan Khusus Terkait Pemesanan?
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(241,239,250,0.65)", lineHeight: 1.6 }}>
                  Tim concierge kami di Prawirotaman siap membantu menemukan homestay dan kupon terbaik untuk keluarga atau solo trip Anda.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href="https://wa.me/6285795445463"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: "#25d366",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chat</span>
                  Chat WhatsApp 24/7
                </a>
                <a
                  href="/homestay"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Semua Listing
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @media (min-width: 768px) {
          .promo-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .howto-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .promo-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        .promo-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          transform: translateY(-4px);
        }
        .promo-card:hover .promo-img {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}
