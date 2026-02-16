// riskEngine.js
// Mesin analisis risiko yang memakai rules.js + integrasi LegalEngine (legalCheck.js)

const RiskEngine = (() => {
  // [PENJELASAN] Helper Sederhana untuk konversi skor angka ke level teks.
  function categorizeRisk(score) {
    if (score <= 6) return "Rendah";
    if (score <= 15) return "Sedang";
    return "Tinggi";
  }

  // [PENJELASAN] Helper: Jika user tidak mencentang data spesifik (checkbox),
  // sistem akan menebak kategori data berdasarkan jenis data utama (dropdown).
  // Contoh: Pilih "Identitas" -> Otomatis dianggap "KTP" & "SIM".
  function deriveDataCategoriesFromDataType(dataType) {
    const t = (dataType || "").toLowerCase();
    if (t === "identitas") {
      return ["ktp", "sim"];
    }
    if (t === "biometrik") {
      return ["wajah", "suara"];
    }
    if (t === "umum") {
      return ["nama"];
    }
    return [];
  }

  // =========================================================
  // FUNGSI UTAMA: ANALYZE
  // =========================================================
  // Menerima input user (params), mengembalikan hasil analisis lengkap.
  function analyze(params) {
    
    // [PENJELASAN] TAHAP 1: PERHITUNGAN DASAR (RAW SCORE)
    // Menggunakan logika di 'rules.js' untuk menghitung Likelihood & Impact awal
    // berdasarkan parameter teknis (enkripsi, akses, jenis data, dll).
    let autoInfoRaw = {};
    if (typeof RiskRules !== "undefined" && RiskRules.inferBaseLikelihoodImpact) {
      autoInfoRaw = RiskRules.inferBaseLikelihoodImpact(params) || {};
    }

    const autoInfo = {
      likelihood:
        typeof autoInfoRaw.likelihood === "number" ? autoInfoRaw.likelihood : 3,
      impact:
        typeof autoInfoRaw.impact === "number" ? autoInfoRaw.impact : 3,
      reasons: Array.isArray(autoInfoRaw.reasons) ? autoInfoRaw.reasons : []
    };

    const baseLikelihood = autoInfo.likelihood;
    const baseImpact = autoInfo.impact;
    const baseRiskScore = baseLikelihood * baseImpact;
    const baseRiskLevel = categorizeRisk(baseRiskScore); // Rendah / Sedang / Tinggi

    // [PENJELASAN] TAHAP 2: EVALUASI KEPATUHAN (COMPLIANCE)
    // Memanggil fungsi-fungsi di 'rules.js' untuk menghasilkan tabel:
    // 1. Kepatuhan UU PDP (Pasal per Pasal)
    // 2. Pemetaan NIST CSF (Govern, Protect, dll)
    // 3. Rekomendasi tindakan
    let pdpResults = [];
    let nistResults = [];
    let recommendations = [];

    if (typeof RiskRules !== "undefined") {
      if (typeof RiskRules.evaluatePDP === "function") {
        pdpResults = RiskRules.evaluatePDP(params) || [];
      }
      if (typeof RiskRules.evaluateNIST === "function") {
        nistResults = RiskRules.evaluateNIST(params) || [];
      }
      if (typeof RiskRules.generateRecommendations === "function") {
        recommendations =
          RiskRules.generateRecommendations({
            params,
            pdpResults,
            nistResults,
            riskScore: baseRiskScore,
            riskLevel: baseRiskLevel
          }) || [];
      }
    }

    // [PENJELASAN] TAHAP 3: INTEGRASI LEGALITAS (LEGAL CHECK)
    // Memanggil 'legalCheck.js' untuk memverifikasi apakah layanan tersebut
    // terdaftar di OJK, Komdigi, atau AFPI.
    let legalContext = null;
    let finalRiskLevel = baseRiskLevel;
    let legalOverride = null;

    if (
      typeof window !== "undefined" &&
      window.LegalEngine &&
      typeof window.LegalEngine.evaluateLegalContext === "function"
    ) {
      const platformType = params.platformType || "lainnya";
      const serviceName = params.serviceName || "";

      // Menyiapkan data kategori untuk dicek legalitasnya
      const dataCategories =
        Array.isArray(params.dataCategories) && params.dataCategories.length > 0
          ? params.dataCategories
          : deriveDataCategoriesFromDataType(params.dataType);

      // Konversi level risiko matriks ke format yang dimengerti LegalEngine
      const matrixRiskLevel =
        baseRiskLevel === "Tinggi"
          ? "High"
          : baseRiskLevel === "Sedang"
          ? "Medium"
          : "Low";

      // Eksekusi pengecekan legalitas
      legalContext = window.LegalEngine.evaluateLegalContext({
        platformType,
        serviceName,
        dataCategories,
        matrixRiskLevel
      });

      // Update level risiko jika ada penyesuaian dari sisi hukum
      if (
        legalContext &&
        legalContext.finalRisk &&
        legalContext.finalRisk.finalRiskLevel
      ) {
        const fr = legalContext.finalRisk.finalRiskLevel;
        finalRiskLevel =
          fr === "High" ? "Tinggi" : fr === "Medium" ? "Sedang" : "Rendah";
        legalOverride = legalContext.finalRisk.overrideReason || null;
      }
    }

    // [PENJELASAN] TAHAP 4: MECHANISM OVERRIDE (FITUR KUNCI SKRIPSI)
    // ----------------------------------------------------------------
    // Jika layanan terbukti LEGAL dan DIAWASI PEMERINTAH (OJK/Komdigi),
    // sistem memaksa skor risiko turun menjadi 1x1 (Low).
    // Logika: "Pengawasan ketat regulator dianggap sebagai kontrol mitigasi tertinggi."
    let effectiveLikelihood = baseLikelihood;
    let effectiveImpact = baseImpact;

    if (
      legalContext &&
      legalContext.finalRisk &&
      legalContext.finalRisk.fromGovernmentRegistry
    ) {
      effectiveLikelihood = 1;
      effectiveImpact = 1;
    }

    const effectiveRiskScore = effectiveLikelihood * effectiveImpact;

    // [PENJELASAN] RETURN RESULT
    // Mengembalikan objek raksasa berisi semua hasil analisis untuk ditampilkan di UI.
    return {
      likelihood: effectiveLikelihood,
      impact: effectiveImpact,
      riskScore: effectiveRiskScore,
      riskLevel: finalRiskLevel, // Status akhir (setelah override legalitas)
      autoInfo,
      pdpResults,
      nistResults,
      recommendations,
      legalContext,
      legalOverride
    };
  }

  return {
    analyze
  };
})();