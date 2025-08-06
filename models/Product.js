const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Trim removes unnecessary spaces
  price: { type: Number, required: true, min: 0 }, // Ensure price is not negative
  category: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 10 }, // Track available stock
  description: { type: String, default: "No description available" }, // Optional description
  image: { type: String, default: "placeholder.jpg" }, // Image URL or path
  createdAt: { type: Date, default: Date.now }, // Automatically add creation date
});

module.exports = mongoose.model("Product", productSchema);
