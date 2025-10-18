const bcrypt = require('bcryptjs');

// Replace 'your_password_here' with your actual password
const plainPassword = 'admin123'; // Change this to your desired password
const saltRounds = 12;

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Original password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    console.log('\nSQL INSERT statement:');
    console.log(`INSERT INTO users (email, name, password, role) VALUES ('divyanshu.mishra8@gmail.com', 'dmishra', '${hashedPassword}', 'admin');`);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword();
