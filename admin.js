// ===== ADMIN PANEL JAVASCRIPT =====

let editingProductId = null;
let stream = null;

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Hide loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 500);

        // Load dashboard data
        await loadDashboard();
        await renderAdminProducts();
        await renderAdminOrders();
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        document.getElementById('loader').classList.add('hidden');
        showToast('Error connecting to server. Please make sure the server is running.', 'error');
    }
});

// ===== DASHBOARD FUNCTIONS =====
async function loadDashboard() {
    try {
        const products = await getAllProducts();
        const orders = await getAllOrders();
        const pendingOrders = orders.filter(o => o.status === 'pending');
        const completedOrders = orders.filter(o => o.status === 'completed');

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('pendingOrders').textContent = pendingOrders.length;
        document.getElementById('completedOrders').textContent = completedOrders.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// ===== TAB NAVIGATION =====
function showAdminTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    if (tab === 'products') {
        document.getElementById('adminProductsTab').classList.add('active');
        document.querySelectorAll('.admin-tab')[0].classList.add('active');
    } else if (tab === 'orders') {
        document.getElementById('adminOrdersTab').classList.add('active');
        document.querySelectorAll('.admin-tab')[1].classList.add('active');
    }
}

// ===== PRODUCT MANAGEMENT =====
async function renderAdminProducts() {
    try {
        const products = await getAllProducts();
        const adminProductsGrid = document.getElementById('adminProductsGrid');

        if (products.length === 0) {
            adminProductsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                    <span class="material-icons" style="font-size: 64px; margin-bottom: 20px; display: block; color: var(--text-light);">inventory_2</span>
                    <h3>No products yet</h3>
                    <p>Add your first product to get started!</p>
                </div>
            `;
            return;
        }

        adminProductsGrid.innerHTML = products.map((product, index) => {
            const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
            return `
                <div class="admin-product-card" style="animation-delay: ${index * 0.1}s">
                    <div class="admin-product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f5f5f7%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%2386868b%22 font-family=%22sans-serif%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="admin-product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description.substring(0, 100)}...</p>
                        <div class="admin-product-price">
                            ${product.discount > 0 ? `
                                <span style="text-decoration: line-through; color: var(--text-light); margin-right: 10px;">
                                    TSh ${product.price.toLocaleString()}
                                </span>
                            ` : ''}
                            <span style="font-weight: 600; color: var(--primary-color); font-size: 20px;">
                                TSh ${finalPrice.toLocaleString()}
                            </span>
                            ${product.discount > 0 ? `
                                <span style="color: var(--error-color); margin-left: 10px; background: #ffebee; padding: 2px 8px; border-radius: 5px; font-size: 12px;">
                                    -${product.discount}%
                                </span>
                            ` : ''}
                        </div>
                        <div class="admin-product-actions">
                            <button class="btn-primary" onclick="editProduct(${product.id})">
                                <span class="material-icons">edit</span> Edit
                            </button>
                            <button class="btn-danger" onclick="deleteProductById(${product.id})">
                                <span class="material-icons">delete</span> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error rendering products:', error);
        showToast('Error loading products', 'error');
    }
}

function calculateFinalPrice(price, discount) {
    return price * (1 - discount / 100);
}

function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('previewPlaceholder').style.display = 'block';
    document.getElementById('productImageBase64').value = '';
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    editingProductId = null;
    document.getElementById('productForm').reset();
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('previewPlaceholder').style.display = 'block';
    document.getElementById('productImageBase64').value = '';
}

async function editProduct(productId) {
    try {
        const product = await getProduct(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }

        editingProductId = productId;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscount').value = product.discount || 0;
        document.getElementById('productCategory').value = product.category || 'iPhone';
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImageBase64').value = product.image;
        
        // Show preview
        if (product.image) {
            document.getElementById('previewImg').src = product.image;
            document.getElementById('previewImg').style.display = 'block';
            document.getElementById('previewPlaceholder').style.display = 'none';
        }

        document.getElementById('productModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product', 'error');
    }
}

async function deleteProductById(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }

    try {
        await deleteProduct(productId);
        showToast('Product deleted successfully', 'success');
        await renderAdminProducts();
        await loadDashboard();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product', 'error');
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const imageBase64 = document.getElementById('productImageBase64').value;
    if (!imageBase64) {
        showToast('Please upload a product image', 'warning');
        return;
    }

    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        discount: parseFloat(document.getElementById('productDiscount').value) || 0,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        image: imageBase64
    };

    try {
        if (editingProductId) {
            // Update existing product
            productData.id = editingProductId;
            await updateProduct(productData);
            showToast('Product updated successfully', 'success');
        } else {
            // Add new product
            productData.id = Date.now();
            await addProduct(productData);
            showToast('Product added successfully', 'success');
        }

        closeProductModal();
        await renderAdminProducts();
        await loadDashboard();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error saving product', 'error');
    }
}

// ===== IMAGE UPLOAD FUNCTIONS =====
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        document.getElementById('productImageBase64').value = base64;
        document.getElementById('previewImg').src = base64;
        document.getElementById('previewImg').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function openCamera() {
    document.getElementById('cameraModal').classList.add('active');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
            stream = mediaStream;
            const video = document.getElementById('videoStream');
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
            showToast('Error accessing camera. Please check permissions.', 'error');
            closeCamera();
        });
}

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    document.getElementById('cameraModal').classList.remove('active');
    const video = document.getElementById('videoStream');
    video.srcObject = null;
}

function capturePhoto() {
    const video = document.getElementById('videoStream');
    const canvas = document.getElementById('photoCanvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    document.getElementById('productImageBase64').value = base64;
    document.getElementById('previewImg').src = base64;
    document.getElementById('previewImg').style.display = 'block';
    document.getElementById('previewPlaceholder').style.display = 'none';

    closeCamera();
    showToast('Photo captured successfully', 'success');
}

// ===== ORDER MANAGEMENT =====
async function renderAdminOrders() {
    try {
        const filter = document.getElementById('orderStatusFilter').value;
        const orders = await getAllOrders(filter);
        
        const adminOrdersContainer = document.getElementById('adminOrdersContainer');

        if (orders.length === 0) {
            adminOrdersContainer.innerHTML = `
                <div class="empty-orders">
                    <span class="material-icons" style="font-size: 64px; margin-bottom: 20px; display: block; color: var(--text-light);">shopping_bag</span>
                    <h3>No orders found</h3>
                </div>
            `;
            return;
        }

        adminOrdersContainer.innerHTML = orders.map((order, index) => `
            <div class="admin-order-card" style="animation-delay: ${index * 0.05}s">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.id}</div>
                        <div style="font-size: 14px; color: var(--text-light); margin-top: 5px;">
                            ${new Date(order.date).toLocaleString()}
                        </div>
                    </div>
                    <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
                </div>
                <div style="margin: 20px 0; padding: 20px; background: var(--bg-gray); border-radius: 10px;">
                    <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="font-size: 18px;">person</span><strong>Customer:</strong> ${order.name}</div>
                    <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="font-size: 18px;">email</span><strong>Email:</strong> ${order.email}</div>
                    <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="font-size: 18px;">phone</span><strong>Phone:</strong> ${order.phone}</div>
                    <div style="display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="font-size: 18px;">location_on</span><strong>Address:</strong> ${order.address}</div>
                </div>
                <div>
                    <div style="margin-bottom: 15px; font-weight: 600;">Items:</div>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: var(--bg-gray); border-radius: 8px;">
                            <span>${item.name} x${item.quantity}</span>
                            <span style="font-weight: 600; color: var(--primary-color);">TSh ${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                    <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border-color); font-size: 24px; font-weight: 700; color: var(--primary-color);">
                        <span>Total:</span>
                        <span>TSh ${order.total.toLocaleString()}</span>
                    </div>
                </div>
                ${order.status === 'pending' ? `
                    <div class="admin-order-actions" style="margin-top: 20px;">
                        <button class="btn-primary" onclick="markOrderCompleted(${order.id})">
                            <span class="material-icons">check_circle</span> Mark as Completed
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering orders:', error);
        showToast('Error loading orders', 'error');
    }
}

async function filterOrders() {
    await renderAdminOrders();
    await loadDashboard();
}

async function markOrderCompleted(orderId) {
    try {
        const order = await getOrder(orderId);
        if (order) {
            order.status = 'completed';
            await updateOrder({ id: orderId, status: 'completed' });
            showToast('Order marked as completed', 'success');
            await renderAdminOrders();
            await loadDashboard();
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('Error updating order', 'error');
    }
}

// ===== LOGOUT =====
function handleAdminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    toastIcon.textContent = icons[type] || icons.info;
    toastIcon.className = 'toast-icon material-icons';
    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
