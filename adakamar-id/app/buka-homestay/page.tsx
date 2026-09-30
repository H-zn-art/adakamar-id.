import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftarkan Homestay di Jogja | Bergabung Jadi Mitra adakamar.id",
  description:
    "Jadikan rumah Anda sumber penghasilan baru. Daftarkan homestay, villa, atau kamar Jogja Anda ke platform kurasi terpercaya #1 DIY bersama 500+ host aktif.",
};

const steps = [
  {
    num: "01",
    icon: "add_home",
    title: "Daftarkan Properti Anda",
    desc: "Isi informasi dasar properti, unggah foto, dan jelaskan keistimewaan rumah Anda kepada calon tamu.",
  },
  {
    num: "02",
    icon: "verified",
    title: "Verifikasi oleh Kurator Lokal",
    desc: "Tim kurator kami akan mengunjungi properti Anda untuk memastikan kualitas dan autentisitas pengalaman menginap.",
  },
  {
    num: "03",
    icon: "groups",
    title: "Mulai Terima Tamu & Penghasilan",
    desc: "Properti Anda akan tampil di platform dan Anda mulai menerima tamu serta pembayaran otomatis ke rekening.",
  },
];

const benefits = [
  {
    icon: "price_check",
    title: "Komisi Rendah, Transparansi Tinggi",
    desc: "Komisi paling kompetitif di Yogyakarta. Tidak ada biaya tersembunyi. Anda mendapatkan apa yang Anda lihat.",
  },
  {
    icon: "support_agent",
    title: "Pendamping Host 24/7",
    desc: "Tim dukungan kami berbasis di Prawirotaman siap membantu operasional dan pertanyaan tamu kapan saja.",
  },
  {
    icon: "insights",
    title: "Dashboard & Analitik Lengkap",
    desc: "Pantau pemesanan, pendapatan, ulasan, dan tren wisata Jogja dari satu dashboard yang mudah digunakan.",
  },
  {
    icon: "security",
    title: "Perlindungan Tamu & Host",
    desc: "Sistem verifikasi tamu dan asuransi properti dasar memastikan ketenangan pikiran Anda sebagai tuan rumah.",
  },
  {
    icon: "school",
    title: "Pelatihan & Workshop Host Gratis",
    desc: "Bergabung di Akademi Host adakamar.id dan pelajari cara mendekorasi, memfoto, dan memasarkan properti.",
  },
  {
    icon: "campaign",
    title: "Promosi Aktif via Media Sosial",
    desc: "Properti Anda dipromosikan aktif lewat Instagram, TikTok, dan panduan lokal adakamar.id setiap minggunya.",
  },
];

const earnings = [
  { type: "Kamar Standar Joglo", location: "Prawirotaman", estimasi: "Rp 4.200.000", per: "per bulan" },
  { type: "Villa Private Pool", location: "Sewon, Bantul", estimasi: "Rp 18.500.000", per: "per bulan" },
  { type: "Suite Heritage", location: "Kotagede", estimasi: "Rp 7.800.000", per: "per bulan" },
];

const testimonials = [
  {
    name: "Budi Santoso",
    location: "Prawirotaman, Yogyakarta",
    since: "Host Bergabung Sejak 2021",
    text: "Sejak daftar di adakamar.id, kamar Joglo kami selalu terisi 85%+ setiap bulan. Tim kurator sangat membantu memoles foto dan deskripsi properti kami.",
    income: "+Rp 6,2 juta / bulan",
    incomeTag: "Pendapatan Tambahan",
  },
  {
    name: "Sri Rahayu",
    location: "Kaliurang, Sleman",
    since: "Host Bergabung Sejak 2022",
    text: "Saya hosting di adakamar.id sambil tetap bekerja. Sistem booking otomatis dan WhatsApp concierge sangat menolong. Tamu selalu puas dengan pelayanan.",
    income: "4.94 ★",
    incomeTag: "Rating Rata-rata",
  },
];

const faqs = [
  "Apakah saya perlu sertifikasi khusus untuk mendaftarkan properti?",
  "Berapa lama proses verifikasi properti saya?",
  "Bagaimana cara menerima pembayaran dari tamu?",
  "Apakah ada komitmen eksklusivitas dengan adakamar.id?",
  "Apa yang terjadi jika ada masalah atau kerusakan dari tamu?",
];

export default function BukaHomestayPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "64px", background: "#fbf8ff", minHeight: "100vh" }}>
        {/* ─── Hero Section ─── */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "72px 0 80px",
            background: "linear-gradient(135deg, #9f3c16 0%, #bf542c 60%, #8d4b00 100%)",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "999px", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "280px", height: "280px", borderRadius: "999px", background: "rgba(255,255,255,0.04)" }} />

          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "48px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginBottom: "20px",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#ffb59c", fontSize: "14px" }}>home</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffdbcf", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Program Mitra Host adakamar.id
                </span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(28px, 4.5vw, 52px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  marginBottom: "16px",
                }}
              >
                Jadikan Rumah Anda{" "}
                <span style={{ color: "#ffb59c" }}>Sumber Penghasilan</span>{" "}
                Baru di Jogja
              </h1>
              <p style={{ fontSize: "17px", color: "rgba(255,219,207,0.9)", lineHeight: 1.65, maxWidth: "520px", marginBottom: "32px" }}>
                Bergabung bersama 500+ mitra host lokal Yogyakarta terpercaya. Mulai sambut tamu dari seluruh Indonesia dan dunia, dengan dukungan penuh tim kurasi adakamar.id.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href="#form-daftar"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#9f3c16",
                    fontSize: "15px",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 3px 14px rgba(0,0,0,0.15)",
                    transition: "all 0.15s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_home</span>
                  Daftar Gratis Sekarang
                </a>
                <a
                  href="https://wa.me/628123456789"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 24px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chat</span>
                  Konsultasi via WhatsApp
                </a>
              </div>

              {/* Trust stats */}
              <div style={{ display: "flex", gap: "24px", marginTop: "32px", flexWrap: "wrap" }}>
                {[
                  { num: "500+", label: "Mitra Host Aktif" },
                  { num: "12.400+", label: "Tamu Dilayani / Tahun" },
                  { num: "4.9 ★", label: "Kepuasan Tuan Rumah" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>{s.num}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,219,207,0.75)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income estimator */}
            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "rgba(255,255,255,0.97)",
                borderRadius: "20px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                padding: "28px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#9f3c16", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                Estimasi Pendapatan Anda
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1b22", marginBottom: "20px", letterSpacing: "-0.01em" }}>
                Berapa yang bisa Anda hasilkan?
              </h3>
              {earnings.map((e) => (
                <div
                  key={e.type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f4f2fd",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1b22" }}>{e.type}</div>
                    <div style={{ fontSize: "11px", color: "#57423b" }}>{e.location}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#9f3c16" }}>{e.estimasi}</div>
                    <div style={{ fontSize: "11px", color: "#57423b" }}>{e.per}</div>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: "12px", color: "#8a726a", marginBottom: "16px" }}>
                *Berdasarkan rata-rata pendapatan host adakamar.id 2024. Angka aktual bervariasi.
              </p>
              <a
                href="#form-daftar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#9f3c16",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Hitung Potensi Saya
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calculate</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section style={{ padding: "64px 0", background: "#fbf8ff" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9f3c16", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
              3 Langkah Mudah
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#1a1b22", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Cara Bergabung Menjadi Mitra Host
            </h2>
            <p style={{ fontSize: "15px", color: "#57423b", maxWidth: "520px", margin: "0 auto 48px" }}>
              Bergabung mudah, cepat, dan gratis. Dalam 3–5 hari kerja properti Anda sudah live di platform.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "960px", margin: "0 auto" }} className="steps-grid">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  style={{
                    display: "flex",
                    gap: "20px",
                    padding: "28px",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    textAlign: "left",
                    alignItems: "flex-start",
                    position: "relative",
                  }}
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div style={{ position: "absolute", left: "42px", bottom: "-24px", width: "2px", height: "24px", background: "#dec0b7", zIndex: 0 }} className="step-connector" />
                  )}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#9f3c16", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: "22px" }}>{step.icon}</span>
                    </div>
                    <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#8a726a" }}>{step.num}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1b22", marginBottom: "8px" }}>{step.title}</h3>
                    <p style={{ fontSize: "14px", color: "#57423b", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "40px" }}>
              <a
                href="#form-daftar"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  background: "#9f3c16",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 3px 14px rgba(159,60,22,0.3)",
                  transition: "all 0.15s",
                }}
              >
                Mulai Daftar Sekarang — Gratis!
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── Benefits ─── */}
        <section style={{ padding: "64px 0", background: "#FDF6F3" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#9f3c16", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                Keunggulan Menjadi Mitra
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#1a1b22", letterSpacing: "-0.02em" }}>
                Mengapa Host Jogja Memilih adakamar.id?
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="benefits-grid">
              {benefits.map((b) => (
                <div key={b.title} style={{ padding: "24px", borderRadius: "16px", background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#FDF6F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: "#9f3c16", fontSize: "22px" }}>{b.icon}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1b22", marginBottom: "6px" }}>{b.title}</h3>
                    <p style={{ fontSize: "13px", color: "#57423b", lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section style={{ padding: "64px 0", background: "#fbf8ff" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#9f3c16", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Suara Host kami</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#1a1b22", letterSpacing: "-0.01em" }}>
                Cerita Sukses Mitra Host adakamar.id
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "900px", margin: "0 auto" }} className="testimonials-grid">
              {testimonials.map((t) => (
                <div key={t.name} style={{ padding: "28px", borderRadius: "16px", background: "#ffffff", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #e8e7f1" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "999px", background: "linear-gradient(135deg, #9f3c16, #bf542c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="material-symbols-outlined filled" style={{ color: "#fff", fontSize: "26px" }}>person</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1b22" }}>{t.name}</div>
                      <div style={{ fontSize: "12px", color: "#57423b" }}>{t.location}</div>
                      <div style={{ fontSize: "12px", color: "#9f3c16", fontWeight: 600 }}>{t.since}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#9f3c16" }}>{t.income}</div>
                      <div style={{ fontSize: "11px", color: "#57423b" }}>{t.incomeTag}</div>
                    </div>
                  </div>
                  <div style={{ padding: "16px", borderRadius: "10px", background: "#f4f2fd", position: "relative" }}>
                    <span style={{ position: "absolute", top: "8px", left: "14px", fontSize: "32px", color: "#dec0b7", lineHeight: 1 }}>&ldquo;</span>
                    <p style={{ fontSize: "14px", color: "#57423b", lineHeight: 1.65, margin: "8px 0 0 20px" }}>{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Registration Form ─── */}
        <section id="form-daftar" style={{ padding: "64px 0", background: "#f4f2fd" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", padding: "40px 36px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9f3c16", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Registrasi Gratis</div>
                <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1b22", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                  Mulai Daftarkan Properti Anda
                </h2>
                <p style={{ fontSize: "14px", color: "#57423b" }}>
                  Isi formulir singkat ini dan kami akan menghubungi Anda dalam 1 × 24 jam.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }} className="form-grid">
                {[
                  { label: "Nama Pemilik / Pengelola *", placeholder: "Budi Santoso", icon: "person" },
                  { label: "Nomor WhatsApp *", placeholder: "+62 812 3456 7890", icon: "phone" },
                  { label: "Alamat Lengkap Properti *", placeholder: "Jl. Prawirotaman II No. 38, Yogyakarta", icon: "location_on" },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ fontSize: "14px", fontWeight: 600, color: "#1a1b22", marginBottom: "6px", display: "block" }}>{field.label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e7f1", background: "#ffffff" }}>
                      <span className="material-symbols-outlined" style={{ color: "#8a726a", fontSize: "18px" }}>{field.icon}</span>
                      <input type="text" placeholder={field.placeholder} style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#1a1b22", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "transparent" }} />
                    </div>
                  </div>
                ))}

                {/* Tipe properti */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1a1b22", marginBottom: "6px", display: "block" }}>Tipe Properti *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e7f1", background: "#ffffff" }}>
                    <span className="material-symbols-outlined" style={{ color: "#8a726a", fontSize: "18px" }}>home</span>
                    <select style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#1a1b22", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "transparent", cursor: "pointer" }}>
                      <option>Pilih tipe properti Anda...</option>
                      <option>Rumah Joglo Tradisional</option>
                      <option>Villa / Villa Private Pool</option>
                      <option>Rumah Biasa / Modern</option>
                      <option>Kamar Kos Harian</option>
                      <option>Glamping / Eco-retreat</option>
                    </select>
                  </div>
                </div>

                {/* Kawasan */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1a1b22", marginBottom: "6px", display: "block" }}>Kawasan di Jogja *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e7f1", background: "#ffffff" }}>
                    <span className="material-symbols-outlined" style={{ color: "#8a726a", fontSize: "18px" }}>map</span>
                    <select style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#1a1b22", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "transparent", cursor: "pointer" }}>
                      <option>Pilih kawasan...</option>
                      <option>Prawirotaman & Tirtodipuran</option>
                      <option>Malioboro & Keraton</option>
                      <option>Sleman & Kaliurang</option>
                      <option>Bantul & Tembi</option>
                      <option>Kotagede</option>
                      <option>Gunungkidul</option>
                    </select>
                  </div>
                </div>

                {/* Kapasitas */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1a1b22", marginBottom: "6px", display: "block" }}>Estimasi Kapasitas Tamu</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["1–2 Tamu", "3–4 Tamu", "5–6 Tamu", "7+ Tamu"].map((c) => (
                      <button key={c} style={{ padding: "6px 16px", borderRadius: "999px", border: "1.5px solid #e8e7f1", background: "#ffffff", fontSize: "13px", fontWeight: 600, color: "#1a1b22", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c}</button>
                    ))}
                  </div>
                </div>

                {/* Pesan */}
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1a1b22", marginBottom: "6px", display: "block" }}>Ceritakan Keistimewaan Properti Anda</label>
                  <textarea
                    placeholder="Deskripsikan properti Anda, keistimewaan, fasilitas, dan harapan Anda sebagai host..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #e8e7f1",
                      fontSize: "14px",
                      color: "#1a1b22",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px", cursor: "pointer", fontSize: "13px", color: "#57423b", lineHeight: 1.5 }}>
                  <input type="checkbox" style={{ width: "16px", height: "16px", accentColor: "#9f3c16", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
                  Saya menyetujui <a href="/syarat-ketentuan" style={{ color: "#9f3c16", fontWeight: 700, textDecoration: "none" }}>Syarat & Ketentuan</a> dan <a href="/kebijakan-privasi" style={{ color: "#9f3c16", fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</a> adakamar.id.
                </label>
                <button
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #9f3c16 0%, #bf542c 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: "0 3px 14px rgba(159,60,22,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
                  Daftarkan Properti Saya Sekarang
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginTop: "16px", fontSize: "12px", color: "#8a726a" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>shield</span>
                Data Anda aman · Tim kami menghubungi dalam 1×24 jam · Pendaftaran 100% Gratis
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section style={{ padding: "56px 0", background: "#fbf8ff" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1b22", marginBottom: "8px", textAlign: "center", letterSpacing: "-0.01em" }}>
              Pertanyaan yang Sering Diajukan Host Baru
            </h2>
            <p style={{ fontSize: "14px", color: "#57423b", textAlign: "center", marginBottom: "28px" }}>
              Semua yang perlu Anda ketahui sebelum mendaftarkan properti di adakamar.id.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e8e7f1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", cursor: "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontSize: "14px", color: "#1a1b22", fontWeight: 500 }}>{faq}</span>
                  <span className="material-symbols-outlined" style={{ color: "#57423b", fontSize: "18px", flexShrink: 0 }}>expand_more</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <a href="https://wa.me/628123456789" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "#25d366", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chat</span>
                Tanya Langsung via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @media (min-width: 768px) {
          .steps-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .step-connector { display: none !important; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .form-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .benefits-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
