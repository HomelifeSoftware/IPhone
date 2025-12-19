// ===== GLOBAL STATE =====
let products = [];
let cart = [];
let orders = [];

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load products from API
        await loadProducts();
        
        // Load cart from localStorage (temporary storage)
        loadCartFromStorage();
        
        // Hide loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 800);
        
        // Render products
        renderProducts(products);
        
        // Initialize dark mode
        initializeDarkMode();
        
        // Close modals when clicking outside
        setupModalCloseHandlers();
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('loader').classList.add('hidden');
        showToast('Error connecting to server. Please make sure the server is running.', 'error');
    }
});

// ===== LOAD DATA FROM DATABASE =====
async function loadProducts() {
    try {
        products = await getAllProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

// ===== CART STORAGE (localStorage for cart only) =====
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Default products are now seeded by the server on first run

// ===== DARK MODE =====
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== SPA NAVIGATION =====
function showSection(section) {
    // Hide all sections
    const sections = ['homeSection', 'productsSection', 'productDetailSection', 'ordersSection'];
    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.style.display = 'none';
    });
    
    // Hide store description by default
    const storeDesc = document.querySelector('.store-description-section');
    if (storeDesc) storeDesc.style.display = 'none';
    
    // Show selected section
    if (section === 'home') {
        document.getElementById('homeSection').style.display = 'block';
        if (storeDesc) storeDesc.style.display = 'block';
    } else if (section === 'products') {
        document.getElementById('productsSection').style.display = 'block';
        loadProducts().then(() => renderProducts(products));
    } else if (section === 'productDetail' || section === 'productDetailSection') {
        document.getElementById('productDetailSection').style.display = 'block';
    } else if (section === 'orders') {
        document.getElementById('ordersSection').style.display = 'block';
        loadOrders();
    }
    
    // Close mobile menu
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// ===== PRODUCT FUNCTIONS =====
function calculateFinalPrice(price, discount) {
    return Math.round(price * (1 - discount / 100));
}

function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">No products found matching your criteria.</p>';
        return;
    }
    
    productsToRender.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
        
        productCard.innerHTML = `
            <div class="product-image">
                ${product.discount > 0 ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f5f5f7%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%2386868b%22 font-family=%22sans-serif%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price-container">
                    ${product.discount > 0 ? `<span class="original-price">TSh ${product.price.toLocaleString()}</span>` : ''}
                    <span class="final-price">TSh ${finalPrice.toLocaleString()}</span>
                </div>
                <button class="read-more-btn" onclick="showProductDetail(${product.id})">
                    <span>Read More</span>
                </button>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <span>Add to Cart</span>
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

async function showProductDetail(productId) {
    try {
        const product = await getProduct(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
        const discountAmount = product.price - finalPrice;
        
        document.getElementById('productDetailContainer').innerHTML = `
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f5f5f7%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%2386868b%22 font-family=%22sans-serif%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="product-description">${product.description}</p>
                <div class="price-details">
                    <div class="price-row">
                        <span>Original Price:</span>
                        <span>TSh ${product.price.toLocaleString()}</span>
                    </div>
                    ${product.discount > 0 ? `
                        <div class="price-row">
                            <span>Discount (${product.discount}%):</span>
                            <span style="color: var(--error-color);">-TSh ${discountAmount.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div class="price-row">
                        <span>Final Price:</span>
                        <span>TSh ${finalPrice.toLocaleString()}</span>
                    </div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}); showSection('products');">
                    <span>Add to Cart</span>
                </button>
            </div>
        `;
        
        showSection('productDetail');
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product details', 'error');
    }
}

async function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priceFilter = document.getElementById('priceFilter').value;
    
    await loadProducts();
    
    let filtered = products.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.description.toLowerCase().includes(searchTerm);
        
        // Price filter (based on final price)
        let matchesPrice = true;
        const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
        
        if (priceFilter !== 'all') {
            if (priceFilter === '0-1000000') {
                matchesPrice = finalPrice < 1000000;
            } else if (priceFilter === '1000000-2000000') {
                matchesPrice = finalPrice >= 1000000 && finalPrice < 2000000;
            } else if (priceFilter === '2000000-2500000') {
                matchesPrice = finalPrice >= 2000000 && finalPrice < 2500000;
            } else if (priceFilter === '2500000+') {
                matchesPrice = finalPrice >= 2500000;
            }
        }
        
        return matchesSearch && matchesPrice;
    });
    
    renderProducts(filtered);
}

// ===== CART FUNCTIONS =====
async function addToCart(productId) {
    // Try to find product in local array first
    let product = products.find(p => p.id == productId || String(p.id) === String(productId));
    
    // If not found locally, fetch from API
    if (!product) {
        try {
            product = await getProduct(productId);
            if (!product) {
                showToast('Product not found', 'error');
                return;
            }
            // Add to local products array for future use
            if (!products.find(p => p.id == product.id)) {
                products.push(product);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast('Error loading product. Please try again.', 'error');
            return;
        }
    }
    
    const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
    
    const existingItem = cart.find(item => item.id == productId || String(item.id) === String(productId));
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            finalPrice: finalPrice,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    animateCartBadge();
    showToast(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
    // Handle both string and number ID comparison
    const itemToRemove = cart.find(item => item.id == productId || String(item.id) === String(productId));
    if (!itemToRemove) {
        console.warn('Item not found in cart:', productId);
        return;
    }
    
    // Remove item from cart
    cart = cart.filter(item => item.id != productId && String(item.id) !== String(productId));
    saveCartToStorage();
    updateCartUI();
    animateCartBadge();
    showToast(`${itemToRemove.name} removed from cart`, 'info');
}

function updateQuantity(productId, change) {
    // Handle both string and number ID comparison
    const item = cart.find(item => item.id == productId || String(item.id) === String(productId));
    if (!item) {
        console.warn('Item not found in cart:', productId);
        return;
    }
    
    const oldQuantity = item.quantity;
    item.quantity += change;
    
    // Ensure quantity doesn't go below 1
    if (item.quantity < 1) {
        item.quantity = 1;
        showToast('Minimum quantity is 1', 'warning');
        return;
    }
    
    // Update cart
    saveCartToStorage();
    updateCartUI();
    animateCartBadge();
    
    // Show feedback for quantity changes
    if (change > 0) {
        showToast(`${item.name} quantity increased to ${item.quantity}`, 'success');
    } else if (change < 0 && oldQuantity > item.quantity) {
        showToast(`${item.name} quantity decreased to ${item.quantity}`, 'info');
    }
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');
    
    if (!cartItems || !cartTotal || !cartBadge) return;
    
    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    cartTotal.textContent = `TSh ${total.toLocaleString()}`;
    
    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <span class="material-icons">shopping_cart</span>
                <p style="font-size: 18px; font-weight: 500; margin: 0;">Your cart is empty</p>
                <p style="font-size: 14px; margin: 0;">Add items to get started!</p>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image" style="background: var(--bg-gray); display: flex; align-items: center; justify-content: center; color: var(--text-light);">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : `<span class="material-icons">phone_iphone</span>`}
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">TSh ${item.finalPrice.toLocaleString()} each</div>
                <div class="cart-item-subtotal">Subtotal: TSh ${(item.finalPrice * item.quantity).toLocaleString()}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn quantity-decrease" onclick="updateQuantity(${item.id}, -1)" title="Decrease quantity">
                        <span class="material-icons">remove</span>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn quantity-increase" onclick="updateQuantity(${item.id}, 1)" title="Increase quantity">
                        <span class="material-icons">add</span>
                    </button>
                </div>
                <button class="remove-item-btn" onclick="confirmRemoveFromCart(${item.id}, '${item.name.replace(/'/g, "\\'")}')" title="Remove item">
                    <span class="material-icons">delete_outline</span> Remove
                </button>
            </div>
        </div>
    `).join('');
}

function animateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.classList.add('animate');
    setTimeout(() => {
        badge.classList.remove('animate');
    }, 300);
}

function confirmRemoveFromCart(productId, itemName) {
    if (confirm(`Are you sure you want to remove "${itemName}" from your cart?`)) {
        removeFromCart(productId);
    }
}

function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== CHECKOUT FUNCTIONS =====
function openCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }
    
    // Display cart items in checkout
    const total = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    document.getElementById('checkoutProductInfo').innerHTML = `
        <h3 style="margin-bottom: 10px;">Order Summary</h3>
        ${cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.name} x${item.quantity}</span>
                <span>TSh ${(item.finalPrice * item.quantity).toLocaleString()}</span>
            </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color); font-weight: 600;">
            <span>Total:</span>
            <span>TSh ${total.toLocaleString()}</span>
        </div>
    `;
    
    closeCart();
    setTimeout(() => {
        document.getElementById('checkoutModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = '';
    const successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.classList.remove('show');
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();
}

async function handleCheckout(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.finalPrice
        })),
        total: cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0),
        status: 'pending',
        date: new Date().toISOString(),
        id: Date.now()
    };
    
    try {
        // Add to database
        await addOrder(formData);
        
        // Show success message
        const successMsg = document.getElementById('successMessage');
        if (successMsg) successMsg.classList.add('show');
        
        // Simulate notifications
        setTimeout(() => {
            showToast('📧 Order sent to admin email', 'success');
        }, 500);
        
        setTimeout(() => {
            showToast('📱 SMS confirmation sent', 'success');
        }, 1000);
        
        // Clear cart and close modal
        setTimeout(() => {
            cart = [];
            saveCartToStorage();
            updateCartUI();
            closeCheckout();
            showToast('Order placed successfully!', 'success');
        }, 2500);
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Error placing order. Please try again.', 'error');
    }
}

// ===== ORDER FUNCTIONS =====
async function loadOrders() {
    try {
        orders = await getAllOrders();
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

function renderOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    // Filter orders for current user (in real app, would filter by user ID)
    const userOrders = orders.slice().reverse(); // Show newest first
    
    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<div class="empty-orders">No orders yet. Start shopping!</div>';
        return;
    }
    
    ordersContainer.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div style="font-size: 14px; color: var(--text-light); margin-top: 5px;">
                        ${new Date(order.date).toLocaleDateString()}
                    </div>
                </div>
                <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
            </div>
            <div>
                <div style="margin-bottom: 10px;"><strong>Items:</strong></div>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${item.name} x${item.quantity}</span>
                        <span>TSh ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); font-weight: 600;">
                    <span>Total:</span>
                    <span>TSh ${order.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    if (toastIcon) {
        toastIcon.textContent = icons[type] || icons.info;
        toastIcon.className = 'toast-icon material-icons';
    }
    if (toastMessage) toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== MODAL HANDLERS =====
function setupModalCloseHandlers() {
    // Close checkout modal when clicking outside
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCheckout();
            }
        });
    }
}