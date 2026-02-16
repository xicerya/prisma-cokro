// app.js
// Interaksi UI untuk Dashboard Analisis Risiko Privasi

document.addEventListener("DOMContentLoaded", () => {
  // [PENJELASAN] 1. INISIALISASI VARIABEL DOM
  // Mengambil referensi elemen HTML agar bisa dikontrol lewat JavaScript.
  const form = document.getElementById("risk-form");
  const resetBtn = document.getElementById("reset-btn");
  const summaryContent = document.getElementById("summary-content");
  const matrixContainer = document.getElementById("risk-matrix");
  const pdpContainer = document.getElementById("pdp-results");
  const nistContainer = document.getElementById("nist-results");
  const recContainer = document.getElementById("recommendations");

  // [PENJELASAN] Membangun visualisasi matriks kosong saat halaman pertama kali dimuat.
  buildEmptyMatrix();

  if (!form) {
    console.error("Form dengan id 'risk-form' tidak ditemukan.");
    return;
  }

  // [PENJELASAN] 2. LOGIKA FILTER DINAMIS (DEPENDENT DROPDOWN)
  // Fitur ini mengubah isi dropdown "Nama Layanan" berdasarkan "Jenis Platform" yang dipilih.
  const platformSelect = document.getElementById("platformType");
  const serviceSelect = document.getElementById("serviceName");

  if (platformSelect && serviceSelect) {
    const optgroups = serviceSelect.querySelectorAll("optgroup");

    function filterServiceOptions() {
      const platform = (platformSelect.value || "").toLowerCase();

      // Reset: Tampilkan semua dulu, nanti yang tidak cocok akan di-hide
      optgroups.forEach((g) => { g.hidden = false; });

      // Jika belum pilih platform atau pilih "Lainnya", tampilkan semua.
      if (!platform || platform === "lainnya") return;

      optgroups.forEach((g) => {
        const label = (g.label || "").toLowerCase();
        let match = false;

        // Logika pencocokan antara Value Platform dengan Label Optgroup
        if (platform === "bank" && label.includes("bank (ojk)")) {
            match = true;
        } 
        else if (platform === "fintech" && label.includes("fintech")) {
            match = true;
        } 
        else if ((platform === "biometric" || platform === "biometrik") && label.includes("biometrik")) {
            match = true;
        }
        // [PENJELASAN KHUSUS] Menggabungkan berbagai kategori digital (Game, Travel, dll)
        // untuk menampilkan daftar layanan yang terdaftar sebagai PSE (Penyelenggara Sistem Elektronik).
        else if (
            (platform === "ecommerce" || platform === "e-commerce" ||
             platform === "travel" || 
             platform === "productivity" || 
             platform === "education_health" || 
             platform === "entertainment" ||
             platform === "game") &&
             label.includes("pse")
        ) {
            match = true;
        }

        // Sembunyikan grup yang tidak cocok
        g.hidden = !match;
      });

      // Reset pilihan agar user memilih ulang dari opsi yang relevan
      serviceSelect.value = "";
    }

    platformSelect.addEventListener("change", filterServiceOptions);
    filterServiceOptions(); // Jalankan sekali di awal
  }

  // [PENJELASAN] 3. MAIN CONTROLLER (EVENT SUBMIT)
  // Menangani proses saat tombol "Hitung Risiko" ditekan.
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Mencegah reload halaman
    
    // Langkah A: Ambil data dari form
    const params = collectParams();
    
    // Langkah B: Panggil RiskEngine untuk melakukan perhitungan
    const result = RiskEngine.analyze(params);

    // Langkah C: Tampilkan hasil ke layar (View Update)
    renderSummary(params, result);
    renderMatrix(result);
    renderPDP(result.pdpResults);
    renderNIST(result.nistResults);
    renderRecommendations(result.recommendations);

    // UX: Scroll otomatis ke bagian hasil
    document.getElementById("summary-card").scrollIntoView({ behavior: "smooth" });
  });

  // [PENJELASAN] Logika Tombol Reset
  resetBtn.addEventListener("click", () => {
    setTimeout(() => {
      buildEmptyMatrix();
      summaryContent.classList.add("placeholder");
      summaryContent.innerHTML =
        'Isi formulir di atas kemudian klik <strong>Hitung Risiko</strong> untuk melihat hasil analisis.';
      pdpContainer.classList.add("placeholder");
      pdpContainer.innerHTML =
        "Belum ada data. Jalankan analisis terlebih dahulu.";
      nistContainer.classList.add("placeholder");
      nistContainer.innerHTML =
        "Belum ada data. Jalankan analisis terlebih dahulu.";
      recContainer.classList.add("placeholder");
      recContainer.innerHTML =
        "Belum ada rekomendasi. Jalankan analisis terlebih dahulu.";
    }, 0);
  });

  // [PENJELASAN] Helper: Mengambil nilai dari semua input HTML dan menjadikannya Object JSON
  function collectParams() {
    const scenarioName = document.getElementById("scenarioName").value.trim();

    const platformType = document.getElementById("platformType").value;
    const serviceName = document.getElementById("serviceName").value;

    const dataType = document.getElementById("dataType").value;
    const processingActivity =
      document.getElementById("processingActivity").value;
    const processingPurpose = document
      .getElementById("processingPurpose")
      .value.trim();

    const encryption = document.getElementById("encryption").value;
    const accessControl = document.getElementById("accessControl").value;
    const authMethod = document.getElementById("authMethod").value;
    const consentType = document.getElementById("consentType").value;
    const privacyPolicy = document.getElementById("privacyPolicy").value;
    const incidentResponsePlan =
      document.getElementById("incidentResponsePlan").value;
    const detectSystem = document.getElementById("detectSystem").value;
    const backupPolicy = document.getElementById("backupPolicy").value;

    const thirdParty =
      (document.querySelector('input[name="thirdParty"]:checked') || {})
        .value || "no";

    const purposeSpecified =
      (document.querySelector('input[name="purposeSpecified"]:checked') || {})
        .value || "no";

    const dataCategories = [];
    document
      .querySelectorAll('input[name="legalDataCategory"]:checked')
      .forEach((el) => dataCategories.push(el.value));

    return {
      scenarioName,
      platformType,
      serviceName,
      dataType,
      processingActivity,
      processingPurpose,
      thirdParty,
      encryption,
      accessControl,
      authMethod,
      purposeSpecified,
      consentType,
      privacyPolicy,
      incidentResponsePlan,
      detectSystem,
      backupPolicy,
      dataCategories
    };
  }

  // [PENJELASAN] Render: Menampilkan Kartu Ringkasan Hasil
  function renderSummary(params, result) {
    summaryContent.classList.remove("placeholder");
    
    // Format tanggal untuk timestamp
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
    };
    const timeString = now.toLocaleDateString('id-ID', options);

    const badgeClass =
      result.riskLevel === "Tinggi"
        ? "high"
        : result.riskLevel === "Sedang"
        ? "medium"
        : "low";

    const scenarioTitle =
      params.scenarioName && params.scenarioName.length > 0
        ? params.scenarioName
        : "Skenario tanpa nama";

    // Blok info jika nilai otomatis dari sistem
    const autoBlock = result.autoInfo
      ? `<p style="margin-top:0.5rem;font-size:0.8rem;color:#9ca3af;">
            Nilai Likelihood &amp; Impact ditentukan otomatis berdasarkan rule engine:
            ${result.autoInfo.reasons.join(" ")}
         </p>`
      : "";

    // Blok info status legalitas (Override Hijau)
    const legalBlock =
      result.legalContext && result.legalContext.legalStatus
        ? `<p style="margin-top:0.5rem;font-size:0.8rem;color:#6ee7b7;">
             Legalitas: ${
               result.legalContext.legalStatus.isLegal
                 ? "LEGAL"
                 : "PERLU KEHATI-HATIAN"
             }${
             result.legalContext.legalStatus.registry
               ? " – " +
                 escapeHtml(result.legalContext.legalStatus.registry.label)
               : ""
           }.<br/>
             ${escapeHtml(
               result.legalContext.legalStatus.reason || ""
             )}
           </p>`
        : "";

    summaryContent.innerHTML = `
      <div style="border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 0.8rem; margin-bottom: 1rem;">
          <p style="margin-bottom:0.25rem; font-size: 1rem;">
            Hasil analisis untuk: <strong style="color:var(--text-main);">${escapeHtml(scenarioTitle)}</strong>
          </p>
          <p style="font-size:0.75rem; color:#9ca3af; display:flex; align-items:center; gap:0.5rem;">
            <span>Waktu Analisis:</span>
            <span style="color:var(--accent); font-weight:600;">${timeString}</span>
          </p>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <h3>Likelihood (Kemungkinan)</h3>
          <p style="font-size:1.2rem; font-weight:bold;">${result.likelihood}</p>
        </div>
        <div class="summary-item">
          <h3>Impact (Dampak)</h3>
          <p style="font-size:1.2rem; font-weight:bold;">${result.impact}</p>
        </div>
        <div class="summary-item">
          <h3>Risk Score</h3>
          <p style="font-size:1.2rem; font-weight:bold;">${result.riskScore}</p>
        </div>
        <div class="summary-item" style="display:flex; flex-direction:column; justify-content:center;">
          <h3 style="margin-bottom:0.2rem;">Level Risiko</h3>
          <div><span class="badge ${badgeClass}" style="font-size:0.9rem;">${result.riskLevel}</span></div>
        </div>
      </div>
      
      ${autoBlock}
      ${legalBlock}
    `;
  }

  // [PENJELASAN] Membuat elemen HTML untuk Grid Matriks 5x5
  function buildEmptyMatrix() {
    matrixContainer.innerHTML = "";

    matrixContainer.appendChild(createCell(" ", "label"));
    for (let l = 1; l <= 5; l++) {
      matrixContainer.appendChild(createCell(String(l), "label axis"));
    }

    for (let i = 5; i >= 1; i--) {
      matrixContainer.appendChild(createCell(String(i), "label axis"));
      for (let l = 1; l <= 5; l++) {
        const levelClass =
          i * l <= 6 ? "low" : i * l <= 15 ? "medium" : "high";
        const cell = createCell("", `matrix ${levelClass}`);
        cell.dataset.likelihood = String(l);
        cell.dataset.impact = String(i);
        matrixContainer.appendChild(cell);
      }
    }
  }

  // [PENJELASAN] Memberikan efek highlight (kedip) pada sel matriks yang sesuai hasil
  function renderMatrix(result) {
    buildEmptyMatrix();
    const cells = matrixContainer.querySelectorAll(".matrix");
    cells.forEach((cell) => {
      const l = parseInt(cell.dataset.likelihood, 10);
      const i = parseInt(cell.dataset.impact, 10);
      if (l === result.likelihood && i === result.impact) {
        cell.classList.add("active");
        // Tambahkan efek kedip (opsional)
        cell.style.animation = "none";
        cell.offsetHeight; /* trigger reflow */
        cell.style.animation = "pulse 1.5s infinite";
      }
    });
  }

  // [PENJELASAN] Render Tabel Kepatuhan UU PDP
  function renderPDP(pdpResults) {
    pdpContainer.classList.remove("placeholder");
    if (!pdpResults || pdpResults.length === 0) {
      pdpContainer.textContent = "Tidak ada hasil evaluasi.";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Aspek</th>
            <th>Status</th>
            <th>Pasal/Ayat Terkait</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const r of pdpResults) {
      html += `
        <tr>
          <td>${escapeHtml(r.aspect)}</td>
          <td>
            <span class="status-pill ${r.code}">
              ${escapeHtml(r.status)}
            </span>
          </td>
          <td>${escapeHtml(r.legalRef || "-")}</td>
          <td>${escapeHtml(r.note)}</td>
        </tr>
      `;
    }

    html += "</tbody></table>";
    pdpContainer.innerHTML = html;
  }

  // [PENJELASAN] Render Tabel Profil NIST CSF
  function renderNIST(nistResults) {
    nistContainer.classList.remove("placeholder");
    if (!nistResults || nistResults.length === 0) {
      nistContainer.textContent = "Tidak ada hasil pemetaan.";
      return;
    }

    let html =
      '<table><thead><tr><th>Fungsi</th><th>Level</th><th>Keterangan</th></tr></thead><tbody>';
    for (const r of nistResults) {
      const levelCode =
        r.level === "Kuat" || r.level === "Sedang–Kuat"
          ? "good"
          : r.level === "Sedang"
          ? "ok"
          : "bad";
      html += `
        <tr>
          <td>${escapeHtml(r.function)}</td>
          <td><span class="status-pill ${levelCode}">${escapeHtml(
        r.level
      )}</span></td>
          <td>${escapeHtml(r.note)}</td>
        </tr>
      `;
    }
    html += "</tbody></table>";
    nistContainer.innerHTML = html;
  }

  function renderRecommendations(recs) {
    recContainer.classList.remove("placeholder");
    if (!recs || recs.length === 0) {
      recContainer.textContent =
        "Tidak ada rekomendasi khusus untuk skenario ini.";
      return;
    }

    let html = '<ul class="recommendation-list">';
    for (const r of recs) {
      html += `<li>${escapeHtml(r)}</li>`;
    }
    html += "</ul>";
    recContainer.innerHTML = html;
  }

  function createCell(text, extraClass) {
    const div = document.createElement("div");
    div.className = "matrix-cell " + (extraClass || "");
    if (text) {
      div.textContent = text;
    }
    return div;
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // [PENJELASAN] 4. FITUR RIWAYAT / HISTORY (LOCAL STORAGE)
  // Menyimpan data hasil analisis ke memori browser agar tidak hilang saat di-refresh.
  const STORAGE_KEY = "prisma_cokro_history_v1";
  const btnSave = document.getElementById("btn-save");
  const btnHistory = document.getElementById("btn-history");
  const historyPanel = document.getElementById("history-panel");
  const historyList = document.getElementById("history-list");
  const btnCloseHistory = document.getElementById("btn-close-history");
  const btnClearHistory = document.getElementById("btn-clear-history");

  function getStoredHistory() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    
    try {
      const decryptedString = atob(rawData); // Decode Base64 sederhana
      return JSON.parse(decryptedString);
    } catch (e) {
      console.error("Gagal mendekripsi data lokal:", e);
      return [];
    }
  }

  function saveStoredHistory(dataArray) {
    try {
      const jsonString = JSON.stringify(dataArray);
      const encryptedData = btoa(jsonString); // Encode Base64 sederhana
      localStorage.setItem(STORAGE_KEY, encryptedData);
      return true;
    } catch (e) {
      console.error("Gagal menyimpan/mengenkripsi data:", e);
      return false;
    }
  }

  function removeHistoryItem(idToRemove) {
    const current = getStoredHistory();
    const updated = current.filter(item => item.id !== idToRemove);
    saveStoredHistory(updated);
    renderHistory();
  }

  // [PENJELASAN] Event Listener: Tombol Simpan
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const scenarioName = document.getElementById("scenarioName").value;
      if (!scenarioName) {
        alert("Harap isi 'Nama Skenario' terlebih dahulu sebelum menyimpan.");
        return;
      }

      const params = collectParams();
      
      let savedScore = 0;
      let savedLevel = "Draft"; 

      if (params.platformType && params.dataType) {
        const result = RiskEngine.analyze(params);
        savedScore = result.riskScore;
        savedLevel = result.riskLevel;
      }

      const nowSave = new Date();
      const saveTime = nowSave.toLocaleDateString('id-ID', {
         day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
      });

      const newEntry = {
        id: Date.now(),
        timestamp: saveTime,
        name: params.scenarioName,
        score: savedScore,
        level: savedLevel, 
        formData: params 
      };

      const history = getStoredHistory();
      history.unshift(newEntry); 
      if (history.length > 20) history.pop(); // Batasi max 20 item
      saveStoredHistory(history);
      
      const originalText = btnSave.innerText;
      btnSave.innerText = "✔ Tersimpan!";
      setTimeout(() => btnSave.innerText = originalText, 2000);
      
      if (historyPanel.style.display !== "none") {
        renderHistory();
      }
    });
  }

  // [PENJELASAN] Render: Daftar Riwayat di Sidebar/Panel
  function renderHistory() {
    const history = getStoredHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = `<div style="text-align:center; color:#666; font-size:0.8rem; padding:1rem;">Belum ada riwayat tersimpan.</div>`;
      return;
    }

    history.forEach((item) => {
      // Container Item
      const el = document.createElement("div");
      el.style.cssText = "background:rgba(255,255,255,0.05); padding:0.8rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; transition:background 0.2s;";
      el.onmouseover = () => el.style.background = "rgba(34, 211, 238, 0.1)";
      el.onmouseout = () => el.style.background = "rgba(255,255,255,0.05)";
      
      let badgeColor = "#9ca3af"; 
      let badgeText = item.level;
      let scoreText = `Score: ${item.score}`;

      if (item.level === "Draft") {
        badgeColor = "rgba(255, 255, 255, 0.15)";
        badgeText = "DRAFT"; 
        scoreText = "-"; 
      } else if (item.level === "Tinggi") {
        badgeColor = "#ef4444";
      } else if (item.level === "Sedang") {
        badgeColor = "#eab308";
      } else if (item.level === "Rendah") {
        badgeColor = "#22c55e";
      }

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;">
            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${escapeHtml(item.name)}</div>
            <div style="font-size:0.7rem; color:#9ca3af;">${item.timestamp}</div>
          </div>
          
          <div style="text-align:right; display:flex; align-items:center; gap:8px;">
             <div>
               <span style="background:${badgeColor}; color:${item.level === 'Draft' ? '#ccc' : '#000'}; border:${item.level === 'Draft' ? '1px solid #555' : 'none'}; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:bold;">
                  ${badgeText}
               </span>
               <div style="font-size:0.7rem; color:#9ca3af; margin-top:2px;">${scoreText}</div>
             </div>

             <button class="btn-delete-item" title="Hapus item ini">
                X
             </button>
          </div>
        </div>
      `;

      // Event Listener: Klik Item -> Load Data
      el.addEventListener("click", () => {
        loadFormData(item.formData);
        historyPanel.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
        if(item.level === "Draft") {
            alert(`Draf "${item.name}" dimuat.`);
        } else {
            alert(`Skenario "${item.name}" dimuat kembali.`);
        }
      });

      // Event Listener: Tombol Hapus per Item
      const deleteBtn = el.querySelector(".btn-delete-item");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
           e.stopPropagation(); // Mencegah klik tembus ke parent (load data)
           
           if(confirm(`Yakin ingin menghapus riwayat "${item.name}"?`)) {
             removeHistoryItem(item.id);
           }
        });
      }

      historyList.appendChild(el);
    });
  }

  // [PENJELASAN] Fungsi Restore: Mengisi ulang form dari data JSON
  function loadFormData(data) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("scenarioName", data.scenarioName);
    setVal("platformType", data.platformType);
    setVal("serviceName", data.serviceName);
    setVal("dataType", data.dataType);
    setVal("processingActivity", data.processingActivity);
    setVal("processingPurpose", data.processingPurpose);
    setVal("encryption", data.encryption);
    setVal("accessControl", data.accessControl);
    setVal("authMethod", data.authMethod);
    setVal("consentType", data.consentType);
    setVal("privacyPolicy", data.privacyPolicy);
    setVal("incidentResponsePlan", data.incidentResponsePlan);
    setVal("detectSystem", data.detectSystem);
    setVal("backupPolicy", data.backupPolicy);

    const setRadio = (name, val) => {
      const radios = document.querySelectorAll(`input[name="${name}"]`);
      radios.forEach(r => r.checked = (r.value === val));
    };
    setRadio("thirdParty", data.thirdParty);
    setRadio("purposeSpecified", data.purposeSpecified);


    document.querySelectorAll(`input[name="legalDataCategory"]`).forEach(cb => cb.checked = false);

    if (data.dataCategories) {
        data.dataCategories.forEach(val => {
            const cb = document.querySelector(`input[name="legalDataCategory"][value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }
  }


  if (btnHistory) {
    btnHistory.addEventListener("click", () => {
      renderHistory();
      historyPanel.style.display = "block";
      historyPanel.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (btnCloseHistory) {
    btnCloseHistory.addEventListener("click", () => {
      historyPanel.style.display = "none";
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      if (confirm("Yakin ingin menghapus SELURUH riwayat analisis?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
      }
    });
  }

});