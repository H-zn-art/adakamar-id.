"use client";

import { useState, useEffect } from "react";
import { inquiriesApi, propertiesApi, promosApi, roomTypesApi } from "@/lib/api";
import { Star, AlertCircle, Loader2, MessageCircle, ShieldCheck, Tag, Check, X, Sparkles, BedDouble, Users, CheckCircle2 } from "lucide-react";

interface BookingFormProps {
  propertyId: string;
  propertySlug: string;
  propertyName: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
}

export default function BookingForm({
  propertyId: initialPropertyId,
  propertySlug,
  propertyName: initialName,
  price: initialPrice,
  originalPrice: initialOriginal,
  rating: initialRating = 4.9,
  reviewCount: initialReviewCount = 0,
}: BookingFormProps) {
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [propertyName, setPropertyName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [originalPrice, setOriginalPrice] = useState(initialOriginal);
  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(!initialPropertyId);

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Room type states
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<any | null>(null);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [minRoomPrice, setMinRoomPrice] = useState<number | null>(null);

  // If server-side fetch failed (propertyId empty), resolve client-side by slug
  useEffect(() => {
    if (!propertyId && propertySlug) {
      setResolving(true);
      propertiesApi.getBySlug(propertySlug)
        .then((data: any) => {
          const p = data?.property || data;
          if (p?.id) {
            setPropertyId(p.id);
            setPropertyName(p.name || initialName);
            setPrice(Number(p.price) || initialPrice);
            setOriginalPrice(Number(p.originalPrice) || initialOriginal);
            setRating(Number(p.rating) || initialRating);
            setReviewCount(Number(p.reviewCount) ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setResolving(false));
    } else {
      setResolving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertySlug]);

  // Fetch room types when propertyId, checkIn, or checkOut is available
  useEffect(() => {
    if (!propertyId) return;
    setRoomTypesLoading(true);
    const dateQuery = checkIn && checkOut ? { checkIn, checkOut } : undefined;
    roomTypesApi.list(propertyId, dateQuery)
      .then((data: any) => {
        const types = Array.isArray(data) ? data : [];
        setRoomTypes(types);
        const availableOnly = types.filter((r: any) => r.isAvailable !== false && (r.availableUnits === undefined || r.availableUnits > 0));
        if (availableOnly.length > 0) {
          const min = Math.min(initialPrice || Infinity, ...availableOnly.map((r: any) => r.pricePerNight));
          setMinRoomPrice(min);
        }
        // If current selected room is now full/unavailable, deselect it
        if (selectedRoomType) {
          const stillAvail = availableOnly.some((r: any) => r.id === selectedRoomType.id);
          if (!stillAvail) {
            setSelectedRoomType(null);
            setError(`Tipe kamar "${selectedRoomType.name}" penuh pada tanggal yang dipilih. Silakan pilih tipe kamar lain.`);
          }
        }
      })
      .catch(() => setRoomTypes([]))
      .finally(() => setRoomTypesLoading(false));
  }, [propertyId, checkIn, checkOut]);


  // Active promos fetched from database
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);

  // Fetch active promos directly from database
  useEffect(() => {
    promosApi.listActive()
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailablePromos(data);
        }
      })
      .catch(() => setAvailablePromos([]));
  }, []);

  // Read promo from URL query on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPromo = urlParams.get("promo");
      if (urlPromo) {
        const code = urlPromo.trim().toUpperCase();
        setPromoCodeInput(code);
      }
    }
  }, []);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;
  // Harga aktif: pakai harga kamar yang dipilih, fallback ke minRoomPrice, fallback ke property price
  const activePrice = selectedRoomType
    ? selectedRoomType.pricePerNight
    : (minRoomPrice ?? price);
  const subtotal = activePrice * nights;
  const discount = originalPrice && !selectedRoomType ? originalPrice * nights - subtotal : 0;
  const promoDiscount = appliedPromo?.calculatedDiscount || 0;
  const finalTotal = Math.max(0, subtotal - promoDiscount);
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSelectRoom = (room: any) => {
    const isFull = room.isAvailable === false || (room.availableUnits !== undefined && room.availableUnits <= 0);
    if (isFull) {
      setError(`Tipe kamar "${room.name}" sudah penuh${checkIn && checkOut ? " pada tanggal yang dipilih" : ""}.`);
      return;
    }
    setError(null);
    setSelectedRoomType(room);
    setPrice(room.pricePerNight);
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoMessage(null);
  };

  const handleApplyPromo = async (codeToUse?: string) => {
    const code = (codeToUse || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoMessage({ type: "error", text: "Silakan pilih atau masukkan kode kupon." });
      return;
    }
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      const res = await promosApi.validate(code, subtotal);
      if (res && res.valid) {
        setAppliedPromo(res);
        setPromoCodeInput(code);
        // Increment pemakaian kuota kupon di backend & database
        try {
          await promosApi.usePromo(code);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("adakamar_promos_updated"));
          }
        } catch (useErr) {
          console.warn("Gagal increment promo usage:", useErr);
        }
        setPromoMessage({
          type: "success",
          text: `Kupon ${code} berhasil digunakan! Hemat Rp ${fmt(res.calculatedDiscount)}`,
        });
      } else {
        setAppliedPromo(null);
        setPromoMessage({ type: "error", text: "Kode promo tidak valid." });
      }
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMessage({
        type: "error",
        text: err?.message || "Kupon promo tidak valid atau syarat belum terpenuhi.",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!propertyId) { setError("Gagal memuat data penginapan. Coba refresh halaman."); return; }
    if (roomTypes.length > 0 && !selectedRoomType) { setError("Pilih tipe kamar terlebih dahulu."); return; }
    if (selectedRoomType) {
      const isSelectedFull = selectedRoomType.isAvailable === false || (selectedRoomType.availableUnits !== undefined && selectedRoomType.availableUnits <= 0);
      if (isSelectedFull) {
        setError("Tipe kamar yang dipilih sedang penuh untuk tanggal tersebut. Silakan pilih tipe kamar lain.");
        return;
      }
    }
    if (!guestName.trim()) { setError("Nama tamu wajib diisi."); return; }
    if (!guestPhone.trim()) { setError("Nomor WhatsApp wajib diisi."); return; }
    setLoading(true);
    try {
      const roomInfo = selectedRoomType ? `\n[Kamar: ${selectedRoomType.name} - Kapasitas ${selectedRoomType.capacity} orang]` : "";
      const promoInfo = appliedPromo
        ? `[PROMO: ${appliedPromo.promo?.code || promoCodeInput} (Hemat Rp ${fmt(promoDiscount)}) - Total: Rp ${fmt(finalTotal)}]`
        : `[Total Estimasi: Rp ${fmt(subtotal)}]`;
      const combinedNotes = notes.trim()
        ? `${notes.trim()}${roomInfo}\n${promoInfo}`
        : `${roomInfo.trim()}\n${promoInfo}`.trim();

      const res = await inquiriesApi.create({
        propertyId,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        checkInDate: checkIn || undefined,
        checkOutDate: checkOut || undefined,
        guestCount,
        notes: combinedNotes,
        roomTypeName: selectedRoomType?.name || undefined,
        roomTypeId: selectedRoomType?.id || undefined,
      });
      if (res?.whatsappUrl) {
        // If promo applied, append promo note to whatsapp url text if not already included
        let waUrl = res.whatsappUrl;
        if (appliedPromo && !waUrl.includes(appliedPromo.promo?.code)) {
          const appendMsg = `\n- Kupon Promo: ${appliedPromo.promo?.code} (Potongan Rp ${fmt(promoDiscount)})\n- Total Pembayaran: Rp ${fmt(finalTotal)}`;
          waUrl = waUrl.replace("Mohon%20konfirmasi", encodeURIComponent(appendMsg) + "%0A%0AMohon%20konfirmasi");
        }
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim. Pastikan server aktif.");
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid #e8e7f1", fontSize: "13px", color: "#1a1b22",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff",
  };

  return (
    <div style={{ position: "sticky", top: "120px", background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e8e7f1", overflow: "hidden" }} className="booking-widget">
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #e8e7f1" }}>
        {/* Label di atas harga */}
        {selectedRoomType ? (
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#9f3c16", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <BedDouble style={{ width: 11, height: 11 }} />
            {selectedRoomType.name}
          </div>
        ) : (
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#8a726a", marginBottom: "2px" }}>
            {roomTypes.length > 0 ? "Mulai dari" : "Harga per malam"}
          </div>
        )}
        {/* Harga utama */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#9f3c16" }}>Rp</span>
          <span style={{ fontSize: "32px", fontWeight: 800, color: "#9f3c16" }}>{fmt(activePrice)}</span>
          <span style={{ fontSize: "14px", color: "#57423b" }}>/malam</span>
          {reviewCount > 0 && (
            <span style={{ marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700 }}>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />{rating.toFixed(1)}
            </span>
          )}
        </div>
        {/* Nama properti + coretan harga asli jika tidak ada room types */}
        {!selectedRoomType && !roomTypes.length && originalPrice && originalPrice > price && (
          <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
            <span style={{ fontSize: "12px", color: "#8a726a", textDecoration: "line-through" }}>Rp {fmt(originalPrice)}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#9f3c16" }}>hemat {Math.round(((originalPrice - price) / originalPrice) * 100)}%</span>
          </div>
        )}
        {propertyName && <div style={{ fontSize: "12px", color: "#57423b", marginTop: "4px", fontWeight: 500 }}>{propertyName}</div>}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: "10px", border: "1.5px solid #e8e7f1", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ padding: "10px 14px", borderRight: "1px solid #e8e7f1" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "3px" }}>Check-in</div>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ fontSize: "13px", fontWeight: 600, border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit" }} />
          </div>
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "3px" }}>Check-out</div>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split("T")[0]} style={{ fontSize: "13px", fontWeight: 600, border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Room Type Selection */}
        {roomTypesLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e7f1", marginBottom: "12px", fontSize: "12px", color: "#57423b" }}>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            Memuat tipe kamar...
          </div>
        ) : roomTypes.length > 0 ? (
          <div style={{ marginBottom: "12px" }}>
            {/* Label + required hint */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                <BedDouble style={{ width: 12, height: 12 }} />
                Pilih Tipe Kamar
                <span style={{ color: "#e74c3c", fontSize: "11px" }}>*</span>
              </div>
              {!selectedRoomType && (
                <span style={{ fontSize: "10px", color: "#9f3c16", fontWeight: 600, background: "#fff7f4", border: "1px solid #ffdbcf", borderRadius: "6px", padding: "2px 7px" }}>
                  Wajib dipilih
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {roomTypes.map((room: any) => {
                const isFull = room.isAvailable === false || (room.availableUnits !== undefined && room.availableUnits <= 0);
                const isSelected = selectedRoomType?.id === room.id;
                const remainingUnits = room.availableUnits !== undefined ? room.availableUnits : (room.totalUnits || 1);

                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => !isFull && handleSelectRoom(room)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: isFull
                        ? "1.5px dashed #cbd5e1"
                        : isSelected
                        ? "2px solid #9f3c16"
                        : "1.5px solid #e8e7f1",
                      background: isFull
                        ? "#f8fafc"
                        : isSelected
                        ? "#fff7f4"
                        : "#fff",
                      cursor: isFull ? "not-allowed" : "pointer",
                      opacity: isFull ? 0.72 : 1,
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: isFull ? "#64748b" : isSelected ? "#9f3c16" : "#1a1b22", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          {isSelected && <CheckCircle2 style={{ width: 14, height: 14, color: "#9f3c16", flexShrink: 0 }} />}
                          <span style={{ textDecoration: isFull ? "line-through" : "none" }}>{room.name}</span>
                          
                          {/* Badge Ketersediaan / Stok Unit */}
                          {isFull ? (
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "6px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
                              Kamar Penuh
                            </span>
                          ) : remainingUnits === 1 ? (
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "6px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                              Sisa 1 kamar
                            </span>
                          ) : (
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "6px", background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                              {remainingUnits} unit tersedia
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px" }}>
                          <span style={{ fontSize: "11px", color: isFull ? "#94a3b8" : "#57423b", display: "flex", alignItems: "center", gap: "3px" }}>
                            <Users style={{ width: 10, height: 10 }} />
                            {room.capacity} orang
                          </span>
                          {room.facilities && (
                            <span style={{ fontSize: "11px", color: isFull ? "#94a3b8" : "#8a726a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                              {room.facilities}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: isFull ? "#94a3b8" : "#9f3c16" }}>Rp {fmt(room.pricePerNight)}</div>
                        <div style={{ fontSize: "10px", color: isFull ? "#94a3b8" : "#8a726a" }}>/malam</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e7f1", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "3px" }}>Jumlah Tamu</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{guestCount} tamu</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #e8e7f1", background: "#f4f2fd", fontSize: "18px", cursor: "pointer", color: "#9f3c16", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
            <span style={{ fontWeight: 700, minWidth: "20px", textAlign: "center" }}>{guestCount}</span>
            <button type="button" onClick={() => setGuestCount(Math.min(20, guestCount + 1))} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #e8e7f1", background: "#f4f2fd", fontSize: "18px", cursor: "pointer", color: "#9f3c16", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "5px" }}>Nama Tamu *</div>
          <input type="text" placeholder="Contoh: Budi Santoso" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={inp} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "5px" }}>Nomor WhatsApp *</div>
          <input type="tel" placeholder="08xx-xxxx-xxxx" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required style={inp} />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#57423b", textTransform: "uppercase", marginBottom: "5px" }}>Catatan (opsional)</div>
          <textarea placeholder="Misal: tiba malam hari, perlu extra bed..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: "none" }} />
        </div>

        {/* Kupon / Kode Promo — Direct from Database */}
        <div style={{ marginBottom: "14px", background: "#fbf8ff", borderRadius: "12px", border: "1px dashed #d6c9c4", padding: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#9f3c16", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Tag style={{ width: "12px", height: "12px" }} />
            Voucher & Kode Promo
          </div>

          {appliedPromo ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check style={{ width: "16px", height: "16px", color: "#16a34a" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", fontFamily: "monospace" }}>{appliedPromo.promo?.code}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "4px" }}>Terpasang</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 600 }}>Potongan Rp {fmt(promoDiscount)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                style={{ background: "transparent", border: "none", color: "#dc2626", fontSize: "11px", fontWeight: 700, cursor: "pointer", padding: "4px" }}
              >
                Lepas
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* List of active promos from database */}
              {availablePromos.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "11px", color: "#57423b", fontWeight: 600 }}>Kupon Promo Tersedia:</div>
                  {availablePromos.map((p) => {
                    const discountText = p.discountPercent
                      ? `Diskon ${p.discountPercent}%`
                      : p.discountAmount
                      ? `Potongan Rp ${fmt(p.discountAmount)}`
                      : p.code;
                    const minText = p.minTransaction
                      ? `Min. transaksi Rp ${fmt(p.minTransaction)}`
                      : "Tanpa minimum transaksi";
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          background: "#fff",
                          border: "1px solid #ffdccf",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#9f3c16", letterSpacing: "0.03em" }}>{p.code}</span>
                            <span style={{ fontSize: "10px", fontWeight: 700, background: "#ffdbcf", color: "#9f3c16", padding: "1px 5px", borderRadius: "4px" }}>{discountText}</span>
                          </div>
                          <div style={{ fontSize: "10px", color: "#78716c", marginTop: "2px" }}>{minText}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo(p.code)}
                          disabled={promoLoading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "#9f3c16",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "none",
                            cursor: promoLoading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {promoLoading ? <Loader2 style={{ width: "10px", height: "10px" }} className="animate-spin" /> : null}
                          <span>Gunakan</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Toggle manual code input */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9f3c16",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {showManualInput ? "Sembunyikan input manual" : "Punya kode kupon lain? Masukkan manual"}
                </button>

                {showManualInput && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <input
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      style={{ ...inp, flex: 1, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", padding: "8px 10px", fontSize: "12px" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      disabled={promoLoading || !promoCodeInput.trim()}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "10px",
                        background: "#9f3c16",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "none",
                        cursor: promoLoading || !promoCodeInput.trim() ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {promoLoading ? <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" /> : null}
                      <span>Terapkan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {promoMessage && (
            <div style={{ fontSize: "11px", marginTop: "8px", color: promoMessage.type === "success" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
              {promoMessage.text}
            </div>
          )}
        </div>

        {checkIn && checkOut && nights > 0 && (
          <div style={{ background: "#f4f2fd", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#57423b" }}>
                {selectedRoomType ? `${selectedRoomType.name} ` : ""}Rp {fmt(activePrice)} × {nights} malam
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>Rp {fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "#16a34a" }}>Diskon Kamar</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>- Rp {fmt(discount)}</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "#9f3c16", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles style={{ width: "12px", height: "12px" }} />
                  Potongan Voucher ({appliedPromo.promo?.code})
                </span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#9f3c16" }}>- Rp {fmt(promoDiscount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e8e7f1", marginTop: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>Total Pembayaran</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#9f3c16" }}>Rp {fmt(finalTotal)}</span>
            </div>
          </div>
        )}

        {resolving && (
          <div style={{ textAlign: "center", padding: "8px", marginBottom: "8px", fontSize: "12px", color: "#57423b" }}>
            Memuat data penginapan...
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", fontSize: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle className="w-4 h-4 text-rose-600" />{error}
          </div>
        )}

        <button type="submit" disabled={loading || resolving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", background: (loading || resolving) ? "#a5d6b8" : "linear-gradient(135deg, #25d366 0%, #128c7e 100%)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: (loading || resolving) ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(37,211,102,0.35)", marginBottom: "10px", fontFamily: "inherit" }}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
          {loading ? "Mengirim..." : "Reservasi via WhatsApp"}
        </button>

        <p style={{ fontSize: "12px", color: "#8a726a", textAlign: "center", margin: "0 0 16px" }}>
          <ShieldCheck className="w-3.5 h-3.5 inline-block text-emerald-600 mr-1" />{" "}
          Data aman - Tidak ada pembayaran di muka
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={"https://wa.me/?text=" + encodeURIComponent("Halo, saya tertarik dengan " + propertyName + " di adakamar.id")} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#e8e7f1", fontSize: "13px", fontWeight: 600, color: "#1a1b22", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none", border: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>phone</span>Hubungi Tuan
          </a>
          <button type="button" style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#e8e7f1", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#1a1b22", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_today</span>Cek Kalender
          </button>
        </div>
      </form>
    </div>
  );
}
