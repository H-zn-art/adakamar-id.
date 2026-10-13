"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import {
  ChevronRight,
  UserPlus,
  Users,
  Home,
  ShieldCheck,
  Shield,
  Search,
  Edit3,
  Lock,
  Trash2,
  X,
  FileText,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Sparkles,
  Phone,
  Clock,
  UserCheck,
} from "lucide-react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Penulis";
  status: "active" | "suspended";
  isActive: boolean;
  joinedDate: string;
  lastLogin: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  articleCount?: number;
}

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAccount | null>(null);

  // Track currently logged-in Super Admin so we can prevent self-deletion
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formPassword, setFormPassword] = useState("adakamar123");
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserAccount["role"]>("Penulis");
  const [formStatus, setFormStatus] = useState<"active" | "suspended">("active");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadUsers = async () => {
    try {
      const data = await usersApi.findAll();
      if (Array.isArray(data)) {
        const mapped: UserAccount[] = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === "ADMIN" ? "Super Admin" : "Penulis",
          status: u.isActive ? "active" : "suspended",
          isActive: Boolean(u.isActive),
          joinedDate: new Date(u.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          lastLogin: "Aktif baru-baru ini",
          avatarUrl: u.avatarUrl,
          phone: u.phone || "",
          bio: u.bio || "",
          articleCount: u._count?.articles ?? 0,
        }));
        setUsers(mapped);
        return;
      }
    } catch (err) {
      console.warn("API load users error:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    // Read current logged-in user from localStorage
    try {
      const stored = localStorage.getItem("adakamar_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUserId(parsed?.id || null);
        setCurrentUserRole(parsed?.role || null);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormBio("");
    setFormPassword("adakamar123");
    setShowPassword(false);
    setFormRole("Penulis");
    setFormStatus("active");
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingItem(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || "");
    setFormBio(user.bio || "");
    setFormPassword("");
    setShowPassword(false);
    setFormRole(user.role);
    setFormStatus(user.isActive ? "active" : "suspended");
    setModalOpen(true);
  };

  const handleToggleActive = async (user: UserAccount) => {
    try {
      await usersApi.toggleActive(user.id);
      const willBeActive = !user.isActive;
      showToast(
        "success",
        willBeActive
          ? `✓ Akun "${user.name}" berhasil diaktifkan! Penulis sekarang dapat login ke sistem.`
          : `Akun "${user.name}" telah dinonaktifkan.`
      );
      await loadUsers();
    } catch (err: any) {
      showToast("error", err?.message || "Gagal mengubah status aktivasi akun.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const role = formRole === "Super Admin" ? "ADMIN" : "PENULIS";

      if (editingItem) {
        await usersApi.update(editingItem.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          bio: formBio.trim() || undefined,
          role,
          isActive: formStatus === "active",
          password: formPassword.trim() ? formPassword.trim() : undefined,
        });
        showToast(
          "success",
          `✓ Data akun "${formName}" berhasil diperbarui! Status: ${
            formStatus === "active" ? "Aktif (Bisa Login)" : "Menunggu Aktivasi / Nonaktif"
          }.${formPassword.trim() ? " Kata sandi baru telah disimpan." : ""}`
        );
      } else {
        const passwordToUse = formPassword.trim() || "adakamar123";
        await usersApi.create({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          bio: formBio.trim() || undefined,
          role,
          password: passwordToUse,
        });
        showToast(
          "success",
          `✓ Akun "${formName}" (${formEmail}) berhasil dibuat! Kata sandi: "${passwordToUse}". Akun ini siap digunakan untuk login di /masuk.`
        );
      }
      setModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan akun pengguna.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userRole: string) => {
    // Proteksi: Super Admin tidak dapat menghapus akunnya sendiri
    if (id === currentUserId && currentUserRole === "ADMIN") {
      showToast("error", "⛔ Anda tidak dapat menghapus akun Anda sendiri sebagai Super Admin.");
      return;
    }
    if (!confirm("Hapus akun pengguna ini secara permanen dari database?")) return;
    try {
      await usersApi.remove(id);
      showToast("success", "✓ Akun pengguna berhasil dihapus.");
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus pengguna.");
    }
    await loadUsers();
  };

  const pendingWritersCount = users.filter((u) => !u.isActive).length;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    if (roleFilter === "pending") {
      return matchSearch && !u.isActive;
    }
    if (roleFilter === "active") {
      return matchSearch && u.isActive;
    }
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-[#f8f7fb] min-h-screen flex font-sans">
      <AdminSidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">
              CMS Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Sistem & Keamanan</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#9f3c16] font-semibold">
              Manajemen Pengguna
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
          {/* Toast Notification Alert */}
          {toastMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toastMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Banner Pendaftaran Penulis Menunggu Aktivasi */}
          {pendingWritersCount > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>{pendingWritersCount} Pendaftaran Penulis Menunggu Aktivasi</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                      Perlu Tindakan
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Penulis luar yang baru mendaftar tidak dapat masuk ke sistem sampai Anda menekan tombol <strong>&ldquo;Aktifkan&rdquo;</strong> di tabel bawah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleFilter("pending")}
                className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                Tampilkan yang Menunggu ({pendingWritersCount})
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] text-[11px] font-bold uppercase tracking-wider">
                Hak Akses & Kredensial
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Kontrol Tim adakamar.id
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Manajemen Akun & Hak Akses
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Kelola kredensial tim internal serta verifikasi dan aktivasi penulis artikel berbakat yang baru mendaftar untuk membuat konten panduan Jogja.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Pengguna
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {users.length} Akun
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Super Admin
                </span>
                <p className="text-3xl font-extrabold text-[#9f3c16] mt-1 tracking-tight">
                  {users.filter((u) => u.role === "Super Admin").length} Akun
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Penulis Konten
                </span>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1 tracking-tight">
                  {users.filter((u) => u.role === "Penulis").length} Penulis
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className={`p-6 rounded-3xl bg-white border shadow-xs flex items-center justify-between transition-all ${
              pendingWritersCount > 0
                ? "border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/20"
                : "border-zinc-200/80"
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Menunggu Aktivasi
                </span>
                <p className={`text-3xl font-extrabold mt-1 tracking-tight ${
                  pendingWritersCount > 0 ? "text-amber-700" : "text-zinc-900"
                }`}>
                  {pendingWritersCount} Akun
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                pendingWritersCount > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-zinc-100 text-zinc-600"
              }`}>
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama, email, atau no. telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs font-semibold text-zinc-700 focus:bg-white focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Semua Status & Peran</option>
                <option value="pending">⏳ Menunggu Aktivasi ({pendingWritersCount})</option>
                <option value="active">✓ Akun Aktif</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Penulis">Penulis Redaksi</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/60 border-b border-zinc-100 text-zinc-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Nama & Identitas</th>
                    <th className="px-5 py-4">Peran / Role</th>
                    <th className="px-5 py-4">Kontak / Bio</th>
                    <th className="px-5 py-4">Bergabung</th>
                    <th className="px-5 py-4">Status Akun</th>
                    <th className="px-6 py-4 text-right">Aksi Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        !user.isActive ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            !user.isActive
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#ffdbcf]/60 text-[#9f3c16]"
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-zinc-900 text-xs">
                                {user.name}
                              </h4>
                              {!user.isActive && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                                  BARU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                            user.role === "Super Admin"
                              ? "bg-zinc-950 text-white"
                              : "bg-[#ffdbcf]/60 text-[#9f3c16]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">-</span>
                        )}
                        {user.bio && (
                          <p className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5" title={user.bio}>
                            {user.bio}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-500 font-medium">
                        {user.joinedDate}
                      </td>
                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5 w-fit border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5 w-fit border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Menunggu Aktivasi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Aktivasi Cepat untuk Penulis yang belum aktif */}
                          {!user.isActive && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all cursor-pointer mr-1"
                              title="Aktifkan Akun Penulis Ini"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aktifkan Akun</span>
                            </button>
                          )}

                          {/* Tombol Nonaktifkan untuk Akun yang sedang aktif (kecuali diri sendiri) */}
                          {user.isActive && user.id !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              className="p-2 rounded-xl hover:bg-amber-50 text-zinc-400 hover:text-amber-700 transition-colors cursor-pointer"
                              title="Nonaktifkan Akun"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Hapus: disembunyikan jika akun adalah Super Admin yang sedang login */}
                          {user.id === currentUserId && currentUserRole === "ADMIN" ? (
                            <div
                              className="p-2 rounded-xl text-zinc-300 cursor-not-allowed"
                              title="Super Admin tidak dapat menghapus akun sendiri"
                            >
                              <Trash2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id, user.role)}
                              className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-zinc-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="font-semibold text-sm text-zinc-600">
                          {roleFilter === "pending"
                            ? "Tidak ada akun yang menunggu aktivasi"
                            : "Tidak ada akun pengguna yang cocok"}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {roleFilter === "pending"
                            ? "Semua akun penulis yang terdaftar telah diaktifkan."
                            : "Ubah kata kunci pencarian atau filter peran."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#ffdbcf]/50 text-[#9f3c16] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingItem ? "Edit Akun Pengguna" : "Tambah Akun Pengguna"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Atur nama, email, nomor telepon, status aktivasi, dan hak akses
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Raditya Danu"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Nomor WhatsApp / Kontak (Opsional)
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Bio / Portofolio Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Pengalaman menulis atau topik artikel yang disukai..."
                  className="w-full p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900 resize-none text-xs"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-zinc-800 block">
                    {editingItem ? "Ganti Kata Sandi (Opsional)" : "Kata Sandi Akun (Password) *"}
                  </label>
                  {!editingItem && (
                    <button
                      type="button"
                      onClick={() => setFormPassword("adakamar123")}
                      className="text-[10px] text-[#9f3c16] font-bold hover:underline cursor-pointer"
                    >
                      Reset ke default
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingItem}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={
                      editingItem
                        ? "Kosongkan jika tidak ingin mengubah kata sandi"
                        : "Minimal 6 karakter (Default: adakamar123)"
                    }
                    className="w-full h-10 pl-3.5 pr-10 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all text-zinc-900 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {editingItem
                    ? "Isi kolom ini hanya jika staf lupa sandi atau ingin mereset kata sandinya."
                    : "Kata sandi yang digunakan akun ini untuk login di halaman Masuk (/masuk)."}
                </p>
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Peran Akun (Role)
                </label>
                <select
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value as UserAccount["role"])
                  }
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                >
                  <option value="Penulis">Penulis Redaksi</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-800 block mb-1">
                  Status Aktivasi Akun
                </label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "active" | "suspended")
                  }
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                >
                  <option value="active">✓ Aktif (Dapat Login ke Sistem)</option>
                  <option value="suspended">⏳ Menunggu Aktivasi / Nonaktif (Tidak Bisa Login)</option>
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Pilih &ldquo;Aktif&rdquo; untuk menyetujui akun penulis baru agar dapat login ke portal.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Simpan Perubahan" : "Simpan Akun Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
