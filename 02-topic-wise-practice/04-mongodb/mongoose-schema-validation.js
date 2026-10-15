// Mongoose validation on a product catalogue: nested objects, arrays of sub-documents,
// conditional "required", async validator, pre-save hook, virtuals and instance/static methods.
const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fsdPracticeNS";

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  stars: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger }
}, { _id: false });

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, uppercase: true, match: /^[A-Z]{3}-\d{4}$/ },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  price: {
    mrp: { type: Number, required: true, min: 1 },
    selling: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) { return v <= this.price.mrp; },
        message: "Selling price ({VALUE}) cannot be more than MRP"
      }
    }
  },
  onSale: { type: Boolean, default: false },
  saleEndsOn: { type: Date, required: function () { return this.onSale; } }, // only required when onSale is true
  tags: { type: [String], set: tags => [...new Set(tags.map(t => t.toLowerCase()))] },
  reviews: [reviewSchema],
  slug: String
});

// Async validator: pretend to check the name against a banned-word list
productSchema.path("name").validate({
  validator: async v => !/free|fake/i.test(v),
  message: "Name contains a word that is not allowed"
});

// pre-save hook builds a URL slug from the name
productSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  next();
});

productSchema.virtual("discountPercent").get(function () {
  return Math.round(((this.price.mrp - this.price.selling) / this.price.mrp) * 100);
});
productSchema.methods.averageStars = function () {
  if (!this.reviews.length) return null;
  return +(this.reviews.reduce((s, r) => s + r.stars, 0) / this.reviews.length).toFixed(1);
};
productSchema.statics.findCheaperThan = function (amount) {
  return this.find({ "price.selling": { $lt: amount } }).select("name price.selling -_id");
};

const Product = mongoose.model("Product", productSchema);

async function attempt(label, data) {
  try {
    const p = await new Product(data).save();
    console.log(`OK    ${label}: ${p.name} | slug=${p.slug} | ${p.discountPercent}% off | stars=${p.averageStars()}`);
  } catch (err) {
    const msg = err.errors ? Object.values(err.errors).map(e => e.message).join("; ") : err.code === 11000 ? "duplicate SKU" : err.message;
    console.log(`ERROR ${label}: ${msg}`);
  }
}

(async () => {
  await mongoose.connect(MONGO_URL);
  await Product.deleteMany({});
  await Product.syncIndexes();

  await attempt("valid product", { sku: "lap-1001", name: "Student Laptop Bag", price: { mrp: 1499, selling: 999 }, tags: ["Bags", "bags", "College"], reviews: [{ user: "ravi", stars: 4 }, { user: "sita", stars: 5 }] });
  await attempt("valid product 2", { sku: "STA-2002", name: "Engineering Drawing Kit", price: { mrp: 650, selling: 520 } });
  await attempt("selling > MRP", { sku: "PEN-3003", name: "Gel Pen Pack", price: { mrp: 100, selling: 150 } });
  await attempt("on sale, no end date", { sku: "CAL-4004", name: "Scientific Calculator", price: { mrp: 1200, selling: 900 }, onSale: true });
  await attempt("bad SKU format", { sku: "X1", name: "Notebook", price: { mrp: 60, selling: 50 } });
  await attempt("banned word in name", { sku: "USB-5005", name: "Free USB Drive", price: { mrp: 400, selling: 300 } });
  await attempt("review out of range", { sku: "BAG-6006", name: "Lunch Box", price: { mrp: 300, selling: 250 }, reviews: [{ user: "kiran", stars: 7 }] });
  await attempt("duplicate SKU", { sku: "LAP-1001", name: "Another Bag", price: { mrp: 900, selling: 800 } });

  console.log("\nStatic method findCheaperThan(800):", await Product.findCheaperThan(800).lean());
  await mongoose.disconnect();
})().catch(err => { console.error("Could not run:", err.message); process.exit(1); });
