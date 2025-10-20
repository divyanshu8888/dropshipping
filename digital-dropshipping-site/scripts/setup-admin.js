const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('🚀 Setting up admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@platform.com',
        name: 'Platform Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@platform.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
