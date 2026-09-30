"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import { articlesApi, articleCategoriesApi } from "@/lib/api";

function mapArticle(a: any) {
  const authorName =
    a.author?.name ||
    (typeof a.author === "string" ? a.author : "Penulis Jogja");
  const dateFormatted = a.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : a.createdAt
    ? new Date(a.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";
  return {
    id: a.id,
    slug: a.slug,
    image:
      a.thumbnailUrl ||
      a.thumbnail ||
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    imageAlt: a.title,
    category:
      a.category?.name ||
      (typeof a.category === "string" ? a.category : "Artikel"),
    title: a.title,
    excerpt:
      a.excerpt ||
      "Ulasan mendalam dan rekomendasi pengalaman autentik di Yogyakarta...",
    author: authorName,
    date: dateFormatted,
    readTime: a.readingTime || a.readTime || "5 mnt baca",
  };
}

const ARTICLES_PER_PAGE = 9;

export default function PanduanJogjaPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    articleCategoriesApi
      .list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: ARTICLES_PER_PAGE,
      };
      if (search) params.search = search;
      if (activeCategory && activeCategory !== "semua")
        params.category = activeCategory;

      const res = await articlesApi.listPublic(params);
      if (res && Array.isArray(res.data)) {
        const mapped = res.data.map(mapArticle);
        setArticles(mapped);
        // Set featured as first article on page 1, no filter
        if (page === 1 && !search && activeCategory === "semua" && mapped.length > 0) {
          setFeatured(mapped[0]);
        } else if (page !== 1 || search || activeCategory !== "semua") {
          // keep featured as is when filtering/searching
        }
        const total = res.meta?.total ?? res.meta?.totalItems ?? mapped.length;
        setTotalArticles(total);
        setTotalPages(Math.ceil(total / ARTICLES_PER_PAGE));
      }
    } catch (err) {
      console.warn("Failed to fetch articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Separate featured fetch (always first published article)
  useEffect(() => {
    articlesApi
      .listPublic({ limit: 1, page: 1 })
      .then((res) => {
        if (res?.data?.[0]) {
          setFeatured(mapArticle(res.data[0]));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  // Articles to show in grid (skip featured on page 1 if no filter/search)
  const gridArticles =
    page === 1 && !search && activeCategory === "semua" && featured
      ? articles.filter((a) => a.slug !== featured.slug)
      : articles;

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 min-h-screen bg-[#fbf8ff]">
        {/* ─── Breadcrumb ─── */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#57423b",
          }}
        >
          <a href="/" style={{ color: "#57423b", textDecoration: "none" }}>Beranda</a>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          <span style={{ color: "#1a1b22", fontWeight: 600 }}>Panduan Jogja &amp; Blog</span>
          <div
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "#FDF6F3",
              border: "1px solid #F3D5CA",
              fontSize: "11px",
              fontWeight: 700,
              color: "#9f3c16",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>article</span>
            {totalArticles > 0 ? `${totalArticles} Artikel Tersedia` : "Panduan Wisata Jogja"}
          </div>
        </div>

        {/* ─── Page Header ─── */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 0" }}>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "#1a1b22",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Cerita, Panduan &amp; Inspirasi Liburan di Jogja
          </h1>
          <p style={{ fontSize: "16px", color: "#57423b", lineHeight: 1.6, maxWidth: "600px" }}>
            Temukan sudut tersembunyi, cita rasa kuliner legendaris, tata cara bertamu di kampung budaya, serta tips kurasi homestay autentik dari para penutur lokal Mataram.
          </p>
        </div>

        {/* ─── Search bar ─── */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                borderRadius: "12px",
                background: "#ffffff",
                border: "1.5px solid #e8e7f1",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                minWidth: "220px",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#8a726a", fontSize: "20px" }}>search</span>
              <input
                type="text"
                placeholder="Cari artikel, rekomendasi kuliner atau tips homestay..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "#1a1b22",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: "transparent",
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                background: "#9f3c16",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Cari Artikel →
            </button>
          </div>
        </div>

        {/* ─── Filter tabs (categories from DB) ─── */}
        <div style={{ borderBottom: "1px solid #e8e7f1", marginTop: "20px" }}>
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              gap: "0",
              overflowX: "auto",
            }}
            className="scrollbar-none"
          >
            {/* "Semua" tab */}
            <button
              onClick={() => handleCategoryChange("semua")}
              style={{
                padding: "12px 16px",
                border: "none",
                borderBottom: `2.5px solid ${activeCategory === "semua" ? "#9f3c16" : "transparent"}`,
                background: "transparent",
                fontSize: "14px",
                fontWeight: activeCategory === "semua" ? 700 : 500,
                color: activeCategory === "semua" ? "#9f3c16" : "#57423b",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              Semua {totalArticles > 0 ? totalArticles : ""}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug || cat.name)}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderBottom: `2.5px solid ${activeCategory === (cat.slug || cat.name) ? "#9f3c16" : "transparent"}`,
                  background: "transparent",
                  fontSize: "14px",
                  fontWeight: activeCategory === (cat.slug || cat.name) ? 700 : 500,
                  color: activeCategory === (cat.slug || cat.name) ? "#9f3c16" : "#57423b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Featured Article ─── */}
        {featured && page === 1 && !search && activeCategory === "semua" && (
          <section style={{ padding: "40px 0 32px" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
              <a
                href={`/panduan-jogja/${featured.slug}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
                className="featured-article"
              >
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr" }}
                  className="featured-grid"
                >
                  {/* Image */}
                  <div
                    style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}
                    className="featured-img-wrap"
                  >
                    <img
                      src={featured.image}
                      alt={featured.imageAlt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      className="featured-img"
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "999px",
                          background: "#9f3c16",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        Pilihan Editor
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#ffffff",
                          fontWeight: 600,
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        {featured.category}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#ffffff",
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
                        {featured.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h2
                      style={{
                        fontSize: "clamp(18px, 3vw, 28px)",
                        fontWeight: 800,
                        color: "#1a1b22",
                        letterSpacing: "-0.02em",
                        marginBottom: "12px",
                        lineHeight: 1.25,
                        transition: "color 0.15s",
                      }}
                      className="featured-title"
                    >
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: "15px", color: "#57423b", lineHeight: 1.65, marginBottom: "20px" }}>
                      {featured.excerpt}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "999px",
                          background: "linear-gradient(135deg, #9f3c16, #bf542c)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="material-symbols-outlined filled" style={{ color: "#fff", fontSize: "18px" }}>person</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1b22" }}>{featured.author}</div>
                        <div style={{ fontSize: "12px", color: "#57423b" }}>
                          Tim Kurator Mataram · {featured.date}
                        </div>
                      </div>
                      <span
                        style={{
                          marginLeft: "auto",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          background: "#9f3c16",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        Baca Selengkapnya
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* ─── Articles Grid ─── */}
        <section style={{ padding: "0 0 48px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1b22", letterSpacing: "-0.01em" }}>
                {search ? `Hasil pencarian "${search}"` : activeCategory !== "semua" ? `Artikel: ${activeCategory}` : "Artikel Terbaru"}
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#8a726a" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "12px", opacity: 0.4 }}>hourglass_top</span>
                <p style={{ fontSize: "14px" }}>Memuat artikel...</p>
              </div>
            ) : gridArticles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#8a726a" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "12px", opacity: 0.3 }}>article</span>
                <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Belum ada artikel</p>
                <p style={{ fontSize: "14px", opacity: 0.7 }}>
                  {search ? "Coba kata kunci lain" : "Belum ada artikel yang dipublikasikan untuk kategori ini"}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "24px",
                  marginBottom: "40px",
                }}
                className="articles-main-grid"
              >
                {gridArticles.map((a) => (
                  <ArticleCard key={a.id || a.slug} {...a} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "40px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "#fff",
                    border: "1px solid #e8e7f1",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    color: page <= 1 ? "#c0b8b3" : "#57423b",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  ← Sebelumnya
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current
                  let startPage = Math.max(1, page - 2);
                  if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
                  return startPage + i;
                }).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: n === page ? "#9f3c16" : "#fff",
                      border: "1px solid",
                      borderColor: n === page ? "#9f3c16" : "#e8e7f1",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      color: n === page ? "#fff" : "#1a1b22",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span style={{ color: "#8a726a" }}>...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#fff",
                        border: "1px solid #e8e7f1",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#1a1b22",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "#fff",
                    border: "1px solid #e8e7f1",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                    color: page >= totalPages ? "#c0b8b3" : "#57423b",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Berikutnya →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── Newsletter CTA ─── */}
        <section style={{ background: "linear-gradient(135deg, #9f3c16 0%, #8d4b00 100%)", padding: "56px 0" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
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
              <span className="material-symbols-outlined" style={{ color: "#ffdbcf", fontSize: "14px" }}>mail</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffdbcf", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Buletin Mingguan Mataram
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              Dapatkan Panduan Wisata Rahasia Jogja via Email Setiap Pekan
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,219,207,0.85)", marginBottom: "28px", lineHeight: 1.6 }}>
              Gratis e-Book panduan &ldquo;50 Lokasi Wisata &amp; Homestay Autentik yang Belum Viral&rdquo; begitu Anda mendaftarkan alamat email Anda. Tanpa spam, cukup tulis.
            </p>
            <div style={{ display: "flex", gap: "8px", maxWidth: "440px", margin: "0 auto" }}>
              <input
                type="email"
                placeholder="masukkan.email.anda@gmail.com"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "14px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  outline: "none",
                }}
              />
              <button
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: "#1a1b22",
                  color: "#fff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Langganan
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,219,207,0.6)", marginTop: "12px" }}>
              ✓ Data Anda 100% aman · ✓ Bisa berhenti kapan saja
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @media (min-width: 768px) {
          .articles-main-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .featured-grid { grid-template-columns: 1fr 1fr !important; }
          .featured-img-wrap { aspect-ratio: auto !important; min-height: 340px; }
        }
        .featured-article:hover .featured-img { transform: scale(1.04); }
        .featured-article:hover .featured-title { color: #9f3c16 !important; }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
