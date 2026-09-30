"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { articlesApi } from "@/lib/api";
import { ArticleJsonLd } from "@/components/seo/SeoComponents";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(windowHeight > 0 ? totalScroll / windowHeight : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      // Backend findBySlug returns { article, related }
      const res = await articlesApi.getBySlug(slug);
      // Handle both shapes: direct article OR { article, related }
      const articleData = res?.article ?? res;
      const relatedData = res?.related ?? [];

      if (articleData && articleData.id) {
        setArticle(articleData);
        // PRD Seksi 28: Penginapan terkait dalam artikel
        setRelatedProperties(Array.isArray(articleData.relatedProperties) ? articleData.relatedProperties : []);
        // Use related from backend response
        setRelated(
          Array.isArray(relatedData)
            ? relatedData.filter((a: any) => a.slug !== slug).slice(0, 2)
            : []
        );
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Tautan artikel berhasil disalin ke papan klip!");
      setShareOpen(false);
    }
  };

  const authorName =
    article?.author?.name ||
    (typeof article?.author === "string" ? article.author : "Kurator Mataram");

  const publishDate = formatDate(article?.publishedAt || article?.createdAt);
  const categoryName =
    article?.category?.name ||
    (typeof article?.category === "string" ? article.category : "Artikel");
  const thumbnailUrl =
    article?.thumbnailUrl ||
    article?.thumbnail ||
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200";

  // ─── Loading ───
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: "80px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#8a726a" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "12px", opacity: 0.3 }}>article</span>
            <p style={{ fontSize: "16px" }}>Memuat artikel...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Not Found ───
  if (notFound || !article) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: "80px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#8a726a", maxWidth: "400px", padding: "0 24px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "64px", display: "block", marginBottom: "16px", opacity: 0.2 }}>search_off</span>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1b22", marginBottom: "8px" }}>
              Artikel Tidak Ditemukan
            </h1>
            <p style={{ fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
              Artikel yang kamu cari tidak tersedia atau sudah dihapus.
            </p>
            <Link
              href="/panduan-jogja"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: "#9f3c16",
                color: "#fff",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              Kembali ke Panduan Jogja
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div style={{ background: "#fbf8ff", minHeight: "100vh" }}>
      {/* JSON-LD Structured Data for SEO — PRD Seksi 20 */}
      {article && (
        <ArticleJsonLd
          title={article.title}
          description={article.excerpt || article.title}
          image={thumbnailUrl}
          authorName={authorName}
          publishedAt={article.publishedAt || article.createdAt}
          updatedAt={article.updatedAt}
          url={`https://adakamar.id/panduan-jogja/${slug}`}
          categoryName={categoryName}
        />
      )}
      <Navbar />

      {/* Reading Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: "64px",
          left: 0,
          height: "3px",
          background: "#9f3c16",
          zIndex: 50,
          transition: "width 0.15s",
          width: `${scrollProgress * 100}%`,
        }}
      />

      <main style={{ paddingTop: "96px" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            width: "100%",
            background: "#fbf8ff",
            padding: "14px 0",
            borderBottom: "1px solid rgba(232,231,241,0.4)",
          }}
        >
          <div
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#57423b",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "#57423b", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>home</span>
              Beranda
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", opacity: 0.5 }}>chevron_right</span>
            <Link href="/panduan-jogja" style={{ color: "#57423b", textDecoration: "none" }}>
              Panduan Jogja &amp; Blog
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", opacity: 0.5 }}>chevron_right</span>
            <span style={{ color: "#1a1b22", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>
              {article.title}
            </span>
          </div>
        </nav>

        {/* Editorial Header */}
        <header style={{ background: "#fbf8ff", paddingTop: "40px", paddingBottom: "32px" }}>
          <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 24px" }}>
            {/* Category badge */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  background: "#FDF6F3",
                  color: "#9f3c16",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#9f3c16", display: "inline-block" }} />
                {categoryName}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#57423b", fontWeight: 500 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#9f3c16" }}>verified</span>
                Edisi Kurator Mataram
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                color: "#1a1b22",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
                marginBottom: "20px",
              }}
            >
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p style={{ fontSize: "18px", color: "#57423b", lineHeight: 1.65, marginBottom: "24px" }}>
                {article.excerpt}
              </p>
            )}

            {/* Meta bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(232,231,241,0.6)",
              }}
            >
              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #9f3c16, #bf542c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined filled" style={{ color: "#fff", fontSize: "22px" }}>person</span>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1b22" }}>{authorName}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          background: "#FDF6F3",
                          color: "#9f3c16",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Kurator Lokal
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#57423b", marginTop: "2px" }}>
                      <time>{publishDate}</time>
                      {article.readingTime && (
                        <>
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                            {article.readingTime}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setBookmarked(!bookmarked)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "all 0.15s",
                      background: bookmarked ? "#FDF6F3" : "#f0eff7",
                      color: bookmarked ? "#9f3c16" : "#1a1b22",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      {bookmarked ? "bookmark" : "bookmark_border"}
                    </span>
                    {bookmarked ? "Tersimpan" : "Simpan"}
                  </button>

                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setShareOpen(!shareOpen)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background: "#9f3c16",
                        color: "#fff",
                        boxShadow: "0 1px 4px rgba(159,60,22,0.3)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>share</span>
                      Bagikan
                    </button>
                    {shareOpen && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 8px)",
                          width: "192px",
                          background: "#ffffff",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          padding: "8px",
                          zIndex: 30,
                          border: "1px solid rgba(232,231,241,0.4)",
                        }}
                      >
                        <button
                          onClick={copyToClipboard}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "12px",
                            color: "#1a1b22",
                            width: "100%",
                            textAlign: "left",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#9f3c16" }}>link</span>
                          Salin Tautan
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#1a1b22",
                            textDecoration: "none",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#25D366" }}>chat</span>
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px 48px" }}>
          <div style={{ borderRadius: "20px", overflow: "hidden", position: "relative" }}>
            <img
              src={thumbnailUrl}
              alt={article.title}
              style={{ width: "100%", maxHeight: "520px", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px 80px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "48px",
            }}
            className="article-layout"
          >
            {/* Article body */}
            <article style={{ minWidth: 0 }}>
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
                  {article.tags.map((tag: any) => (
                    <span
                      key={tag.id || tag.name}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        background: "#e8e7f1",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#57423b",
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Article content */}
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: article.content || "<p>Konten artikel belum tersedia.</p>" }}
                style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "#2f3038",
                }}
              />

              {/* Author bio */}
              <div
                style={{
                  marginTop: "48px",
                  padding: "24px",
                  borderRadius: "16px",
                  background: "#f4f2fd",
                  border: "1px solid rgba(232,231,241,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #9f3c16, #bf542c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined filled" style={{ color: "#fff", fontSize: "32px" }}>person</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#1a1b22" }}>{authorName}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        background: "#FDF6F3",
                        color: "#9f3c16",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontWeight: 700,
                      }}
                    >
                      Kurator Mataram
                    </span>
                  </div>
                  {article.author?.bio && (
                    <p style={{ fontSize: "13px", color: "#57423b", lineHeight: 1.6, margin: 0 }}>
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside>
              {/* Related articles */}
              {related.length > 0 && (
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    border: "1px solid rgba(232,231,241,0.4)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    marginBottom: "24px",
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1b22", marginBottom: "16px" }}>
                    Artikel Terkait Lainnya
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {related.map((rel: any) => (
                      <Link
                        key={rel.id || rel.slug}
                        href={`/panduan-jogja/${rel.slug}`}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        <img
                          src={rel.thumbnailUrl || rel.thumbnail || "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=200"}
                          alt={rel.title}
                          style={{ width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                        />
                        <div>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#1a1b22",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical" as any,
                              overflow: "hidden",
                              marginBottom: "4px",
                            }}
                          >
                            {rel.title}
                          </p>
                          <span style={{ fontSize: "11px", color: "#8a726a" }}>
                            {rel.readingTime || "5 mnt baca"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to list */}
              <Link
                href="/panduan-jogja"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: "#FDF6F3",
                  color: "#9f3c16",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "1px solid #F3D5CA",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                Kembali ke Panduan Jogja
              </Link>
            </aside>
          </div>
        </div>
      </main>

      {/* ─── PRD Seksi 28: Penginapan Terkait dalam Artikel ─── */}
      {relatedProperties.length > 0 && (
        <section style={{ background: "#FDF6F3", borderTop: "1px solid #F3D5CA", padding: "48px 0" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9f3c16", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Rekomendasi Penginapan
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1b22", marginTop: "6px", letterSpacing: "-0.02em" }}>
                Penginapan Terkait dalam Artikel Ini
              </h2>
              <p style={{ fontSize: "14px", color: "#8a726a", marginTop: "6px" }}>
                Homestay dan villa yang direkomendasikan oleh kurator adakamar.id dalam artikel ini.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {relatedProperties.map((prop: any) => {
                const coverImg = prop.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
                const price = prop.price ? `Rp ${Number(prop.price).toLocaleString("id-ID")}` : "Hubungi kami";
                return (
                  <Link
                    key={prop.id}
                    href={`/homestay/${prop.slug}`}
                    style={{
                      display: "block",
                      background: "#fff",
                      borderRadius: "16px",
                      border: "1px solid #F3D5CA",
                      overflow: "hidden",
                      textDecoration: "none",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(159,60,22,0.12)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    {/* Cover Image */}
                    <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                      <img
                        src={coverImg}
                        alt={prop.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {prop.isFeatured && (
                        <span style={{
                          position: "absolute", top: "12px", left: "12px",
                          background: "#9f3c16", color: "#fff",
                          fontSize: "10px", fontWeight: 700, padding: "3px 10px",
                          borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.06em"
                        }}>Pilihan Kurator</span>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#9f3c16", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {prop.category?.name || "Homestay"}
                      </div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1b22", marginBottom: "6px", lineHeight: 1.3 }}>
                        {prop.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#8a726a", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>location_on</span>
                        {prop.locationArea?.name || prop.address || "Yogyakarta"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: "#9f3c16" }}>{price}</span>
                          <span style={{ fontSize: "11px", color: "#8a726a" }}> /malam</span>
                        </div>
                        {prop.rating > 0 && prop.reviewCount > 0 && (
                          <span style={{ fontSize: "12px", color: "#57423b", fontWeight: 600 }}>⭐ {prop.rating}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        @media (min-width: 1024px) {
          .article-layout {
            grid-template-columns: 2fr 1fr !important;
          }
        }
        .article-body h1, .article-body h2, .article-body h3 {
          font-weight: 700;
          color: #1a1b22;
          margin-top: 32px;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .article-body h2 { font-size: 22px; }
        .article-body h3 { font-size: 18px; }
        .article-body p { margin-bottom: 18px; }
        .article-body ul, .article-body ol { padding-left: 24px; margin-bottom: 18px; }
        .article-body li { margin-bottom: 8px; }
        .article-body blockquote {
          border-left: 4px solid #9f3c16;
          padding: 12px 20px;
          background: #FDF6F3;
          border-radius: 0 12px 12px 0;
          margin: 24px 0;
          font-style: italic;
          color: #57423b;
        }
        .article-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 24px 0;
        }
        .article-body a {
          color: #9f3c16;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
