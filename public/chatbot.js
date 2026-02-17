/**
 * SIT E-Stationery Store - Chatbot
 * College-level rule-based assistant for product help, FAQs, and store info
 */

(function () {
    const API_BASE = window.location.origin;
    let productCache = [];

    function normalizeText(str) {
        return String(str || "")
            .toLowerCase()
            .replace(/[^a-z0-9₹\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function tokenize(str) {
        const norm = normalizeText(str);
        return norm ? norm.split(" ").filter(Boolean) : [];
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function productSummary(p) {
        const desc = (p && p.description) ? ` ${p.description}` : "";
        return `${p.name}: ₹${p.price}.${desc}`;
    }

    function scoreProductMatch(queryNorm, queryTokens, product) {
        const nameNorm = normalizeText(product?.name);
        if (!queryNorm || !nameNorm) return 0;

        let score = 0;
        if (nameNorm === queryNorm) score += 120;
        if (nameNorm.includes(queryNorm) || queryNorm.includes(nameNorm)) score += 70;
        if (nameNorm.startsWith(queryNorm)) score += 15;

        const nameTokens = tokenize(product?.name);
        if (queryTokens.length && nameTokens.length) {
            const nameSet = new Set(nameTokens);
            let overlap = 0;
            for (const t of queryTokens) if (nameSet.has(t)) overlap++;
            score += overlap * 12;
        }

        return score;
    }

    function getTopProductMatches(query, limit = 3) {
        if (!productCache.length) return [];
        const queryNorm = normalizeText(query);
        const queryTokens = tokenize(query);
        if (!queryNorm) return [];

        const scored = productCache
            .map((p) => ({ p, score: scoreProductMatch(queryNorm, queryTokens, p) }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score);

        const top = [];
        for (const item of scored) {
            if (!top.find(t => t.p._id === item.p._id && item.p._id)) top.push(item);
            if (top.length >= limit) break;
        }
        return top;
    }

    function sampleAvailableProducts(limit = 6) {
        if (!productCache.length) return [];
        // shuffle copy
        const copy = productCache.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, Math.min(limit, copy.length));
    }

    function extractPossibleProductTerm(text) {
        // Remove common intent words so we can try matching what remains.
        return normalizeText(text)
            .replace(/\b(do you have|have you got|is|are|any|available|in stock|sell|selling|provide|carry|stock|price|cost|how much|rupees|₹|of|for|a|an|the|please)\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function looksLikeOffTopic(textNorm) {
        // Keep this small and conservative so we don't block valid store questions.
        return /\b(weather|forecast|joke|riddle|movie|song|lyrics|sports|cricket|football|news|stocks|bitcoin|astrology|horoscope)\b/.test(textNorm);
    }

    // Fetch products for dynamic responses
    async function fetchProducts() {
        try {
            const res = await fetch(`${API_BASE}/products`);
            if (res.ok) productCache = await res.json();
        } catch (e) {
            productCache = [];
        }
    }

    const responses = {
        greeting: [
            "Hi! 👋 I'm your SIT E-Stationery assistant. How can I help you today?",
            "Hello! Welcome to SIT E-Stationery Store. What would you like to know?",
            "Hey there! Ask me about products, prices, or how to order."
        ],
        help: [
            "I can help you with:\n• Product info & prices\n• Finding items (diary, pens, notebooks, etc.)\n• Cart & checkout help\n• Store info & contact\n\nJust type your question!",
            "You can ask me: 'What products do you have?', 'How much is X?', 'Where is the cart?', or 'How do I order?'"
        ],
        products: () => {
            if (productCache.length === 0) {
                return "Loading products... Try again in a moment!";
            }
            const list = productCache.map(p => `• ${p.name} - ₹${p.price}`).join("\n");
            return `Here are our products:\n\n${list}\n\nBrowse the Products section above or search to find what you need!`;
        },
        price: (query) => {
            if (productCache.length === 0) return "I'm loading product info. Ask again shortly!";
            const q = (query || "").trim();
            const matches = getTopProductMatches(q, 5);
            if (matches.length) {
                const best = matches[0];
                // If the user query clearly points to one item, answer directly.
                if (best.score >= 70 || matches.length === 1) {
                    return `${best.p.name} costs ₹${best.p.price}. ${best.p.description || ""}`.trim();
                }
                // Otherwise show a short list of close matches.
                return `I found a few close matches:\n${matches.map(m => `• ${m.p.name}: ₹${m.p.price}`).join("\n")}\n\nWhich one did you mean?`;
            }

            const term = extractPossibleProductTerm(q);
            const samples = sampleAvailableProducts(6);
            const sampleText = samples.length ? `Here are a few items we currently have:\n${samples.map(p => `• ${p.name} - ₹${p.price}`).join("\n")}` : "";
            return `I couldn't find a product matching \"${term || q}\" in our catalog.\n${sampleText}\n\nYou can also ask: \"What products do you have?\"`.trim();
        },
        cart: "To add items to cart, click **Add to Cart** on any product. View your cart using the **🛒 View Cart** link in the header, or go to cart.html.",
        checkout: "After adding items to cart, click **View Cart**, review your items, then proceed to checkout. You can also use **Buy Now** for instant checkout on a single item.",
        about: "We're passionate about stationery! Our collection is curated with care for students and professionals. Quality products at affordable prices.",
        contact: "Reach us via the Contact form on this page, or you can send an email. We're here to help!",
        thanks: ["You're welcome! Happy shopping! 🎒", "Glad I could help! Feel free to ask more.", "Anytime! Enjoy your stationery!"],
        default: () => {
            const samples = sampleAvailableProducts(5);
            const sampleText = samples.length
                ? `Some popular items right now:\n${samples.map(p => `• ${p.name} - ₹${p.price}`).join("\n")}`
                : "";
            return `I can help with our stationery store: products, prices, cart, and checkout.\n\nTry asking:\n• \"What products do you have?\"\n• \"Do you have notebooks?\"\n• \"How much is a diary?\"\n• \"How do I add to cart?\"\n\n${sampleText}`.trim();
        }
    };

    function getResponse(userText) {
        const text = userText.trim().toLowerCase();
        const textNorm = normalizeText(text);
        if (!text) return "Type something to get started!";

        // Greetings
        if (/\b(hi|hello|hey|hiya)\b/.test(text))
            return pickRandom(responses.greeting);

        // Help
        if (/\b(help|what can you do|options)\b/.test(text))
            return pickRandom(responses.help);

        // Products
        if (/\b(products?|items?|what do you (have|sell)|catalog)\b/.test(text))
            return responses.products();

        // Price
        if (/\b(price|cost|how much|rupees?|₹)\b/.test(text)) {
            const withoutPrice = text.replace(/\b(price|cost|how much|rupees?|₹)\b/g, "").trim();
            return responses.price(withoutPrice || text);
        }

        // Availability / do you have X?
        if (/\b(available|in stock|do you have|have you got|sell|selling|any)\b/.test(textNorm)) {
            if (!productCache.length) {
                return "I'm still loading the product list. Please try again in a moment.";
            }

            const term = extractPossibleProductTerm(textNorm);
            const matches = getTopProductMatches(term || textNorm, 4);
            if (matches.length && (matches[0].score >= 70 || matches.length === 1)) {
                const p = matches[0].p;
                return `Yes — we have **${p.name}**.\n${productSummary(p)}\n\nTip: open Products and click **Add to Cart**.`;
            }

            if (matches.length) {
                return `I couldn't find an exact match for \"${term || textNorm}\", but here are close options:\n${matches.map(m => `• ${m.p.name} - ₹${m.p.price}`).join("\n")}\n\nWhich one are you looking for?`;
            }

            const samples = sampleAvailableProducts(6);
            const sampleText = samples.length ? `Here are a few items we do have:\n${samples.map(p => `• ${p.name} - ₹${p.price}`).join("\n")}` : "";
            return `I don't see \"${term || textNorm}\" in our catalog right now.\n${sampleText}\n\nYou can ask: \"What products do you have?\"`;
        }

        // Cart
        if (/\b(cart|add to cart|shopping cart)\b/.test(text))
            return responses.cart;

        // Checkout / Order
        if (/\b(checkout|order|buy|purchase)\b/.test(text))
            return responses.checkout;

        // About
        if (/\b(about|who are you|store info)\b/.test(text))
            return responses.about;

        // Contact
        if (/\b(contact|email|reach|support)\b/.test(text))
            return responses.contact;

        // Thanks
        if (/\b(thanks?|thank you|ty)\b/.test(text))
            return pickRandom(responses.thanks);

        // Product-specific (e.g. "diary", "pens", "notebooks")
        if (productCache.length) {
            const matches = getTopProductMatches(textNorm, 3);
            if (matches.length && (matches[0].score >= 70 || matches.length === 1)) {
                return productSummary(matches[0].p);
            }
        }

        if (looksLikeOffTopic(textNorm)) {
            return "I’m mainly a store assistant for SIT E-Stationery. I can help with products, prices, cart, and checkout.\n\nTry: \"What products do you have?\" or \"Help\".";
        }

        // Context-aware default
        return responses.default();
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function formatMessage(msg) {
        return escapeHtml(msg).replace(/\n/g, "<br>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    function createChatbotUI() {
        const html = `
            <div id="chatbot-widget">
                <div id="chatbot-window">
                    <div id="chatbot-header">
                        <span>💬 Store Assistant</span>
                        <button id="chatbot-close">×</button>
                    </div>
                    <div id="chatbot-messages"></div>
                    <div id="chatbot-input-area">
                        <input type="text" id="chatbot-input" placeholder="Ask about products, cart, or store...">
                        <button id="chatbot-send">Send</button>
                    </div>
                </div>
                <button id="chatbot-toggle" title="Chat with us">💬</button>
            </div>
        `;

        const style = document.createElement("style");
        style.textContent = `
            #chatbot-widget { font-family: 'Roboto', sans-serif; }
            #chatbot-toggle {
                position: fixed; bottom: 24px; right: 24px;
                width: 56px; height: 56px; border-radius: 50%;
                background: #2d89ef; color: white; border: none;
                font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(45,137,239,0.4);
                z-index: 9998; transition: transform 0.2s;
            }
            #chatbot-toggle:hover { transform: scale(1.05); }
            #chatbot-window {
                display: none; position: fixed; bottom: 90px; right: 24px;
                width: 340px; max-width: calc(100vw - 48px); height: 420px;
                background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                flex-direction: column; z-index: 9999; overflow: hidden;
            }
            #chatbot-window.open { display: flex; }
            #chatbot-header {
                background: #2d89ef; color: white; padding: 12px 16px;
                display: flex; justify-content: space-between; align-items: center;
            }
            #chatbot-header span { font-weight: bold; }
            #chatbot-close {
                background: none; border: none; color: white; font-size: 1.5rem;
                cursor: pointer; padding: 0; line-height: 1;
            }
            #chatbot-close:hover { opacity: 0.8; }
            #chatbot-messages {
                flex: 1; overflow-y: auto; padding: 16px;
                display: flex; flex-direction: column; gap: 12px;
            }
            .chat-msg { max-width: 90%; padding: 10px 12px; border-radius: 12px; font-size: 0.9rem; }
            .chat-msg.bot {
                align-self: flex-start; background: #e8f0fe; color: #333; border-bottom-left-radius: 4px;
            }
            .chat-msg.user {
                align-self: flex-end; background: #2d89ef; color: white; border-bottom-right-radius: 4px;
            }
            #chatbot-input-area {
                display: flex; padding: 12px; border-top: 1px solid #eee; gap: 8px;
            }
            #chatbot-input {
                flex: 1; padding: 10px 12px; border: 1px solid #ddd;
                border-radius: 8px; font-size: 0.95rem;
            }
            #chatbot-send {
                padding: 10px 16px; background: #2d89ef; color: white;
                border: none; border-radius: 8px; cursor: pointer; font-weight: bold;
            }
            #chatbot-send:hover { background: #1a6fd4; }
        `;

        document.head.appendChild(style);
        document.body.insertAdjacentHTML("beforeend", html);
    }

    function addMessage(text, isUser) {
        const container = document.getElementById("chatbot-messages");
        const msg = document.createElement("div");
        msg.className = `chat-msg ${isUser ? "user" : "bot"}`;
        msg.innerHTML = formatMessage(text);
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function sendUserMessage() {
        const input = document.getElementById("chatbot-input");
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = "";

        const reply = getResponse(text);
        setTimeout(() => addMessage(reply, false), 400);
    }

    function init() {
        createChatbotUI();
        fetchProducts();

        const toggle = document.getElementById("chatbot-toggle");
        const windowEl = document.getElementById("chatbot-window");
        const closeBtn = document.getElementById("chatbot-close");
        const input = document.getElementById("chatbot-input");
        const sendBtn = document.getElementById("chatbot-send");

        toggle.addEventListener("click", () => {
            windowEl.classList.toggle("open");
            if (windowEl.classList.contains("open") && !document.querySelector(".chat-msg")) {
                addMessage("Hi! 👋 How can I help you today? Try: 'What products do you have?' or 'Help'", false);
            }
        });

        closeBtn.addEventListener("click", () => windowEl.classList.remove("open"));

        sendBtn.addEventListener("click", sendUserMessage);
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendUserMessage();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
