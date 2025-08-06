const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Place an order
router.post("/", async (req, res) => {
    try {
        const { name, address, items } = req.body;

        // Validate required fields
        if (!name || !address || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Name, address, and at least one item are required" });
        }

        // Ensure all items have price and quantity
        if (items.some(item => typeof item.price !== "number" || typeof item.quantity !== "number")) {
            return res.status(400).json({ message: "Each item must have a valid price and quantity" });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create new order
        const newOrder = new Order({
            name,
            address,
            items,
            totalAmount
        });

        await newOrder.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
