const products = [
  { id: 1, name: "Studio Wireless Headphones", description: "A clean, comfortable everyday listening companion with a sleek silhouette and sound that makes your playlists feel closer.", category: "Tech", price: 2499, oldPrice: 3299, rating: 4.9, label: "BESTSELLER", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85" },
  { id: 2, name: "Everyday Ceramic Mug Set", description: "Slow mornings start here. A simple, timeless mug set designed for coffee breaks, tea rituals and little everyday moments.", category: "Home", price: 899, oldPrice: 1199, rating: 4.8, label: "LOVED", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85" },
  { id: 3, name: "Classic Minimal Watch", description: "An understated accessory with a versatile look that pairs easily with weekday outfits and weekend plans alike.", category: "Style", price: 1899, oldPrice: 2499, rating: 4.7, label: "NEW", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85" },
  { id: 4, name: "Daily Carry Backpack", description: "A go-anywhere everyday bag with a relaxed, practical look for classes, commutes and spontaneous plans.", category: "Style", price: 1599, oldPrice: 1999, rating: 4.8, label: "", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85" },
  { id: 5, name: "Soft Glow Table Lamp", description: "Give your corner a softer mood with a warm, inviting accent that makes evenings feel a little more relaxed.", category: "Home", price: 1299, oldPrice: 1699, rating: 4.6, label: "TRENDING", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85" },
  { id: 6, name: "Move More Yoga Mat", description: "Make space for a stretch, a flow or a reset. A simple workout essential for building a routine at your own pace.", category: "Fitness", price: 999, oldPrice: 1299, rating: 4.8, label: "", image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=700&q=85" },
  { id: 7, name: "Pocket Bluetooth Speaker", description: "Bring your soundtrack along with a compact design that fits naturally into your desk setup or weekend plans.", category: "Tech", price: 1399, oldPrice: 1799, rating: 4.5, label: "", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85" },
  { id: 8, name: "Everyday Water Bottle", description: "A clean, reusable daily companion to keep close at your desk, in your bag or on the move.", category: "Fitness", price: 699, oldPrice: 899, rating: 4.7, label: "ECO PICK", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85" }
];

const formatPrice = amount => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(amount);

const productGrid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartFooter = document.querySelector("#cartFooter");
const toast = document.querySelector("#toast");

let selectedCategory = "All";
let searchTerm = "";
let cart = loadCart();
let favorites = new Set();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("novacart-cart") || "[]");
    return Array.isArray(saved) ? saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("novacart-cart", JSON.stringify(cart));
}

function renderProducts() {
  let visibleProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "low-high") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "high-low") visibleProducts.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating") visibleProducts.sort((a, b) => b.rating - a.rating);

  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.label ? `<span class="product-label">${product.label}</span>` : ""}
        <button class="wishlist-button ${favorites.has(product.id) ? "saved" : ""}" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Remove from" : "Add to"} wishlist" aria-pressed="${favorites.has(product.id)}">${favorites.has(product.id) ? "♥" : "♡"}</button>
        <button class="quick-view-button" data-quick-view="${product.id}">Quick view <span>↗</span></button>
        <button class="add-button" data-add="${product.id}">＋ Add to cart</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${product.category}</span><span class="rating">★ ${product.rating.toFixed(1)}</span></div>
        <h3>${product.name}</h3>
        <div class="price-row"><span class="price">${formatPrice(product.price)}</span><span class="old-price">${formatPrice(product.oldPrice)}</span></div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visibleProducts.length !== 0;
  productGrid.hidden = visibleProducts.length === 0;
}

function setCategory(category) {
  selectedCategory = category;
  document.querySelectorAll("[data-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderProducts();
}

function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${products.find(product => product.id === id).name} added to your cart`);
}

function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed from cart");
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  document.querySelector("#cartCount").textContent = totalQuantity;
  document.querySelector("#drawerCartCount").textContent = `(${totalQuantity})`;
  document.querySelector("#cartSubtotal").textContent = formatPrice(subtotal);
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <div class="item-category">${product.category}</div>
          <div class="item-price">${formatPrice(product.price)}</div>
          <div class="quantity-controls">
            <button data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button>
      </div>
    `;
  }).join("");

  const isEmpty = cart.length === 0;
  cartEmpty.classList.toggle("visible", isEmpty);
  cartFooter.classList.toggle("hidden", isEmpty);
  cartItems.style.display = isEmpty ? "none" : "block";
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector("#closeCartBtn").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.querySelector("#openCartBtn").focus();
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelector("#searchForm").addEventListener("submit", event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
});
sortSelect.addEventListener("change", renderProducts);
document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) addToCart(Number(addButton.dataset.add));
  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    renderProducts();
    showToast(favorites.has(id) ? "Added to your wishlist" : "Removed from your wishlist");
  }
});

cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});

document.querySelector("#openCartBtn").addEventListener("click", openCart);
document.querySelector("#closeCartBtn").addEventListener("click", closeCart);
document.querySelector("#continueShoppingBtn").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

document.querySelector("#checkoutBtn").addEventListener("click", () => {
  showToast("Demo checkout only — connect a payment provider to accept payments.");
});

document.querySelector("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = document.querySelector("#emailInput").value.trim();
  const message = document.querySelector("#newsletterMessage");
  if (!email) return;
  message.textContent = "Thanks for joining! This demo does not store email addresses.";
  message.classList.add("success");
  event.target.reset();
});

// Quick view: inspect a product and choose a quantity before adding it.
let quickViewProductId = null;
let quickViewQuantity = 1;
const quickView = document.querySelector("#quickView");
const quickViewBackdrop = document.querySelector("#quickViewBackdrop");

function openQuickView(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  quickViewProductId = id;
  quickViewQuantity = 1;
  document.querySelector("#quickViewImage").src = product.image;
  document.querySelector("#quickViewImage").alt = product.name;
  document.querySelector("#quickViewCategory").textContent = `${product.category.toUpperCase()} / EVERYDAY ESSENTIAL`;
  document.querySelector("#quickViewRating").innerHTML = `★★★★★ <span>${product.rating.toFixed(1)} · Customer rating</span>`;
  document.querySelector("#quickViewName").textContent = product.name;
  document.querySelector("#quickViewPrice").textContent = formatPrice(product.price);
  document.querySelector("#quickViewOldPrice").textContent = formatPrice(product.oldPrice);
  document.querySelector("#quickViewSave").textContent = `${Math.round((1 - product.price / product.oldPrice) * 100)}% OFF`;
  document.querySelector("#quickViewDescription").textContent = product.description || "A thoughtfully chosen everyday essential.";
  document.querySelector("#quickQty").textContent = quickViewQuantity;
  quickView.classList.add("open");
  quickViewBackdrop.classList.add("open");
  quickView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector("#quickViewClose").focus();
}

function closeQuickView() {
  quickView.classList.remove("open");
  quickViewBackdrop.classList.remove("open");
  quickView.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function addQuickViewToCart() {
  if (!quickViewProductId) return;
  for (let i = 0; i < quickViewQuantity; i++) {
    const existing = cart.find(item => item.id === quickViewProductId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: quickViewProductId, quantity: 1 });
  }
  saveCart();
  renderCart();
  const product = products.find(item => item.id === quickViewProductId);
  closeQuickView();
  showToast(`${quickViewQuantity} × ${product.name} added to your cart`);
}

productGrid.addEventListener("click", event => {
  const quickViewButton = event.target.closest("[data-quick-view]");
  if (quickViewButton) openQuickView(Number(quickViewButton.dataset.quickView));
});

document.querySelector("#quickViewClose").addEventListener("click", closeQuickView);
quickViewBackdrop.addEventListener("click", closeQuickView);
document.querySelector("#quickQtyMinus").addEventListener("click", () => {
  quickViewQuantity = Math.max(1, quickViewQuantity - 1);
  document.querySelector("#quickQty").textContent = quickViewQuantity;
});
document.querySelector("#quickQtyPlus").addEventListener("click", () => {
  quickViewQuantity = Math.min(10, quickViewQuantity + 1);
  document.querySelector("#quickQty").textContent = quickViewQuantity;
});
document.querySelector("#quickAddBtn").addEventListener("click", addQuickViewToCart);

// Toggle a softer dark theme and remember the choice on this browser.
const themeToggle = document.querySelector("#themeToggle");
function setTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  localStorage.setItem("novacart-theme", isDark ? "dark" : "light");
}
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));
setTheme(localStorage.getItem("novacart-theme") === "dark");

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && quickView.classList.contains("open")) closeQuickView();
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
