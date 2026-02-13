# Privacy Risk Management System & Analysis - Compliance & Risk Override: PRISMA COKRO GEN 1.0 (BETA) 

**Sistem Analisis Risiko Privasi pada Platform Digital Menggunakan Likelihood–Impact Engine Berbasis Rule-Based Automation.**

[![License](https://img.shields.io/badge/License-Academic-blue.svg)](#license)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-yellow.svg)](#tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-Client--Side%20%7C%20Zero--Knowledge-green.svg)](#architecture)
[![Compliance](https://img.shields.io/badge/Compliance-UU%20PDP%202022%20%7C%20NIST%20CSF%202.0-red.svg)](#compliance)

## 🔗 Demo Aplikasi
Sistem ini dapat diakses secara langsung melalui GitHub Pages tanpa memerlukan proses instalasi lokal:
**[KLIK DISINI](https://xicerya.github.io/prisma-cokro/)**

## 📖 Tentang Proyek

**PRISMA COKRO GEN 1.0 (BETA)** adalah sebuah artefak perangkat lunak yang dikembangkan sebagai bagian dari Skripsi Program Studi Teknik Komputer, Universitas AMIKOM Yogyakarta. Proyek ini disusun oleh **Munif Aryaputra (22.83.0787)**.

Sistem ini berfungsi sebagai alat bantu *Self-Assessment* otomatis untuk mengukur risiko privasi pada layanan digital. Menggunakan pendekatan **Hybrid**, sistem ini menggabungkan metode kuantitatif (*Likelihood-Impact Matrix*) dengan evaluasi kualitatif berbasis aturan (*Rule-Based*) yang merujuk pada regulasi **UU PDP Tahun 2022** dan standar **NIST Cybersecurity Framework 2.0**.

### 🚀 Keunggulan Utama
* **Zero-Knowledge Architecture:** Berjalan sepenuhnya di sisi klien (*Client-Side*) menggunakan HTML, CSS, dan JavaScript murni. Data sensitif skenario tidak pernah dikirim ke server eksternal, menjamin privasi pengguna (*Privacy by Design*).
* **Institutional Trust Override:** Fitur cerdas (COKRO) yang memvalidasi legalitas layanan terhadap *whitelist* (OJK/Komdigi PSE). Layanan legal terdaftar otomatis mendapatkan penyesuaian penurunan skor risiko residual.
* **Encrypted Local Persistence:** Menyimpan progres analisis dan draf formulir secara lokal di *browser* dengan mekanisme enkripsi/obfuscation (Base64) untuk keamanan *data-at-rest*.
* **Actionable Insights:** Memberikan rekomendasi mitigasi teknis dan hukum secara otomatis berdasarkan celah yang ditemukan pada 17 parameter input pengguna.

---

## 🛠️ Fitur & Fungsionalitas

1.  **Likelihood-Impact Engine:**
    * Mengkalkulasi skor risiko dinamis (Skala 1-25) berdasarkan parameter keamanan dan sensitivitas data.
    * Visualisasi *Interactive Risk Heatmap* 5x5 yang di-render secara dinamis menggunakan CSS Grid.
2.  **Compliance Evaluator (Rule-Based):**
    * **UU PDP 2022:** Mendeteksi kepatuhan terhadap prinsip persetujuan (*Consent*), transparansi, pemrosesan pihak ketiga, dan keamanan data.
    * **NIST CSF 2.0:** Memetakan postur keamanan pengguna ke dalam 6 fungsi inti: *Govern, Identify, Protect, Detect, Respond, Recover*.
3.  **Local History Management (Riwayat Penilaian):**
    * Menyimpan riwayat kalkulasi risiko pengguna beserta detail *timestamp*.
    * Dilengkapi fitur muat ulang draf (*load*) dan hapus item riwayat (*delete item*) secara spesifik.
4.  **Community-Driven Feedback:**
    * Integrasi protokol `mailto:` *client-side* untuk pelaporan *bug* atau usulan pembaruan data *registry* secara partisipatif.

---

## 💻 Tech Stack (Spesifikasi Teknis)

Sistem ini dibangun sebagai **Static Web Application** tanpa dependensi *backend* yang berat, mematuhi prinsip kedaulatan data dan efisiensi *deployment*[cite: 1363, 1364].

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | HTML5 Semantic | Membangun struktur konten dan formulir input 17 parameter. |
| **Styling** | CSS3 Custom Properties | Manajemen tema warna *High-Contrast Dark Mode* & *Glassmorphism* tanpa framework eksternal[cite: 1513]. |
| **Visualisasi** | CSS Grid & Flexbox | Merender Matriks Risiko 5x5 interaktif dan *layout* responsif[cite: 1495, 1513]. |
| **Logic** | Vanilla JavaScript (ES6+) | Bahasa pemrograman utama untuk logika *Risk Engine* dan *Rule Base*[cite: 1495, 1513]. |
| **Storage** | LocalStorage API | Utilitas *client-side* untuk menyimpan sesi riwayat yang diobfuskasi[cite: 1482]. |
| **Tipografi** | Google Fonts | Menggunakan *font* bergaya teknikal: Orbitron dan Rajdhani[cite: 1513]. |

---

## 📂 Struktur Direktori

```text
PRISMA COKRO (Beta Gen 1,0)/
└── project-root/
    ├── index.html                 # Halaman Pendaratan (Landing Page) [cite: 1516]
    ├── landing-style.css          # Styling khusus untuk Landing Page
    └── privacy-risk-dashboard/    # Direktori Utama Dashboard Analisis
        ├── dashboard.html         # Antarmuka utama dengan 17 parameter input [cite: 1516]
        ├── css/
        │   └── dashboard-style.css# Styling komponen dashboard, form, dan matriks
        └── js/
            ├── app.js             # Pengendali DOM, interaksi UI, & LocalStorage [cite: 1516]
            ├── riskEngine.js      # Modul utama algoritma kalkulasi skor risiko [cite: 1516]
            ├── rules.js           # Basis aturan UU PDP 2022 & pemetaan NIST CSF [cite: 1516]
            └── legalCheck.js      # Basis data statis (Registry OJK/PSE) & logika override [cite: 1516]
