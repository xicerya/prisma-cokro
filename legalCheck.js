// legalCheck.js
// Mesin klasifikasi legalitas layanan & jenis data
// Menggunakan registry contoh: OJK, Komdigi PSE, AFPI, dan standar biometrik internasional.
// Catatan: daftar ini contoh untuk prototipe skripsi. Untuk produksi harus dihubungkan ke API resmi.

//// 1. Konfigurasi registry

const LEGAL_REGISTRIES = {
  OJK: {
    code: "OJK",
    label: "Otoritas Jasa Keuangan",
    authorityType: "government",
    description: "Regulator resmi sektor jasa keuangan di Indonesia."
  },
  PSE: {
    code: "PSE",
    label: "Komdigi PSE",
    authorityType: "government",
    description: "Penyelenggara Sistem Elektronik (PSE) yang terdaftar di Komdigi."
  },
  AFPI: {
    code: "AFPI",
    label: "AFPI",
    authorityType: "association",
    description: "Asosiasi Fintech Pendanaan Bersama Indonesia."
  },
  INT_BIOMETRIC: {
    code: "INT_BIOMETRIC",
    label: "International Biometric Registry",
    authorityType: "international_standard",
    description: "Contoh penyedia/standar biometrik yang diakui secara internasional."
  }
};

//// 2. Registry data (contoh subset)

// 2.1. Bank yang diawasi OJK (subset)
const REGISTRY_OJK_BANKS = [
  // Bank BUMN
  "BANK MANDIRI",
  "BANK RAKYAT INDONESIA",
  "BANK BRI",
  "BANK NEGARA INDONESIA",
  "BANK BNI",
  "BANK TABUNGAN NEGARA",
  "BANK BTN",

  // Bank Swasta Nasional
  "BANK CENTRAL ASIA",
  "BANK BCA",
  "BANK CIMB NIAGA",
  "BANK DANAMON",
  "BANK PERMATA",
  "BANK MEGA",
  "BANK BTPN",
  "BANK OCBC NISP",
  "BANK MAYBANK INDONESIA",
  "BANK PANIN",
  "BANK COMMONWEALTH",
  "BANK HSBC INDONESIA",
  "BANK UOB INDONESIA",

  // Bank Syariah
  "BANK SYARIAH INDONESIA",
  "BANK MUAMALAT",
  "BANK MEGA SYARIAH",
  "BANK PANIN DUBAI SYARIAH",
  "BANK BCA SYARIAH",
  "BANK BNI SYARIAH",
  "BANK BRI SYARIAH",

  // Bank Pembangunan Daerah (BPD)
  "BANK DKI",
  "BANK JABAR BANTEN",
  "BANK JABAR",
  "BANK BJB",
  "BANK JATENG",
  "BANK JATIM",
  "BANK SUMUT",
  "BANK NAGARI",
  "BANK RIAU KEPRI",
  "BANK SUMSEL BABEL",
  "BANK LAMPUNG",
  "BANK BENGKULU",
  "BANK BPD DIY",
  "BANK KALTIMTARA",
  "BANK KALBAR",
  "BANK KALSEL",
  "BANK KALTENG",
  "BANK NTB SYARIAH",
  "BANK NTT",
  "BANK MALUKU MALUT",
  "BANK SULUTGO",
  "BANK SULTENG",
  "BANK SULTRA",
  "BANK PAPUA"
];

// 2.1b. E-wallet / uang elektronik (berizin BI/OJK – subset)
const REGISTRY_EWALLETS = [
  "DANA",
  "OVO",
  "GOPAY",
  "GO-PAY",
  "SHOPEEPAY",
  "SHOPEE PAY",
  "LINKAJA",
  "LINK AJA",
  "ISAKU",
  "I.SAKU",
  "SAKUKU",
  "BRIMO",
  "JAGO",
  "JENIUS",
  "MOTIONPAY",
  "MOTION PAY",
  "DOKU",
  "AYOPOP",
  "OVO CASH"
];

// Kombinasi: bank + e-wallet → sama-sama diperlakukan sebagai entitas
// yang diawasi otoritas keuangan (BI/OJK).
const REGISTRY_OJK_BANKS_AND_EWALLETS = REGISTRY_OJK_BANKS.concat(REGISTRY_EWALLETS);

// 2.2. PSE (e-commerce / layanan digital) contoh yang terdaftar Komdigi PSE
const REGISTRY_PSE_SERVICES = [
  "TOKOPEDIA",
  "SHOPEE",
  "LAZADA",
  "BUKALAPAK",
  "BLIBLI",
  "TIKTOK SHOP",
  "TRAVELOKA",
  "PEGI-PEGI",
  "AIRASIA",
  "CITILINK",
  "ALFAGIFT",
  "INDOMARET POIN",
  "GOJEK",
  "GRAB",
  "MAXIM",
  "MYTELKOMSEL",
  "BY.U",
  "INDIHOME",
  "PLN MOBILE",
  "PDAM ONLINE",
  "BCA MOBILE",
  "BRIMO",
  "LIVIN",
  "JENIUS",
  "OVO",
  "DANA",
  "LINKAJA",
  "SHOPEE PAY",
  "GO-PAY",
  "PAYFREN",
  "GOOGLE",
  "YOUTUBE",
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "TWITTER",
  "X",
  "TIKTOK",
  "NETFLIX",
  "SPOTIFY",
  "DISNEY PLUS",
  "AMAZON",
  "MICROSOFT",
  "STEAM",
  "EPIC GAMES",
  "ROBLOX",
  "MOBILE LEGENDS",
  "GENSHIN IMPACT",
  "FREE FIRE",
  "PUBG MOBILE"
];

// 2.3. Anggota AFPI (contoh fintech lending)
const REGISTRY_AFPI_MEMBERS = [
  "AKULAKU",
  "KREDIVO",
  "HOME CREDIT",
  "INDODANA",
  "MODALKU",
  "AMAR BANK TUNAIKU",
  "RUPIAH CEPAT",
  "ADAKAMI",
  "UANGME",
  "JULO",
  "DANA SYARIAH",
  "PINJAM YUK",
  "PINJAMIN",
  "PINJAMAN GO",
  "KTA KILAT",
  "KLIK ACC",
  "KREDITPRO",
  "CROWDE",
  "INVESTREE",
  "AMARTEK",
  "KOINWORKS",
  "ASETKU",
  "LENDID",
  "PRISMA FINTECH PAYLATER"  // punyamu
];

// 2.4. Penyedia / standar biometrik internasional (contoh)
const REGISTRY_INTL_BIOMETRIC = [
  "ID.ME",
  "ONFIDO",
  "JUMIO",
  "IPROOV",
  "MICROSOFT AZURE FACE API",
  "AMAZON REKOGNITION",
  "AWS REKOGNITION",
  "FACE++",
  "NEC BIOMETRICS",
  "CLEAR SECURE",
  "VERIFF",
  "YOTI",
  "ID R&D",
  "THALES BIOMETRICS",
  "DAON",
  "ZKTECO",
  "SECUREMETRIC",
  "GLOBAL VOICE ID SERVICE",
  "PRISMA VERIFY ID" // punyamu
];

//// 3. Util pencarian nama

function legalNormalizeName(name) {
  return (name || "").toString().trim().toUpperCase();
}

function legalSearchInList(list, targetName) {
  const t = legalNormalizeName(targetName);
  if (!t) return false;
  return list.some((item) => legalNormalizeName(item).includes(t));
}

//// 4. Fungsi cek registry spesifik (sinkron)

// Cek ke registry OJK untuk bank + e-wallet
function legalCheckOjk(serviceName) {
  const found = legalSearchInList(REGISTRY_OJK_BANKS_AND_EWALLETS, serviceName);
  return {
    registry: LEGAL_REGISTRIES.OJK,
    found,
    sourceCount: REGISTRY_OJK_BANKS_AND_EWALLETS.length
  };
}

// Cek ke registry Komdigi PSE
function legalCheckPse(serviceNameOrDomain) {
  const found = legalSearchInList(REGISTRY_PSE_SERVICES, serviceNameOrDomain);
  return {
    registry: LEGAL_REGISTRIES.PSE,
    found,
    sourceCount: REGISTRY_PSE_SERVICES.length
  };
}

// Cek ke registry AFPI
function legalCheckAfpi(serviceName) {
  const found = legalSearchInList(REGISTRY_AFPI_MEMBERS, serviceName);
  return {
    registry: LEGAL_REGISTRIES.AFPI,
    found,
    sourceCount: REGISTRY_AFPI_MEMBERS.length
  };
}

// Cek ke registry / standar biometrik internasional
function legalCheckIntlBiometric(serviceName) {
  const found = legalSearchInList(REGISTRY_INTL_BIOMETRIC, serviceName);
  return {
    registry: LEGAL_REGISTRIES.INT_BIOMETRIC,
    found,
    sourceCount: REGISTRY_INTL_BIOMETRIC.length
  };
}

//// 5. Dispatcher: cek berdasarkan jenis platform

function legalCheckByPlatform(platformType, serviceNameOrDomain) {
  const pt = (platformType || "").toLowerCase();
  let raw = null;

  if (pt === "bank") {
    raw = legalCheckOjk(serviceNameOrDomain);         // termasuk e-wallet
  } else if (pt === "ecommerce" || pt === "e-commerce") {
    raw = legalCheckPse(serviceNameOrDomain);
  } else if (pt === "fintech") {
    raw = legalCheckAfpi(serviceNameOrDomain);
  } else if (pt === "biometric" || pt === "biometrik" || pt === "biometric-service") {
    raw = legalCheckIntlBiometric(serviceNameOrDomain);
  } else {
    // Website biasa, game, "lainnya", dan platform umum lain
    return {
      platformType: pt,
      serviceName: serviceNameOrDomain,
      registry: null,
      isLegal: true,
      isGovernmentApproved: false,
      confidence: "low",
      reason:
        "Platform umum tanpa registry pemerintah spesifik. Dianggap legal secara umum, namun kepatuhan detail tetap harus dievaluasi manual."
    };
  }

  const { registry, found } = raw;

  if (found) {
    return {
      platformType: pt,
      serviceName: serviceNameOrDomain,
      registry,
      isLegal: true,
      isGovernmentApproved: registry.authorityType === "government",
      confidence: "medium",
      reason: `Layanan teridentifikasi dalam registry ${registry.label}.`
    };
  }

  return {
    platformType: pt,
    serviceName: serviceNameOrDomain,
    registry,
    isLegal: false,
    isGovernmentApproved: registry.authorityType === "government",
    confidence: "medium",
    reason: `Layanan tidak ditemukan dalam registry ${registry.label}. Berpotensi belum terdaftar atau tidak memiliki dasar legal yang jelas.`
  };
}

//// 6. Rule-based legalitas jenis data

function legalNormalizeCategory(cat) {
  return (cat || "").toString().trim().toLowerCase();
}

function legalContainsAny(categories, keywords) {
  const set = categories.map(legalNormalizeCategory);
  return keywords.some((k) => set.includes(k));
}

/**
 * Aturan:
 * - Bank + KTP/SIM/Selfie          → legal, Low (Hijau)
 * - Website biasa + KTP/SIM        → tidak legal, High
 * - E-commerce + nama + alamat     → legal, Medium
 * - Game platform + wajah/suara    → hati-hati, High
 */
function legalEvaluateDataRule(platformType, dataCategories) {
  const pt = (platformType || "").toLowerCase();
  const cats = (dataCategories || []).map(legalNormalizeCategory);

  let legal = false;
  let baseRisk = "Medium";
  let explanation =
    "Tidak ada aturan khusus yang terpenuhi. Evaluasi lebih detail diperlukan.";

  // 1. Bank + KTP / SIM / Selfie → wajib secara hukum, Low
  if (pt === "bank" && legalContainsAny(cats, ["ktp", "sim", "selfie"])) {
    legal = true;
    baseRisk = "Low";
    explanation =
      "Bank / lembaga keuangan berizin diperbolehkan secara hukum meminta KTP/SIM/Selfie untuk keperluan verifikasi identitas (KYC).";
  }

  // 2. Website biasa + KTP / SIM → tidak ada dasar hukum, High
  if (
    (pt === "website" || pt === "web" || pt === "generic_web") &&
    legalContainsAny(cats, ["ktp", "sim"])
  ) {
    legal = false;
    baseRisk = "High";
    explanation =
      "Website biasa yang bukan lembaga resmi tidak memiliki dasar hukum kuat untuk meminta KTP/SIM.";
  }

  // 3. E-commerce + nama + alamat → legal, Medium
  if (
    (pt === "ecommerce" || pt === "e-commerce") &&
    legalContainsAny(cats, ["nama"]) &&
    legalContainsAny(cats, ["alamat"])
  ) {
    legal = true;
    baseRisk = "Medium";
    explanation =
      "Platform e-commerce lazim dan legal meminta nama dan alamat untuk kebutuhan pengiriman barang.";
  }

  // 4. Game platform + wajah / suara → data biometrik sensitif, High
  if (
    (pt === "game" || pt === "gaming" || pt === "game_platform") &&
    legalContainsAny(cats, ["wajah", "suara", "voice", "face"])
  ) {
    legal = false;
    baseRisk = "High";
    explanation =
      "Game platform yang mengumpulkan wajah/suara menyentuh data biometrik sensitif dan membutuhkan dasar hukum serta proteksi tambahan.";
  }

  return {
    platformType: pt,
    dataCategories: cats,
    legalByDataRule: legal,
    baseRiskByDataRule: baseRisk,
    explanation
  };
}

//// 7. Kombinasi dengan hasil Likelihood–Impact Matrix

function legalRiskToScore(level) {
  const v = (level || "").toLowerCase();
  if (v === "low") return 1;
  if (v === "medium") return 2;
  if (v === "high") return 3;
  return 2;
}

function legalScoreToRisk(score) {
  if (score <= 1) return "Low";
  if (score === 2) return "Medium";
  return "High";
}

function legalRiskColor(level) {
  const v = (level || "").toLowerCase();
  if (v === "low") return "green";
  if (v === "medium") return "yellow";
  return "red";
}

/**
 * Aturan kombinasi:
 * 1. Jika isLegal && isGovernmentApproved (OJK / Komdigi PSE)
 *    → finalRisk = Low (Hijau), override apapun.
 * 2. Jika isLegal, tapi non-pemerintah (AFPI / internasional / website/game/lainnya)
 *    → TIDAK mengubah perhitungan Likelihood–Impact, hanya memberi konteks legalitas.
 * 3. Jika !isLegal && baseRiskByDataRule = High → boleh dinaikkan 1 tingkat (opsional).
 * 4. Selain itu → gunakan max(matrixRisk, dataRule).
 */
function legalCombineRisk(matrixRiskLevel, legalStatus, dataRule) {
  const matrixScore = legalRiskToScore(matrixRiskLevel);
  const dataScore = legalRiskToScore(dataRule.baseRiskByDataRule);

  let baseScore = Math.max(matrixScore, dataScore);
  let baseLevel = legalScoreToRisk(baseScore);

  // 1️⃣ LEGAL + PEMERINTAH (OJK / Komdigi PSE) → paksa Low (Hijau)
  if (legalStatus && legalStatus.isLegal && legalStatus.isGovernmentApproved) {
    return {
      finalRiskLevel: "Low",
      finalRiskColor: legalRiskColor("Low"),
      overrideReason:
        "Layanan terdaftar resmi di lembaga pemerintah (misalnya OJK / Komdigi PSE), sehingga residual risk dinilai rendah.",
      fromGovernmentRegistry: true
    };
  }

  // 2️⃣ Legal tapi BUKAN lembaga pemerintah (AFPI / biometric / website / game / lainnya)
  if (legalStatus && legalStatus.isLegal && !legalStatus.isGovernmentApproved) {
    return {
      finalRiskLevel: baseLevel,
      finalRiskColor: legalRiskColor(baseLevel),
      overrideReason:
        "Layanan memiliki dasar legal non-pemerintah. Analisis risiko tetap mengikuti hasil perhitungan Likelihood–Impact.",
      fromGovernmentRegistry: false
    };
  }

  // 3️⃣ Tidak legal + rule data High → opsional: dinaikkan 1 tingkat
  if (
    legalStatus &&
    !legalStatus.isLegal &&
    dataRule.baseRiskByDataRule === "High"
  ) {
    baseScore = Math.min(3, baseScore + 1);
    baseLevel = legalScoreToRisk(baseScore);
  }

  return {
    finalRiskLevel: baseLevel,
    finalRiskColor: legalRiskColor(baseLevel),
    overrideReason: null,
    fromGovernmentRegistry: false
  };
}

//// 8. Fungsi utama yang dipakai RiskEngine

function legalEvaluateContext({ platformType, serviceName, dataCategories, matrixRiskLevel }) {
  const legalStatus = legalCheckByPlatform(platformType, serviceName);
  const dataRule = legalEvaluateDataRule(platformType, dataCategories || []);
  const finalRisk = legalCombineRisk(matrixRiskLevel, legalStatus, dataRule);

  return {
    platformType: (platformType || "").toLowerCase(),
    serviceName,
    dataCategories: dataCategories || [],
    matrixRiskLevel,
    legalStatus,
    dataRule,
    finalRisk
  };
}

// Daftarkan ke global window supaya bisa diakses riskEngine.js / app.js
window.LegalEngine = {
  checkOjkBank: legalCheckOjk,
  checkKominfoPse: legalCheckPse,
  checkAfpi: legalCheckAfpi,
  checkIntlBiometric: legalCheckIntlBiometric,
  checkLegalByPlatform: legalCheckByPlatform,
  evaluateDataLegalRule: legalEvaluateDataRule,
  combineRiskWithLegalContext: legalCombineRisk,
  evaluateLegalContext: legalEvaluateContext
};
