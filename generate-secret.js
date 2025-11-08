const crypto = require('crypto');

// Generate a secure random session secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('\n===========================================');
console.log('Generated Session Secret:');
console.log('===========================================\n');
console.log(secret);
console.log('\n===========================================');
console.log('Add this to your .env file as:');
console.log('SESSION_SECRET="' + secret + '"');
console.log('===========================================\n');
