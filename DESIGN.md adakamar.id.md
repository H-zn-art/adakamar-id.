# DESIGN.md
# adakamar.id — UI/UX Design System

**Version:** 1.0  
**Product:** adakamar.id  
**Design Direction:** Modern Hospitality / Clean / Editorial / Professional

---

# 1. Design Vision

adakamar.id harus memiliki visual yang terasa seperti platform penginapan profesional, bukan sekadar website CRUD.

Desain harus mengutamakan:

- Trust
- Clarity
- Comfort
- Simplicity
- Hospitality
- Discoverability
- Strong photography
- Easy booking

Desain mengambil inspirasi dari pola website penginapan modern, tetapi tidak menyalin identitas visual, layout secara identik, gambar, logo, atau aset website lain.

---

# 2. Design Principles

## 2.1 Clean

Gunakan whitespace yang cukup.

Hindari:

- Card berlebihan.
- Border berlebihan.
- Shadow terlalu kuat.
- Gradient berlebihan.
- Glassmorphism.
- Dekorasi yang tidak memiliki fungsi.

## 2.2 Photography First

Foto penginapan menjadi elemen visual utama.

Gunakan:

- Foto berkualitas tinggi.
- Aspect ratio konsisten.
- Object-fit cover.
- Gallery yang jelas.

## 2.3 Clear CTA

CTA utama harus mudah ditemukan.

Primary CTA:

**Cari Penginapan**

Secondary CTA:

**Pesan via WhatsApp**

## 2.4 Trustworthy

Informasi harus terlihat jelas:

- Harga
- Lokasi
- Rating
- Fasilitas
- Kapasitas
- Kontak

---

# 3. Visual Direction

Style:

**Modern Indonesian Hospitality**

Karakter:

- Warm
- Clean
- Friendly
- Professional
- Premium tetapi tidak berlebihan

Hindari gaya:

- Futuristic
- Cyberpunk
- Glassmorphism
- Excessive gradient
- AI-generated dashboard style
- Neon
- Excessive rounded cards

---

# 4. Color System

Warna utama sebaiknya menggunakan palet yang memberikan kesan hospitality dan natural.

## Primary

Digunakan untuk:

- CTA
- Link penting
- Active state
- Button utama
- Highlight

## Neutral

Digunakan untuk:

- Background
- Text
- Border
- Card
- Form

Recommended neutral hierarchy:

```text
Background
Surface
Border
Muted Text
Secondary Text
Primary Text
```

## Semantic

Success:

- Published
- Active
- Available

Warning:

- Pending
- Review

Danger:

- Delete
- Error
- Rejected

---

# 5. Typography

Gunakan font sans-serif modern.

Recommended:

**Inter**

atau font sans-serif modern yang setara.

Hierarchy:

```text
Display
H1
H2
H3
H4
Body
Small
Caption
```

Contoh:

```text
H1
Temukan Kamar Nyaman untuk Perjalananmu

H2
Penginapan Pilihan

H3
Homestay Nyaman di Sleman

Body
Temukan penginapan yang sesuai dengan kebutuhan perjalananmu.
```

---

# 6. Spacing

Gunakan spacing system berbasis kelipatan 4 atau 8.

Contoh:

```text
4px
8px
12px
16px
24px
32px
48px
64px
80px
96px
```

Section homepage:

- Mobile: 48–64px
- Desktop: 72–96px

---

# 7. Border Radius

Gunakan radius secara moderat.

Recommended:

```text
Small: 6px
Medium: 8px
Large: 12px
Extra Large: 16px
```

Hindari semua elemen menggunakan radius sangat besar.

---

# 8. Shadows

Gunakan shadow ringan.

Tujuan shadow hanya untuk:

- Elevation.
- Membuat card terbaca.
- Modal.
- Dropdown.

Hindari shadow yang terlalu tebal.

---

# 9. Buttons

## Primary

Digunakan untuk:

- Cari
- Pesan
- Publish
- Simpan

## Secondary

Digunakan untuk:

- Lihat detail
- Batal
- Kembali

## Danger

Digunakan untuk:

- Hapus
- Reject

Button harus:

- Memiliki state hover.
- Memiliki focus state.
- Memiliki disabled state.
- Memiliki loading state.

---

# 10. Navbar

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│ adakamar.id   Penginapan  Artikel  Tentang  Kontak  │
│                                      [Masuk]         │
└──────────────────────────────────────────────────────┘
```

Mobile:

```text
┌────────────────────────────────────┐
│ adakamar.id                 ☰      │
└────────────────────────────────────┘
```

Navbar harus:

- Sticky atau fixed jika sesuai kebutuhan.
- Responsive.
- Tidak terlalu tinggi.
- Memiliki active state.

---

# 11. Homepage Design

## Hero

Hero harus menjadi fokus pertama.

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│       Temukan Kamar Nyaman                              │
│       untuk Perjalananmu di Jogja                       │
│                                                         │
│       Temukan penginapan yang sesuai kebutuhanmu.       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📍 Lokasi │ Check-in │ Check-out │ Tamu │ Cari  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Hero background dapat menggunakan foto penginapan atau suasana Yogyakarta dengan overlay yang ringan.

---

# 12. Search Component

Search harus menjadi komponen reusable.

Desktop:

```text
Location
[ Yogyakarta        ]

Check-in
[ 20 Sep            ]

Check-out
[ 22 Sep            ]

Guests
[ 4 Tamu            ]

[ Cari ]
```

Mobile:

Search menjadi stacked layout.

---

# 13. Property Card

Property card adalah komponen reusable utama.

```text
┌──────────────────────────────┐
│                              │
│          PROPERTY IMAGE      │
│                              │
│                     ♡        │
├──────────────────────────────┤
│ ⭐ 4.8                       │
│ Homestay Jogja Nyaman        │
│ 📍 Sleman, Yogyakarta        │
│                              │
│ 2 Kamar • 4 Tamu             │
│                              │
│ Rp350.000 / malam            │
└──────────────────────────────┘
```

Optional badges:

- Featured
- Popular
- Promo
- New

---

# 14. Property Detail

Layout desktop:

```text
┌────────────────────────────────────────────────┐
│                 IMAGE GALLERY                   │
└────────────────────────────────────────────────┘

Homestay ABC
⭐ 4.8
📍 Sleman, Yogyakarta

┌───────────────────────┐
│ Description           │
│                       │
│ ...                   │
└───────────────────────┘

Facilities

[WiFi] [AC] [TV] [Parking]

Information

2 Bedrooms
4 Guests
2 Bathrooms

────────────────────────────────

Location

[             MAP             ]

────────────────────────────────

Rp350.000 / malam

[ Pesan via WhatsApp ]
```

Desktop dapat menggunakan sticky booking CTA.

---

# 15. Gallery

Gallery:

- Main image.
- Thumbnail.
- Lightbox.
- Next/previous.
- Image counter.

Mobile menggunakan carousel.

---

# 16. Category Section

Gunakan visual sederhana:

```text
Penginapan berdasarkan kebutuhan

[ Keluarga ]
[ Rombongan ]
[ Private Pool ]
[ Villa ]
[ Budget ]
[ Dekat Malioboro ]
```

Jangan membuat setiap kategori terlalu besar.

---

# 17. Promo Section

Promo harus visually distinct tetapi tetap clean.

```text
┌───────────────────────────────────────────────┐
│ Promo Minggu Ini                              │
│                                               │
│ Hemat untuk perjalananmu ke Jogja             │
│                                               │
│ [ Lihat Promo ]                               │
└───────────────────────────────────────────────┘
```

---

# 18. Article Card

```text
┌────────────────────────────┐
│                            │
│       ARTICLE IMAGE        │
│                            │
├────────────────────────────┤
│ WISATA                     │
│ 7 Tempat Wisata Jogja...   │
│                            │
│ Budi • 10 Sep 2026         │
└────────────────────────────┘
```

Article card tidak perlu terlalu banyak decoration.

---

# 19. Article Detail

Struktur:

```text
Breadcrumb

Kategori

Judul Artikel

Penulis • Tanggal

Hero Image

──────────────────────────

Article Content

Heading
Paragraph

Image

Heading
Paragraph

──────────────────────────

Tags

Share

Artikel Terkait
```

Content width harus dibatasi agar nyaman dibaca.

Recommended:

```text
max-width: 720–800px
```

---

# 20. Footer

Footer:

```text
┌─────────────────────────────────────────────────────┐
│ adakamar.id                                         │
│ Temukan penginapan nyaman untuk perjalananmu.       │
│                                                     │
│ Penginapan     Artikel       Tentang                │
│ Cari           Wisata        Tentang Kami           │
│ Promo          Kuliner       Kontak                 │
│                                                     │
│ WhatsApp • Instagram • Email                        │
│                                                     │
│ © adakamar.id                                       │
└─────────────────────────────────────────────────────┘
```

---

# 21. Admin Layout

Admin memiliki design system tersendiri.

```text
┌───────────────────────────────────────────────────────┐
│ Sidebar       │ Topbar                                │
│               ├───────────────────────────────────────┤
│ Dashboard     │                                       │
│ Penginapan    │              Content                  │
│ Artikel       │                                       │
│ Promo         │                                       │
│ Pengguna      │                                       │
│ Pengaturan    │                                       │
│               │                                       │
└───────────────────────────────────────────────────────┘
```

Admin dashboard harus:

- Dense tetapi tetap readable.
- Tidak menggunakan visual berlebihan.
- Fokus pada data dan action.

---

# 22. Admin Dashboard

Stat cards:

```text
┌──────────────┐ ┌──────────────┐
│ Penginapan   │ │ Artikel      │
│ 35           │ │ 82           │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Pending      │ │ Penulis      │
│ 8            │ │ 5            │
└──────────────┘ └──────────────┘
```

Di bawahnya:

- Recent articles
- Recent properties
- Pending reviews
- Recent inquiry

---

# 23. Data Table

Data table reusable.

Fitur:

- Search
- Filter
- Sort
- Pagination
- Status
- Action
- Bulk action jika diperlukan

Contoh:

```text
Artikel

[ Search................ ] [Filter]

┌───────────────────────────────────────────────┐
│ Judul       │ Penulis │ Status │ Updated     │
├───────────────────────────────────────────────┤
│ Wisata Jogja│ Budi    │ Publish│ 10 Sep      │
│ Kuliner     │ Andi    │ Draft  │ 09 Sep      │
└───────────────────────────────────────────────┘
```

---

# 24. Form Design

Form harus menggunakan label yang jelas.

```text
Nama Penginapan
[........................................]

Harga per malam
[........................................]

Lokasi
[........................................]

Deskripsi
[........................................]

Fasilitas
[ WiFi ] [ AC ] [ TV ]

Gallery
[ + Upload Foto ]

[ Batal ] [ Simpan ]
```

Validation error ditampilkan tepat di bawah field.

---

# 25. Article Editor

Editor artikel harus mendukung:

- Heading
- Paragraph
- Bold
- Italic
- Link
- Image
- Ordered list
- Unordered list
- Quote
- Table jika diperlukan

Sidebar:

```text
Publish
Status

Category
Tags

Thumbnail

SEO
SEO Title
Meta Description
```

---

# 26. Responsive Design

## Mobile

Prioritas:

- Navigation sederhana.
- Search stacked.
- Property card 1 kolom.
- Article card 1 kolom.
- CTA WhatsApp mudah dijangkau.
- Admin sidebar menjadi drawer.

## Tablet

- Property grid 2 kolom.
- Article grid 2 kolom.

## Desktop

- Property grid 3–4 kolom.
- Article grid 3 kolom.
- Detail property menggunakan multi-column layout.

---

# 27. UI States

Semua komponen yang mengambil data harus memiliki:

## Loading

Skeleton.

## Empty

```text
Belum ada penginapan yang ditemukan.

[ Reset Filter ]
```

## Error

```text
Terjadi kesalahan saat memuat data.

[ Coba Lagi ]
```

## Success

Toast:

```text
Penginapan berhasil disimpan.
```

---

# 28. Accessibility

Website harus memperhatikan:

- Semantic HTML.
- Keyboard navigation.
- Focus state.
- Alt text gambar.
- Kontras warna.
- Label form.
- Aria label untuk icon button.
- Button bukan div clickable.
- Link menggunakan anchor.

---

# 29. Component Architecture

Frontend component:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button
│   │   ├── Input
│   │   ├── Select
│   │   ├── Modal
│   │   ├── Badge
│   │   ├── Toast
│   │   ├── Pagination
│   │   └── Skeleton
│   │
│   ├── layout/
│   │   ├── Navbar
│   │   ├── Footer
│   │   └── Breadcrumb
│   │
│   ├── property/
│   │   ├── PropertyCard
│   │   ├── PropertyGallery
│   │   ├── PropertyInfo
│   │   ├── FacilityList
│   │   └── BookingCTA
│   │
│   ├── article/
│   │   ├── ArticleCard
│   │   ├── ArticleMeta
│   │   ├── ArticleContent
│   │   └── RelatedArticles
│   │
│   ├── search/
│   │   ├── SearchBox
│   │   ├── SearchFilters
│   │   └── SortSelect
│   │
│   └── admin/
│       ├── Sidebar
│       ├── Topbar
│       ├── StatCard
│       └── DataTable
```

---

# 30. Route Architecture

## Public

```text
/
 /penginapan
 /penginapan/[slug]
 /kategori/[slug]
 /lokasi/[slug]
 /promo
 /artikel
 /artikel/[slug]
 /tentang
 /kontak
```

## Authentication

```text
/login
/forgot-password
/reset-password
```

## Admin

```text
/admin/dashboard
/admin/penginapan
/admin/penginapan/create
/admin/penginapan/[id]/edit
/admin/fasilitas
/admin/lokasi
/admin/artikel
/admin/artikel/[id]
/admin/kategori
/admin/tag
/admin/promo
/admin/inquiry
/admin/users
/admin/settings
/admin/profile
```

## Penulis

```text
/penulis/dashboard
/penulis/artikel
/penulis/artikel/create
/penulis/artikel/[id]/edit
/penulis/profile
```

---

# 31. Design Do

- Gunakan foto berkualitas.
- Gunakan whitespace.
- Gunakan typography hierarchy.
- Gunakan CTA yang jelas.
- Gunakan card dengan struktur sederhana.
- Gunakan icon seperlunya.
- Gunakan consistent spacing.
- Gunakan responsive layout.
- Gunakan reusable component.
- Utamakan usability.

---

# 32. Design Don't

Jangan menggunakan:

- Glassmorphism berlebihan.
- Gradient pada hampir semua section.
- Excessive rounded corners.
- Excessive shadows.
- Terlalu banyak icon.
- Animasi berlebihan.
- Card dengan informasi terlalu padat.
- Warna terlalu banyak.
- Dashboard dengan dekorasi yang tidak berguna.
- Layout yang terasa seperti template AI generik.

---

# 33. Overall User Flow

```text
                 VISITOR
                    │
                    ▼
               HOMEPAGE
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    SEARCH PROPERTY        ARTICLES
          │                   │
          ▼                   ▼
   PROPERTY LISTING     ARTICLE DETAIL
          │
          ▼
   PROPERTY DETAIL
          │
          ▼
   BOOKING / INQUIRY
          │
          ▼
       WHATSAPP
```

Admin:

```text
LOGIN
  ↓
ADMIN DASHBOARD
  ↓
MANAGEMENT
  ├── Properties
  ├── Facilities
  ├── Locations
  ├── Articles
  ├── Categories
  ├── Tags
  ├── Promo
  ├── Inquiry
  └── Users
```

Penulis:

```text
LOGIN
  ↓
PENULIS DASHBOARD
  ↓
ARTIKEL
  ↓
CREATE / EDIT
  ↓
DRAFT
  ↓
SUBMIT REVIEW
  ↓
ADMIN REVIEW
  ↓
PUBLISHED
```

---

# 34. Final Design Direction

adakamar.id harus terasa seperti:

**"Platform penginapan lokal yang modern, terpercaya, dan mudah digunakan."**

Bukan:

**"Website CRUD dengan banyak card dan efek visual."**

Prioritas desain:

1. Photography
2. Search
3. Property discovery
4. Property information
5. Booking CTA
6. Article discovery
7. Trust
8. Accessibility
9. Performance
10. SEO