# 🌿 adakamar.id — Platform Kurasi Homestay Autentik Yogyakarta

> **Tugas Akhir / Proyek Magang**: Sistem Informasi Pemesanan & Kurasi Homestay Tradisional Berbasis Web (Next.js 15 + NestJS + MySQL).

---

## 📌 Tentang Proyek

**adakamar.id** adalah platform digital inovatif yang mengurasi penginapan bernuansa autentik (Joglo, Limasan, Omah Kayu, Heritage) di seluruh wilayah Daerah Istimewa Yogyakarta. Platform ini menghubungkan wisatawan yang mencari ketenangan dan pengalaman budaya lokal langsung dengan para pemilik homestay lokal melalui sistem reservasi WhatsApp yang terintegrasi, tanpa potongan komisi yang memberatkan.

Proyek ini dibangun menggunakan arsitektur **Monorepo** yang memisahkan sisi *Frontend* (pengalaman pengguna dan antarmuka interaktif) dan *Backend API* (logika bisnis, autentikasi berbasis peran/role, dan manajemen database relasional).

---

## 🚀 Fitur-Fitur Utama

### 1. Sisi Tamu & Pengunjung (Public Guest)
* **Katalog Penginapan Terkurasi**: Filter pencarian cerdas berdasarkan wilayah (Kota Jogja, Sleman, Bantul, Kulon Progo, Gunungkidul), rentang harga, kapasitas tamu, dan fasilitas.
* **Lencana "Pilihan Kurator"**: Penanda khusus untuk properti yang telah lolos standar kenyamanan dan estetika tim kurator.
* **Direct WhatsApp Booking Engine**: Formulir pemesanan langsung memformat pesan reservasi secara rapi dan otomatis mengarahkan tamu ke nomor host/pemilik penginapan via WhatsApp.
* **Majalah & Panduan Wisata Jogja**: Artikel editorial terkurasi seputar budaya, destinasi tersembunyi, dan kuliner legendaris.
* **Ulasan Tamu & Testimoni**: Menampilkan ulasan autentik tamu yang pernah menginap.

### 2. Sisi Admin (CMS Manajemen)
* **Dashboard Statistik Interaktif**: Ringkasan jumlah penginapan, status aktif/nonaktif, rating rata-rata, dan ulasan tamu.
* **Manajemen Penginapan (CRUD Lengkap)**:
  * Tambah/edit unit penginapan via Modal Box atau Halaman Khusus.
  * Dukungan multi-foto galeri dan foto sampul utama.
  * Pemilih Foto Galeri Visual (**Pilih dari Galeri**) & upload langsung dari komputer.
  * Toggle kurator pilihan (*Featured*) dan penyesuaian aturan penginapan.
* **Pustaka Galeri Media**: Manajemen aset gambar mandiri (upload lokal, salin tautan absolut, serta tombol *Pasang Foto* langsung ke penginapan).
* **Inquiry & Pemesanan Tamu**: Daftar riwayat pesan reservasi tamu lengkap dengan *Modal Box Detail Reservasi*.

### 3. Sisi Penulis (Author / Editorial CMS)
* **Pusat Penulisan Artikel**:
  * Pembuatan artikel dengan pratinjau judul, ringkasan, dan konten naratif.
  * Otomasi slug ramah SEO dan sistem tag dinamis.
  * Pilihan kategori artikel dan pengaturan status (Draf vs Terbit).
* **Manajemen Profil Penulis**: Pengaturan foto avatar, nama pena, dan bio singkat penulis.

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19 | Server & Client Components, Fast Refresh |
| **Styling** | Tailwind CSS + Vanilla CSS Tokens | Glassmorphism, Palet Warna Terracotta & Sage |
| **Icons & UI** | Lucide React | Modern, konsisten, dan ringan |
| **Backend API** | NestJS 10 (TypeScript) | Modular Architecture, RESTful API |
| **Database** | MySQL (Relasional) | Penyimpanan data terstruktur dan integritas relasi |
| **ORM** | Prisma ORM | Tipe data aman (*Type-safe queries*), Migrasi & Seeding |
| **Autentikasi** | JWT (JSON Web Token) + Passport | Role-based Access Control (`ADMIN`, `PENULIS`) |

---

## 📁 Struktur Monorepo

```text
├── adakamar-id/               # 🖥️ APLIKASI FRONTEND (Next.js 15)
│   ├── app/                   # App Router (Halaman Tamu, Admin, Penulis, & API Routes)
│   │   ├── admin/             # Panel CMS Admin (Penginapan, Media, Pemesanan, dll)
│   │   ├── penulis/           # Panel Penulis (Artikel Baru, Draf, Profil)
│   │   ├── homestay/          # Halaman Katalog & Detail Unit Homestay
│   │   ├── panduan-jogja/     # Halaman Artikel Editorial & Kategori
│   │   └── api/               # Next.js API Routes (termasuk /api/upload)
│   ├── components/            # Komponen UI (Navbar, Footer, Sidebar, Card, Modals)
│   ├── lib/                   # API Client Wrapper & Helpers
│   └── public/                # Aset statis & Folder Unggahan Lokal (/uploads)
│
├── adakamar-backend/          # ⚙️ APLIKASI BACKEND REST API (NestJS + Prisma)
│   ├── src/                   # Modul Backend (auth, properties, articles, facilities, dll)
│   ├── prisma/                # Skema Database (schema.prisma) & Data Seed (seed.ts)
│   └── .env.example           # Template Konfigurasi Environment Backend
│
├── dev.js                     # ⚡ Skrip Runner (Menjalankan Frontend & Backend Sekaligus)
├── package.json               # Konfigurasi Monorepo Root
├── PRD adakamar.id.pdf        # Dokumen Spesifikasi Produk (PRD Utama)
└── PRD Role & User Flow adakamar.id.pdf # Dokumen Alur Pengguna & Role
```

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

### 1. Prasyarat
* **Node.js**: Versi 18.x atau yang lebih baru ([Unduh Node.js](https://nodejs.org/))
* **Database MySQL**: XAMPP, Laragon, atau Docker MySQL service aktif pada port `3306`.

### 2. Konfigurasi Database MySQL
1. Buka MySQL client Anda (misalnya **phpMyAdmin** atau HeidiSQL).
2. Buat database baru bernama:
   ```sql
   CREATE DATABASE adakamar_db;
   ```

### 3. Setup Backend (`adakamar-backend`)
1. Masuk ke folder backend dan pasang berkas `.env`:
   ```bash
   cd adakamar-backend
   cp .env.example .env
   ```
2. Pastikan isi `.env` sesuai dengan konfigurasi MySQL lokal Anda (default XAMPP tanpa password):
   ```env
   PORT=4000
   DATABASE_URL="mysql://root:@localhost:3306/adakamar_db"
   JWT_SECRET="adakamar_secret_jwt_key_mataram_jogja_2025"
   JWT_EXPIRES_IN="7d"
   FRONTEND_URL="http://localhost:3000"
   ```
3. Lakukan instalasi dependensi, sinkronisasi skema, dan isi data awal (*seeding*):
   ```bash
   npm install
   npx prisma db push
   npm run prisma:seed
   ```
4. Kembali ke direktori utama:
   ```bash
   cd ..
   ```

### 4. Setup Frontend (`adakamar-id`)
1. Masuk ke direktori frontend dan instal dependensi:
   ```bash
   cd adakamar-id
   npm install
   cd ..
   ```

### 5. Menjalankan Seluruh Aplikasi Sekaligus
Dari folder paling luar (*root workspace*), jalankan satu perintah:
```bash
npm run dev
```
* **Frontend** berjalan di: [http://localhost:3000](http://localhost:3000)
* **Backend API** berjalan di: [http://localhost:4000/api](http://localhost:4000/api)

---

## 🔑 Akun Bawaan (Default Login Credentials)

Untuk menguji fitur autentikasi dan panel CMS, gunakan akun demo yang telah di-seed ke dalam database:

| Peran (Role) | Email | Password | Akses Menu |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@adakamar.id` | `admin123` | Dashboard, Penginapan, Pustaka Media, Pemesanan, Kategori, Fasilitas |
| **Penulis (Author)** | `penulis@adakamar.id` | `penulis123` | Buat Artikel, Kelola Draf, Terbitkan Artikel, Profil Penulis |

Halaman login dapat diakses di: [http://localhost:3000/masuk](http://localhost:3000/masuk)

---

## 📑 Berkas Bukti & Dokumen Tugas
Dalam repositori ini disertakan berkas pendukung resmi untuk evaluasi:
1. **`PRD adakamar.id.pdf`**: *Product Requirement Document* kurasi homestay autentik.
2. **`PRD Role & User Flow adakamar.id.pdf`**: *Role, permission matrix*, dan diagram alur pengguna.
3. **`DESIGN.md adakamar.id.md`**: Panduan desain antarmuka, filosofi warna, dan tipografi budaya Jawa modern.

---

## 👨‍💻 Pengembang
Dikembangkan untuk pengumpulan tugas dan portofolio proyek magang sistem informasi berbasis web modern.
Semua hak cipta dilindungi © 2026 **adakamar.id**.
