"use client";

import { useEffect, useRef } from "react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}

// Center Yogyakarta
const JOGJA_CENTER: [number, number] = [-7.7956, 110.3695];
const JOGJA_ZOOM = 12;

export default function MapPicker({ lat, lng, onPick }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically import Leaflet (SSR safe)
    import("leaflet").then((L) => {
      // Fix default marker icons for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Jika peta sudah diinisialisasi, jangan inisialisasi lagi
      if (mapRef.current) return;

      const initialCenter: [number, number] =
        lat && lng ? [lat, lng] : JOGJA_CENTER;

      const map = L.map(mapContainerRef.current!, {
        center: initialCenter,
        zoom: lat && lng ? 15 : JOGJA_ZOOM,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marker awal jika sudah ada koordinat
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng])
          .addTo(map)
          .bindPopup("📍 Lokasi kawasan")
          .openPopup();
      }

      // Klik peta → update marker & koordinat
      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng])
            .addTo(map)
            .bindPopup("📍 Lokasi kawasan")
            .openPopup();
        }

        onPick(
          parseFloat(clickLat.toFixed(6)),
          parseFloat(clickLng.toFixed(6))
        );
      });

      mapRef.current = map;
    });

    // Cleanup saat unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker saat lat/lng berubah dari luar (misal edit existing)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup("📍 Lokasi kawasan")
          .openPopup();
      }
      mapRef.current.setView([lat, lng], 15);
    });
  }, [lat, lng]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-surface-variant/40 shadow-sm">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapContainerRef}
        style={{ height: "280px", width: "100%" }}
        className="z-0"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none backdrop-blur-sm">
        Klik peta untuk memilih lokasi kawasan
      </div>
    </div>
  );
}
