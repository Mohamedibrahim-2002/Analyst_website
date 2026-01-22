const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const previewImg = preview.querySelector("img");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");

const assetBadge = document.getElementById("assetBadge");
const tfBadge = document.getElementById("tfBadge");
const trendBadge = document.getElementById("trendBadge");
const riskBadge = document.getElementById("riskBadge");

const confidenceText = document.getElementById("confidenceText");
const confidenceBar = document.getElementById("confidenceBar");

const structureEl = document.getElementById("structure");
const phaseEl = document.getElementById("phase");
const scenariosEl = document.getElementById("scenarios");

const riskColors = {
  Low: "bg-emerald-600",
  Medium: "bg-amber-500",
  High: "bg-red-600",
};

const trendColors = {
  Bullish: "bg-emerald-600",
  Bearish: "bg-red-600",
  Neutral: "bg-slate-500",
};

const HISTORY_KEY = "market_analysis_history";
const MAX_HISTORY = 5;

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}

function saveToHistory(data) {
  const history = getHistory();

  history.unshift({
    time: new Date().toLocaleString(),
    asset: data.asset,
    timeframe: data.timeframe,
    trend: data.trend,
    risk: data.risk,
    confidence: data.confidence,
    snapshot: data,
  });

  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  const history = getHistory();

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = `<div class="text-slate-500 text-xs">No history yet</div>`;
    return;
  }

  history.forEach((item, index) => {
    const div = document.createElement("div");
    div.className =
      "flex justify-between items-center bg-slate-800/60 rounded px-3 py-2 cursor-pointer hover:bg-slate-700";

    div.innerHTML = `
      <div>
        <div class="font-medium">${item.asset} • ${item.timeframe}</div>
        <div class="text-xs text-slate-400">${item.time}</div>
      </div>
      <div class="text-xs">
        ${Math.round(item.confidence * 100)}%
      </div>
    `;

    div.onclick = () => restoreAnalysis(item.snapshot);
    historyList.appendChild(div);
  });
}

function restoreAnalysis(d) {
  assetBadge.textContent = d.asset;
  tfBadge.textContent = d.timeframe;

  trendBadge.textContent = d.trend;
  trendBadge.className =
    "px-3 py-1 rounded-full " + (trendColors[d.trend] || "bg-slate-600");

  riskBadge.textContent = "Risk: " + d.risk;
  riskBadge.className =
    "px-3 py-1 rounded-full font-medium " +
    (riskColors[d.risk] || "bg-slate-600");

  structureEl.textContent = d.structure;
  phaseEl.textContent = d.market_phase;

  setConfidence(d.confidence);

  renderSRLevels(d.support_zones, d.resistance_zones);
  highlightNearestLevels(d.current_price, d.support_zones, d.resistance_zones);

  priceProximityAlert(
    d.current_price,
    d.support_zones?.[0]?.level,
    d.resistance_zones?.[0]?.level,
  );

  renderRiskHeat(d.risk, d.confidence);
  explainMarketPhase(d.market_phase, d.trend);

  result.classList.remove("hidden");
}

async function exportAsImage() {
  const target = document.getElementById("result");

  const canvas = await html2canvas(target, {
    backgroundColor: "#020617",
    scale: 2,
  });

  const link = document.createElement("a");
  link.download = "market-analysis.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

document
  .getElementById("exportImageBtn")
  .addEventListener("click", exportAsImage);

async function exportAsPDF() {
  const target = document.getElementById("result");

  const canvas = await html2canvas(target, {
    backgroundColor: "#020617",
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  pdf.save("market-analysis.pdf");
}

document.getElementById("exportPdfBtn").addEventListener("click", exportAsPDF);

function highlightNearestLevels(price, supports = [], resistances = []) {
  if (!price) return;

  const nearestSupport = supports
    .map((z) => z.level)
    .filter((l) => l <= price)
    .sort((a, b) => price - a - (price - b))[0];

  const nearestResistance = resistances
    .map((z) => z.level)
    .filter((l) => l >= price)
    .sort((a, b) => a - b)[0];

  document.getElementById("nearestSupport").textContent = nearestSupport
    ? nearestSupport.toFixed(2)
    : "—";

  document.getElementById("nearestResistance").textContent = nearestResistance
    ? nearestResistance.toFixed(2)
    : "—";

  document.getElementById("nearestLevels").classList.remove("hidden");
}
function priceProximityAlert(price, support, resistance) {
  if (!price) return;

  const alertBox = document.getElementById("priceAlert");

  const supportDist = support ? ((price - support) / price) * 100 : null;
  const resistanceDist = resistance
    ? ((resistance - price) / price) * 100
    : null;

  let message = "";
  let classes = "";

  if (supportDist !== null && supportDist < 1.2) {
    message = "🟢 Price near SUPPORT — Bounce possible";
    classes = "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30";
  } else if (resistanceDist !== null && resistanceDist < 1.2) {
    message = "🔴 Price near RESISTANCE — Rejection risk";
    classes = "bg-red-600/20 text-red-400 border border-red-500/30";
  } else {
    message = "⚪ Price in neutral zone";
    classes = "bg-slate-600/20 text-slate-300 border border-slate-500/30";
  }

  alertBox.textContent = message;
  alertBox.className = `mt-4 text-sm px-4 py-2 rounded-lg font-medium ${classes}`;
  alertBox.classList.remove("hidden");
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  previewImg.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
});

function setConfidence(conf) {
  const pct = Math.round(conf * 100);
  confidenceText.textContent = pct + "%";

  confidenceBar.style.width = pct + "%";
  confidenceBar.className =
    "h-2 rounded-full " +
    (pct > 70 ? "bg-emerald-500" : pct > 45 ? "bg-amber-500" : "bg-red-500");
}
function renderRiskHeat(risk, confidence) {
  const box = document.getElementById("riskHeat");

  let text = "";
  let classes = "";

  if (risk === "High") {
    text = "🔥 HIGH RISK ZONE — Patience Required";
    classes =
      "bg-red-600/20 text-red-400 border border-red-500/40 animate-pulse";
  } else if (risk === "Medium") {
    text = "⚠️ MEDIUM RISK — Be Selective";
    classes = "bg-amber-500/20 text-amber-400 border border-amber-400/40";
  } else {
    text = "✅ LOW RISK — Conditions Favorable";
    classes = "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40";
  }

  // Extra caution if confidence is low
  if (confidence < 0.45) {
    text += " (Low Confidence)";
  }

  box.textContent = text;
  box.className = `mt-4 rounded-xl p-4 text-center font-semibold text-sm ${classes}`;
  box.classList.remove("hidden");
}

function explainMarketPhase(phase, trend) {
  const box = document.getElementById("phaseExplain");

  let text = "";

  switch (phase) {
    case "Accumulation":
      text =
        "📦 Accumulation phase detected. Price is moving sideways with low momentum. Smart money may be building positions, but direction is not yet confirmed.";
      break;

    case "Expansion":
      text = `🚀 Expansion phase detected. Momentum is strong and price is moving decisively ${
        trend === "Bullish" ? "upward" : "downward"
      }. Continuation is favored while structure remains intact.`;
      break;

    case "Distribution":
      text =
        "⚠️ Distribution phase detected. Trend is losing strength and volatility may increase. Watch for potential trend exhaustion.";
      break;

    case "Reversal":
      text =
        "🔄 Reversal phase detected. Market structure is shifting and prior trend may no longer be valid. Caution is advised.";
      break;

    default:
      text =
        "ℹ️ Market phase is developing. Conditions are still forming and clarity may improve with more price action.";
  }

  box.textContent = text;
  box.className =
    "mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm";
  box.classList.remove("hidden");
}

analyzeBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Upload an image");

  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("https://analyst-website.onrender.com", {
      method: "POST",
      body: fd,
    });
    const d = await res.json();

    assetBadge.textContent = d.asset;
    tfBadge.textContent = d.timeframe;

    trendBadge.textContent = d.trend;
    trendBadge.className =
      "px-3 py-1 rounded-full " + (trendColors[d.trend] || "bg-slate-600");

    riskBadge.textContent = "Risk: " + d.risk;
    riskBadge.className =
      "px-3 py-1 rounded-full font-medium " +
      (riskColors[d.risk] || "bg-slate-600");

    structureEl.textContent = d.structure;
    phaseEl.textContent = d.market_phase;

    setConfidence(d.confidence);

    scenariosEl.innerHTML = "";
    (d.scenarios || []).forEach((s) => {
      const card = document.createElement("div");
      card.className = "bg-slate-800 rounded-lg p-3 text-sm";
      card.textContent = s;
      scenariosEl.appendChild(card);
    });

    renderSRLevels(d.support_zones, d.resistance_zones);

    highlightNearestLevels(
      d.current_price,
      d.support_zones,
      d.resistance_zones,
    );
    priceProximityAlert(
      d.current_price,
      document.getElementById("nearestSupport").textContent !== "—"
        ? parseFloat(document.getElementById("nearestSupport").textContent)
        : null,
      document.getElementById("nearestResistance").textContent !== "—"
        ? parseFloat(document.getElementById("nearestResistance").textContent)
        : null,
    );
    renderRiskHeat(d.risk, d.confidence);
    explainMarketPhase(d.market_phase, d.trend);
    document.getElementById("exportImageBtn").classList.remove("hidden");
    document.getElementById("exportPdfBtn").classList.remove("hidden");
    saveToHistory(d);
    renderHistory();

    result.classList.remove("hidden");
  } catch (err) {
    alert("Analysis failed");
  } finally {
    analyzeBtn.textContent = "Analyze Market";
    analyzeBtn.disabled = false;
  }
});
function renderSRLevels(supports = [], resistances = []) {
  const sr = document.getElementById("srLevels");
  sr.innerHTML = "";

  resistances
    .sort((a, b) => b.level - a.level)
    .forEach((r) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between bg-red-900/40 border border-red-700 rounded px-2 py-1";
      div.innerHTML = `
        <span class="text-red-400">Resistance</span>
        <span>${r.level.toFixed(2)}</span>
      `;
      sr.appendChild(div);
    });

  supports
    .sort((a, b) => b.level - a.level)
    .forEach((s) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1";
      div.innerHTML = `
        <span class="text-emerald-400">Support</span>
        <span>${s.level.toFixed(2)}</span>
      `;
      sr.appendChild(div);
    });
}
document.addEventListener("DOMContentLoaded", renderHistory);
