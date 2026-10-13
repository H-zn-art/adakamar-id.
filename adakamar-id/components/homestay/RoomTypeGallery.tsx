"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface RoomTypeGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomTypeGallery({ images, roomName }: RoomTypeGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const open = (idx: number) => setLightboxIndex(idx);
  const close = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  if (images.length === 0) return null;

  return (
    <>
      {/* ── Photo Strip ── */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          height: "180px",
          overflow: "hidden",
        }}
      >
        {images.slice(0, 3).map((url, i) => (
          <div
            key={i}
            style={{
              flex: i === 0 ? "2" : "1",
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => open(i)}
            title={`Lihat foto ${i + 1} dari ${images.length}`}
          >
            <img
              src={url}
              alt={`${roomName} foto ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.25s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />

            {/* Hover overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.28)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"; }}
            >
              <ZoomIn style={{ color: "#fff", width: 22, height: 22, opacity: 0, transition: "opacity 0.2s" }} className="zoom-icon" />
            </div>

            {/* "+N more" badge on last visible slot */}
            {i === 2 && images.length > 3 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: 700,
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span>+{images.length - 3}</span>
                <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.85 }}>foto</span>
              </div>
            )}

            {/* First photo badge */}
            {i === 0 && (
              <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                {images.length} foto
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox Modal ── */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              zIndex: 10001,
            }}
            title="Tutup (Esc)"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>

          {/* Counter */}
          <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, zIndex: 10001 }}>
            {roomName} — {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                zIndex: 10001,
              }}
              title="Foto sebelumnya (←)"
            >
              <ChevronLeft style={{ width: 22, height: 22 }} />
            </button>
          )}

          {/* Main image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "82vh",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${roomName} foto ${lightboxIndex + 1}`}
              style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain", display: "block" }}
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                zIndex: 10001,
              }}
              title="Foto berikutnya (→)"
            >
              <ChevronRight style={{ width: 22, height: 22 }} />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 12,
                backdropFilter: "blur(8px)",
                maxWidth: "90vw",
                overflowX: "auto",
                zIndex: 10001,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  style={{
                    width: 52,
                    height: 38,
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: i === lightboxIndex ? "2px solid #f97316" : "2px solid transparent",
                    opacity: i === lightboxIndex ? 1 : 0.55,
                    transition: "opacity 0.2s, border-color 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <img src={url} alt={`thumb ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        div:hover .zoom-icon { opacity: 1 !important; }
      `}</style>
    </>
  );
}
