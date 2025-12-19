// ===== API CLIENT FOR FRONTEND =====
// This file replaces db.js functionality with API calls

const API_BASE_URL = window.location.origin;

// ===== PRODUCTS API =====
async function getAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

async function addProduct(product) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

async function updateProduct(product) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// ===== ORDERS API =====
async function getAllOrders(status = 'all') {
    try {
        const url = status === 'all' 
            ? `${API_BASE_URL}/api/orders`
            : `${API_BASE_URL}/api/orders?status=${status}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        // Parse JSONB items field
        return orders.map(order => ({
            ...order,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

async function getOrder(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const order = await response.json();
        // Parse JSONB items field
        return {
            ...order,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        };
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
}

async function addOrder(order) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
        });
        if (!response.ok) throw new Error('Failed to create order');
        const newOrder = await response.json();
        // Parse JSONB items field
        return {
            ...newOrder,
            items: typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

async function updateOrder(order) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: order.status }),
        });
        if (!response.ok) throw new Error('Failed to update order');
        const updatedOrder = await response.json();
        // Parse JSONB items field
        return {
            ...updatedOrder,
            items: typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items
        };
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
}
