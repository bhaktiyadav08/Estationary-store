let allProducts = []; // 🌐 Global array to hold all products

// 📦 Load products dynamically
async function loadProducts() {
    const productGrid = document.querySelector('.product-container');
    if (!productGrid) return;

    productGrid.innerHTML = '<p>Loading products...</p>'; // Show loading message

    try {
        const response = await fetch('http://localhost:5000/products'); // Fetch products from backend
        if (!response.ok) throw new Error('Failed to fetch products.');
        allProducts = await response.json(); // Save all products globally

        if (allProducts.length === 0) {
            productGrid.innerHTML = '<p>No products available.</p>';
            return;
        }

        displayProducts(allProducts); // Initial display
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// 🎨 Display products on screen
function displayProducts(products) {
    const productGrid = document.querySelector('.product-container');
    if (!productGrid) return;

    if (products.length === 0) {
        productGrid.innerHTML = '<p>No products match your search.</p>';
        return;
    }

    productGrid.innerHTML = ''; // Clear loading or previous content

    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Price: ₹${product.price}</p>
                <button class="buy-button" data-name="${product.name}" data-price="${product.price}">Buy Now</button>
                <button class="cart-button" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
            </div>
        `;
        productGrid.innerHTML += productCard;
    });

    addButtonListeners(); // Attach event listeners again after re-rendering
}

// 🎯 Handle button clicks for "Buy Now" & "Add to Cart"
function addButtonListeners() {
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price')) || 0;

            if (!productName || isNaN(productPrice)) {
                alert('Invalid product selection.');
                return;
            }

            const buyNowItem = [{ name: productName, price: productPrice, quantity: 1 }];
            sessionStorage.setItem("buyNowProduct", JSON.stringify(buyNowItem));

            window.location.href = "checkout.html?buynow=true";
        });
    });

    document.querySelectorAll('.cart-button').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price')) || 0;

            if (!productName || isNaN(productPrice)) {
                alert("❌ Invalid product.");
                return;
            }

            try {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                let existingItem = cart.find(item => item.name === productName);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name: productName, price: productPrice, quantity: 1 });
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                alert(`✅ ${productName} added to cart!`);
                console.log("✅ Cart updated:", cart);

            } catch (error) {
                console.error("🚨 Error adding to cart:", error);
                alert("⚠️ Failed to add item to cart.");
            }
        });
    });
}

// 🛒 Load Cart Items from Local Storage
function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById("total-price");
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalPrice = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
        totalPriceElement.textContent = "0";
        localStorage.removeItem("cart");
        return;
    }

    cartContainer.innerHTML = "";

    cart.forEach((item) => {
        let price = parseFloat(item.price) || 0;
        let itemTotal = price * item.quantity;
        totalPrice += itemTotal;

        const cartRow = document.createElement("tr");
        cartRow.innerHTML = `
            <td>${item.name}</td>
            <td>₹${price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td><button class="remove-btn" data-name="${item.name}">Remove</button></td>
        `;
        cartContainer.appendChild(cartRow);
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", removeItem);
    });
}

// 🗑️ Remove Item from Cart
function removeItem(event) {
    const itemName = event.target.getAttribute("data-name");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter(item => item.name !== itemName);

    if (cart.length === 0) {
        localStorage.removeItem("cart");
    } else {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    loadCart(); // Refresh cart
}

// 🔍 Setup live search filter
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        displayProducts(filtered);
    });
}

// 📌 Ensure event listeners work for both static and dynamic content
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".product-container")) {
        loadProducts();
        setupSearch(); // Initialize search listener
    }
    if (document.querySelector("#cart-items")) {
        loadCart();
    }
});
