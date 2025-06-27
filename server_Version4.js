const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// ----------------- SETTINGS -----------------
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = 'aviator_history.json';

// Valid Access IDs (valid for 7 days from first use)
const VALID_IDS = [
  "PMT-7KY-AG", "PMT-6AG-55", "PMT-FUF-54",
  "PMT-642-FT", "PMT-357-RY", "PMT-A96-PP"
];

// Where to track AccessID activation dates (in memory for demo; use DB for production)
const accessIdTracking = {};

// ----------------- APP -----------------
const app = express();
app.use(cors());
app.use(express.json());

// Load round history
let history = [];
function loadHistory() {
  try {
    const json = fs.readFileSync(path.join(__dirname, HISTORY_FILE), 'utf8');
    history = JSON.parse(json);
  } catch (err) {
    console.error('Could not load aviator_history.json:', err);
    history = [];
  }
}
loadHistory();

// Helper: validate AccessID and check expiration
function checkAccessId(accessId) {
  if (!VALID_IDS.includes(accessId)) return { valid: false, reason: "Invalid AccessID" };
  let activation = accessIdTracking[accessId];
  const now = Date.now();
  if (!activation) {
    // First use, activate now
    accessIdTracking[accessId] = now;
    activation = now;
  }
  // Check if expired (7 days)
  const age = now - activation;
  if (age > 7 * 24 * 3600 * 1000) return { valid: false, reason: "AccessID expired" };
  const expiresAt = activation + 7 * 24 * 3600 * 1000;
  return { valid: true, activation, expiresAt };
}

// Helper: generate accurate signal from round history (simulate realistic prediction)
function generateSignal() {
  // Use last 40 rounds
  const N = Math.min(40, history.length);
  const recent = history.slice(-N);

  // Strategy: Favor recent highs, but never repeat a very low (e.g., <1.20) immediately
  const last = recent[recent.length - 1];
  let candidates = recent.filter(r => r.crash > 1.20 && r.crash < 25);

  // If last round was very high (>10), favor lower in next
  if (last.crash > 10) {
    candidates = recent.filter(r => r.crash < 2.5);
  }
  // If last round was very low (<1.20), favor a bounce (higher pick)
  if (last.crash < 1.20) {
    candidates = recent.filter(r => r.crash > 2.1 && r.crash < 12);
  }

  // If not enough candidates, fallback to all except last
  if (candidates.length < 3) {
    candidates = recent.slice(0, recent.length - 1);
  }

  // Pick a random candidate, weighted toward the last 10 results
  let idx;
  if (Math.random() < 0.7) {
    // 70% chance: from last 10
    const last10 = candidates.slice(-10);
    idx = Math.floor(Math.random() * last10.length);
    return last10[idx].crash.toFixed(2) + "x";
  } else {
    idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx].crash.toFixed(2) + "x";
  }
}

// API: Validate AccessID and return a signal
app.post('/api/signal', (req, res) => {
  const { accessId } = req.body;
  if (!accessId) return res.status(400).json({ error: "AccessID required" });

  const check = checkAccessId(accessId);
  if (!check.valid) return res.status(403).json({ error: check.reason });

  // Return signal
  const signal = generateSignal();
  res.json({
    signal,
    jetLogo: "🛩️", // Or send SVG if you want
    server: "Server Connected - PMT services",
    expiresAt: new Date(check.expiresAt).toISOString()
  });
});

// API: Check AccessID validity
app.post('/api/validate', (req, res) => {
  const { accessId } = req.body;
  if (!accessId) return res.status(400).json({ error: "AccessID required" });
  const check = checkAccessId(accessId);
  if (!check.valid) return res.status(403).json({ error: check.reason });
  res.json({ valid: true, expiresAt: new Date(check.expiresAt).toISOString() });
});

// Refresh history endpoint (in case you update the file)
app.post('/api/refresh-history', (req, res) => {
  loadHistory();
  res.json({ status: "ok", loaded: history.length });
});

// Serve static frontend (optional)
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Aviator Predictor backend running at http://localhost:${PORT}`);
});