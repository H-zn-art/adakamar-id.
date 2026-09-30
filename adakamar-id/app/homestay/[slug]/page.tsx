import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/ui/PropertyCard";
import BookingForm from "@/components/homestay/BookingForm";
import PropertyReviewsSection from "@/components/homestay/PropertyReviewsSection";
import { PropertyJsonLd } from "@/components/seo/SeoComponents";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiBase}/api/properties/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const p = data?.property || data;
      if (p?.name) {
        return {
          title: `${p.name} | adakamar.id`,
          description: p.description?.substring(0, 160) || `${p.name} — homestay di Yogyakarta. Temukan pengalaman menginap terbaik di adakamar.id`,
          alternates: { canonical: `/homestay/${slug}` },
        };
      }
    }
  } catch {}
  return {
    title: `Homestay Yogyakarta | adakamar.id`,
    description: "Temukan homestay terbaik di Yogyakarta di adakamar.id",
    alternates: { canonical: `/homestay/${slug}` },
  };
}

// similar properties are now fetched from API

// NOTE: amenities is now built dynamically from propertyFacilities in the page component

const keistimewaan = [
  {
    icon: "local_dining",
    title: "Sarapan Tradisional Tiap Hari",
    desc: "Sarapan nasi gudeg komplet tiap Hari. Disiapkan pukul 07.00 pagi.",
  },
  {
    icon: "spa",
    title: "Afternoon Tea Tradisional",
    desc: "Ketika & wedang panas. Mataram & Jawa kuliner.",
  },
  {
    icon: "pool",
    title: "Private Renang & Gamel",
    desc: "Seluruh kampung wisata ini selalu dengan tamu yang menjamu.",
  },
];

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try to fetch real property data from backend
  let propertyId = "";
  let propertyName = "Penginapan";
  let propertyPrice = 680000;
  let propertyOriginalPrice = 950000;
  let propertyRating = 4.9;
  let propertyReviewCount = 0;
  let propertyAddress = "Yogyakarta";
  let propertyDescription = "";
  let propertyCapacity = 4;
  let propertyBedrooms = 2;
  let propertyBathrooms = 1;
  let propertyCategory = "";
  let propertyArea = "";
  let propertyImages: string[] = [];
  let propertyFacilities: string[] = [];
  let propertyWhatsapp = "";
  let propertyRules = "";
  let propertyReviews: any[] = [];
  let similarProps: any[] = [];

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiBase}/api/properties/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      // Backend returns { property: {...}, similar: [...] }
      const p = data?.property || data;
      if (p?.id) {
        propertyId = p.id;
        propertyName = p.name || propertyName;
        propertyPrice = Number(p.price) || propertyPrice;
        propertyOriginalPrice = Number(p.originalPrice) || propertyOriginalPrice;
        propertyRating = Number(p.rating) || propertyRating;
        propertyReviewCount = Number(p.reviewCount) || 0;
        propertyAddress = p.address || propertyAddress;
        propertyDescription = p.description || "";
        propertyCapacity = Number(p.capacity) || propertyCapacity;
        propertyBedrooms = Number(p.bedroomCount) || propertyBedrooms;
        propertyBathrooms = Number(p.bathroomCount) || propertyBathrooms;
        propertyCategory = p.category?.name || "";
        propertyArea = p.locationArea?.name || "";
        propertyWhatsapp = p.whatsappNumber || "";
        propertyRules = p.rules || "";
        propertyImages = (p.images || [])
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
          .map((img: any) => img.imageUrl)
          .filter(Boolean);
        propertyFacilities = (p.facilities || [])
          .map((f: any) => f.facility?.name || f.name)
          .filter(Boolean);
        propertyReviews = Array.isArray(p.reviews) ? p.reviews : [];
        // Similar properties from API response
        similarProps = (data?.similar || []).map((s: any) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          image: s.images?.[0]?.imageUrl || "",
          imageAlt: s.name,
          location: s.locationArea?.name || "Yogyakarta",
          rating: s.rating ?? 4.9,
          reviewCount: s.reviewCount ?? 0,
          price: s.price,
          originalPrice: s.originalPrice,
          capacity: [
            s.capacity ? `${s.capacity} Tamu` : "",
            s.bedroomCount ? `${s.bedroomCount} Kamar` : "",
          ].filter(Boolean).join(" · "),
        }));
      }
    }
  } catch {
    // Use static defaults if API is unavailable
  }

  // Fallback default image
  const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8";
  const mainImage = propertyImages[0] || defaultImage;
  const thumbImages = propertyImages.length > 1
    ? propertyImages.slice(1, 5)
    : [defaultImage, defaultImage, defaultImage, defaultImage];

  // Build amenities list from DB facilities
  const iconMap: Record<string, string> = {
    "wifi": "wifi", "ac": "ac_unit", "parkir": "local_parking", "kolam": "pool",
    "pool": "pool", "dapur": "kitchen", "kitchen": "kitchen", "tv": "tv",
    "kulkas": "kitchen", "laundry": "local_laundry_service", "keamanan": "security",
    "cctv": "camera_indoor", "spa": "spa", "gym": "fitness_center", "bbq": "outdoor_grill",
    "bathtub": "bathtub", "sarapan": "local_dining", "breakfast": "local_dining",
  };
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lower.includes(key)) return icon;
    }
    return "check_circle";
  };
  const amenities = propertyFacilities.length > 0
    ? propertyFacilities.map((f) => ({ icon: getIcon(f), label: f }))
    : [];

  return (
    <>
      {/* JSON-LD Structured Data for SEO — PRD Seksi 20 */}
      <PropertyJsonLd
        name={propertyName}
        description={propertyDescription || `${propertyName} — homestay di Yogyakarta`}
        image={mainImage}
        price={propertyPrice}
        rating={propertyReviewCount > 0 ? propertyRating : undefined}
        reviewCount={propertyReviewCount > 0 ? propertyReviewCount : undefined}
        address={propertyAddress}
        url={`https://adakamar.id/homestay/${slug}`}
      />
      <Navbar />
      <main
        style={{
          paddingTop: "64px",
          background: "#fbf8ff",
          minHeight: "100vh",
        }}
      >
        {/* ─── Top bar: breadcrumb + actions ─── */}
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e8e7f1",
            position: "sticky",
            top: "64px",
            zIndex: 30,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Breadcrumb */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#57423b",
                flexWrap: "wrap",
              }}
            >
              <a href="/" style={{ color: "#57423b", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>home</span>
                Beranda
              </a>
              <span style={{ color: "#dec0b7" }}>/</span>
              <a href="/homestay" style={{ color: "#57423b", textDecoration: "none" }}>Yogyakarta</a>
              {propertyArea && (
                <>
                  <span style={{ color: "#dec0b7" }}>/</span>
                  <span style={{ color: "#57423b" }}>{propertyArea}</span>
                </>
              )}
              <span style={{ color: "#dec0b7" }}>/</span>
              <span style={{ color: "#1a1b22", fontWeight: 600 }}>{propertyName}</span>
            </nav>
            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "#FDF6F3",
                  color: "#9f3c16",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>verified</span>
                Terverifikasi
              </span>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "#e8e7f1",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#1a1b22",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>share</span>
                Bagikan
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "#e8e7f1",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#1a1b22",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>favorite_border</span>
                Simpan
              </button>
            </div>
          </div>
        </div>

        {/* ─── Title section ─── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "24px 24px 0",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {propertyCategory && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "#e8e7f1",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#57423b",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {propertyCategory}
              </span>
            )}
            {propertyReviewCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "#ffdcc3",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#2f1500",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: "14px", color: "#8d4b00" }}>star</span>
                {propertyRating.toFixed(1)}
                <span style={{ fontWeight: 400, color: "#6e3900" }}>({propertyReviewCount} ulasan)</span>
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 36px)",
              fontWeight: 700,
              color: "#1a1b22",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            {propertyName}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#57423b",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "18px" }}>
                location_on
              </span>
              <span>
                {propertyAddress}
                {propertyArea && ` — ${propertyArea}`}
              </span>
              <a
                href="#peta-lokasi"
                style={{
                  color: "#9f3c16",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontSize: "13px",
                }}
              >
                Lihat di Peta ↗
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#15803D",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1b22" }}>
                Tersedia untuk Booking Langsung
              </span>
            </div>
          </div>
        </div>

        {/* ─── Photo Gallery ─── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "24px 24px 0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
            className="gallery-grid"
          >
            {/* Main image */}
            <div
              style={{
                position: "relative",
                aspectRatio: "16/10",
                overflow: "hidden",
                background: "#e8e7f1",
              }}
              className="gallery-main"
            >
              <img
                src={mainImage}
                alt={propertyName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(to top, rgba(26,27,34,0.7) 0%, transparent 60%)",
                  padding: "20px 24px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Foto Utama
                </span>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  Master Joglo & Akses Plunge Pool
                </p>
              </div>
            </div>

            {/* 4 smaller images */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
              className="gallery-thumbs"
            >
              {thumbImages.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    overflow: "hidden",
                    borderRadius: "12px",
                    background: "#e8e7f1",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={src}
                    alt={`${propertyName} foto ${i + 2}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {i === thumbImages.length - 1 && propertyImages.length > 5 && (
                    <button
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.92)",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        color: "#1a1b22",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Lihat Semua Foto ({propertyImages.length})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Main Content + Booking Widget ─── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "40px 24px 64px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "40px",
            alignItems: "start",
          }}
          className="detail-layout"
        >
          {/* ── Left: Property Info ── */}
          <div>
            {/* Host + Capacity row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "24px",
                borderBottom: "1px solid #e8e7f1",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #9f3c16, #bf542c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined filled"
                    style={{ color: "#fff", fontSize: "24px" }}
                  >
                    person
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1b22" }}>
                    Dikelola oleh Mas Danang & Mbak Ratna
                  </div>
                  <div style={{ fontSize: "13px", color: "#57423b" }}>
                    Host Lokal Bestari · Host sejak 2019 · Prawirotaman, Jogja
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "#FDF6F3",
                  border: "1px solid #F3D5CA",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#9f3c16",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  timer
                </span>
                RESPON CEPAT ≥ 3 Menit
              </div>
            </div>

            {/* Capacity icons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
                marginBottom: "32px",
              }}
              className="capacity-grid"
            >
              {[
                { icon: "group", label: `${propertyCapacity} Tamu`, sub: "Kapasitas Maksimal" },
                { icon: "bed", label: `${propertyBedrooms} Kamar Tidur`, sub: "Termasuk kamar utama" },
                { icon: "bathroom", label: `${propertyBathrooms} Kamar Mandi`, sub: "Kamar mandi dalam" },
                { icon: "location_on", label: propertyArea || "Yogyakarta", sub: "Lokasi properti" },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f4f2fd",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                    {c.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1b22" }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#57423b" }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Keistimewaan */}
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1a1b22",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                  hotel_class
                </span>
                Keistimewaan Menginap
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "12px",
                }}
                className="keistimewaan-grid"
              >
                {keistimewaan.map((k) => (
                  <div
                    key={k.title}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#FDF6F3",
                      border: "1px solid #F3D5CA",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#9f3c16", fontSize: "20px" }}
                      >
                        {k.icon}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1b22", marginBottom: "4px" }}>
                        {k.title}
                      </div>
                      <div style={{ fontSize: "13px", color: "#57423b", lineHeight: 1.5 }}>
                        {k.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "1px solid #e8e7f1" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1a1b22",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                  description
                </span>
                Tentang {propertyName}
              </h2>
              <div style={{ fontSize: "15px", color: "#57423b", lineHeight: 1.75 }}>
                {propertyDescription ? (
                  propertyDescription.split("\n").map((para, i) =>
                    para.trim() ? <p key={i} style={{ marginTop: i > 0 ? "12px" : 0 }}>{para.trim()}</p> : null
                  )
                ) : (
                  <p style={{ color: "#8a726a" }}>Deskripsi belum tersedia.</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "1px solid #e8e7f1" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1a1b22",
                    letterSpacing: "-0.01em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                    check_circle
                  </span>
                  Fasilitas Lengkap
                </h2>
                <span style={{ fontSize: "13px", color: "#9f3c16", fontWeight: 600 }}>
                  {amenities.length > 0 ? `${amenities.length} Fasilitas Tersedia` : "Fasilitas belum diisi"}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "10px",
                }}
                className="amenities-grid"
              >
                {amenities.map((a) => (
                  <div
                    key={a.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#1a1b22",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#9f3c16", fontSize: "18px", flexShrink: 0 }}
                    >
                      {a.icon}
                    </span>
                    {a.label}
                  </div>
                ))}
              </div>
              <button
                style={{
                  marginTop: "16px",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1.5px solid #dec0b7",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#1a1b22",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                Tampilkan Semua Fasilitas (31)
              </button>
            </div>

            {/* Map placeholder */}
            {/* Aturan Penginapan — PRD Seksi 7 */}
            {propertyRules && (
              <div
                style={{ paddingTop: "24px", borderTop: "1px solid #e8e7f1", marginBottom: "32px" }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1a1b22",
                    marginBottom: "16px",
                    letterSpacing: "-0.01em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                    rule
                  </span>
                  Aturan Penginapan
                </h2>
                <div
                  style={{
                    background: "#FDF6F3",
                    border: "1px solid #F3D5CA",
                    borderRadius: "16px",
                    padding: "20px 24px",
                  }}
                >
                  {propertyRules.split("\n").filter(Boolean).map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "14px",
                        color: "#57423b",
                        lineHeight: 1.6,
                        marginBottom: idx < propertyRules.split("\n").filter(Boolean).length - 1 ? "10px" : 0,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#9f3c16", fontSize: "16px", marginTop: "2px", flexShrink: 0 }}
                      >
                        arrow_right
                      </span>
                      <span>{rule.replace(/^[-•*]\s*/, "").trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              id="peta-lokasi"
              style={{ paddingTop: "24px", borderTop: "1px solid #e8e7f1", marginBottom: "32px" }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1a1b22",
                  marginBottom: "4px",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>
                  map
                </span>
                Lokasi & Lingkungan Sekitar
              </h2>
              <p style={{ fontSize: "14px", color: "#57423b", marginBottom: "16px" }}>
                {propertyArea}{propertyArea && propertyAddress ? " · " : ""}{propertyAddress}
              </p>
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #e8e7f1 0%, #dec0b7 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  color: "#57423b",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#9f3c16" }}>
                  map
                </span>
                <p style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>
                  {propertyArea || "Yogyakarta"}
                </p>
                {propertyAddress && (
                  <p style={{ fontSize: "13px", margin: 0, textAlign: "center", maxWidth: "280px" }}>
                    {propertyAddress}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((propertyAddress || propertyArea || "Yogyakarta") + " Yogyakarta")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#9f3c16",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    marginTop: "4px",
                  }}
                >
                  Buka di Google Maps ↗
                </a>
              </div>
            </div>

            {/* Reviews Section */}
            <PropertyReviewsSection
              propertyId={propertyId}
              propertySlug={slug}
              propertyName={propertyName}
              initialRating={propertyRating}
              initialReviewCount={propertyReviewCount}
              initialReviews={propertyReviews}
            />
          </div>


          {/* ── Right: Booking Widget ── */}
          <BookingForm
            propertyId={propertyId}
            propertySlug={slug}
            propertyName={propertyName}
            price={propertyPrice}
            originalPrice={propertyOriginalPrice}
            rating={propertyRating}
            reviewCount={propertyReviewCount}
          />
        </div>



        {/* ─── Similar Properties ─── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px 64px",
            borderTop: "1px solid #e8e7f1",
            paddingTop: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#1a1b22",
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}
              >
                Homestay & Villa Serupa{propertyArea ? ` di ${propertyArea}` : " di Yogyakarta"}
              </h2>
              <p style={{ fontSize: "14px", color: "#57423b" }}>
                Pilihan lain yang mungkin Anda sukai di sekitar {propertyName}.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  background: "#fff",
                  border: "1px solid #e8e7f1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1a1b22",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
              </button>
              <button
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  background: "#fff",
                  border: "1px solid #e8e7f1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1a1b22",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
              </button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
            className="similar-grid"
          >
            {similarProps.length > 0 ? (
              similarProps.map((p) => (
                <PropertyCard key={p.id} {...p} />
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", color: "#8a726a", fontSize: "14px", padding: "20px 0" }}>
                Belum ada penginapan serupa yang tersedia.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (min-width: 1024px) {
          .detail-layout { grid-template-columns: 1fr 380px !important; }
          .booking-widget { display: block !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) {
          .gallery-grid { grid-template-rows: auto !important; }
          .gallery-main { aspect-ratio: 16/9 !important; }
          .gallery-thumbs { grid-template-columns: repeat(4, 1fr) !important; }
          .keistimewaan-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .amenities-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .capacity-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .poi-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .similar-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
