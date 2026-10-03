import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Never store plaintext or placeholder hashes: hash the seed password with the
// same cost factor the application uses at runtime.
const SEED_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@technova.com',
      passwordHash: SEED_PASSWORD_HASH,
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: SEED_PASSWORD_HASH,
      role: 'CUSTOMER',
    },
  });

  // 2. Create Categories
  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'High-performance laptops for work and gaming',
    },
  });

  const phonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest flagship and mid-range smartphones',
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Essential tech accessories and peripherals',
    },
  });

  // 3. Create Products
  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16" (M3 Max)',
      slug: 'macbook-pro-16-m3-max',
      description: 'The ultimate pro laptop. Mind-blowing performance with the M3 Max chip, amazing battery life, and a brilliant Liquid Retina XDR display.',
      brand: 'Apple',
      price: 3499.00,
      discount: 0,
      stock: 50,
      rating: 4.9,
      reviewCount: 124,
      categoryId: laptopsCategory.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000', altText: 'MacBook Pro Front', sortOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=1000', altText: 'MacBook Pro Side', sortOrder: 2 },
        ]
      },
      specs: {
        create: [
          { key: 'Processor', value: 'Apple M3 Max' },
          { key: 'RAM', value: '36GB Unified Memory' },
          { key: 'Storage', value: '1TB SSD' },
          { key: 'Display', value: '16.2-inch Liquid Retina XDR' },
          { key: 'GPU', value: 'Apple 30-core GPU' },
          { key: 'Battery', value: 'Up to 22 hours' },
        ]
      }
    }
  });

  const xps = await prisma.product.create({
    data: {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Power your passions with the premium Dell XPS 15. Featuring a stunning OLED display and powerful Intel Core processors.',
      brand: 'Dell',
      price: 1899.99,
      discount: 10.00,
      stock: 35,
      rating: 4.7,
      reviewCount: 89,
      categoryId: laptopsCategory.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1000', altText: 'Dell XPS 15 Open', sortOrder: 1 },
        ]
      },
      specs: {
        create: [
          { key: 'Processor', value: 'Intel Core i9-13900H' },
          { key: 'RAM', value: '32GB DDR5' },
          { key: 'Storage', value: '1TB PCIe 4.0 SSD' },
          { key: 'Display', value: '15.6" 3.5K OLED Touch' },
          { key: 'GPU', value: 'NVIDIA GeForce RTX 4070' },
          { key: 'Battery', value: 'Up to 13 hours' },
        ]
      }
    }
  });

  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
      brand: 'Apple',
      price: 1199.00,
      discount: 0,
      stock: 120,
      rating: 4.8,
      reviewCount: 342,
      categoryId: phonesCategory.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000', altText: 'iPhone 15 Pro Max Titanium', sortOrder: 1 },
        ]
      },
      specs: {
        create: [
          { key: 'Chip', value: 'A17 Pro' },
          { key: 'Storage', value: '256GB' },
          { key: 'Display', value: '6.7" Super Retina XDR' },
          { key: 'Material', value: 'Titanium' },
          { key: 'GPU', value: 'Apple A17 Pro GPU' },
          { key: 'Battery', value: 'Up to 29 hours video' },
        ]
      }
    }
  });

  const s24 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
      brand: 'Samsung',
      price: 1299.99,
      discount: 12.00,
      stock: 85,
      rating: 4.9,
      reviewCount: 215,
      categoryId: phonesCategory.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1000', altText: 'Galaxy S24 Ultra Front and Pen', sortOrder: 1 },
        ]
      },
      specs: {
        create: [
          { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { key: 'RAM', value: '12GB' },
          { key: 'Storage', value: '512GB' },
          { key: 'Camera', value: '200MP Main, 50MP 5x Zoom' },
          { key: 'GPU', value: 'Adreno 750' },
          { key: 'Battery', value: 'Up to 30 hours' },
        ]
      }
    }
  });

  const headphones = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise cancellation, exceptional sound quality, and all-day comfort. The perfect headphones for travel and focus.',
      brand: 'Sony',
      price: 398.00,
      discount: 15.00,
      stock: 200,
      rating: 4.8,
      reviewCount: 521,
      categoryId: accessoriesCategory.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000', altText: 'Sony Headphones Black', sortOrder: 1 },
        ]
      },
      specs: {
        create: [
          { key: 'Type', value: 'Over-ear Wireless' },
          { key: 'Noise Cancelling', value: 'Active (ANC)' },
          { key: 'Battery Life', value: 'Up to 30 hours' },
          { key: 'Bluetooth', value: 'Version 5.2' },
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
