const API_BASE = "https://analyst-website.onrender.com";

/* ===================== ELEMENTS ===================== */
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

/* ===================== CONSTANTS ===================== */
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

/* ===================== HISTORY ===================== */
function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}

function saveToHistory(snapshot) {
  const history = getHistory();
  history.unshift({
    time: new Date().toLocaleString(),
    snapshot,
  });
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const history = getHistory();
  list.innerHTML = "";

  if (!history.length) {
    list.innerHTML = `<div class="text-slate-500 text-xs">No history yet</div>`;
    return;
  }

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "flex justify-between items-center bg-slate-800/60 rounded px-3 py-2 cursor-pointer hover:bg-slate-700";
    div.innerHTML = `
      <div>
        <div class="font-medium">${item.snapshot.asset} • ${item.snapshot.timeframe}</div>
        <div class="text-xs text-slate-400">${item.time}</div>
      </div>
      <div class="text-xs">${Math.round(item.snapshot.confidence * 100)}%</div>
    `;
    div.onclick = () => restoreAnalysis(item.snapshot);
    list.appendChild(div);
  });
}

/* ===================== UI HELPERS ===================== */
function setConfidence(conf) {
  const safe = Math.min(Math.max(conf, 0), 1);
  const pct = Math.round(safe * 100);
  confidenceText.textContent = pct + "%";
  confidenceBar.style.width = pct + "%";
  confidenceBar.className =
    "h-2 rounded-full " +
    (pct > 70 ? "bg-emerald-500" : pct > 45 ? "bg-amber-500" : "bg-red-500");
}

function renderSRLevels(supports = [], resistances = []) {
  const sr = document.getElementById("srLevels");
  sr.innerHTML = "";

  resistances.forEach((r) => {
    sr.innerHTML += `
      <div class="flex justify-between bg-red-900/40 border border-red-700 rounded px-2 py-1">
        <span class="text-red-400">Resistance</span>
        <span>${r.level.toFixed(2)}</span>
      </div>`;
  });

  supports.forEach((s) => {
    sr.innerHTML += `
      <div class="flex justify-between bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1">
        <span class="text-emerald-400">Support</span>
        <span>${s.level.toFixed(2)}</span>
      </div>`;
  });
}

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

  document.getElementById("nearestSupport").textContent =
    nearestSupport?.toFixed(2) || "—";
  document.getElementById("nearestResistance").textContent =
    nearestResistance?.toFixed(2) || "—";

  document.getElementById("nearestLevels").classList.remove("hidden");
}

/* ===================== CORE RENDER ===================== */
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

  scenariosEl.innerHTML = "";
  d.scenarios.forEach((s) => {
    const div = document.createElement("div");
    div.className = "bg-slate-800 rounded-lg p-3 text-sm";
    div.textContent = s;
    scenariosEl.appendChild(div);
  });

  result.classList.remove("hidden");
}

/* ===================== ANALYZE ===================== */
analyzeBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Upload an image");

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: fd, // ✅ FIXED
    });

    const d = await res.json();
    saveToHistory(d);
    restoreAnalysis(d);
    renderHistory();
  } catch {
    alert("Analysis failed");
  } finally {
    analyzeBtn.textContent = "Analyze Market";
    analyzeBtn.disabled = false;
  }
});

/* ===================== PREVIEW ===================== */
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
});

document.addEventListener("DOMContentLoaded", renderHistory);
