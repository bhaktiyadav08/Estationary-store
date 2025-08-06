const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel"); // Create this model next
const Product = require("../models/Product"); // Ensure you have this model

// Add item to cart
router.post("/", async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cartItem = await Cart.findOne({ productId });
        if (cartItem) {
            cartItem.quantity += 1; // Increase quantity if already in cart
        } else {
            cartItem = new Cart({
                productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
            });
        }

        await cartItem.save();
        res.status(200).json({ message: "Item added to cart", cartItem });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Get all cart items
router.get("/", async (req, res) => {
    try {
        const cartItems = await Cart.find();
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Remove an item from the cart
router.delete("/:id", async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
