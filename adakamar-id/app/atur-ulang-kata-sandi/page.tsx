"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [success, setSuccess] = useState(false);

  // Requirement checks
  const hasLength = newPassword.length >= 8;
  const hasCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumOrSym = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const strengthCount = (hasLength ? 1 : 0) + (hasCase ? 1 : 0) + (hasNumOrSym ? 1 : 0);
  const strengthLabels = ["Belum diisi", "Lemah", "Sedang", "Kuat & Aman"];
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasLength || !isMatch) return;
    setSuccess(true);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="pt-24 pb-16 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg mx-auto relative">
          <div className="relative bg-surface-container-lowest rounded-3xl shadow-xl border border-surface-variant/40 p-6 sm:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-terracotta-soft flex items-center justify-center mb-3 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  lock_reset
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-terracotta-soft text-primary text-[11px] font-semibold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Pembaruan Kredensial
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Buat Kata Sandi Baru
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
                Silakan masukkan kombinasi kata sandi baru yang kuat untuk
                melindungi akun{" "}
                <span className="font-semibold text-on-surface">adakamar.id</span>{" "}
                Anda.
              </p>
            </div>

            {/* Session info alert */}
            <div className="mb-6 bg-surface-container-low rounded-2xl p-3.5 flex items-start gap-3 border border-surface-variant/30">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                schedule
              </span>
              <div className="text-xs">
                <span className="font-semibold text-on-surface block">
                  Tautan Pemulihan Aktif
                </span>
                <span className="text-on-surface-variant mt-0.5">
                  Sesi pemulihan akun Anda berlaku selama 30 menit. Mohon segera
                  perbarui sebelum kedaluwarsa.
                </span>
              </div>
            </div>

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-success-forest/10 text-success-forest flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[36px]">
                    check_circle
                  </span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">
                  Kata Sandi Berhasil Diperbarui!
                </h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Kredensial baru Anda telah aktif. Silakan masuk kembali
                  menggunakan kata sandi yang baru saja Anda buat.
                </p>
                <Link
                  href="/masuk"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary text-xs font-bold rounded-xl shadow hover:bg-primary-container transition-colors mt-2"
                >
                  <span>Masuk ke Akun Saya</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface flex justify-between items-center">
                    <span>Kata Sandi Baru</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Min. 8 karakter
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3 text-[18px]">
                      key
                    </span>
                    <input
                      type={showPassword1 ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword1(!showPassword1)}
                      className="absolute right-3 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword1 ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                  {/* Strength Bar */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">
                        Kekuatan Kata Sandi:
                      </span>
                      <span
                        className={`font-semibold ${
                          strengthCount === 3
                            ? "text-success-forest"
                            : strengthCount === 2
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      >
                        {strengthLabels[strengthCount]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          strengthCount >= 1 ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full transition-all ${
                          strengthCount >= 2 ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full transition-all ${
                          strengthCount >= 3 ? "bg-success-forest" : "bg-transparent"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-1 text-xs text-on-surface-variant pt-1">
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasLength ? "text-success-forest" : "text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {hasLength ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasCase ? "text-success-forest" : "text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {hasCase ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span>Mengandung huruf besar & kecil</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasNumOrSym
                            ? "text-success-forest"
                            : "text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {hasNumOrSym ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span>Mengandung angka atau simbol unik (@, #, $, dll)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface flex justify-between items-center">
                    <span>Konfirmasi Kata Sandi Baru</span>
                    {confirmPassword && (
                      <span
                        className={`text-[11px] font-semibold ${
                          isMatch ? "text-success-forest" : "text-error"
                        }`}
                      >
                        {isMatch ? "Cocok ✓" : "Belum Cocok"}
                      </span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3 text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword2 ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      className="absolute right-3 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword2 ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!hasLength || !isMatch}
                  className="w-full h-12 bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Simpan Kata Sandi Baru</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
