const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/storeManagement");
  

// Routes
app.use("/products", require("./routes/productroutes"));
// Import cart routes
app.use("/cart", require("./routes/cartRoutes"));
// Import order routes
app.use("/orders", require("./routes/orderRoutes"));
// Default route
app.use("/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
    res.send("Welcome to the eStore API!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Sample product data
const initialProducts = [
    { name: "Diary", price: 35, description: "High-quality diary for every occasion.", category: "Category A" },
    { name: "Pen set", price: 50, description: "Stylish pens for professionals and students.", category: "Category B" },
    { name: "Chalk", price: 30, description: "Smooth, vibrant, and dust-free chalks", category: "Category C" },
    { name: "Files", price: 30, description: "High quality files with attractive colours", category: "Category D" },
    { name: "Duster", price: 40, description: "Effortless cleaning every time", category: "Category D" },
    { name: "Blank Pages", price: 50, description: "Premium quality pages for every occasion", category: "Category B" },
    { name: "Notebooks", price: 30, description: "High quality notebooks for smooth writing", category: "Category B" },
    { name: "Markers", price: 30, description: "Bold marks, smooth lines", category: "Category C" }
];
