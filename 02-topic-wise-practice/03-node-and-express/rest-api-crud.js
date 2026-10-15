// REST API for a college canteen menu: GET, POST, PUT, PATCH, DELETE on an in-memory list
const express = require("express");
const app = express();
const PORT = 5102;
app.use(express.json());

let menu = [
  { id: 1, name: "Masala Dosa", category: "Tiffin", price: 40, available: true },
  { id: 2, name: "Veg Biryani", category: "Meals", price: 90, available: true },
  { id: 3, name: "Samosa", category: "Snacks", price: 15, available: false },
  { id: 4, name: "Filter Coffee", category: "Beverages", price: 20, available: true }
];
let nextId = 5;
const CATEGORIES = ["Tiffin", "Meals", "Snacks", "Beverages"];

function checkItem(body, partial = false) {
  const errors = [];
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim() === "") errors.push("name is required");
  }
  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) errors.push(`category must be one of ${CATEGORIES.join(", ")}`);
  }
  if (!partial || body.price !== undefined) {
    if (typeof body.price !== "number" || body.price <= 0) errors.push("price must be a positive number");
  }
  return errors;
}

const findItem = (req, res, next) => {
  req.item = menu.find(m => m.id === Number(req.params.id));
  if (!req.item) return res.status(404).json({ error: "Menu item not found" });
  next();
};

// GET /api/menu?category=Snacks&available=true&maxPrice=50
app.get("/api/menu", (req, res) => {
  let result = menu;
  if (req.query.category) result = result.filter(m => m.category === req.query.category);
  if (req.query.available) result = result.filter(m => m.available === (req.query.available === "true"));
  if (req.query.maxPrice) result = result.filter(m => m.price <= Number(req.query.maxPrice));
  res.json({ count: result.length, items: result });
});

app.get("/api/menu/:id", findItem, (req, res) => res.json(req.item));

app.post("/api/menu", (req, res) => {
  const errors = checkItem(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const item = { id: nextId++, name: req.body.name.trim(), category: req.body.category, price: req.body.price, available: req.body.available ?? true };
  menu.push(item);
  res.status(201).location(`/api/menu/${item.id}`).json(item);
});

// PUT replaces the whole item
app.put("/api/menu/:id", findItem, (req, res) => {
  const errors = checkItem(req.body);
  if (errors.length) return res.status(400).json({ errors });
  Object.assign(req.item, { name: req.body.name.trim(), category: req.body.category, price: req.body.price, available: req.body.available ?? true });
  res.json(req.item);
});

// PATCH changes only the fields that are sent
app.patch("/api/menu/:id", findItem, (req, res) => {
  const errors = checkItem(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  ["name", "category", "price", "available"].forEach(k => {
    if (req.body[k] !== undefined) req.item[k] = req.body[k];
  });
  res.json(req.item);
});

app.delete("/api/menu/:id", findItem, (req, res) => {
  menu = menu.filter(m => m !== req.item);
  res.status(204).end();
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Canteen API at http://localhost:${PORT}/api/menu`));
}
module.exports = app;
