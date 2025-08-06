const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Product = require("./models/Product");
const User = require("./models/userModel"); // Import User model

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Failed to connect to MongoDB", err));

const initialProducts = [
    {
        name: "Diary",
        price: 35,
        description: "High-quality diary for every occasion.",
        category: "Category A",
        image: "/images/mp1.jpg"
    },
    {
        name: "Pen set",
        price: 50,
        description: "Stylish pens for professionals and students.",
        category: "Category B",
        image: "/images/mp2.jpg"
    },
    {
        name: "Chalk",
        price: 30,
        description: "Smooth, vibrant, and dust-free chalks",
        category: "Category C",
        image: "/images/mp3.jpg"
    },
    {
        name: "Files",
        price: 30,
        description: "High-quality files with attractive colors",
        category: "Category D",
        image: "/images/mp4.jpg"
    },
    {
        name: "Duster",
        price: 40,
        description: "Effortless cleaning every time",
        category: "Category D",
        image: "/images/mp5.png"
    },
    {
        name: "Blank Pages",
        price: 50,
        description: "Premium quality pages for every occasion",
        category: "Category B",
        image: "/images/mp6.jpg"
    },
    {
        name: "Notebooks",
        price: 30,
        description: "High-quality notebooks for smooth writing",
        category: "Category B",
        image: "/images/mp7.jpeg"
    },
    {
        name: "Markers",
        price: 30,
        description: "Bold marks, smooth lines",
        category: "Category C",
        image: "/images/mp8.jpg"
    }
];

const seedDatabase = async () => {
    try {
        // --- Seed Products ---
        console.log("Deleting existing products...");
        await Product.deleteMany({});
        console.log("Adding new products...");
        await Product.insertMany(initialProducts);
        console.log("Products added successfully!");

        // --- Seed Admin User ---
        const existingUser = await User.findOne({ username: "admin" }); // Check for username instead of email
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const adminUser = new User({
                username: "admin",
                password: hashedPassword
            });
            await adminUser.save();
            console.log("Admin user created successfully!");
        } else {
            console.log("Admin user already exists.");
        }

        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDatabase();
