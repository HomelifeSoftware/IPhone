# iPhone Empire Store - E-Commerce Platform

A modern, full-stack e-commerce application for selling iPhone models with PostgreSQL database.

## 🚀 Features

### Customer Features
- **Product Browsing**: View all iPhone models in a beautiful grid layout
- **Product Details**: Click "Read More" to see full product information
- **Search & Filter**: Search products by name and filter by price range
- **Shopping Cart**: Add items to cart with quantity management
- **Order Placement**: Complete checkout form to place orders
- **Order History**: View all placed orders with status tracking
- **Dark Mode**: Toggle between light and dark themes

### Admin Features
- **Admin Dashboard**: Separate admin panel with statistics
- **Product Management**: 
  - Add new products with image upload (file or camera)
  - Edit existing products
  - Delete products
  - Automatic price calculation with discounts
- **Order Management**:
  - View all customer orders
  - See complete order details
  - Mark orders as completed
- **Real-time Statistics**: Dashboard shows product and order counts

## 📁 Project Structure

```
├── index.html          # Main customer-facing page
├── admin.html          # Admin dashboard
├── admin-login.html    # Admin login page
├── style.css           # Main stylesheet
├── admin.css           # Admin-specific styles
├── script.js           # Customer page JavaScript
├── admin.js            # Admin panel JavaScript
├── api.js              # API client for frontend
├── server.js           # Node.js Express backend server
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Responsive design with modern UI/UX
- Dark mode support

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- RESTful API endpoints

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open PostgreSQL command line (psql) and run:

```sql
CREATE DATABASE iphone_empire;
```

Or use pgAdmin to create the database.

### Step 3: Install Node.js Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=iphone_empire
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=3000
```

Replace `your_postgres_password` with your actual PostgreSQL password.

### Step 5: Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Step 6: Open the Application

1. Open `http://localhost:3000` in your browser
2. The server automatically:
   - Creates database tables
   - Seeds default products (if database is empty)

## 🔐 Admin Access

1. Click "Admin Panel" in the navigation
2. Login with:
   - **Email**: `admin@store.com`
   - **Password**: `admin123`

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders (optional `?status=pending`)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

## 🗄️ Database Schema

### Products Table
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR)
- price (DECIMAL)
- discount (DECIMAL)
- category (VARCHAR)
- description (TEXT)
- image (TEXT - base64 or URL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Orders Table
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- address (TEXT)
- total (DECIMAL)
- status (VARCHAR) - 'pending' or 'completed'
- items (JSONB) - Array of order items
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🎨 Features Explained

### Image Upload
- **File Upload**: Select image from device
- **Camera Capture**: Take photo directly (requires camera permissions)
- Images stored as base64 strings in database

### Currency
- All prices in Tanzanian Shillings (TSh)
- Automatic formatting with thousands separators

### Database
- PostgreSQL for reliable, scalable data storage
- JSONB for flexible order items storage
- Automatic table creation and seeding

## 🐛 Troubleshooting

### Server won't start
- Check PostgreSQL is running: `pg_isready` or check services
- Verify database credentials in `.env`
- Ensure database exists: `psql -l` to list databases

### Connection errors
- Check firewall settings
- Verify PostgreSQL is listening on port 5432
- Check `.env` file has correct credentials

### Products not loading
- Check browser console for errors
- Verify server is running on correct port
- Check database connection in server logs

## 🔄 Migration from IndexedDB

The application has been migrated from IndexedDB to PostgreSQL:
- All data now stored in PostgreSQL
- Frontend uses `api.js` for API calls
- Backend handles all database operations
- More reliable and scalable solution

## 📝 Notes

- Cart data still uses localStorage (client-side only)
- Images are stored as base64 strings (consider using file storage for production)
- Admin authentication is basic (implement proper auth for production)
- Server must be running for the application to work

## 🚀 Production Deployment

For production deployment:
1. Use environment variables for sensitive data
2. Implement proper authentication (JWT, sessions)
3. Use file storage service for images (AWS S3, Cloudinary)
4. Add rate limiting and security middleware
5. Use HTTPS
6. Set up database backups
7. Use process manager (PM2) for Node.js

## 📄 License

ISC

---

**Note**: Make sure PostgreSQL is running before starting the server!