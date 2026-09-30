"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Shield,
  PenSquare,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ─── Zod Schema (PRD: validasi email & password) ───
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "PENULIS">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@adakamar.id",
      password: "admin123",
      rememberMe: true,
    },
  });

  const handleQuickFill = (role: "ADMIN" | "PENULIS") => {
    setSelectedRole(role);
    setServerError("");
    if (role === "ADMIN") {
      setValue("email", "admin@adakamar.id");
      setValue("password", "admin123");
    } else {
      setValue("email", "penulis@adakamar.id");
      setValue("password", "penulis123");
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");
    setIsLoading(true);

    try {
      // 1. Try real NestJS backend login
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adakamar_token", data.accessToken);
        localStorage.setItem("adakamar_user", JSON.stringify(data.user));

        // Simpan ke cookie agar middleware bisa baca route guard (PRD Seksi 17 & 26)
        const maxAge = values.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8;
        document.cookie = `adakamar_token=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `adakamar_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/penulis");
        }
        return;
      }

      // Backend online tapi credentials salah
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || "Kredensial tidak valid.");
    } catch (err: any) {
      // Cek apakah error karena backend tidak bisa dihubungi (network error)
      const isNetworkError = err instanceof TypeError && err.message.includes("fetch");

      if (!isNetworkError) {
        // Backend online tapi login gagal
        setIsLoading(false);
        setServerError(err?.message || "Email atau kata sandi salah.");
        return;
      }

      // 2. Backend tidak bisa dihubungi → gunakan demo credentials
    }

    // 3. Client-side fallback (hanya untuk demo, cek email+password secara ketat)
    setTimeout(() => {
      const maxAge = values.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8;

      if (values.email === "admin@adakamar.id" && values.password === "admin123") {
        localStorage.setItem(
          "adakamar_user",
          JSON.stringify({ name: "Raditya Danu", email: "admin@adakamar.id", role: "ADMIN" })
        );
        document.cookie = `adakamar_role=ADMIN; path=/; max-age=${maxAge}; SameSite=Lax`;
        router.push("/admin");
      } else if (values.email === "penulis@adakamar.id" && values.password === "penulis123") {
        localStorage.setItem(
          "adakamar_user",
          JSON.stringify({ name: "Sekar Ayu Kinanti", email: "penulis@adakamar.id", role: "PENULIS" })
        );
        document.cookie = `adakamar_role=PENULIS; path=/; max-age=${maxAge}; SameSite=Lax`;
        router.push("/penulis");
      } else {
        setIsLoading(false);
        setServerError(
          "Email atau kata sandi tidak valid. Gunakan akun demo: admin@adakamar.id / admin123 atau penulis@adakamar.id / penulis123"
        );
      }
    }, 400);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col justify-between pt-24 sm:pt-28">
        {/* Background Image with Scrim & Warm Glow matching Homepage Hero */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQkRIcJlvibVhgokAsvDunnK-ScGwgtt1DspBTQRdicV-kNVoeboHq0arq7C6aAUJW_cVb_TbKRv16XPq3GiwttJQsP0DuUoHIa-We1vzo-ZiQUvJJmBpaEGJATAL8Ykbr8dlC39KD6zV3DpxXKfLInxtRYZ9Q7zlPyYiAp6GWO4KsROTQEaE7C-u5SqXCCWzQIX9T7H8Xka7k7tmjyZoBNoDk45iaXJ9fp8g0DIxHE7A8WWXHhiwp"
            alt="Joglo villa interior"
            className="w-full h-full object-cover object-center scale-105 opacity-40 blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/80 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9f3c16]/30 via-transparent to-transparent" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="w-full max-w-md">
            {/* Login Card in Luxury Glassmorphism */}
            <div className="relative rounded-3xl bg-zinc-950/85 backdrop-blur-2xl border border-white/15 p-7 sm:p-9 shadow-2xl overflow-hidden">
              {/* Top ambient glow inside card */}
              <div className="absolute -top-10 inset-x-0 h-32 bg-gradient-to-b from-[#9f3c16]/25 to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-3 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portal Masuk Internal</span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9f3c16] to-[#bf542c] text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    adakamar<span className="text-[#ffdbcf]">.id</span>
                  </h1>
                </div>

                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Khusus Administrator dan Penulis Konten untuk mengelola sistem serta artikel Jogja.
                </p>
              </div>

              {/* Role Switcher Pill Capsule (Admin vs Penulis) */}
              <div className="relative z-10 mb-6 p-1 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleQuickFill("ADMIN")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === "ADMIN"
                      ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white shadow-lg scale-[1.01]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Administrator</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("PENULIS")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    selectedRole === "PENULIS"
                      ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white shadow-lg scale-[1.01]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Penulis Jogja</span>
                </button>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="relative z-10 mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-4" noValidate>
                {/* Email Field */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                    Alamat Email <span className="text-[#ffdbcf]">*</span>
                  </label>
                  <div
                    className={`flex items-center gap-2.5 px-4 h-12 rounded-2xl bg-white/5 border transition-all ${
                      errors.email
                        ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                        : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                    }`}
                  >
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="email"
                      placeholder="nama@adakamar.id"
                      autoComplete="email"
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Kata Sandi <span className="text-[#ffdbcf]">*</span>
                    </label>
                    <Link
                      href="/lupa-kata-sandi"
                      className="text-[11px] font-semibold text-[#ffdbcf] hover:underline underline-offset-2 transition-colors"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <div
                    className={`flex items-center gap-2.5 px-4 h-12 rounded-2xl bg-white/5 border transition-all ${
                      errors.password
                        ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                        : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                    }`}
                  >
                    <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      autoComplete="current-password"
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    className="rounded accent-[#9f3c16] w-4 h-4 cursor-pointer"
                    {...register("rememberMe")}
                  />
                  <span>Ingat sesi saya di perangkat ini</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9f3c16] via-[#bf542c] to-[#9f3c16] text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Memverifikasi Sesi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk sebagai {selectedRole === "ADMIN" ? "Administrator" : "Penulis"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials Panel */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-300">
                    <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                    Akun Demo Siap Pakai (1-Klik):
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                    Auto-Fill
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Admin Quick Pick */}
                  <button
                    type="button"
                    onClick={() => handleQuickFill("ADMIN")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedRole === "ADMIN"
                        ? "bg-white/10 border-amber-400/40 shadow-xs"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400" />
                        Admin
                      </span>
                      {selectedRole === "ADMIN" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono truncate">
                      admin@adakamar.id
                    </span>
                  </button>

                  {/* Penulis Quick Pick */}
                  <button
                    type="button"
                    onClick={() => handleQuickFill("PENULIS")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedRole === "PENULIS"
                        ? "bg-white/10 border-emerald-400/40 shadow-xs"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] flex items-center gap-1">
                        <PenSquare className="w-3 h-3 text-emerald-400" />
                        Penulis
                      </span>
                      {selectedRole === "PENULIS" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono truncate">
                      penulis@adakamar.id
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Trust Badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Otentikasi Terenkripsi · Sesi Khusus Internal</span>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
