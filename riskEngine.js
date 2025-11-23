// riskEngine.js
// Mesin analisis risiko yang memakai rules.js

const RiskEngine = (() => {
  function categorizeRisk(score) {
    if (score <= 6) return "Rendah";
    if (score <= 15) return "Sedang";
    return "Tinggi";
  }

  function analyze(params) {
    // Selalu pakai rule engine
    const autoInfoRaw = RiskRules.inferBaseLikelihoodImpact(params) || {};

    const autoInfo = {
      likelihood:
        typeof autoInfoRaw.likelihood === "number" ? autoInfoRaw.likelihood : 3,
      impact:
        typeof autoInfoRaw.impact === "number" ? autoInfoRaw.impact : 3,
      reasons: Array.isArray(autoInfoRaw.reasons)
        ? autoInfoRaw.reasons
        : ["Menggunakan nilai default."],
    };

    let likelihood = autoInfo.likelihood;
    let impact = autoInfo.impact;

    // clamp 1–5
    likelihood = Math.max(1, Math.min(5, likelihood));
    impact = Math.max(1, Math.min(5, impact));

    const riskScore = likelihood * impact;
    const riskLevel = categorizeRisk(riskScore);

    const pdpResults = RiskRules.evaluatePDP(params);
    const nistResults = RiskRules.evaluateNIST(params);

    const recommendations = RiskRules.generateRecommendations({
      params,
      riskScore,
      riskLevel,
      pdpResults,
      nistResults,
    });

    return {
      likelihood,
      impact,
      riskScore,
      riskLevel,
      autoInfo,
      pdpResults,
      nistResults,
      recommendations,
    };
  }

  return {
    analyze,
  };
})();
