// ===== NODE.JS EXPRESS SERVER WITH POSTGRESQL =====
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Increase JSON/body size limit to handle base64 images for products
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(".")); // Serve static files

// PostgreSQL Connection Pool
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "iphone_empire",
      password: process.env.DB_PASSWORD || "password",
      port: process.env.DB_PORT || 5432,
    });

// Test database connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create products table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(12, 2) NOT NULL,
                discount DECIMAL(5, 2) DEFAULT 0,
                category VARCHAR(100),
                description TEXT,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create orders table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                address TEXT NOT NULL,
                total DECIMAL(12, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                items JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create users table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Create indexes
    await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
        `);

    console.log("✅ Database tables initialized");

    // Seed default admin user if none exists
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      await seedDefaultAdminUser();
    }

    // Check if products table is empty and seed with default data
    const productCount = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(productCount.rows[0].count) === 0) {
      await seedDefaultProducts();
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

// Seed default products
async function seedDefaultProducts() {
  const defaultProducts = [
    {
      name: "iPhone 11",
      price: 1247500,
      discount: 0,
      category: "iPhone",
      description:
        "6.1-inch Liquid Retina display. A13 Bionic chip. Dual-camera system with Ultra Wide and Wide cameras. Face ID for secure authentication. Up to 17 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 12",
      price: 1747500,
      discount: 10,
      category: "iPhone",
      description:
        "6.1-inch Super Retina XDR display. A14 Bionic chip. 5G capable. Dual-camera system with Night mode. Ceramic Shield front cover. MagSafe accessories.",
      image:
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 13",
      price: 1997500,
      discount: 5,
      category: "iPhone",
      description:
        "6.1-inch Super Retina XDR display. A15 Bionic chip. Advanced camera system for better photos in any light. Cinematic mode for videos. Up to 19 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1632665852592-f3a9811317bf?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 13 Pro",
      price: 2497500,
      discount: 15,
      category: "iPhone Pro",
      description:
        "6.1-inch ProMotion display with adaptive refresh rates up to 120Hz. A15 Bionic chip. Pro camera system with macro photography. Cinematic mode. Up to 22 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1632665852592-f3a9811317bf?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 14",
      price: 2247500,
      discount: 8,
      category: "iPhone",
      description:
        "6.1-inch Super Retina XDR display. A15 Bionic chip. Action mode for smooth, steady videos. Crash Detection. Emergency SOS via satellite. Up to 20 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1663491488536-1c6b5e0c5d8b?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 14 Pro",
      price: 2747500,
      discount: 12,
      category: "iPhone Pro",
      description:
        "6.1-inch Super Retina XDR display with Dynamic Island. A16 Bionic chip. 48MP main camera. Action mode. Crash Detection. Up to 23 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1663491488536-1c6b5e0c5d8b?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 14 Pro Max",
      price: 2997500,
      discount: 10,
      category: "iPhone Pro Max",
      description:
        "6.7-inch Super Retina XDR display with Dynamic Island. A16 Bionic chip. Largest iPhone display. 48MP main camera. Action mode. Up to 29 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1663491488536-1c6b5e0c5d8b?w=400&h=400&fit=crop",
    },
    {
      name: "iPhone 15",
      price: 2497500,
      discount: 0,
      category: "iPhone",
      description:
        "6.1-inch Super Retina XDR display. A16 Bionic chip. USB-C connectivity. Advanced camera system. Action button. Up to 20 hours of video playback.",
      image:
        "https://images.unsplash.com/photo-1695048133142-a4c7887fcd3e?w=400&h=400&fit=crop",
    },
  ];

  for (const product of defaultProducts) {
    await pool.query(
      "INSERT INTO products (name, price, discount, category, description, image) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        product.name,
        product.price,
        product.discount,
        product.category,
        product.description,
        product.image,
      ]
    );
  }
  console.log("✅ Default products seeded");
}

// Seed default admin user
async function seedDefaultAdminUser() {
  const defaultEmail = process.env.ADMIN_EMAIL || "admin@store.com";
  const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
    [defaultEmail, passwordHash, "admin"]
  );

  console.log(`✅ Default admin user created: ${defaultEmail}`);
}

// ===== AUTH API ENDPOINTS =====

// Admin login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // For now we just return basic info; frontend will store a simple flag in sessionStorage
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// ===== PRODUCTS API ENDPOINTS =====

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, discount, category, description, image } = req.body;
    const result = await pool.query(
      "INSERT INTO products (name, price, discount, category, description, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, price, discount || 0, category || "iPhone", description, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, discount, category, description, image } = req.body;
    const result = await pool.query(
      "UPDATE products SET name = $1, price = $2, discount = $3, category = $4, description = $5, image = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [name, price, discount || 0, category || "iPhone", description, image, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ===== ORDERS API ENDPOINTS =====

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM orders ORDER BY created_at DESC";
    let params = [];

    if (status && status !== "all") {
      query = "SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC";
      params = [status];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;
    const result = await pool.query(
      "INSERT INTO orders (name, email, phone, address, items, total, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, email, phone, address, JSON.stringify(items), total, "pending"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order status
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ===== START SERVER =====
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 iPhone Empire Store API ready`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await pool.end();
  process.exit(0);
});
