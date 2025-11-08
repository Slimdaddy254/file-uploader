# File Uploader - Cloud Storage Application

A full-featured file storage application similar to Google Drive, built with Express.js, Prisma, and Cloudinary. Features include folder management, file uploads, authentication, and shareable links with expiration.
<img width="1919" height="898" alt="image" src="https://github.com/user-attachments/assets/4abb0510-6fe7-4714-a6f7-83912df0096c" />


## Features

### Core Features
- ✅ **User Authentication**: Session-based authentication using Passport.js with local strategy
- ✅ **Folder Management**: Create, read, update, and delete folders with nested hierarchy
- ✅ **File Upload**: Upload files with validation (type and size restrictions)
- ✅ **Cloud Storage**: Files stored securely on Cloudinary
- ✅ **File Details**: View file information including name, size, type, and upload date
- ✅ **Download Files**: Download uploaded files from cloud storage
- ✅ **Persistent Sessions**: Sessions stored in PostgreSQL using Prisma

### Extra Features
- ✅ **Share Folders**: Generate shareable links for folders with custom expiration (1d, 7d, 30d, etc.)
- ✅ **Public Access**: Unauthenticated users can view shared folders via links
- ✅ **Link Management**: View and delete share links for folders
- ✅ **File Validation**: Restrict file types and size (max 10MB)

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js (Local Strategy)
- **Session Store**: Prisma Session Store
- **File Upload**: Multer middleware
- **Cloud Storage**: Cloudinary
- **View Engine**: EJS
- **Styling**: Bootstrap 5 + Bootstrap Icons
- **Validation**: Express Validator

## Project Structure

```
file-uploader/
├── config/
│   ├── cloudinary.js       # Cloudinary configuration
│   └── passport.js          # Passport authentication strategy
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # Multer file upload configuration
├── prisma/
│   └── schema.prisma        # Database schema
├── public/
│   └── css/
│       └── style.css        # Custom styles
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── files.js             # File management routes
│   ├── folders.js           # Folder management routes
│   └── share.js             # Share link routes
├── views/
│   ├── auth/
│   │   ├── login.ejs        # Login page
│   │   └── register.ejs     # Registration page
│   ├── files/
│   │   ├── details.ejs      # File details page
│   │   └── upload.ejs       # File upload page
│   ├── folders/
│   │   ├── edit.ejs         # Edit folder page
│   │   └── index.ejs        # Folder listing page
│   ├── share/
│   │   ├── created.ejs      # Share link created confirmation
│   │   ├── list.ejs         # List of share links
│   │   └── view.ejs         # Public shared folder view
│   ├── 404.ejs              # 404 error page
│   ├── error.ejs            # Error page
│   ├── index.ejs            # Landing page
│   └── layout.ejs           # Main layout template
├── .env.example             # Environment variables template
├── .gitignore
├── app.js                   # Main application file
└── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Cloudinary account (free tier available)

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd file-uploader

# Install dependencies
npm install
```

### Step 2: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE fileuploader;
```

2. Copy `.env.example` to `.env`:
```bash
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac
```

3. Update `.env` with your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fileuploader"
SESSION_SECRET="your-secret-key-here-change-this-in-production"
```

### Step 3: Cloudinary Setup

1. Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 5: Run the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Usage Guide

### 1. Register & Login
- Visit `http://localhost:3000`
- Click "Register" to create an account
- Login with your credentials

### 2. Manage Folders
- Click "New Folder" to create a folder
- Click on a folder to navigate into it
- Use the three-dot menu to rename or delete folders
- Breadcrumb navigation shows your current location

### 3. Upload Files
- Click "Upload File" button
- Select a file (max 10MB)
- Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR, MP4, MP3, MOV
- Files are uploaded to Cloudinary

### 4. Manage Files
- Click on a file name to view details
- Download files using the download button
- Delete files when no longer needed

### 5. Share Folders
- Navigate to a folder
- Click "Share Links" button
- Click "Create New Link"
- Select expiration duration (1d, 7d, 14d, 30d, 90d)
- Copy and share the generated link
- Anyone with the link can view/download files (even without login)

## Database Schema

### User
- id, email, username, password
- Relations: folders, files

### Session
- id, sid, data, expiresAt
- Stores user sessions

### Folder
- id, name, userId, parentId
- Relations: user, parent, subfolders, files, sharedLinks
- Supports nested folder hierarchy

### File
- id, name, originalName, size, mimeType, url, publicId, folderId, userId
- Relations: user, folder
- Stores Cloudinary URL and public ID

### SharedLink
- id, token, folderId, expiresAt
- Relations: folder
- Enables public folder sharing

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- Session-based authentication
- Protected routes with authentication middleware
- File type validation
- File size restrictions (10MB max)
- CSRF protection via sessions
- Input validation with express-validator

## File Validation

**Allowed File Types:**
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT
- Archives: ZIP, RAR
- Media: MP4, MP3, MOV

**Restrictions:**
- Maximum file size: 10 MB
- Validated by both MIME type and file extension

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Session
SESSION_SECRET="random-secret-key-min-32-characters"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server (optional)
PORT=3000
```

## API Routes

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Login handler
- `GET /auth/register` - Registration page
- `POST /auth/register` - Registration handler
- `GET /auth/logout` - Logout handler

### Folders
- `GET /folders` - List folders and files
- `POST /folders` - Create new folder
- `GET /folders/:id/edit` - Edit folder page
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Files
- `GET /files/upload` - Upload page
- `POST /files/upload` - Upload file
- `GET /files/:id` - File details
- `GET /files/:id/download` - Download file
- `DELETE /files/:id` - Delete file

### Share Links
- `POST /share/:folderId` - Create share link
- `GET /share/:token` - View shared folder (public)
- `GET /share/folder/:folderId/links` - List share links
- `DELETE /share/:id` - Delete share link

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

## Deployment Considerations

1. **Environment Variables**: Set all required env vars on hosting platform
2. **Database**: Use hosted PostgreSQL (e.g., Heroku Postgres, Railway, Supabase)
3. **Session Secret**: Generate a strong random secret
4. **Cloudinary**: Free tier supports up to 25GB storage
5. **File Cleanup**: Consider implementing cleanup for deleted files on Cloudinary

## Future Enhancements

- [ ] File search functionality
- [ ] User storage quota management
- [ ] File versioning
- [ ] Trash/recycle bin
- [ ] Multiple file upload
- [ ] Drag & drop upload interface
- [ ] File preview for more formats
- [ ] Share individual files (not just folders)
- [ ] Password-protected share links
- [ ] Activity logs
- [ ] Email notifications

## License

ISC

## Author

Built as part of The Odin Project curriculum

---

**Note**: This is a learning project. For production use, consider additional security measures, error handling, and performance optimizations.


