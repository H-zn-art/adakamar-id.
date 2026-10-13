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
  Clock,
  UserPlus,
  Phone,
  FileText,
  UserCheck,
} from "lucide-react";

// ─── Zod Schema: Login ───
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

// ─── Zod Schema: Register Penulis ───
const registerSchema = z
  .object({
    name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    email: z
      .string()
      .min(1, "Alamat email wajib diisi")
      .email("Format email tidak valid"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    password: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "PENULIS">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Registration success state
  const [registeredData, setRegisteredData] = useState<{ name: string; email: string } | null>(null);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Register form
  const {
    register: registerWriter,
    handleSubmit: handleSubmitRegister,
    reset: resetRegisterForm,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleQuickFill = (role: "ADMIN" | "PENULIS") => {
    setSelectedRole(role);
    setServerError("");
    if (role === "ADMIN") {
      setLoginValue("email", "admin@adakamar.id");
      setLoginValue("password", "admin123");
    } else {
      setLoginValue("email", "penulis@adakamar.id");
      setLoginValue("password", "penulis123");
    }
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    setServerError("");
    setIsLoading(true);

    try {
      // 1. Try real NestJS backend login with expectedRole
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          expectedRole: selectedRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Validasi kesesuaian peran: jika memilih Administrator tetapi akun adalah Penulis (atau sebaliknya)
        if (selectedRole === "ADMIN" && data.user.role !== "ADMIN") {
          setIsLoading(false);
          setServerError(
            'Akun ini terdaftar sebagai Penulis Konten, bukan Administrator. Silakan klik tombol "Penulis Jogja" di atas untuk masuk.',
          );
          return;
        }

        if (selectedRole === "PENULIS" && data.user.role !== "PENULIS") {
          setIsLoading(false);
          setServerError(
            'Akun ini adalah akun Administrator. Silakan klik tombol "Administrator" di atas untuk masuk.',
          );
          return;
        }

        localStorage.setItem("adakamar_token", data.accessToken);
        localStorage.setItem("adakamar_user", JSON.stringify(data.user));

        // Simpan ke cookie agar middleware bisa baca route guard
        const maxAge = values.rememberMe ? 60 * 60 * 24 * 7 : 60 * 8;
        document.cookie = `adakamar_token=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `adakamar_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/penulis");
        }
        return;
      }

      // Backend online tapi login ditolak (password salah, peran tidak cocok, atau akun belum diaktifkan)
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || "Kredensial tidak valid.");
    } catch (err: any) {
      const isNetworkError = err instanceof TypeError && err.message.includes("fetch");

      if (!isNetworkError) {
        setIsLoading(false);
        setServerError(err?.message || "Email atau kata sandi salah.");
        return;
      }

      // Jika backend offline, periksa apakah pengguna mencoba akun demo
      const isDemoAdmin = values.email === "admin@adakamar.id" && values.password === "admin123";
      const isDemoPenulis = values.email === "penulis@adakamar.id" && values.password === "penulis123";

      if (!isDemoAdmin && !isDemoPenulis) {
        setIsLoading(false);
        setServerError(
          "Tidak dapat terhubung ke server backend (port 4000). Pastikan server backend sedang aktif agar akun terdaftar dapat diverifikasi.",
        );
        return;
      }
    }

    // Client-side demo fallback jika backend tidak dapat dihubungi
    setTimeout(() => {
      const maxAge = values.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8;

      if (selectedRole === "ADMIN" && values.email === "admin@adakamar.id" && values.password === "admin123") {
        localStorage.setItem(
          "adakamar_user",
          JSON.stringify({ name: "Raditya Danu", email: "admin@adakamar.id", role: "ADMIN" })
        );
        document.cookie = `adakamar_role=ADMIN; path=/; max-age=${maxAge}; SameSite=Lax`;
        router.push("/admin");
      } else if (selectedRole === "PENULIS" && values.email === "penulis@adakamar.id" && values.password === "penulis123") {
        localStorage.setItem(
          "adakamar_user",
          JSON.stringify({ name: "Sekar Ayu Kinanti", email: "penulis@adakamar.id", role: "PENULIS" })
        );
        document.cookie = `adakamar_role=PENULIS; path=/; max-age=${maxAge}; SameSite=Lax`;
        router.push("/penulis");
      } else if (selectedRole === "ADMIN" && values.email === "penulis@adakamar.id") {
        setIsLoading(false);
        setServerError('Akun ini terdaftar sebagai Penulis Konten, bukan Administrator. Silakan klik tombol "Penulis Jogja" untuk masuk.');
      } else if (selectedRole === "PENULIS" && values.email === "admin@adakamar.id") {
        setIsLoading(false);
        setServerError('Akun ini adalah akun Administrator. Silakan klik tombol "Administrator" untuk masuk.');
      } else {
        setIsLoading(false);
        setServerError(
          "Email atau kata sandi tidak valid. Gunakan akun demo: admin@adakamar.id / admin123 atau penulis@adakamar.id / penulis123"
        );
      }
    }, 400);
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setServerError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          phone: values.phone?.trim() || undefined,
          bio: values.bio?.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Gagal melakukan pendaftaran penulis.");
      }

      // Sukses mendaftar! Set status pendaftaran berhasil
      setRegisteredData({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      resetRegisterForm();
    } catch (err: any) {
      setServerError(err?.message || "Terjadi kesalahan saat mendaftar. Pastikan server backend aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper jika user di alert belum diaktifkan
  const isPendingActivationError =
    serverError.toLowerCase().includes("belum diaktifkan") ||
    serverError.toLowerCase().includes("verifikasi");

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
          <div className="w-full max-w-lg">
            {/* Card in Luxury Glassmorphism */}
            <div className="relative rounded-3xl bg-zinc-950/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-9 shadow-2xl overflow-hidden">
              {/* Top ambient glow inside card */}
              <div className="absolute -top-10 inset-x-0 h-32 bg-gradient-to-b from-[#9f3c16]/25 to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-3 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {activeTab === "login" ? "Portal Masuk Tim & Penulis" : "Pendaftaran Penulis Konten"}
                  </span>
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
                  {activeTab === "login"
                    ? "Portal terpadu Administrator dan Penulis Konten Panduan Wisata Jogja."
                    : "Peluang bagi penulis berbakat untuk berkontribusi cerita & panduan Jogja."}
                </p>
              </div>

              {/* Top Navigation Tabs: [Masuk ke Akun] / [Daftar Penulis Baru] */}
              <div className="relative z-10 mb-6 p-1 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setServerError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "login"
                      ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white shadow-lg scale-[1.01]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setServerError("");
                    setRegisteredData(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "register"
                      ? "bg-gradient-to-r from-[#9f3c16] to-[#bf542c] text-white shadow-lg scale-[1.01]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Penulis Baru</span>
                </button>
              </div>

              {/* Alert: Khusus Akun Menunggu Aktivasi Super Admin */}
              {serverError && isPendingActivationError && (
                <div className="relative z-10 mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-amber-300 text-xs mb-1">
                      Akun Menunggu Aktivasi Super Admin
                    </h5>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      {serverError}
                    </p>
                    <p className="text-[10px] text-amber-300/80 mt-1.5 font-medium">
                      💡 Super Admin mengaktifkan akun Anda di menu CMS Admin &rarr; Kelola Pengguna.
                    </p>
                  </div>
                </div>
              )}

              {/* Standard Server Error Alert */}
              {serverError && !isPendingActivationError && (
                <div className="relative z-10 mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: LOGIN FORM                                       */}
              {/* ======================================================== */}
              {activeTab === "login" && (
                <>
                  {/* Role Switcher Pill Capsule (Admin vs Penulis) */}
                  <div className="relative z-10 mb-5 p-1 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-1 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("ADMIN");
                        setServerError("");
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === "ADMIN"
                          ? "bg-white/15 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-300" />
                      <span>Administrator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("PENULIS");
                        setServerError("");
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === "PENULIS"
                          ? "bg-white/15 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <PenSquare className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Penulis Jogja</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="relative z-10 flex flex-col gap-4" noValidate>
                    {/* Email Field */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                        Alamat Email <span className="text-[#ffdbcf]">*</span>
                      </label>
                      <div
                        className={`flex items-center gap-2.5 px-4 h-12 rounded-2xl bg-white/5 border transition-all ${
                          loginErrors.email
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
                          {...registerLogin("email")}
                        />
                      </div>
                      {loginErrors.email && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {loginErrors.email.message}
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
                          loginErrors.password
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
                          {...registerLogin("password")}
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
                      {loginErrors.password && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {loginErrors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me */}
                    <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        className="rounded accent-[#9f3c16] w-4 h-4 cursor-pointer"
                        {...registerLogin("rememberMe")}
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

                  {/* CTA Switch ke Register */}
                  <div className="relative z-10 mt-5 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-zinc-400">
                      Penulis berbakat ingin berkontribusi artikel Jogja?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("register");
                          setServerError("");
                        }}
                        className="font-bold text-[#ffdbcf] hover:underline underline-offset-2 transition-colors cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <span>Daftar Jadi Penulis</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </p>
                  </div>

                  {/* Quick Demo Credentials Panel */}
                  <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
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
                </>
              )}

              {/* ======================================================== */}
              {/* TAB 2: REGISTER FORM                                    */}
              {/* ======================================================== */}
              {activeTab === "register" && (
                <>
                  {registeredData ? (
                    /* SUCCESS STATE: MENUNGGU AKTIVASI SUPER ADMIN */
                    <div className="relative z-10 flex flex-col items-center text-center py-4 animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-4 shadow-xl">
                        <Clock className="w-8 h-8 animate-pulse text-amber-400" />
                      </div>

                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                        <span>Menunggu Aktivasi Akun</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2">
                        Pendaftaran Berhasil Dikirim!
                      </h3>

                      <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mb-5">
                        Terima kasih telah mendaftar, <strong className="text-white">{registeredData.name}</strong>.
                        Akun Anda telah tersimpan di sistem dengan email <strong className="text-amber-200">{registeredData.email}</strong>.
                      </p>

                      {/* Detail Card */}
                      <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs mb-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-zinc-400">Status Akun:</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Menunggu Aktivasi Super Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                          Demi menjaga kualitas artikel panduan adakamar.id, penulis baru <strong>tidak dapat langsung login</strong>. Harap menunggu hingga <strong>Super Admin</strong> memverifikasi dan mengaktifkan akun Anda di menu kelola pengguna.
                        </p>
                      </div>

                      <div className="w-full flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisteredData(null);
                            setActiveTab("login");
                            setLoginValue("email", registeredData.email);
                            setLoginValue("password", "");
                          }}
                          className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#9f3c16] via-[#bf542c] to-[#9f3c16] text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Ke Halaman Masuk</span>
                        </button>
                        <Link
                          href="/"
                          className="h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                        >
                          Kembali ke Beranda
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* FORM PENDAFTARAN PENULIS BARU */
                    <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="relative z-10 flex flex-col gap-3.5" noValidate>
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Setelah mendaftar, akun Anda harus <strong>diaktifkan terlebih dahulu oleh Super Admin</strong> di panel kelola pengguna sebelum dapat login.
                        </span>
                      </div>

                      {/* Nama Lengkap */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Nama Lengkap Penulis <span className="text-[#ffdbcf]">*</span>
                        </label>
                        <div
                          className={`flex items-center gap-2.5 px-3.5 h-11 rounded-2xl bg-white/5 border transition-all ${
                            registerErrors.name
                              ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                              : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                          }`}
                        >
                          <PenSquare className="w-4 h-4 text-zinc-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="Contoh: Sekar Ayu Kinanti"
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                            {...registerWriter("name")}
                          />
                        </div>
                        {registerErrors.name && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {registerErrors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Alamat Email Aktif <span className="text-[#ffdbcf]">*</span>
                        </label>
                        <div
                          className={`flex items-center gap-2.5 px-3.5 h-11 rounded-2xl bg-white/5 border transition-all ${
                            registerErrors.email
                              ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                              : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                          }`}
                        >
                          <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                          <input
                            type="email"
                            placeholder="nama@email.com"
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                            {...registerWriter("email")}
                          />
                        </div>
                        {registerErrors.email && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {registerErrors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Nomor WhatsApp / Telepon */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Nomor WhatsApp / Kontak <span className="text-zinc-500 text-[10px]">(Opsional)</span>
                        </label>
                        <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30 transition-all">
                          <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                          <input
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                            {...registerWriter("phone")}
                          />
                        </div>
                      </div>

                      {/* Bio / Minat Topik */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Topik Tulisan / Portofolio Singkat <span className="text-zinc-500 text-[10px]">(Opsional)</span>
                        </label>
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30 transition-all">
                          <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                          <textarea
                            rows={2}
                            placeholder="Contoh: Wisata Kuliner Pasar Ngasem, Hidden Gem Gunungkidul, Seni Tradisi..."
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none resize-none"
                            {...registerWriter("bio")}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Kata Sandi <span className="text-[#ffdbcf]">*</span>
                        </label>
                        <div
                          className={`flex items-center gap-2.5 px-3.5 h-11 rounded-2xl bg-white/5 border transition-all ${
                            registerErrors.password
                              ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                              : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                          }`}
                        >
                          <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="Minimal 6 karakter"
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                            {...registerWriter("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerErrors.password && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {registerErrors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                          Konfirmasi Kata Sandi <span className="text-[#ffdbcf]">*</span>
                        </label>
                        <div
                          className={`flex items-center gap-2.5 px-3.5 h-11 rounded-2xl bg-white/5 border transition-all ${
                            registerErrors.confirmPassword
                              ? "border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/30"
                              : "border-white/10 focus-within:border-[#ffdbcf]/60 focus-within:ring-2 focus-within:ring-[#9f3c16]/30"
                          }`}
                        >
                          <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                          <input
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi kata sandi"
                            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                            {...registerWriter("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                          >
                            {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerErrors.confirmPassword && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {registerErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Register Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#9f3c16] via-[#bf542c] to-[#9f3c16] text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Mendaftarkan Penulis...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Kirim Pendaftaran Penulis</span>
                          </>
                        )}
                      </button>

                      {/* Switch back to Login */}
                      <div className="pt-2 text-center">
                        <p className="text-xs text-zinc-400">
                          Sudah memiliki akun yang aktif?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("login");
                              setServerError("");
                            }}
                            className="font-bold text-[#ffdbcf] hover:underline underline-offset-2 transition-colors cursor-pointer ml-1"
                          >
                            Masuk di sini
                          </button>
                        </p>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Security Trust Badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Kurasi adakamar.id · Verifikasi Terpusat oleh Super Admin</span>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
