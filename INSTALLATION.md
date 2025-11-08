# Installation Guide

This guide will walk you through setting up the File Uploader application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### 1. Node.js (v14 or higher)
- **Download**: https://nodejs.org/
- **Verify installation**: 
  ```bash
  node --version
  npm --version
  ```

#### 2. PostgreSQL (v12 or higher)
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`
- **Verify installation**: 
  ```bash
  psql --version
  ```

#### 3. Git (Optional, for cloning)
- **Download**: https://git-scm.com/
- **Verify installation**: 
  ```bash
  git --version
  ```

### Required Accounts

#### Cloudinary Account (Free Tier)
1. Visit: https://cloudinary.com/
2. Click "Sign Up for Free"
3. Complete registration
4. Navigate to Dashboard to get credentials:
   - Cloud Name
   - API Key
   - API Secret

---

## Installation Steps

### Step 1: Get the Project Files

If you have Git installed:
```bash
git clone <repository-url>
cd file-uploader
```

Or if you downloaded a ZIP:
```bash
cd file-uploader
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- Prisma (database ORM)
- Passport.js (authentication)
- Multer (file uploads)
- Cloudinary (cloud storage)
- And more...

**Expected output**: You should see a progress bar and "added X packages" message.

---

## Configuration

### Step 1: Create Environment File

Copy the example environment file:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### Step 2: Generate Session Secret

Run the helper script:
```bash
node generate-secret.js
```

Copy the generated secret.

### Step 3: Configure Environment Variables

Open `.env` file in your text editor and update:

```env
# 1. Database URL
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/fileuploader"

# 2. Session Secret (paste generated secret)
SESSION_SECRET="paste-generated-secret-here"

# 3. Cloudinary Credentials (from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Finding PostgreSQL Credentials

**Default PostgreSQL username**: `postgres`

If you don't know your password:
- **Windows**: It was set during PostgreSQL installation
- **Mac**: Usually no password needed, use `postgres` or your username
- **Linux**: May need to set password with `sudo -u postgres psql`

### Step 4: Verify Configuration

Run the configuration checker:
```bash
npm run check-config
```

You should see ✅ for all environment variables.

---

## Database Setup

### Step 1: Ensure PostgreSQL is Running

**Windows**: 
- Open Services (Win + R, type `services.msc`)
- Find "postgresql-x64-XX" 
- Ensure it's "Running"

**Mac**:
```bash
brew services start postgresql
```

**Linux**:
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Step 2: Create Database

**Option A - Using psql command line:**
```bash
psql -U postgres -c "CREATE DATABASE fileuploader;"
```

**Option B - Using psql interactive:**
```bash
psql -U postgres
```
Then run:
```sql
CREATE DATABASE fileuploader;
\q
```

**Option C - Using pgAdmin:**
1. Open pgAdmin
2. Right-click "Databases"
3. Create > Database
4. Name: `fileuploader`
5. Save

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

**Expected output**: "Generated Prisma Client"

### Step 4: Run Database Migrations

```bash
npm run db:migrate
```

When prompted for migration name, press Enter (it will use "init" as default).

**Expected output**: 
- "Applying migration..."
- "Your database is now in sync"

### Step 5: Verify Database Schema (Optional)

Open Prisma Studio to view your database:
```bash
npm run db:studio
```

This opens a browser at http://localhost:5555 where you can see your database tables:
- User
- Session
- Folder
- File
- SharedLink

---

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Expected output**:
```
Server running on port 3000
```

### Access the Application

Open your browser and visit:
```
http://localhost:3000
```

You should see the File Uploader landing page with options to Register or Login.

---

## Verification

### Test 1: Registration
1. Click "Register"
2. Fill in username, email, and password
3. Submit form
4. Should redirect to login page with success message

### Test 2: Login
1. Enter your email and password
2. Click "Login"
3. Should redirect to "My Files" page

### Test 3: Create Folder
1. Click "New Folder"
2. Enter folder name
3. Click "Create"
4. Folder should appear in the list

### Test 4: Upload File
1. Click "Upload File"
2. Select a file (image, PDF, etc.)
3. Click "Upload"
4. File should appear in the files list
5. Click file name to view details

### Test 5: Share Folder
1. Navigate to a folder
2. Click "Share Links"
3. Click "Create New Link"
4. Select duration (e.g., 7d)
5. Click "Create Link"
6. Copy the share link
7. Open in incognito/private window
8. Should see folder contents without login

### Test 6: Download File
1. View file details
2. Click "Download" button
3. File should download from Cloudinary

**If all tests pass**: ✅ Installation successful!

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**:
```bash
rm -rf node_modules package-lock.json  # Delete node_modules
npm install  # Reinstall
```

### Issue: Database connection failed

**Possible causes**:
1. PostgreSQL is not running
   - **Fix**: Start PostgreSQL service
   
2. Wrong credentials in DATABASE_URL
   - **Fix**: Double-check username/password in `.env`
   
3. Database doesn't exist
   - **Fix**: Run `CREATE DATABASE fileuploader;`

**Test connection**:
```bash
psql -U postgres -d fileuploader -c "SELECT 1;"
```

### Issue: Cloudinary upload errors

**Possible causes**:
1. Invalid credentials
   - **Fix**: Verify credentials in Cloudinary dashboard
   
2. Credentials have spaces or special characters
   - **Fix**: Wrap in quotes in `.env`:
     ```env
     CLOUDINARY_API_SECRET="your-secret-here"
     ```

**Test Cloudinary connection**:
Create a test file `test-cloudinary.js`:
```javascript
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected'))
  .catch(err => console.log('❌ Cloudinary error:', err.message));
```
Run: `node test-cloudinary.js`

### Issue: Port 3000 already in use

**Solution 1 - Use different port**:
Add to `.env`:
```env
PORT=3001
```

**Solution 2 - Kill process using port 3000**:

**Windows**:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: Session/Authentication not working

**Solutions**:
1. Clear browser cookies
2. Check SESSION_SECRET is set in `.env`
3. Restart the application
4. Try incognito/private browsing mode

### Issue: Prisma migration errors

**Solution - Reset database** (WARNING: Deletes all data):
```bash
npm run db:reset
```
Then run migrations again:
```bash
npm run db:migrate
```

### Issue: File uploads fail validation

**Check**:
1. File size < 10MB
2. File type is supported (images, PDFs, documents, archives, media)
3. Check browser console for errors

### Getting More Help

1. **Check logs**: Look at terminal/console for error messages
2. **Prisma Studio**: Use `npm run db:studio` to inspect database
3. **Cloudinary Dashboard**: Check usage and errors
4. **Environment**: Run `npm run check-config` to verify setup

---

## Post-Installation Tips

### Recommended VS Code Extensions
- Prisma (syntax highlighting)
- EJS language support
- PostgreSQL (database management)

### Useful Commands

```bash
# Check all environment variables
npm run check-config

# Generate new session secret
npm run generate-secret

# View database in browser
npm run db:studio

# Reset database (deletes data!)
npm run db:reset

# Run development server
npm run dev

# Run production server
npm start
```

### Next Steps

- Customize styling in `public/css/style.css`
- Add more file type validations in `middleware/upload.js`
- Implement additional features from README.md
- Deploy to production (see README.md deployment section)

---

## Quick Reference

### Directory Structure
```
file-uploader/
├── app.js              - Main application entry point
├── config/             - Configuration files
├── middleware/         - Custom middleware
├── prisma/             - Database schema and migrations
├── public/             - Static files (CSS, images)
├── routes/             - Route handlers
├── views/              - EJS templates
├── .env                - Environment variables (DO NOT COMMIT)
├── package.json        - Dependencies and scripts
└── README.md           - Full documentation
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random secret for sessions (32+ chars)
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
- `CLOUDINARY_API_KEY` - From Cloudinary dashboard  
- `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
- `PORT` - Optional, defaults to 3000

### Important URLs
- Application: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Cloudinary Dashboard: https://cloudinary.com/console

---

**Total Installation Time**: 15-20 minutes

**Congratulations! You've successfully installed the File Uploader application!** 🎉
