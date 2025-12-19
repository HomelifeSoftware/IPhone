# Quick Setup Guide

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install version 14 or higher
- Verify: `node --version`

### 2. Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql postgresql-contrib`

## Database Setup

### Step 1: Start PostgreSQL
- **Windows**: PostgreSQL service should start automatically
- **macOS**: `brew services start postgresql`
- **Linux**: `sudo systemctl start postgresql`

### Step 2: Create Database
Open terminal/command prompt and run:

```bash
# Windows (use Command Prompt or PowerShell)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Then in PostgreSQL prompt:
```sql
CREATE DATABASE iphone_empire;
\q
```

### Step 3: Note Your PostgreSQL Password
Remember the password you set during PostgreSQL installation (or the default if you didn't change it).

## Application Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create .env File
Create a file named `.env` in the project root:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=iphone_empire
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
PORT=3000
```

**Important**: Replace `your_postgres_password_here` with your actual PostgreSQL password!

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database tables initialized
✅ Default products seeded
🚀 Server running on http://localhost:3000
```

### Step 4: Open Application
Open your browser and go to: `http://localhost:3000`

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify password in `.env` file
- Check database name is correct

### "Port 3000 already in use"
- Change PORT in `.env` to another number (e.g., 3001)
- Or stop the process using port 3000

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Default Admin Credentials
- Email: `admin@store.com`
- Password: `admin123`

## Next Steps
- The server automatically creates tables and seeds default products
- You can now add/edit products through the admin panel
- All data is stored in PostgreSQL database
