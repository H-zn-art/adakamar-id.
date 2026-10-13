"use client";

import { useState, useEffect } from "react";
import { MessageSquarePlus, CheckCircle2, User, Loader2, Sparkles, Send } from "lucide-react";
import { reviewsApi } from "@/lib/api";

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PropertyReviewsSectionProps {
  propertyId: string;
  propertySlug: string;
  propertyName: string;
  initialRating?: number;
  initialReviewCount?: number;
  initialReviews?: Review[];
}

export default function PropertyReviewsSection({
  propertyId,
  propertySlug,
  propertyName,
  initialRating = 4.9,
  initialReviewCount = 0,
  initialReviews = [],
}: PropertyReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewCount, setReviewCount] = useState<number>(initialReviewCount);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [guestName, setGuestName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load reviews on mount
  useEffect(() => {
    const target = propertySlug || propertyId;
    if (!target) return;
    setLoading(true);
    reviewsApi
      .getByProperty(target)
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
          setReviewCount(data.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertySlug, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg("Nama pengulas wajib diisi.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Tuliskan ulasan atau pengalaman Anda.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const target = propertySlug || propertyId;
      const res = await reviewsApi.create(target, {
        guestName: guestName.trim(),
        rating: 5, // rating tidak ditampilkan, pakai default 5
        comment: comment.trim(),
      });

      if (res && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewCount((c) => c + 1);
        setSuccessMsg("Terima kasih! Ulasan Anda telah berhasil diterbitkan.");
        setGuestName("");
        setComment("");
        setTimeout(() => setShowForm(false), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengirim ulasan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="ulasan-tamu" className="pt-8 border-t border-zinc-200 mt-8 mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9f3c16] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pengalaman Tamu Asli</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Ulasan Tamu — {propertyName}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {reviewCount > 0
              ? `${reviewCount} ulasan dari tamu yang pernah menginap`
              : "Belum ada ulasan. Jadilah yang pertama!"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showForm ? "Tutup Form Ulasan" : "Tulis Ulasan Anda"}</span>
        </button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#fbf8ff] to-white border-2 border-[#ffdbcf] shadow-sm mb-8 transition-all"
        >
          <h3 className="text-sm font-bold text-zinc-900 mb-1 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#9f3c16]" />
            <span>Bagikan Pengalaman Menginap Anda</span>
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Bantu calon tamu lain dengan ulasan dan kesan autentik Anda selama di {propertyName}.
          </p>

          {/* Name input */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Nama Anda *
            </label>
            <input
              type="text"
              placeholder="Contoh: Sarah Anindita"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#9f3c16]"
            />
          </div>

          {/* Comment input */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Ulasan &amp; Kesan Menginap *
            </label>
            <textarea
              rows={4}
              placeholder="Ceritakan tentang kenyamanan kamar, keramahan tuan rumah, suasana lingkungan sekitar..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#9f3c16] resize-none"
            />
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#9f3c16] hover:bg-[#853010] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{submitting ? "Menerbitkan..." : "Kirim Ulasan"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#9f3c16]" />
          <span className="text-xs">Memuat ulasan tamu...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center mb-3">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 mb-1">Belum Ada Ulasan</h4>
          <p className="text-xs text-zinc-500 max-w-sm mb-4">
            Penginapan ini belum memiliki ulasan dari tamu sebelumnya. Anda dapat menjadi orang pertama yang mengulasnya!
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-[#9f3c16] text-white text-xs font-bold hover:bg-[#853010] transition-colors cursor-pointer"
          >
            Tulis Ulasan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {rev.guestName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight">
                    {rev.guestName}
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-12">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
