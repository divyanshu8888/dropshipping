import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Professional Website Design',
    description: 'Custom responsive website design with modern UI/UX principles. Perfect for businesses looking to establish their online presence.',
    price: 299.99,
    category: 'Web Design',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop',
    stock: 50,
  },
  {
    name: 'SEO Optimization Package',
    description: 'Complete SEO audit and optimization for your website. Includes keyword research, on-page optimization, and technical SEO.',
    price: 199.99,
    category: 'Digital Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop',
    stock: 25,
  },
  {
    name: 'Mobile App Development',
    description: 'Native mobile app development for iOS and Android platforms. Includes design, development, and deployment.',
    price: 1299.99,
    category: 'Mobile Development',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop',
    stock: 10,
  },
  {
    name: 'Social Media Marketing Kit',
    description: 'Complete social media marketing package including content creation, posting schedule, and analytics reporting.',
    price: 149.99,
    category: 'Digital Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    stock: 100,
  },
  {
    name: 'E-commerce Setup',
    description: 'Full e-commerce website setup with payment integration, inventory management, and order processing.',
    price: 599.99,
    category: 'Web Development',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
    stock: 15,
  },
  {
    name: 'Content Writing Package',
    description: 'Professional content writing service including blog posts, website copy, and marketing materials.',
    price: 79.99,
    category: 'Content Writing',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&h=300&fit=crop',
    stock: 200,
  },
  {
    name: 'Logo Design Package',
    description: 'Professional logo design with multiple concepts, revisions, and final files in various formats.',
    price: 99.99,
    category: 'Graphic Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    stock: 75,
  },
  {
    name: 'Data Analysis Report',
    description: 'Comprehensive data analysis with insights, visualizations, and actionable recommendations for your business.',
    price: 249.99,
    category: 'Data Analytics',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    stock: 30,
  },
];

async function main() {
  console.log('Seeding products...');
  
  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${product.name}`);
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
