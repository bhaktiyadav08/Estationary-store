// ✅ Load order summary: Checks if user used "Buy Now" or Cart
function loadOrderSummary() {
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get("buynow") === "true"; // Check if user clicked "Buy Now"

    let orderItemsContainer = document.getElementById("order-items");
    let totalAmount = document.getElementById("total-amount");
    let total = 0;

    orderItemsContainer.innerHTML = "";

    if (isBuyNow) {
        // 🛒 User clicked "Buy Now" → Load only that product from sessionStorage
        let buyNowItem = JSON.parse(sessionStorage.getItem("buyNowProduct"));

        if (!buyNowItem) {
            orderItemsContainer.innerHTML = "<p>⚠️ No product selected. Please try again.</p>";
            totalAmount.textContent = "₹0.00";
            return;
        }

        buyNowItem.forEach((item) => {
            let price = parseFloat(item.price) || 0;
            let itemTotal = price * item.quantity;
            total += itemTotal;

            const itemElement = `
                <div class="order-item">
                    <p>${item.name} - ₹${price.toFixed(2)} x ${item.quantity}</p>
                </div>
            `;
            orderItemsContainer.innerHTML += itemElement;
        });

        sessionStorage.removeItem("buyNowProduct"); // Clear after displaying
    } else {
        // 🛒 User came from cart → Load all cart items from localStorage
        let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

        if (cartItems.length === 0) {
            orderItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            totalAmount.textContent = "₹0.00";
            return;
        }

        cartItems.forEach((item) => {
            let price = parseFloat(item.price) || 0;
            let itemTotal = price * item.quantity;
            total += itemTotal;

            const itemElement = `
                <div class="order-item">
                    <p>${item.name} - ₹${price.toFixed(2)} x ${item.quantity}</p>
                </div>
            `;
            orderItemsContainer.innerHTML += itemElement;
        });
    }

    totalAmount.textContent = `₹${total.toFixed(2)}`;
}

// ✅ Clear cart or Buy Now product after order confirmation
function clearCart() {
    console.log("🛒 Clearing cart...");
    localStorage.removeItem("cart"); // ✅ Clears cart items
    sessionStorage.removeItem("buyNowProduct"); // ✅ Clears Buy Now item
}

// ✅ Ensure checkout form submission works
document.addEventListener("DOMContentLoaded", function () {
    const checkoutForm = document.getElementById("checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();
            alert("🎉 Order placed successfully! Thank you for shopping with us.");
            clearCart(); // ✅ Clears the cart after order submission
            window.location.href = "orderConfirmation.html"; // ✅ Redirect to confirmation page
        });
    }

    // ✅ Handle "Continue Shopping" button click
    const continueShoppingBtn = document.getElementById("continue-shopping");
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener("click", () => {
            clearCart(); // ✅ Ensure cart is emptied before going back
            window.location.href = "estore.html"; // ✅ Redirect to shopping page
        });
    }

    loadOrderSummary(); // ✅ Load cart or Buy Now summary on checkout page load
});
