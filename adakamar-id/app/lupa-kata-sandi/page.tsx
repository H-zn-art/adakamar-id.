"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-24 pb-16 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[480px]">
          <div className="bg-surface-container-lowest shadow-xl border border-surface-variant/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-terracotta-soft text-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">
                  lock_reset
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-terracotta-soft text-primary text-[11px] font-semibold tracking-wider uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Pemulihan Kredensial
              </span>
              <h1 className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                Lupa Kata Sandi?
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-sm mx-auto leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun{" "}
                <span className="font-semibold text-on-surface">adakamar.id</span>{" "}
                Anda. Kami akan mengirimkan tautan verifikasi aman untuk
                mengatur ulang kata sandi.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 rounded-full bg-success-forest/10 text-success-forest flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">
                    mark_email_read
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-on-surface">
                    Cek Kotak Masuk Anda
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Tautan reset telah dikirim ke{" "}
                    <span className="font-bold text-on-surface">{email}</span>
                  </p>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl text-left text-on-surface-variant text-xs space-y-2 border border-surface-variant/40">
                  <p className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                      timer
                    </span>
                    <span>
                      Tautan verifikasi kedaluwarsa dalam{" "}
                      <strong>30 menit</strong> demi privasi akun.
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                      markunread_mailbox
                    </span>
                    <span>
                      Tidak menerima email? Periksa folder spam atau promosi
                      Anda.
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/atur-ulang-kata-sandi"
                    className="w-full py-3 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-container transition-colors"
                  >
                    Simulasi Buka Tautan Reset
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Gunakan alamat email lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="text-xs text-on-surface font-semibold"
                    >
                      Alamat Email Terdaftar
                    </label>
                    <span className="text-[11px] text-on-surface-variant">
                      Wajib diisi
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">
                        mail
                      </span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      className="w-full h-11 pl-10 pr-4 bg-surface-container-low border border-surface-variant/60 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1 pt-0.5">
                    <span className="material-symbols-outlined text-[14px]">
                      info
                    </span>
                    Pastikan Anda memiliki akses aktif ke kotak masuk email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {loading ? "Mengirim Tautan..." : "Kirim Tautan Pemulihan"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </form>
            )}

            {/* Back to login */}
            <div className="mt-6 pt-5 bg-surface-container-low/40 rounded-2xl p-4 flex flex-col gap-2 text-center border border-surface-variant/30">
              <span className="text-xs text-on-surface-variant">
                Ingat kata sandi Anda?
              </span>
              <Link
                href="/masuk"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center justify-center gap-1"
              >
                <span>Masuk ke Akun</span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Concierge Hotline */}
            <div className="mt-4 p-3.5 rounded-2xl bg-surface-container-low flex items-center gap-3 border border-surface-variant/30">
              <div className="w-8 h-8 rounded-full bg-success-forest/10 flex items-center justify-center shrink-0 text-success-forest">
                <span className="material-symbols-outlined text-[18px]">
                  support_agent
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-on-surface block">
                  Concierge Tamu 24 Jam
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  Butuh akses mendesak untuk check-in hari ini?{" "}
                  <a
                    href="https://wa.me/6285795445463"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Hubungi WhatsApp
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
