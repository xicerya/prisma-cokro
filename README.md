# 🛡️ PRISMA COKRO: Privacy Risk Analysis System

![Version](https://img.shields.io/badge/version-1.0.0_Beta-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Thesis_Artifact-orange?style=for-the-badge)
![Stack](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20JS-yellow?style=for-the-badge)

> **Perancangan dan Implementasi Sistem Analisis Risiko Privasi pada Platform Digital Menggunakan Likelihood–Impact Engine Berbasis Rule-Based Automation.**

---

## 📋 Tentang Proyek

**PRISMA COKRO** adalah sistem berbasis web untuk menganalisis risiko privasi pada skenario pemrosesan data pribadi. Sistem ini dirancang sebagai alat bantu (artefak) skripsi untuk mengukur risiko secara kuantitatif dan memberikan rekomendasi mitigasi secara otomatis.

Aplikasi ini menggabungkan:
1.  **Metode Kuantitatif:** Matriks Risiko 5x5 (Likelihood x Impact).
2.  **Kepatuhan Regulasi:** UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
3.  **Standar Global:** NIST Cybersecurity Framework (CSF) 2.0.

### 🌟 Fitur Utama

* **Risk Engine Otomatis:** Menghitung skor risiko berdasarkan parameter teknis (enkripsi, akses kontrol, jenis data, dll).
* **Legal Context Awareness:** Simulasi pengecekan legalitas layanan (Bank OJK, PSE Komdigi, AFPI, Standar Biometrik).
* **Compliance Mapping:** Pemetaan otomatis celah keamanan terhadap pasal-pasal UU PDP dan fungsi NIST CSF (Govern, Identify, Protect, Detect, Respond, Recover).
* **Recommendation Generator:** Memberikan saran mitigasi teknis dan organisasional berdasarkan profil risiko.
* **PDF Reporting:** Ekspor hasil analisis ke dalam format laporan siap cetak.
* **Real-time Interaction:** Kalkulasi instan di sisi klien (Client-Side) dengan antarmuka modern (Neon UI).

---

## ⚙️ Arsitektur & Teknologi

Sistem ini dibangun menggunakan pendekatan **Web Standar** yang ringan dan modular, memungkinkan portabilitas tinggi tanpa ketergantungan backend yang kompleks (pada versi dasar).

* **Frontend:** HTML5, CSS3 (Custom Properties / CSS Variables), Vanilla JavaScript (ES6+).
* **Logic Core:**
    * `riskEngine.js`: Algoritma perhitungan matriks risiko.
    * `rules.js`: Basis aturan (Knowledge Base) untuk inferensi UU PDP & NIST.
    * `legalCheck.js`: Modul validasi legalitas layanan (mendukung simulasi API/JSON).
* **Styling:** Responsif dengan tema "Cyber/Neon" menggunakan CSS Grid & Flexbox.

---

## 🚀 Cara Menjalankan (Instalasi)

Karena aplikasi ini bersifat statis (atau menggunakan Node.js opsional), Anda dapat menjalankannya dengan mudah.

### Metode 1: Web Statis (Langsung Browser)
1.  Clone repositori ini:
    ```bash
    git clone [https://github.com/username-anda/prisma-cokro.git](https://github.com/username-anda/prisma-cokro.git)
    ```
2.  Buka folder proyek.
3.  Klik ganda file `index.html`.
4.  Aplikasi siap digunakan.

### Metode 2: Menggunakan Live Server (Disarankan)
Untuk pengalaman terbaik tanpa masalah CORS (saat memuat file JSON eksternal):
1.  Pastikan VS Code terinstal.
2.  Instal ekstensi **Live Server**.
3.  Klik kanan pada `index.html` -> **Open with Live Server**.

### Metode 3: Backend Node.js (Opsional - Untuk Audit Mode)
Jika Anda menggunakan cabang `feature/backend` untuk keamanan logika:
```bash
cd prisma-backend
npm install
node index.js
# Buka http://localhost:3000
