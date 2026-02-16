// legalCheck.js
// Mesin klasifikasi legalitas layanan & jenis data
// Menggunakan registry contoh: OJK, Komdigi PSE, AFPI, dan standar biometrik internasional.

// [PENJELASAN 1] DEFINISI REGULATOR
// Objek ini mendefinisikan siapa saja "wasit" atau otoritas yang diakui sistem.
// Kunci utama: 'authorityType: government' akan memicu fitur Override Risiko (skor otomatis jadi Low/Hijau).
const LEGAL_REGISTRIES = {
  OJK: {
    code: "OJK",
    label: "Otoritas Jasa Keuangan",
    authorityType: "government", // Pemicu Skor Hijau (Low)
    description: "Regulator resmi sektor jasa keuangan di Indonesia."
  },
  PSE: {
    code: "PSE",
    label: "Komdigi PSE",
    authorityType: "government", // Pemicu Skor Hijau (Low)
    description: "Penyelenggara Sistem Elektronik (PSE) yang terdaftar di Komdigi."
  },
  AFPI: {
    code: "AFPI",
    label: "AFPI",
    authorityType: "association", // Asosiasi Fintech (Mitra OJK)
    description: "Asosiasi Fintech Pendanaan Bersama Indonesia."
  },
  INT_BIOMETRIC: {
    code: "INT_BIOMETRIC",
    label: "International Biometric Registry",
    authorityType: "international_standard", // Standar Teknis Internasional
    description: "Contoh penyedia/standar biometrik yang diakui secara internasional."
  }
};

// ============================================================================
// [PENJELASAN 2] DATABASE WHITELIST (DAFTAR PUTIH)
// Daftar ini berisi nama-nama aplikasi/layanan yang dianggap RESMI & LEGAL.
// Jika nama yang diinput user ada di sini, sistem akan menandainya sebagai 'Legal'.
// ============================================================================

// 2.1. Bank yang diawasi OJK & Aplikasi Mobile Banking Resmi (Lengkap)
const REGISTRY_OJK_BANKS = [
  "BANK MANDIRI", "LIVIN BY MANDIRI", "LIVIN", "LIVIN MANDIRI", "KOPRA",
  "BANK RAKYAT INDONESIA", "BANK BRI", "BRIMO", "BRI MOBILE", "CERIA BRI",
  "BANK NEGARA INDONESIA", "BANK BNI", "BNI MOBILE BANKING", "WONDR BY BNI", "WONDR",
  "BANK TABUNGAN NEGARA", "BANK BTN", "BTN MOBILE", "BTN PROPERTI",
  "BANK CENTRAL ASIA", "BANK BCA", "BCA MOBILE", "MYBCA", "KLIKBCA", "BLU BY BCA DIGITAL", "BLU BCA",
  "BANK CIMB NIAGA", "OCTO MOBILE", "OCTO CLICKS", "OCTO PAY",
  "BANK DANAMON", "D-BANK PRO", "DANAMON ONLINE",
  "BANK PERMATA", "PERMATAMOBILE X", "PERMATA NET",
  "BANK MAYBANK INDONESIA", "M2U ID", "M2U",
  "BANK PANIN", "PANIN MOBILE", "PANIN DIRECT",
  "BANK OCBC NISP", "OCBC INDONESIA", "ONE MOBILE", "NYALA OCBC",
  "BANK UOB INDONESIA", "TMRW BY UOB", "TMRW", "UOB INFINITY",
  "BANK DBS INDONESIA", "DIGIBANK BY DBS", "DIGIBANK",
  "BANK BTPN", "JENIUS", "JENIUS BTPN", "SINAYA",
  "BANK MEGA", "M-SMILE", "MEGA MOBILE",
  "BANK SINARMAS", "SIMOBI PLUS",
  "BANK BUKOPIN", "KB BUKOPIN", "KBSTAR", "WOKEE",
  "BANK MAYAPADA", "MYONLINE",
  "BANK ARTHA GRAHA", "AGI MOBILE",
  "BANK MNC", "MOTIONBANK",
  "BANK GANESHA", "BANGGA",
  "BANK JAGO", "JAGO APP", "JAGO SYARIAH",
  "BANK NEO COMMERCE", "BNC", "NEOBANK",
  "ALLO BANK", "ALLO APP", "ALLO PRIME",
  "SEABANK", "SEABANK INDONESIA",
  "BANK RAYA", "RAYA APP",
  "SUPERBANK", "BANK ALADIN SYARIAH", "ALADIN",
  "BANK KROM", "KROM BANK",
  "BANK AMAR", "TUNAIKU",
  "BANK SYARIAH INDONESIA", "BSI", "BSI MOBILE", "BSI NET",
  "BANK MUAMALAT", "MUAMALAT DIN",
  "BANK MEGA SYARIAH", "M-SYARIAH",
  "BCA SYARIAH", "BCA SYARIAH MOBILE",
  "BTPN SYARIAH", "TEPAT MOBILE",
  "BANK ALADIN", 
  "BANK VICTORIA SYARIAH",
  "BANK JABAR BANTEN SYARIAH", "BJB SYARIAH",
  "BANK DKI", "JAKONE MOBILE", "JAKONE",
  "BANK JABAR BANTEN", "BANK BJB", "BJB DIGI", "DIGI BY BJB",
  "BANK JATENG", "BIMA MOBILE", "IBANK JATENG",
  "BANK JATIM", "JCONNECT", "JCONNECT MOBILE",
  "BANK BPD DIY", "BPD DIY MOBILE",
  "BANK SUMUT", "SUMUT MOBILE",
  "BANK NAGARI", "NAGARI MOBILE",
  "BANK RIAU KEPRI SYARIAH", "BRKS MOBILE",
  "BANK SUMSEL BABEL", "TELEMATI",
  "BANK LAMPUNG", "LAMPUNG ONLINE",
  "BANK JAMBI", "MOBILE BANK JAMBI",
  "BANK BENGKULU", "BENGKULU MOBILE",
  "BANK KALBAR", "KALBAR MOBILE",
  "BANK KALSEL", "AKSEL BY BANK KALSEL",
  "BANK KALTENG", "BETANG MOBILE",
  "BANK KALTIMTARA", "DG BANK KALTIMTARA",
  "BANK SULSELBAR", "SULSELBAR MOBILE",
  "BANK SULUTGO", "SULUTGO MOBILE",
  "BANK NTB SYARIAH", "NTB SYARIAH MOBILE",
  "BANK BALI", "BPD BALI MOBILE",
  "BANK NTT", "B PUNG MOBILE",
  "BANK MALUKU MALUT",
  "BANK PAPUA", "PAPUA MOBILE",
  "CITIBANK", "CITI MOBILE",
  "HSBC INDONESIA", "HSBC MOBILE",
  "STANDARD CHARTERED", "SC MOBILE",
  "BANK OF CHINA",
  "ANZ INDONESIA",
  "QNB INDONESIA", "QNB DOOET",
  "SHINHAN BANK", "SOL INDONESIA"
];

// ============================================================================
// 2.1b. E-Wallet, Paylater & Uang Elektronik (Berizin BI/OJK)
// ============================================================================
const REGISTRY_EWALLETS = [
  "GOPAY", "GO-PAY", "GOPAY LATER",
  "OVO", "OVO CASH", "OVO POINTS",
  "DANA", "DANA DOMPET DIGITAL",
  "SHOPEEPAY", "SHOPEE PAY", "SPAYLATER",
  "LINKAJA", "LINK AJA", "LINKAJA SYARIAH",
  "ISAKU", "I.SAKU", 
  "ASTRAPAY", 
  "DOKU", "DOKU WALLET",
  "SAKUKU", 
  "JAKONE PAY",
  "PAYTREN",
  "SPEEDCASH",
  "KASPRO",
  "SPIN PAY",
  "NOBU E-PAY",
  "YAP!", 
  "QRIS", 
  "KREDIVO", "KREDIVO PAYLATER",
  "AKULAKU", "AKULAKU PAY",
  "INDODANA", "INDODANA PAYLATER",
  "TRAVELOKA PAYLATER",
  "GOPAY LATER",
  "SHOPEE PAYLATER",
  "ATOM",
  "HOME CREDIT", "HOME CREDIT INDONESIA",
  "AEON CREDIT",
  "ADIRA FINANCE", "ADIRAKU"
];

// Gabungan untuk pengecekan "Institusi Keuangan Resmi"
const REGISTRY_OJK_BANKS_AND_EWALLETS = REGISTRY_OJK_BANKS.concat(REGISTRY_EWALLETS);

// ============================================================================
// 2.2. PSE (Layanan Digital Terdaftar Komdigi/Kominfo)
// ============================================================================
const REGISTRY_PSE_SERVICES = [
  "TOKOPEDIA", "SHOP TOKOPEDIA", "MITRA TOKOPEDIA",
  "SHOPEE", "SHOPEE INDONESIA", "MITRA SHOPEE",
  "LAZADA", "LAZADA INDONESIA",
  "BUKALAPAK", "MITRA BUKALAPAK",
  "BLIBLI", "BLIBLI.COM",
  "TIKTOK SHOP",
  "ZALORA",
  "JD.ID", 
  "BHINNEKA",
  "SOCIOLLA",
  "RALALI",
  "JAKMALL",
  "MATAHARI.COM",
  "KLIKINDOMARET",
  "ALFAGIFT",
  "ASTRO",
  "SAYURBOX",
  "TRAVELOKA",
  "TIKET.COM",
  "AGODA",
  "BOOKING.COM",
  "AIRBNB",
  "PEGIPEGI", 
  "MISTER ALADIN",
  "GOJEK", "GOCAR", "GORIDE", "GOFOOD",
  "GRAB", "GRAB INDONESIA", "GRABFOOD",
  "MAXIM", "MAXIM DRIVER",
  "INDRIVE",
  "BLUEBIRD", "MYBLUEBIRD",
  "KAI ACCESS", "ACCESS BY KAI",
  "FERIZY",
  "MRT JAKARTA",
  "TRAJEKLINE",
  "NETFLIX",
  "DISNEY+ HOTSTAR", "DISNEY PLUS",
  "VIDIO", "VIDIO.COM",
  "VIU",
  "SPOTIFY",
  "YOUTUBE", "YOUTUBE MUSIC",
  "TIKTOK",
  "INSTAGRAM",
  "FACEBOOK",
  "WHATSAPP", "WHATSAPP BUSINESS",
  "X", "TWITTER",
  "TELEGRAM",
  "LINE", "LINE TODAY",
  "DISCORD",
  "ROBLOX",
  "MOBILE LEGENDS", "MLBB",
  "FREE FIRE", "GARENA FREE FIRE",
  "PUBG MOBILE",
  "GENSHIN IMPACT",
  "VALORANT",
  "STEAM",
  "EPIC GAMES STORE",
  "PLAYSTATION STORE",
  "NINTENDO ESHOP",
  "CANDY CRUSH",
  "CLASH OF CLANS",
  "GOOGLE", "GMAIL", "GOOGLE DRIVE", "GOOGLE DOCS", "GOOGLE CLASSROOM",
  "ZOOM", "ZOOM MEETING",
  "MICROSOFT", "MICROSOFT 365", "TEAMS",
  "CANVA",
  "NOTION",
  "SLACK",
  "TRELLO",
  "RUANGGURU",
  "ZENIUS",
  "QUIPPER",
  "UDEMY",
  "COURSERA",
  "LINKEDIN",
  "GLINTS",
  "JOBSTREET",
  "KITA LULUS",
  "PEDULILINDUNGI", "SATUSEHAT",
  "MJKN", "MOBILE JKN",
  "PLN MOBILE",
  "MYPERTAMINA",
  "MYTELKOMSEL",
  "MYIM3",
  "BIMA+", "TRI",
  "AXISNET",
  "BY.U",
  "INDIHOME",
  "FIRST MEDIA",
  "BIZNET",
  "DJP ONLINE", "PAJAK.GO.ID",
  "OSS", "OSS RBA",
  "SIPP", "SIPP BPJS"
];

// ============================================================================
// 2.3. Anggota AFPI (Fintech Lending / Pinjol Legal)
// ============================================================================
const REGISTRY_AFPI_MEMBERS = [
  "KREDIVO",
  "AKULAKU",
  "EASYCASH",
  "ADAKAMI",
  "RUPIAH CEPAT",
  "UANGME",
  "KREDIT PINTAR",
  "INDODANA",
  "MUCASH",
  "MODALKU",
  "INVESTREE",
  "AMARTHA",
  "KOINWORKS",
  "ASETKU",
  "DANAMAS",
  "AKSELERAN",
  "POHON DANA",
  "MEKAR",
  "ESTA KAPITAL",
  "KREDITPRO",
  "FINTAG",
  "RUPIAH CEPAT",
  "CROWDO",
  "JULO",
  "PINJAM WINWIN",
  "DANA RUPIAH",
  "TARALITE",
  "PINJAM MODAL",
  "ALAMI",
  "AUNTING",
  "DANA SYARIAH",
  "BATUMBU",
  "CROWDE",
  "KLIKUMKM",
  "PINJAM GAMPANG",
  "CICIL",
  "LUMBUNG DANA",
  "360 KREDI",
  "DHANAPALA",
  "KREDINESIA",
  "PINJAM YUK",
  "FINPLUS",
  "UANGME",
  "PINJAMDUIT",
  "DANAFIX",
  "INDODANA",
  "AWANTUNAI",
  "DANAKINI",
  "SINGA",
  "DANAMERDEKA",
  "EASYCASH",
  "PINJAMAN GO",
  "KREDITO",
  "CROWDE",
  "ALAMI",
  "SAMIR",
  "WATAS",
  "KAYA.ID",
  "KAPITAL BOOST",
  "PAPITUPI SYARIAH",
  "BANTUSAKU",
  "DANABIJAK",
  "DANAIN",
  "ADA PUNDI",
  "LENTERA DANA NUSANTARA",
  "MODAL NASIONAL",
  "SOLUSIKU",
  "CAIRIN",
  "TRUSTIQ",
  "KLIKCARI",
  "ADAMODAL",
  "KOMUNAL",
  "RESTOCK.ID",
  "RINGAN",
  "AVANTEE",
  "GRADANA",
  "DANACITA",
  "IKI MODAL",
  "IVOJI",
  "INDOSAKU",
  "JEMBATAN EMAS",
  "EDUFUND",
  "GANDENGTANGAN",
  "PAPITUPI",
  "FINMAS", 
  "KTA KILAT"
];

// ============================================================================
// 2.4. Penyedia / Standar Biometrik & Identitas Internasional (Vendor)
// ============================================================================
const REGISTRY_INTL_BIOMETRIC = [
  "APPLE FACE ID", "FACE ID", "TOUCH ID",
  "ANDROID BIOMETRIC", "GOOGLE BIOMETRIC API",
  "WINDOWS HELLO", "MICROSOFT FACE API",
  "AMAZON REKOGNITION", "AWS REKOGNITION",
  "IBM WATSON VISUAL RECOGNITION",
  "SAMSUNG PASS",
  "VIDA", "VIDA DIGITAL IDENTITY", 
  "PRIVY", "PRIVYID", 
  "TILAKA", 
  "PERURI", "PERURI DIGITAL", 
  "ASLI RI", "ASLI.RI", 
  "TEGUH", 
  "DIGISIGN", 
  "XENIDENTITY", 
  "VERIHUBS", 
  "JUMIO",
  "ONFIDO",
  "THALES GROUP", "THALES GEMALTO",
  "IDEMIA",
  "NEC BIOMETRICS", "NEC",
  "HID GLOBAL",
  "DERMALOG",
  "AWARE INC",
  "ID R&D",
  "DAON",
  "BIOKEY",
  "FINGERPRINTJS",
  "AUTH0", "OKTA",
  "SUMSUB",
  "TRULIOO",
  "SOCURE",
  "VERIFF",
  "INCODE",
  "MATI",
  "ALICE BIOMETRICS",
  "FACEPHI",
  "INNOVATRICS",
  "ID.ME",
  "CLEAR", "CLEAR SECURE",
  "YOTI",
  "IPROOV"
];

//// 3. Util pencarian nama
// [PENJELASAN 3] FUNGSI NORMALISASI
// Agar pencarian tidak case-sensitive (huruf besar/kecil tidak masalah).
// Contoh: User ketik "bca", sistem tetap bisa mencocokkan dengan "BCA" di database.
function legalNormalizeName(name) {
  return (name || "").toString().trim().toUpperCase();
}

function legalSearchInList(list, targetName) {
  const t = legalNormalizeName(targetName);
  if (!t) return false;
  return list.some((item) => legalNormalizeName(item).includes(t));
}

//// 4. Fungsi cek registry spesifik
// [PENJELASAN 4] FUNGSI PENGECEKAN INDIVIDUAL
// Fungsi-fungsi ini bertugas mengecek ke satu database spesifik saja.
// Misal: legalCheckOjk hanya mengecek ke list Bank OJK.

function legalCheckOjk(serviceName) {
  const found = legalSearchInList(REGISTRY_OJK_BANKS_AND_EWALLETS, serviceName);
  return {
    registry: LEGAL_REGISTRIES.OJK,
    found,
    sourceCount: REGISTRY_OJK_BANKS_AND_EWALLETS.length
  };
}

function legalCheckPse(serviceNameOrDomain) {
  const found = legalSearchInList(REGISTRY_PSE_SERVICES, serviceNameOrDomain);
  return {
    registry: LEGAL_REGISTRIES.PSE,
    found,
    sourceCount: REGISTRY_PSE_SERVICES.length
  };
}

function legalCheckAfpi(serviceName) {
  const found = legalSearchInList(REGISTRY_AFPI_MEMBERS, serviceName);
  return {
    registry: LEGAL_REGISTRIES.AFPI,
    found,
    sourceCount: REGISTRY_AFPI_MEMBERS.length
  };
}

function legalCheckIntlBiometric(serviceName) {
  const found = legalSearchInList(REGISTRY_INTL_BIOMETRIC, serviceName);
  return {
    registry: LEGAL_REGISTRIES.INT_BIOMETRIC,
    found,
    sourceCount: REGISTRY_INTL_BIOMETRIC.length
  };
}

//// 5. Dispatcher: cek berdasarkan jenis platform
// [PENJELASAN 5] DISPATCHER (PENGENDALI LOGIKA)
// Fungsi ini yang menentukan "Kategori apa dicek kemana?".
// Contoh: Jika user pilih 'Game', sistem diarahkan cek ke database PSE.
function legalCheckByPlatform(platformType, serviceNameOrDomain) {
  const pt = (platformType || "").toLowerCase();
  let raw = null;

  if (pt === "bank") {
    raw = legalCheckOjk(serviceNameOrDomain);
  } 
  else if (pt === "fintech") {
    raw = legalCheckAfpi(serviceNameOrDomain);
  } 
  else if (pt === "biometric" || pt === "biometrik") {
    raw = legalCheckIntlBiometric(serviceNameOrDomain);
  } 
  // [PENJELASAN] Bagian ini menggabungkan semua kategori digital (Game, Travel, dll)
  // agar diperiksa di database PSE Komdigi.
  else if (
    pt === "ecommerce" || pt === "e-commerce" ||
    pt === "travel" || 
    pt === "productivity" || 
    pt === "education_health" || 
    pt === "entertainment" ||
    pt === "game"
  ) {
    raw = legalCheckPse(serviceNameOrDomain);
  } 
  else {
    // Jika kategori 'Lainnya', tidak ada pengecekan legalitas spesifik.
    return {
      platformType: pt,
      serviceName: serviceNameOrDomain,
      registry: null,
      isLegal: true,
      isGovernmentApproved: false,
      confidence: "low",
      reason: "Platform umum tanpa registry pemerintah spesifik. Dianggap legal secara umum, namun kepatuhan detail tetap harus dievaluasi manual."
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
// [PENJELASAN 6] VALIDASI KONTEKS (CONTEXTUAL CHECK)
// Memeriksa kewajaran permintaan data.
// Contoh: Wajar jika Bank minta KTP, tapi Tidak Wajar jika Game minta KTP.

function legalNormalizeCategory(cat) {
  return (cat || "").toString().trim().toLowerCase();
}

function legalContainsAny(categories, keywords) {
  const set = categories.map(legalNormalizeCategory);
  return keywords.some((k) => set.includes(k));
}

function legalEvaluateDataRule(platformType, dataCategories) {
  const pt = (platformType || "").toLowerCase();
  const cats = (dataCategories || []).map(legalNormalizeCategory);

  let legal = false;
  let baseRisk = "Medium";
  let explanation =
    "Tidak ada aturan khusus yang terpenuhi. Evaluasi lebih detail diperlukan.";

  // 1. BANK / FINTECH (Keuangan)
  if ((pt === "bank" || pt === "fintech") && legalContainsAny(cats, ["ktp", "sim", "selfie", "rekening"])) {
    legal = true;
    baseRisk = "Low";
    explanation =
      "Wajar bagi Lembaga Keuangan (Bank/Fintech) meminta KYC (KTP/Selfie) sesuai regulasi OJK.";
  }

  // 2. WEBSITE BIASA (Tidak boleh minta KTP)
  if (
    (pt === "website" || pt === "web" || pt === "generic_web" || pt === "lainnya") &&
    legalContainsAny(cats, ["ktp", "sim", "selfie"])
  ) {
    legal = false;
    baseRisk = "High";
    explanation =
      "Website umum yang bukan lembaga resmi tidak memiliki dasar hukum kuat untuk meminta KTP/SIM.";
  }

  // 3. E-COMMERCE / TRAVEL (Butuh Alamat & Lokasi)
  if (
    (pt === "ecommerce" || pt === "e-commerce" || pt === "travel") &&
    (legalContainsAny(cats, ["alamat"]) || legalContainsAny(cats, ["lokasi"]))
  ) {
    legal = true;
    baseRisk = "Medium"; // Medium karena data lokasi tetap sensitif, tapi legal diminta.
    explanation =
      "Platform E-commerce/Travel secara sah membutuhkan Alamat/Lokasi untuk pengiriman barang atau penjemputan.";
  }

  // 4. GAME / HIBURAN (Tidak boleh minta Biometrik/KTP)
  if (
    (pt === "game" || pt === "gaming" || pt === "entertainment") &&
    legalContainsAny(cats, ["wajah", "suara", "ktp", "sim"])
  ) {
    legal = false;
    baseRisk = "High";
    explanation =
      "Platform Game/Hiburan umumnya tidak memerlukan data biometrik atau identitas resmi (KTP). Permintaan ini mencurigakan.";
  }

  // 5. PENDIDIKAN / KESEHATAN (Butuh Identitas Terbatas)
  if (
    (pt === "education_health" || pt === "productivity") &&
    legalContainsAny(cats, ["nama", "email", "telepon"])
  ) {
    legal = true;
    baseRisk = "Low";
    explanation =
      "Aplikasi Pendidikan/Produktivitas wajar meminta Nama/Email untuk pendaftaran akun pengguna.";
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
// [PENJELASAN 7] LOGIKA OVERRIDE (PENGGANTIAN SKOR)
// Ini adalah inti kecerdasan sistem:
// 1. Jika Terdaftar Pemerintah (OJK/PSE) -> Paksa Skor Jadi Low (Hijau).
// 2. Jika Tidak Terdaftar & Minta Data Aneh -> Penalti (Naikkan Risiko).

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

function legalCombineRisk(matrixRiskLevel, legalStatus, dataRule) {
  const matrixScore = legalRiskToScore(matrixRiskLevel);
  const dataScore = legalRiskToScore(dataRule.baseRiskByDataRule);

  let baseScore = Math.max(matrixScore, dataScore);
  let baseLevel = legalScoreToRisk(baseScore);

  // [OVERRIDE 1] LEGAL + PEMERINTAH -> PASTI HIJAU (AMAN)
  // Logika ini otomatis menangkap Game/Travel resmi karena mereka masuk "PSE" (Government)
  if (legalStatus && legalStatus.isLegal && legalStatus.isGovernmentApproved) {
    return {
      finalRiskLevel: "Low",
      finalRiskColor: legalRiskColor("Low"),
      overrideReason:
        "Layanan terdaftar resmi di lembaga pemerintah (misalnya OJK / Komdigi PSE), sehingga residual risk dinilai rendah.",
      fromGovernmentRegistry: true
    };
  }

  // [OVERRIDE 2] LEGAL NON-PEMERINTAH -> IKUTI HITUNGAN TEKNIS
  if (legalStatus && legalStatus.isLegal && !legalStatus.isGovernmentApproved) {
    return {
      finalRiskLevel: baseLevel,
      finalRiskColor: legalRiskColor(baseLevel),
      overrideReason:
        "Layanan memiliki dasar legal non-pemerintah. Analisis risiko tetap mengikuti hasil perhitungan Likelihood–Impact.",
      fromGovernmentRegistry: false
    };
  }

  // [OVERRIDE 3] TIDAK LEGAL + DATA SENSITIF -> PENALTI (RISIKO NAIK)
  // Logika ini otomatis menghukum Game/Travel bodong yang minta data aneh
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

//// 8. Fungsi utama
// [PENJELASAN 8] MAIN ENTRY POINT
// Fungsi ini yang dipanggil oleh file lain (riskEngine.js) untuk memulai proses pengecekan legalitas.

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

// Mengekspos fungsi ke window agar bisa diakses global oleh file lain.
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