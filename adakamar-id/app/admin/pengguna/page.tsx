"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { ChevronRight, UserPlus, Users, Home, ShieldCheck, Shield, Search, Edit3, Lock, Trash2, X, FileText } from "lucide-react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Penulis";
  status: "active" | "suspended";
  joinedDate: string;
  lastLogin: string;
  avatarUrl?: string;
}

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAccount | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<UserAccount["role"]>("Penulis");
  const [formStatus, setFormStatus] = useState<"active" | "suspended">("active");

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
          joinedDate: new Date(u.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          lastLogin: "Aktif baru-baru ini",
          avatarUrl: u.avatarUrl,
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
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Penulis");
    setFormStatus("active");
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingItem(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        if (
          (editingItem.status === "active" && formStatus === "suspended") ||
          (editingItem.status === "suspended" && formStatus === "active")
        ) {
          await usersApi.toggleActive(editingItem.id);
        }
      } else {
        const role = formRole === "Super Admin" ? "ADMIN" : "PENULIS";
        await usersApi.create({
          name: formName,
          email: formEmail,
          role,
        });
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan akun pengguna.");
    }
    setModalOpen(false);
    await loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus akun pengguna ini secara permanen dari database?")) return;
    try {
      await usersApi.remove(id);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pengguna.");
    }
    await loadUsers();
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9f3c16] hover:bg-[#853212] text-white text-xs font-semibold rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </header>

        {/* Body */}
        <main className="p-8 max-w-[1440px] w-full flex flex-col gap-6">
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
              Kelola kredensial tim internal (Super Admin dan Penulis Redaksi) yang bertugas
              mengelola kurasi homestay dan artikel panduan Jogja.
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
                  Penulis Redaksi
                </span>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1 tracking-tight">
                  {users.filter((u) => u.role === "Penulis").length} Penulis
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-between group hover:border-zinc-300 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Akun Aktif
                </span>
                <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">
                  {users.filter((u) => u.status === "active").length} Akun
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama atau email pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9f3c16]/20 transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs font-semibold text-zinc-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Peran (Role)</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Penulis">Penulis Redaksi</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/60 border-b border-zinc-100 text-zinc-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Nama & Identitas</th>
                    <th className="px-5 py-4">Peran / Role</th>
                    <th className="px-5 py-4">Bergabung</th>
                    <th className="px-5 py-4">Login Terakhir</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#ffdbcf]/60 text-[#9f3c16] flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 text-xs">
                              {user.name}
                            </h4>
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
                      <td className="px-5 py-4 text-zinc-500 font-medium">
                        {user.joinedDate}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {user.lastLogin}
                      </td>
                      <td className="px-5 py-4">
                        {user.status === "active" ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5 w-fit border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold w-fit border border-rose-200/60">
                            Ditangguhkan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Edit Akun"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-700 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-zinc-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="font-semibold text-sm text-zinc-600">Belum ada akun pengguna</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Klik &quot;Tambah Akun Baru&quot; untuk menambahkan staf ke sistem.
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200/80 flex flex-col gap-4">
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
                    Atur nama, email, dan hak akses staf
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
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
                  Status Akun
                </label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "active" | "suspended")
                  }
                  className="w-full h-10 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:outline-none font-medium text-zinc-800"
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Ditangguhkan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#9f3c16] hover:bg-[#853212] text-white font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
