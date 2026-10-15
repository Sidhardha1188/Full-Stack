// Node.js http module: serving a file, a JSON API, and reading a POST body without Express
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5100;
const feedback = []; // stored in memory

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1e5) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);

  // GET / -> send public/index.html
  if (req.method === "GET" && req.url === "/") {
    fs.readFile(path.join(__dirname, "public", "index.html"), (err, data) => {
      if (err) return sendJSON(res, 500, { error: "Could not read file" });
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // GET /api/info -> details about the running process
  if (req.method === "GET" && req.url === "/api/info") {
    return sendJSON(res, 200, {
      node: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
  }

  // GET /api/feedback -> list stored feedback
  if (req.method === "GET" && req.url === "/api/feedback") {
    return sendJSON(res, 200, feedback);
  }

  // POST /api/feedback -> read the JSON body by hand
  if (req.method === "POST" && req.url === "/api/feedback") {
    try {
      const data = JSON.parse(await readBody(req));
      if (!data.name || !data.message) return sendJSON(res, 400, { error: "name and message are required" });
      const item = { id: feedback.length + 1, name: data.name, message: data.message, at: new Date().toISOString() };
      feedback.push(item);
      return sendJSON(res, 201, item);
    } catch (err) {
      return sendJSON(res, 400, { error: "Body must be valid JSON" });
    }
  }

  sendJSON(res, 404, { error: `Cannot ${req.method} ${req.url}` });
});

server.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
