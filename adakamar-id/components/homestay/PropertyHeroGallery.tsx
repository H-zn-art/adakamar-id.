"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface PropertyHeroGalleryProps {
  images: string[]; // all property images (index 0 = main, rest = thumbs)
  propertyName: string;
}

export default function PropertyHeroGallery({ images, propertyName }: PropertyHeroGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const mainImage = images[0] || "/placeholder-homestay.jpg";
  const rawThumbs = images.length > 1 ? images.slice(1, 5) : [];
  const thumbImages: string[] = Array.from({ length: 4 }, (_, i) =>
    rawThumbs[i] || images[0] || "/placeholder-homestay.jpg"
  );

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <>
      {/* ─── Gallery Grid ─── */}
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
            cursor: images.length > 0 ? "pointer" : "default",
          }}
          className="gallery-main"
          onClick={() => images.length > 0 && setLightboxIndex(0)}
          title="Klik untuk lihat foto besar"
        >
          <img
            src={mainImage}
            alt={propertyName}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
            onMouseEnter={(e) => { if (images.length > 0) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(26,27,34,0.7) 0%, transparent 60%)",
              padding: "20px 24px",
              pointerEvents: "none",
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
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
              {propertyName}
            </p>
          </div>

          {/* "Lihat Semua" badge */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Images style={{ width: 14, height: 14 }} />
              {images.length} Foto
            </button>
          )}
        </div>

        {/* 4 thumbnail images */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
          className="gallery-thumbs"
        >
          {thumbImages.map((src, i) => {
            const imageIndex = i + 1;
            const isLast = i === thumbImages.length - 1;
            const hasMore = images.length > 5;
            return (
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
                onClick={() => setLightboxIndex(Math.min(imageIndex, images.length - 1))}
                title={`Lihat foto ${imageIndex + 1}`}
              >
                <img
                  src={src}
                  alt={`${propertyName} foto ${imageIndex + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.25s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
                {/* Overlay on hover */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.22)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"; }}
                />
                {/* "Lihat Semua" button on last thumb if more photos exist */}
                {isLast && hasMore && (
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
                    }}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); }}
                  >
                    Lihat Semua Foto ({images.length})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Lightbox ─── */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.93)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", zIndex: 10001,
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>

          {/* Counter */}
          <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, zIndex: 10001 }}>
            {propertyName} — {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: "50%", width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", zIndex: 10001,
              }}
            >
              <ChevronLeft style={{ width: 22, height: 22 }} />
            </button>
          )}

          {/* Main image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "82vh", borderRadius: 12, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${propertyName} foto ${lightboxIndex + 1}`}
              style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain", display: "block" }}
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: "50%", width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", zIndex: 10001,
              }}
            >
              <ChevronRight style={{ width: 22, height: 22 }} />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 8, padding: "8px 12px",
                background: "rgba(0,0,0,0.5)", borderRadius: 12, backdropFilter: "blur(8px)",
                maxWidth: "90vw", overflowX: "auto", zIndex: 10001,
              }}
            >
              {images.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  style={{
                    width: 52, height: 38, borderRadius: 6, overflow: "hidden", cursor: "pointer", flexShrink: 0,
                    border: i === lightboxIndex ? "2px solid #f97316" : "2px solid transparent",
                    opacity: i === lightboxIndex ? 1 : 0.5, transition: "opacity 0.2s, border-color 0.2s",
                  }}
                >
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
