require('dotenv').config();

console.log('\n========================================');
console.log('File Uploader - Configuration Check');
console.log('========================================\n');

let allGood = true;

// Check DATABASE_URL
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://username:password@localhost:5432/fileuploader') {
  console.log('✅ DATABASE_URL is configured');
} else {
  console.log('❌ DATABASE_URL is not configured or using default value');
  allGood = false;
}

// Check SESSION_SECRET
if (process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'your-secret-key-here-change-this-in-production' && process.env.SESSION_SECRET.length >= 32) {
  console.log('✅ SESSION_SECRET is configured');
} else {
  console.log('❌ SESSION_SECRET is not configured or too short (min 32 chars)');
  allGood = false;
}

// Check CLOUDINARY_CLOUD_NAME
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
  console.log('✅ CLOUDINARY_CLOUD_NAME is configured');
} else {
  console.log('❌ CLOUDINARY_CLOUD_NAME is not configured');
  allGood = false;
}

// Check CLOUDINARY_API_KEY
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your-api-key') {
  console.log('✅ CLOUDINARY_API_KEY is configured');
} else {
  console.log('❌ CLOUDINARY_API_KEY is not configured');
  allGood = false;
}

// Check CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'your-api-secret') {
  console.log('✅ CLOUDINARY_API_SECRET is configured');
} else {
  console.log('❌ CLOUDINARY_API_SECRET is not configured');
  allGood = false;
}

console.log('\n========================================');
if (allGood) {
  console.log('✅ All environment variables are configured!');
  console.log('\nNext steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma migrate dev --name init');
  console.log('3. Run: npm run dev');
} else {
  console.log('❌ Some environment variables are missing or incorrect');
  console.log('\nPlease check your .env file and configure all required variables.');
  console.log('See .env.example for reference.');
}
console.log('========================================\n');
