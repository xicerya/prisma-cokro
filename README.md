# PRISMA COKRO: Privacy Risk Management System & Analysis

![PRISMA COKRO Banner](path/to/your/banner-image.png) > **Sistem Analisis Risiko Privasi pada Platform Digital Menggunakan Likelihood–Impact Engine Berbasis Rule-Based Automation.**

[![License](https://img.shields.io/badge/License-Academic-blue.svg)](#license)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-yellow.svg)](#tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-Client--Side%20%7C%20Zero--Knowledge-green.svg)](#architecture)
[![Compliance](https://img.shields.io/badge/Compliance-UU%20PDP%202022%20%7C%20NIST%20CSF%202.0-red.svg)](#compliance)

## 📖 Tentang Proyek

**PRISMA COKRO** adalah sebuah artefak perangkat lunak yang dikembangkan sebagai bagian dari Skripsi Program Studi Teknik Komputer, Universitas AMIKOM Yogyakarta.

Sistem ini berfungsi sebagai alat bantu *Self-Assessment* otomatis untuk mengukur risiko privasi pada layanan digital. Menggunakan pendekatan **Hybrid**, sistem ini menggabungkan metode kuantitatif (*Likelihood-Impact Matrix*) dengan evaluasi kualitatif berbasis aturan (*Rule-Based*) yang merujuk pada regulasi **UU PDP Tahun 2022** dan standar **NIST Cybersecurity Framework 2.0**.

### 🚀 Keunggulan Utama
* **Zero-Knowledge Architecture:** Berjalan 100% di sisi klien (*Client-Side*). Data sensitif skenario tidak pernah dikirim ke server eksternal, menjamin privasi pengguna (*Privacy by Design*).
* **Institutional Trust Override:** Fitur cerdas yang memvalidasi legalitas layanan (OJK/Komdigi/PSE). Layanan terdaftar otomatis mendapatkan penyesuaian skor risiko.
* **Encrypted Local Persistence:** Menyimpan progres analisis secara lokal di browser dengan mekanisme enkripsi/obfuscation (Base64) untuk keamanan data saat istirahat (*data-at-rest*).
* **Actionable Insights:** Memberikan rekomendasi mitigasi teknis dan hukum secara otomatis berdasarkan celah yang ditemukan.

---

## 🛠️ Fitur & Fungsionalitas

1.  **Likelihood-Impact Engine:**
    * Mengkalkulasi skor risiko (1-25) berdasarkan 17 parameter teknis.
    * Visualisasi *Interactive Heatmap* 5x5.
2.  **Compliance Evaluator:**
    * **UU PDP 2022:** Mendeteksi pelanggaran prinsip persetujuan (*Consent*), transparansi, dan keamanan data.
    * **NIST CSF 2.0:** Memetakan postur keamanan ke dalam fungsi *Govern, Identify, Protect, Detect, Respond, Recover*.
3.  **Legal Check Integration:**
    * Validasi nama layanan terhadap *whitelist* statis (OJK, PSE, AFPI).
    * Deteksi anomali untuk layanan ilegal (misal: Pinjol Ilegal).
4.  **Community-Driven Feedback:**
    * Integrasi protokol `mailto:` untuk pelaporan *bug* atau pembaruan data *registry* secara partisipatif.

---

## 💻 Tech Stack (Spesifikasi Teknis)

Sistem ini dibangun sebagai **Static Web Application** tanpa dependensi backend yang berat, memastikan portabilitas dan auditabilitas kode.

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | HTML5 Semantic | Struktur dokumen yang aksesibel. |
| **Styling** | CSS3 Custom Properties | Tema *High-Contrast Dark Mode* & *Glassmorphism*. |
| **Logic** | Vanilla JavaScript (ES6+) | Tanpa Framework (React/Vue) untuk transparansi logika. |
| **Visualization** | CSS Grid & DOM Manipulation | Rendering matriks risiko dan tabel dinamis. |
| **Storage** | LocalStorage API | Penyimpanan sesi lokal terenkripsi. |

---

## 📂 Struktur Direktori

```text
prisma-cokro/
├── index.html            # Halaman Pendaratan (Landing Page)
├── dashboard.html        # Halaman Utama Analisis (Formulir & Hasil)
├── assets/
│   ├── css/
│   │   └── styles.css    # Global Styling & Themes
│   └── js/
│       ├── app.js        # DOM Controller & UI Interaction
│       ├── riskEngine.js # Core Logic (Algoritma Perhitungan Risiko)
│       ├── rules.js      # Rule-Base (UU PDP & NIST Mapping)
│       └── legalCheck.js # Database Registry Statis (OJK/PSE)
└── README.md             # Dokumentasi Proyek
