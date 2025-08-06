document.addEventListener("DOMContentLoaded", loadCart);

// 🛒 Load Cart Items from Local Storage
function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById("total-price");
    
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalPrice = 0;

    // ✅ Handle empty cart correctly
    if (cart.length === 0) {
        cartContainer.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
        totalPriceElement.textContent = "0";
        localStorage.removeItem("cart"); // Ensure it's removed
        return;
    }

    // ✅ Populate cart table
    cartContainer.innerHTML = "";
    cart.forEach((item) => {
        let price = parseFloat(item.price) || 0;
        let itemTotal = price * item.quantity;
        totalPrice += itemTotal;

        const cartRow = document.createElement("tr");
        cartRow.innerHTML = `
            <td>${item.name}</td>
            <td>₹${price.toFixed(2)}</td>
            <td class="quantity-controls">
                <button class="quantity-btn decrease" data-name="${item.name}">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-name="${item.name}">+</button>
            </td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td><button class="remove-btn" data-name="${item.name}">Remove</button></td>
        `;
        cartContainer.appendChild(cartRow);
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);

    // ✅ Reattach event listeners
    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", removeItem);
    });

    document.querySelectorAll(".increase").forEach(button => {
        button.addEventListener("click", increaseQuantity);
    });

    document.querySelectorAll(".decrease").forEach(button => {
        button.addEventListener("click", decreaseQuantity);
    });
}

// ➕ Increase Quantity
function increaseQuantity(event) {
    const itemName = event.target.getAttribute("data-name");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let item = cart.find(item => item.name === itemName);
    if (item) {
        item.quantity += 1;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart(); // ✅ Reload UI
}

// ➖ Decrease Quantity
function decreaseQuantity(event) {
    const itemName = event.target.getAttribute("data-name");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let item = cart.find(item => item.name === itemName);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== itemName); // Remove item if quantity reaches 0
        }
    }

    if (cart.length === 0) {
        localStorage.removeItem("cart");
    } else {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    loadCart(); // ✅ Reload UI
}

// 🗑️ Remove Item from Cart Properly
function removeItem(event) {
    const itemName = event.target.getAttribute("data-name");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // ✅ Remove selected item from the cart array
    cart = cart.filter(item => item.name !== itemName);

    // ✅ If cart is empty, remove it from localStorage and update UI
    if (cart.length === 0) {
        localStorage.removeItem("cart");
        document.getElementById("cart-items").innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
        document.getElementById("total-price").textContent = "0";
    } else {
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart(); // ✅ Reload the cart UI properly
    }
}

// 🛒 Redirect to Checkout Page (Added Check for Button)
document.addEventListener("DOMContentLoaded", () => {
    const checkoutButton = document.querySelector(".checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });
    }
});
