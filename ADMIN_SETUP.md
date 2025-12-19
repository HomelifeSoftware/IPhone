# iPhone Empire Store - Admin Panel Setup & Fix

## Problem Fixed
The admin panel couldn't perform CRUD operations (create, read, update, delete) on products and orders because:
1. The server database connection wasn't properly configured for both local development and Render production
2. The API endpoints needed the server to have an active database connection

## Solution Implemented

### 1. **Database Connection Configuration** (`server.js`)
Updated the PostgreSQL connection pool to support both:
- **Local Development**: Uses individual environment variables (DB_USER, DB_HOST, etc.)
- **Render Production**: Uses DATABASE_URL with SSL when deployed to Render

```javascript
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
```

### 2. **Environment Variables**

#### For Local Development (`.env`)
Use a local PostgreSQL database:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=iphone_empire
DB_PASSWORD=password
DB_PORT=5432
PORT=3000
```

#### For Render Production (`.env.local` or Render Dashboard)
Use your Render PostgreSQL connection:
```
DATABASE_URL=postgresql://iphone_empire_user:Y2r03mjB35564CugoIE2uDYcY37VewIu@dpg-d52pg6muk2gs73aim2m0-a.frankfurt-postgres.render.com:5432/iphone_empire?sslmode=require
PORT=3000
```

## How to Use the Admin Panel

### 1. **Access Admin Login**
- Navigate to `admin-login.html`
- Login credentials:
  - Email: `admin@store.com` (default)
  - Password: `admin123` (default)
- Change these in `.env`: `ADMIN_EMAIL` and `ADMIN_PASSWORD`

### 2. **Product Management**

#### **Add a New Product**
1. Click "Add Product" button in Products tab
2. Fill in product details:
   - Product Name
   - Price (in TSh)
   - Discount % (optional)
   - Category (iPhone, iPhone Pro, iPhone Pro Max)
   - Description
   - Upload image or capture from camera
3. Click "Add Product"
4. Product appears in the store and admin dashboard

#### **Edit a Product**
1. Find the product in the grid
2. Click "Edit" button
3. Modify the details
4. Click "Update Product"
5. Changes appear instantly

#### **Delete a Product**
1. Find the product in the grid
2. Click "Delete" button
3. Confirm deletion
4. Product removed from store

#### **Upload Product Images**
Three methods:
- **File Upload**: Click image area to select file
- **Camera Capture**: Click camera icon to take a photo
- **URL**: Paste image URL in advanced mode

### 3. **Order Management**

#### **View All Orders**
1. Go to "Orders" tab
2. See all pending and completed orders
3. Each order shows:
   - Order ID and timestamp
   - Customer details (name, email, phone, address)
   - Ordered items with quantities
   - Total amount
   - Current status

#### **Filter Orders by Status**
1. Use the "Filter by Status" dropdown
2. Select: All, Pending, or Completed
3. Dashboard updates automatically

#### **Mark Order as Completed**
1. Find a pending order
2. Click "Mark as Completed" button
3. Order status changes to "completed"
4. Dashboard statistics update

### 4. **Dashboard Metrics**
Monitor your store with real-time stats:
- **Total Products**: All products in store
- **Total Orders**: All orders received
- **Pending Orders**: Awaiting completion
- **Completed Orders**: Fulfilled orders

## API Endpoints (Backend)

All endpoints are automatically available once the server connects to the database:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders (with optional status filter)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

## Deployment to Render

1. **Push to GitHub**
```bash
git add .
git commit -m "Your message"
git push origin main
```

2. **On Render Dashboard**
   - Create a new Web Service
   - Connect to your GitHub repository
   - Add environment variable:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
     ```
   - Deploy! (auto-deploys on push)

3. **Initialize Database**
   - Server automatically creates tables and seeds default data on first run
   - Default products are loaded automatically

## Troubleshooting

### "Connection refused" Error
- **Local**: Make sure PostgreSQL is running: `sudo systemctl start postgresql`
- **Render**: Verify DATABASE_URL is set in environment variables

### Products not saving
- Check browser console for error messages
- Verify server is running: `npm start`
- Check PostgreSQL is accessible

### Images not uploading
- Maximum image size: 10MB
- Server automatically converts to Base64
- Supported formats: jpg, png, gif, webp

### Admin login fails
- Verify credentials in `.env` file
- Default: `admin@store.com` / `admin123`
- Server must be running to authenticate

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(5, 2) DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
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
);
```

## Next Steps

✅ **Database Connection**: Fixed and working  
✅ **Admin CRUD Operations**: Full functionality  
✅ **Ready for Production**: Deploy to Render anytime  

Your admin panel is now fully operational!
