// rules.js
// Kumpulan fungsi rule-based untuk analisis risiko privasi
// Disesuaikan dengan UU PDP 2022 & NIST CSF 2.0, dengan bahasa yang mudah dipahami.

const RiskRules = (() => {
  /**
   * Infer base Likelihood & Impact (otomatis).
   * Nilai awal = 3, lalu dinaikkan / diturunkan berdasarkan parameter teknis.
   */
  function inferBaseLikelihoodImpact(params) {
    let L = 3;
    let I = 3;
    const reasons = [];

    // 1. Sensitivitas jenis data
    switch (params.dataType) {
      case "biometrik":
      case "keuangan":
        I += 2;
        reasons.push("Data sensitif (biometrik/keuangan) membuat dampak lebih besar.");
        break;
      case "identitas":
        I += 1;
        reasons.push("Data identitas resmi menambah dampak jika bocor.");
        break;
      case "lokasi":
      case "perilaku":
        reasons.push("Data perilaku/lokasi bisa berdampak sedang tergantung konteks.");
        break;
      case "umum":
        reasons.push("Data umum biasanya berdampak lebih kecil dibanding data sensitif.");
        break;
      default:
        reasons.push("Jenis data tidak spesifik, diasumsikan berdampak sedang.");
    }

    // 2. Aktivitas pemrosesan
    if (params.processingActivity === "sharing") {
      L += 1;
      I += 1;
      reasons.push("Data dibagikan ke pihak lain, peluang dan dampak risiko meningkat.");
    } else if (params.processingActivity === "storage") {
      I += 1;
      reasons.push("Penyimpanan jangka panjang menaikkan dampak bila terjadi kebocoran.");
    } else if (params.processingActivity === "verification") {
      I += 1;
      reasons.push("Verifikasi identitas biasanya melibatkan data penting pengenal.");
    } else if (params.processingActivity === "analysis") {
      L += 1;
      reasons.push("Analisis/pemantauan meningkatkan risiko profilisasi jika tidak dijaga.");
    } else if (params.processingActivity === "transmission") {
      L += 1;
      reasons.push("Pengiriman data tanpa kontrol kuat meningkatkan kemungkinan kebocoran.");
    } else if (params.processingActivity === "deletion") {
      I -= 1;
      reasons.push("Fokus pada penghapusan dapat menurunkan dampak residu data.");
    }

    // 3. Keterlibatan pihak ketiga
    if (params.thirdParty === "yes") {
      L += 1;
      I += 1;
      reasons.push(
        "Ada pihak ketiga yang terlibat, permukaan serangan dan ketidakpastian kontrol meningkat."
      );
    }

    // 4. Enkripsi
    if (params.encryption === "none") {
      L += 1;
      I += 1;
      reasons.push("Tidak ada enkripsi membuat data lebih mudah disalahgunakan.");
    } else if (params.encryption === "in_transit" || params.encryption === "at_rest") {
      reasons.push("Enkripsi hanya sebagian, perlindungan sudah ada tapi masih bisa ditingkatkan.");
    } else if (params.encryption === "both") {
      L -= 1;
      I -= 1;
      reasons.push("Enkripsi saat dikirim dan disimpan menurunkan kemungkinan dan dampak.");
    }

    // 5. Kontrol akses
    if (params.accessControl === "none") {
      L += 1;
      reasons.push("Tidak ada kontrol akses formal, siapa saja bisa mengakses data.");
    } else if (params.accessControl === "basic") {
      reasons.push("Hanya memakai username/password, masih berisiko jika lemah.");
    } else if (params.accessControl === "role_based") {
      L -= 1;
      reasons.push("Akses dibatasi berdasarkan peran, mengurangi risiko akses tidak sah.");
    }

    // 6. Metode autentikasi
    if (params.authMethod === "none") {
      L += 1;
      reasons.push("Tanpa autentikasi yang jelas, data lebih mudah diakses pihak yang tidak berhak.");
    } else if (params.authMethod === "password_only") {
      reasons.push("Password saja cukup, tapi rawan jika tidak dikelola dengan baik.");
    } else if (params.authMethod === "password_mfa") {
      L -= 1;
      reasons.push("Autentikasi multi-faktor menambah lapisan keamanan.");
    } else if (params.authMethod === "sso") {
      reasons.push("Login lewat SSO bisa aman jika penyedia SSO terpercaya.");
    }

    // Clamp ke rentang 1–5
    L = Math.max(1, Math.min(5, L));
    I = Math.max(1, Math.min(5, I));

    return {
      likelihood: L,
      impact: I,
      reasons,
    };
  }

  /**
   * Evaluasi kepatuhan terhadap aspek utama UU PDP 2022.
   * Aspek yang dicek (disederhanakan):
   * - Kesesuaian tujuan pemrosesan (purpose limitation)
   * - Consent / dasar pemrosesan
   * - Keamanan pemrosesan data
   * - Pihak ketiga
   * - Respons insiden & pemberitahuan
   */
function evaluatePDP(params) {
  const results = [];

  // 1. Tujuan pemrosesan (Purpose Limitation – Pasal 16 ayat (2) huruf b, Pasal 28)
  if (params.purposeSpecified === "yes" && params.processingPurpose) {
    results.push({
      aspect: "Tujuan Pemrosesan",
      status: "Patuh",
      code: "good",
      legalRef: "Pasal 16 ayat (2) huruf b, Pasal 28 UU PDP",
      note: "Tujuan pengumpulan dan penggunaan data dijelaskan dengan jelas kepada pengguna.",
    });
  } else if (params.purposeSpecified === "yes") {
    results.push({
      aspect: "Tujuan Pemrosesan",
      status: "Sebagian Patuh",
      code: "ok",
      legalRef: "Pasal 16 ayat (2) huruf b, Pasal 28 UU PDP",
      note: "Tujuan disebutkan, tetapi belum dijelaskan secara rinci.",
    });
  } else {
    results.push({
      aspect: "Tujuan Pemrosesan",
      status: "Tidak Patuh",
      code: "bad",
      legalRef: "Pasal 16 ayat (2) huruf b, Pasal 28 UU PDP",
      note:
        "Tujuan pengumpulan data tidak dijelaskan dengan jelas, berpotensi melanggar prinsip pemrosesan sesuai tujuan.",
    });
  }

  // 2. Persetujuan (Consent) – Pasal 20, 22, 23, 24
  if (params.consentType === "explicit") {
    results.push({
      aspect: "Persetujuan (Consent)",
      status: "Patuh",
      code: "good",
      legalRef: "Pasal 20 ayat (1)-(2), Pasal 22–24 UU PDP",
      note:
        "Pengguna memberikan persetujuan yang jelas dan spesifik sebelum data diproses.",
    });
  } else if (params.consentType === "implicit") {
    let status = "Sebagian Patuh";
    let code = "ok";
    let note =
      "Persetujuan hanya tersirat dari syarat dan ketentuan umum. Untuk data sensitif sebaiknya lebih tegas.";

    if (params.dataType === "biometrik" || params.dataType === "keuangan") {
      status = "Tidak Patuh";
      code = "bad";
      note =
        "Untuk data sensitif seperti biometrik/keuangan, sebaiknya menggunakan persetujuan eksplisit.";
    }

    results.push({
      aspect: "Persetujuan (Consent)",
      status,
      code,
      legalRef: "Pasal 20 ayat (1)-(2), Pasal 22–24 UU PDP",
      note,
    });
  } else {
    results.push({
      aspect: "Persetujuan (Consent)",
      status: "Tidak Patuh",
      code: "bad",
      legalRef: "Pasal 20 ayat (1)-(2), Pasal 22–24 UU PDP",
      note:
        "Tidak ada mekanisme persetujuan yang jelas sebelum data diproses.",
    });
  }

  // 3. Keamanan pemrosesan data – Pasal 35–39
  let securityStatus = "Sebagian Patuh";
  let securityCode = "ok";
  let securityNote =
    "Sebagian kontrol keamanan sudah ada, tetapi masih bisa ditingkatkan.";

  const weakEncryption = params.encryption === "none";
  const weakAccess = params.accessControl === "none";
  const strongEncryption = params.encryption === "both";
  const strongAccess = params.accessControl === "role_based";
  const strongAuth = params.authMethod === "password_mfa";

  if (weakEncryption || weakAccess) {
    securityStatus = "Tidak Patuh";
    securityCode = "bad";
    securityNote =
      "Enkripsi dan/atau kontrol akses belum memadai untuk melindungi data pribadi.";
  } else if (strongEncryption && strongAccess && strongAuth) {
    securityStatus = "Patuh";
    securityCode = "good";
    securityNote =
      "Enkripsi, kontrol akses, dan autentikasi sudah cukup kuat untuk melindungi data pribadi.";
  }

  results.push({
    aspect: "Keamanan Pemrosesan Data",
    status: securityStatus,
    code: securityCode,
    legalRef: "Pasal 35–39 UU PDP",
    note: securityNote,
  });

  // 4. Pemrosesan oleh pihak ketiga – Pasal 17 ayat (2), Pasal 52
  if (params.thirdParty === "yes") {
    results.push({
      aspect: "Pemrosesan oleh Pihak Ketiga",
      status: "Sebagian Patuh",
      code: "ok",
      legalRef: "Pasal 17 ayat (2), Pasal 52 UU PDP",
      note:
        "Ada pihak ketiga yang memproses data. Pastikan ada perjanjian tertulis yang mengatur peran, tanggung jawab, dan perlindungan data.",
    });
  } else {
    results.push({
      aspect: "Pemrosesan oleh Pihak Ketiga",
      status: "Patuh",
      code: "good",
      legalRef: "Pasal 17 ayat (2), Pasal 52 UU PDP",
      note:
        "Data tidak diberikan ke pihak ketiga, sehingga risiko dari luar lebih kecil.",
    });
  }

  // 5. Respons insiden & pemberitahuan – Pasal 46 ayat (1)-(2)
  if (params.incidentResponsePlan === "tested_regularly") {
    results.push({
      aspect: "Respons Insiden",
      status: "Patuh",
      code: "good",
      legalRef: "Pasal 46 ayat (1)-(2) UU PDP",
      note:
        "Ada rencana respons insiden yang didokumentasikan dan diuji secara berkala, termasuk kewajiban pemberitahuan jika terjadi kegagalan perlindungan data.",
    });
  } else if (params.incidentResponsePlan === "documented") {
    results.push({
      aspect: "Respons Insiden",
      status: "Sebagian Patuh",
      code: "ok",
      legalRef: "Pasal 46 ayat (1)-(2) UU PDP",
      note:
        "Ada rencana respons insiden, tetapi belum diuji secara rutin.",
    });
  } else {
    results.push({
      aspect: "Respons Insiden",
      status: "Tidak Patuh",
      code: "bad",
      legalRef: "Pasal 46 ayat (1)-(2) UU PDP",
      note:
        "Belum ada rencana jelas jika terjadi kebocoran data, termasuk cara memberi tahu Subjek Data Pribadi dan lembaga terkait.",
    });
  }

  return results;
}

  /**
   * Pemetaan heuristik ke fungsi NIST CSF 2.0:
   * GV (Govern), ID (Identify), PR (Protect), DE (Detect), RS (Respond), RC (Recover)
   */
  function evaluateNIST(params) {
    const results = [];

    // GOVERN (GV) – Kebijakan & tata kelola privasi
    let governLevel = "Lemah";
    let governNote =
      "Belum ada kebijakan privasi yang jelas dan konsisten diterapkan.";

    if (params.privacyPolicy === "informal" || params.purposeSpecified === "yes") {
      governLevel = "Sedang";
      governNote =
        "Ada bentuk kebijakan atau penjelasan tujuan pemrosesan, namun masih bisa dirapikan.";
    }
    if (params.privacyPolicy === "formal" && params.purposeSpecified === "yes") {
      governLevel = "Kuat";
      governNote =
        "Ada kebijakan privasi tertulis dan tujuan pemrosesan dijelaskan dengan jelas.";
    }

    results.push({
      function: "GV (Govern)",
      level: governLevel,
      note: governNote,
    });

    // IDENTIFY (ID) – Pengenalan aset & data (disederhanakan)
    results.push({
      function: "ID (Identify)",
      level: "Sedang",
      note:
        "Jenis data yang diproses sudah diidentifikasi melalui parameter input, namun pemetaan aset lebih rinci belum dimodelkan di sini.",
    });

    // PROTECT (PR) – Perlindungan (enkripsi, akses, autentikasi)
    let protectLevel = "Sedang";
    let protectNote =
      "Sebagian kontrol perlindungan sudah ada, tetapi masih bisa ditingkatkan.";

    const veryWeakProtect =
      params.encryption === "none" || params.accessControl === "none";
    const strongProtect =
      params.encryption === "both" &&
      params.accessControl === "role_based" &&
      (params.authMethod === "password_mfa" || params.authMethod === "sso");

    if (veryWeakProtect) {
      protectLevel = "Lemah";
      protectNote =
        "Enkripsi dan/atau kontrol akses masih lemah, sehingga risiko penyalahgunaan data lebih tinggi.";
    } else if (strongProtect) {
      protectLevel = "Kuat";
      protectNote =
        "Enkripsi, kontrol akses, dan autentikasi sudah tergolong kuat untuk melindungi data.";
    }

    results.push({
      function: "PR (Protect)",
      level: protectLevel,
      note: protectNote,
    });

    // DETECT (DE) – Deteksi insiden
    let detectLevel = "Lemah";
    let detectNote =
      "Belum ada mekanisme yang jelas untuk mendeteksi insiden atau aktivitas mencurigakan.";

    if (params.detectSystem === "basic") {
      detectLevel = "Sedang";
      detectNote =
        "Ada log dasar atau pemantauan sederhana, tetapi belum optimal.";
    } else if (params.detectSystem === "advanced") {
      detectLevel = "Kuat";
      detectNote =
        "Ada sistem pemantauan/pendeteksi insiden yang lebih matang (misalnya alert otomatis).";
    }

    results.push({
      function: "DE (Detect)",
      level: detectLevel,
      note: detectNote,
    });

    // RESPOND (RS) – Tanggapan insiden
    let respondLevel = "Lemah";
    let respondNote =
      "Belum ada prosedur jelas untuk merespons insiden keamanan atau kebocoran data.";

    if (params.incidentResponsePlan === "documented") {
      respondLevel = "Sedang";
      respondNote =
        "Ada prosedur respons insiden tertulis, namun belum diuji secara berkala.";
    } else if (params.incidentResponsePlan === "tested_regularly") {
      respondLevel = "Kuat";
      respondNote =
        "Prosedur respons insiden sudah didokumentasikan dan diuji secara rutin.";
    }

    results.push({
      function: "RS (Respond)",
      level: respondLevel,
      note: respondNote,
    });

    // RECOVER (RC) – Pemulihan setelah insiden
    let recoverLevel = "Sedang";
    let recoverNote =
      "Kemampuan pemulihan dianggap sedang; perlu dipastikan bahwa backup benar-benar dapat digunakan.";

    if (params.backupPolicy === "none") {
      recoverLevel = "Lemah";
      recoverNote =
        "Tidak ada backup, sehingga pemulihan setelah insiden akan sangat sulit.";
    } else if (params.backupPolicy === "tested") {
      recoverLevel = "Kuat";
      recoverNote =
        "Backup tersedia dan proses pemulihan sudah pernah diuji sehingga lebih siap saat insiden.";
    }

    results.push({
      function: "RC (Recover)",
      level: recoverLevel,
      note: recoverNote,
    });

    return results;
  }

  /**
   * Menghasilkan rekomendasi berbasis kondisi risiko & kepatuhan.
   */
  function generateRecommendations(context) {
    const { params, riskLevel, pdpResults, nistResults } = context;
    const recs = [];

    // 1. Berdasarkan level risiko
    if (riskLevel === "Tinggi") {
      recs.push(
        "Prioritaskan skenario ini sebagai risiko tinggi dan lakukan tindakan mitigasi dalam waktu dekat."
      );
    } else if (riskLevel === "Sedang") {
      recs.push(
        "Risiko berada di level sedang. Tetapkan kontrol tambahan dan lakukan pemantauan berkala."
      );
    } else {
      recs.push(
        "Risiko berada pada level rendah, namun tetap perlu dikaji ulang secara periodik."
      );
    }

    // 2. Enkripsi & akses
    if (params.encryption === "none") {
      recs.push(
        "Pertimbangkan untuk menerapkan enkripsi saat data disimpan (at rest) dan saat dikirim (in transit)."
      );
    }
    if (params.accessControl === "none") {
      recs.push(
        "Gunakan kontrol akses formal, misalnya role-based access control (RBAC) agar tidak semua orang bisa mengakses data."
      );
    }

    // 3. Autentikasi
    if (params.authMethod === "none" || params.authMethod === "password_only") {
      recs.push(
        "Pertimbangkan penggunaan autentikasi multi-faktor (MFA) agar akun pengguna dan data lebih sulit dibobol."
      );
    }

    // 4. Consent & data sensitif
    if (
      (params.dataType === "biometrik" || params.dataType === "keuangan") &&
      params.consentType !== "explicit"
    ) {
      recs.push(
        "Untuk data sensitif seperti biometrik atau keuangan, gunakan persetujuan (consent) yang eksplisit dan terpisah."
      );
    }

    // 5. Pihak ketiga
    if (params.thirdParty === "yes") {
      recs.push(
        "Pastikan ada perjanjian tertulis dengan pihak ketiga yang mengatur perlindungan data pribadi dan tanggung jawab jika terjadi insiden."
      );
    }

    // 6. Respons insiden (lihat hasil PDP & NIST)
    const incidentAspect = pdpResults.find(
      (r) => r.aspect === "Respons Insiden"
    );
    if (incidentAspect && incidentAspect.status === "Tidak Patuh") {
      recs.push(
        "Susun rencana respons insiden yang jelas, termasuk langkah-langkah notifikasi ke pengguna dan pihak berwenang jika terjadi kebocoran data."
      );
    }

    const detectFunc = nistResults.find((n) => n.function.startsWith("DE"));
    if (detectFunc && detectFunc.level === "Lemah") {
      recs.push(
        "Tambahkan mekanisme pemantauan keamanan (log yang rutin dicek, alert otomatis, dsb.) agar insiden bisa dideteksi lebih cepat."
      );
    }

    const recoverFunc = nistResults.find((n) => n.function.startsWith("RC"));
    if (recoverFunc && recoverFunc.level === "Lemah") {
      recs.push(
        "Bangun mekanisme backup dan uji proses pemulihan data agar layanan bisa pulih lebih cepat setelah insiden."
      );
    }

    const governFunc = nistResults.find((n) => n.function.startsWith("GV"));
    if (governFunc && governFunc.level === "Lemah") {
      recs.push(
        "Buat kebijakan privasi tertulis yang mudah dipahami dan pastikan seluruh tim memahami aturan pengelolaan data pribadi."
      );
    }

    return recs;
  }

  return {
    inferBaseLikelihoodImpact,
    evaluatePDP,
    evaluateNIST,
    generateRecommendations,
  };
})();
