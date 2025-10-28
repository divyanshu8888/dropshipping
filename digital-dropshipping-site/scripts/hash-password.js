const bcrypt = require('bcryptjs');

// Replace 'your_password_here' with your actual password
const plainPassword = process.argv[2];
if (!plainPassword) {
  console.error('❌ Error: Password is required');
  console.log('Usage: node scripts/hash-password.js YOUR_PASSWORD');
  process.exit(1);
}
const saltRounds = 12;

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Original password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    console.log('\nSQL INSERT statement:');
    console.log(`INSERT INTO users (email, name, password, role) VALUES ('admin@platform.com', 'Admin User', '${hashedPassword}', 'ADMIN');`);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword();
