// Express middleware: logging, static files, rate limiting, validation, maintenance mode, error handling
const express = require("express");
const path = require("path");

const app = express();
const PORT = 5101;
let maintenance = false;

// 1. Logger with a request counter
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`#${requestCount} ${req.method} ${req.url}`);
  next();
});

// 2. Built-in middleware
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));

// 3. Maintenance mode: blocks every route except /admin while switched on
app.use((req, res, next) => {
  if (maintenance && !req.path.startsWith("/admin")) {
    return res.status(503).json({ error: "Site under maintenance, try again later" });
  }
  next();
});

// 4. Simple rate limiter: at most 5 requests per 10 seconds per IP on /api
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter(t => now - t < 10000);
  recent.push(now);
  hits.set(req.ip, recent);
  res.set("X-RateLimit-Remaining", Math.max(0, 5 - recent.length));
  if (recent.length > 5) return res.status(429).json({ error: "Too many requests, wait 10 seconds" });
  next();
}

// 5. Validation middleware factory: checks that the listed body fields exist
const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === "");
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });
  next();
};

app.get("/", (req, res) => res.send("Middleware demo. Try /api/time, /static/index.html, POST /api/register, /admin/maintenance/on"));

app.get("/api/time", rateLimit, (req, res) => res.json({ time: new Date().toLocaleTimeString() }));

app.post("/api/register", rateLimit, requireFields("name", "email"), (req, res) => {
  res.status(201).json({ message: `Registered ${req.body.name}` });
});

app.get("/admin/maintenance/:state", (req, res) => {
  maintenance = req.params.state === "on";
  res.json({ maintenance });
});

app.get("/api/crash", (req, res, next) => {
  next(new Error("Deliberate error to test the error handler"));
});

// 6. 404 and error handlers
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Middleware demo at http://localhost:${PORT}`));
}
module.exports = app;
