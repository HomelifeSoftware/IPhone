// ===== INDEXEDDB DATABASE SETUP =====
const DB_NAME = 'iPhoneEmpireDB';
const DB_VERSION = 1;
const STORES = {
    PRODUCTS: 'products',
    ORDERS: 'orders'
};

let db = null;

// Initialize Database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database failed to open');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create products store
            if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
                const productsStore = database.createObjectStore(STORES.PRODUCTS, {
                    keyPath: 'id',
                    autoIncrement: false
                });
                productsStore.createIndex('name', 'name', { unique: false });
                productsStore.createIndex('price', 'price', { unique: false });
            }

            // Create orders store
            if (!database.objectStoreNames.contains(STORES.ORDERS)) {
                const ordersStore = database.createObjectStore(STORES.ORDERS, {
                    keyPath: 'id',
                    autoIncrement: false
                });
                ordersStore.createIndex('status', 'status', { unique: false });
                ordersStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

// ===== PRODUCTS OPERATIONS =====
async function addProduct(product) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
        const store = transaction.objectStore(STORES.PRODUCTS);
        const request = store.add(product);

        request.onsuccess = () => {
            console.log('Product added:', product.id);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error adding product:', request.error);
            reject(request.error);
        };
    });
}

async function getAllProducts() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
        const store = transaction.objectStore(STORES.PRODUCTS);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error getting products:', request.error);
            reject(request.error);
        };
    });
}

async function getProduct(id) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
        const store = transaction.objectStore(STORES.PRODUCTS);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error getting product:', request.error);
            reject(request.error);
        };
    });
}

async function updateProduct(product) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
        const store = transaction.objectStore(STORES.PRODUCTS);
        const request = store.put(product);

        request.onsuccess = () => {
            console.log('Product updated:', product.id);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error updating product:', request.error);
            reject(request.error);
        };
    });
}

async function deleteProduct(id) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
        const store = transaction.objectStore(STORES.PRODUCTS);
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log('Product deleted:', id);
            resolve();
        };

        request.onerror = () => {
            console.error('Error deleting product:', request.error);
            reject(request.error);
        };
    });
}

// ===== ORDERS OPERATIONS =====
async function addOrder(order) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.ORDERS], 'readwrite');
        const store = transaction.objectStore(STORES.ORDERS);
        const request = store.add(order);

        request.onsuccess = () => {
            console.log('Order added:', order.id);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error adding order:', request.error);
            reject(request.error);
        };
    });
}

async function getAllOrders() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.ORDERS], 'readonly');
        const store = transaction.objectStore(STORES.ORDERS);
        const index = store.index('date');
        const request = index.getAll();

        request.onsuccess = () => {
            // Sort by date descending (newest first)
            const orders = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(orders);
        };

        request.onerror = () => {
            console.error('Error getting orders:', request.error);
            reject(request.error);
        };
    });
}

async function getOrder(id) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.ORDERS], 'readonly');
        const store = transaction.objectStore(STORES.ORDERS);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error getting order:', request.error);
            reject(request.error);
        };
    });
}

async function updateOrder(order) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.ORDERS], 'readwrite');
        const store = transaction.objectStore(STORES.ORDERS);
        const request = store.put(order);

        request.onsuccess = () => {
            console.log('Order updated:', order.id);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error updating order:', request.error);
            reject(request.error);
        };
    });
}

async function getOrdersByStatus(status) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.ORDERS], 'readonly');
        const store = transaction.objectStore(STORES.ORDERS);
        const index = store.index('status');
        const request = index.getAll(status);

        request.onsuccess = () => {
            const orders = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(orders);
        };

        request.onerror = () => {
            console.error('Error getting orders by status:', request.error);
            reject(request.error);
        };
    });
}

// Initialize database on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        console.log('Database initialized');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
});
