// @ts-ignore - PrismaClient is generated at runtime
// import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// In-memory Prisma mock
// ---------------------------------------------------------------------------
// This workspace has no provisioned PostgreSQL database and the Prisma client
// has not been generated, so this client emulates the subset of the Prisma API
// that the API server uses. To switch to a real database:
//   1. Uncomment the PrismaClient import above and delete the mock below.
//   2. Provide DATABASE_URL in server/.env
//   3. Run `npx prisma generate` and `npx prisma migrate dev`
//
// Seeded accounts (password for all: "password123"):
//   admin@technova.com -> ADMIN
//   john@example.com   -> CUSTOMER
// ---------------------------------------------------------------------------

const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: Date;
}

interface SeedUser extends MockUser {
  orderCount: number;
}

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const seedUsers: SeedUser[] = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Admin User',      email: 'admin@technova.com',           passwordHash: PASSWORD_HASH, role: 'ADMIN',    createdAt: daysAgo(180), orderCount: 0 },
  { id: '00000000-0000-4000-8000-000000000002', name: 'John Doe',        email: 'john@example.com',             passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(150), orderCount: 3 },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Priya Sharma',    email: 'priya.sharma@example.com',     passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(130), orderCount: 5 },
  { id: '00000000-0000-4000-8000-000000000004', name: 'Michael Chen',    email: 'michael.chen@example.com',     passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(110), orderCount: 2 },
  { id: '00000000-0000-4000-8000-000000000005', name: 'Sarah Williams',  email: 'sarah.williams@example.com',   passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(95),  orderCount: 4 },
  { id: '00000000-0000-4000-8000-000000000006', name: 'David Brown',     email: 'david.brown@example.com',      passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(80),  orderCount: 1 },
  { id: '00000000-0000-4000-8000-000000000007', name: 'Emily Davis',     email: 'emily.davis@example.com',      passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(65),  orderCount: 0 },
  { id: '00000000-0000-4000-8000-000000000008', name: 'James Wilson',    email: 'james.wilson@example.com',     passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(50),  orderCount: 6 },
  { id: '00000000-0000-4000-8000-000000000009', name: 'Aisha Khan',      email: 'aisha.khan@example.com',       passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(35),  orderCount: 2 },
  { id: '00000000-0000-4000-8000-000000000010', name: 'Robert Garcia',   email: 'robert.garcia@example.com',    passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(25),  orderCount: 0 },
  { id: '00000000-0000-4000-8000-000000000011', name: 'Laura Martinez',  email: 'laura.martinez@example.com',   passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(18),  orderCount: 1 },
  { id: '00000000-0000-4000-8000-000000000012', name: 'Daniel Lee',      email: 'daniel.lee@example.com',       passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(10),  orderCount: 3 },
  { id: '00000000-0000-4000-8000-000000000013', name: 'Sophia Patel',    email: 'sophia.patel@example.com',     passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(6),   orderCount: 0 },
  { id: '00000000-0000-4000-8000-000000000014', name: 'Kevin Nguyen',    email: 'kevin.nguyen@example.com',     passwordHash: PASSWORD_HASH, role: 'CUSTOMER', createdAt: daysAgo(2),   orderCount: 1 },
];

const users: MockUser[] = seedUsers.map(({ orderCount: _orderCount, ...user }) => ({ ...user }));

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

let orderSequence = 1;

const orders = seedUsers
  .filter((user) => user.role === 'CUSTOMER')
  .flatMap((user, userIndex) =>
    Array.from({ length: user.orderCount }, (_, i) => {
      const createdAt = daysAgo(userIndex * 3 + i * 5 + 1);
      return {
        // UUID-shaped ids so the order routes' uuid param validation accepts them.
        id: `30000000-0000-4000-8000-${String(orderSequence++).padStart(12, '0')}`,
        userId: user.id,
        totalAmount: 999 + i * 250 + userIndex * 37,
        shippingAddress: '123 Mock Street, Demo City',
        paymentMethod: 'CARD',
        paymentStatus: 'SIMULATED',
        orderStatus: ORDER_STATUSES[(userIndex + i) % ORDER_STATUSES.length],
        createdAt,
        updatedAt: createdAt,
      };
    })
  );

// ----------------------------- Catalog fixtures -----------------------------

interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
}

interface MockProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface MockProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
}

const categories: MockCategory[] = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Laptops',     slug: 'laptops',     description: 'High-performance laptops for work and gaming' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Smartphones', slug: 'smartphones', description: 'Latest flagship and mid-range smartphones' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Accessories', slug: 'accessories', description: 'Essential tech accessories and peripherals' },
];

const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));

const products: MockProduct[] = [];
const productImages: MockProductImage[] = [];
const productSpecifications: MockProductSpecification[] = [];

const unsplash = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1000`;

const seedProducts = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'MacBook Pro 16" (M3 Max)',
    slug: 'macbook-pro-16-m3-max',
    description: 'The ultimate pro laptop. Mind-blowing performance with the M3 Max chip, amazing battery life, and a brilliant Liquid Retina XDR display.',
    brand: 'Apple', price: 3499, discount: 0, stock: 50, rating: 4.9, reviewCount: 124, categorySlug: 'laptops', createdDaysAgo: 40,
    images: [{ id: '1517336714731-489689fd1ca8', altText: 'MacBook Pro Front' }, { id: '1611186871348-b1ce696e52c9', altText: 'MacBook Pro Side' }],
    specs: [{ key: 'Processor', value: 'Apple M3 Max' }, { key: 'RAM', value: '36GB Unified Memory' }, { key: 'Storage', value: '1TB SSD' }, { key: 'Display', value: '16.2-inch Liquid Retina XDR' }, { key: 'GPU', value: 'Apple 30-core GPU' }, { key: 'Battery', value: 'Up to 22 hours' }],
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    description: 'Power your passions with the premium Dell XPS 15. Featuring a stunning OLED display and powerful Intel Core processors.',
    brand: 'Dell', price: 1899.99, discount: 10, stock: 35, rating: 4.7, reviewCount: 89, categorySlug: 'laptops', createdDaysAgo: 30,
    images: [{ id: '1593642632823-8f785ba67e45', altText: 'Dell XPS 15 Open' }],
    specs: [{ key: 'Processor', value: 'Intel Core i9-13900H' }, { key: 'RAM', value: '32GB DDR5' }, { key: 'Storage', value: '1TB PCIe 4.0 SSD' }, { key: 'Display', value: '15.6" 3.5K OLED Touch' }, { key: 'GPU', value: 'NVIDIA GeForce RTX 4070' }, { key: 'Battery', value: 'Up to 13 hours' }],
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
    brand: 'Apple', price: 1199, discount: 0, stock: 120, rating: 4.8, reviewCount: 342, categorySlug: 'smartphones', createdDaysAgo: 20,
    images: [{ id: '1695048133142-1a20484d2569', altText: 'iPhone 15 Pro Max Titanium' }],
    specs: [{ key: 'Chip', value: 'A17 Pro' }, { key: 'Storage', value: '256GB' }, { key: 'Display', value: '6.7" Super Retina XDR' }, { key: 'Material', value: 'Titanium' }, { key: 'GPU', value: 'Apple A17 Pro GPU' }, { key: 'Battery', value: 'Up to 29 hours video' }],
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    brand: 'Samsung', price: 1299.99, discount: 12, stock: 85, rating: 4.9, reviewCount: 215, categorySlug: 'smartphones', createdDaysAgo: 10,
    images: [{ id: '1610945415295-d9bbf067e59c', altText: 'Galaxy S24 Ultra Front and Pen' }],
    specs: [{ key: 'Processor', value: 'Snapdragon 8 Gen 3' }, { key: 'RAM', value: '12GB' }, { key: 'Storage', value: '512GB' }, { key: 'Camera', value: '200MP Main, 50MP 5x Zoom' }, { key: 'GPU', value: 'Adreno 750' }, { key: 'Battery', value: 'Up to 30 hours' }],
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise cancellation, exceptional sound quality, and all-day comfort. The perfect headphones for travel and focus.',
    brand: 'Sony', price: 398, discount: 15, stock: 200, rating: 4.8, reviewCount: 521, categorySlug: 'accessories', createdDaysAgo: 5,
    images: [{ id: '1618366712010-f4ae9c647dcb', altText: 'Sony Headphones Black' }],
    specs: [{ key: 'Type', value: 'Over-ear Wireless' }, { key: 'Noise Cancelling', value: 'Active (ANC)' }, { key: 'Battery Life', value: 'Up to 30 hours' }, { key: 'Bluetooth', value: 'Version 5.2' }],
  },
];

seedProducts.forEach((seed) => {
  const createdAt = daysAgo(seed.createdDaysAgo);
  products.push({
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    brand: seed.brand,
    price: seed.price,
    discount: seed.discount,
    stock: seed.stock,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    createdAt,
    updatedAt: createdAt,
    categoryId: categoryIdBySlug.get(seed.categorySlug) ?? categories[0].id,
  });
  seed.images.forEach((image, index) => {
    productImages.push({ id: randomUUID(), productId: seed.id, url: unsplash(image.id), altText: image.altText, sortOrder: index + 1 });
  });
  seed.specs.forEach((spec) => {
    productSpecifications.push({ id: randomUUID(), productId: seed.id, key: spec.key, value: spec.value });
  });
});

const productMatchesWhere = (product: MockProduct, where: any = {}): boolean => {
  if (where.id && product.id !== where.id) return false;
  if (where.slug && product.slug !== where.slug) return false;
  if (where.brand && product.brand !== where.brand) return false;

  if (where.category?.slug) {
    const category = categories.find((candidate) => candidate.id === product.categoryId);
    if (!category || category.slug !== where.category.slug) return false;
  }
  if (where.price) {
    if (where.price.gte != null && product.price < Number(where.price.gte)) return false;
    if (where.price.lte != null && product.price > Number(where.price.lte)) return false;
  }
  if (where.rating?.gte != null && product.rating < Number(where.rating.gte)) return false;
  if (where.stock) {
    if (where.stock.lte != null && product.stock > Number(where.stock.lte)) return false;
    if (where.stock.gte != null && product.stock < Number(where.stock.gte)) return false;
  }

  if (Array.isArray(where.OR) && where.OR.length > 0) {
    const matches = where.OR.some((condition: any) =>
      Object.entries(condition).some(([field, filter]: [string, any]) => {
        const value = (product as any)[field];
        if (typeof value !== 'string') return false;
        const needle = String(filter?.contains ?? '');
        return filter?.mode === 'insensitive'
          ? value.toLowerCase().includes(needle.toLowerCase())
          : value.includes(needle);
      })
    );
    if (!matches) return false;
  }

  return true;
};

const productRelations = (product: MockProduct, args: any = {}) => {
  if (args.select) {
    const selected: any = {};
    for (const [key, enabled] of Object.entries(args.select)) {
      if (!enabled) continue;
      if (key === 'images') {
        const images = productImages
          .filter((image) => image.productId === product.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        selected.images = (enabled as any).take ? images.slice(0, Number((enabled as any).take)) : images;
      } else if (key === 'category') {
        selected.category = categories.find((category) => category.id === product.categoryId) ?? null;
      } else if (key === 'specs' || key === 'specifications') {
        selected[key] = productSpecifications.filter((spec) => spec.productId === product.id);
      } else {
        selected[key] = (product as any)[key];
      }
    }
    return selected;
  }

  const result: any = { ...product };
  const include = args.include || {};
  if (include.category) result.category = categories.find((category) => category.id === product.categoryId) ?? null;
  if (include.images) {
    const images = productImages
      .filter((image) => image.productId === product.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    result.images = include.images.take ? images.slice(0, Number(include.images.take)) : images;
  }
  if (include.specs) result.specs = productSpecifications.filter((spec) => spec.productId === product.id);
  if (include.specifications) result.specifications = productSpecifications.filter((spec) => spec.productId === product.id);
  if (include.reviews) result.reviews = [];
  return result;
};

const userMatchesWhere = (user: MockUser, where: any = {}): boolean => {
  if (where.id && user.id !== where.id) return false;
  if (where.email && user.email !== where.email) return false;
  if (where.role && user.role !== where.role) return false;

  if (Array.isArray(where.OR) && where.OR.length > 0) {
    const matches = where.OR.some((condition: any) =>
      Object.entries(condition).some(([field, filter]: [string, any]) => {
        const value = (user as any)[field];
        if (typeof value !== 'string') return false;
        const needle = String(filter?.contains ?? '');
        return filter?.mode === 'insensitive'
          ? value.toLowerCase().includes(needle.toLowerCase())
          : value.includes(needle);
      })
    );
    if (!matches) return false;
  }

  return true;
};

const orderCountFor = (userId: string): number => orders.filter((order) => order.userId === userId).length;

const selectUser = (user: MockUser, select?: any) => {
  if (!select) return { ...user };

  const result: any = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (!enabled) continue;
    if (key === '_count') {
      const countSelect = (enabled as any).select || {};
      result._count = {};
      if (countSelect.orders) result._count.orders = orderCountFor(user.id);
    } else {
      result[key] = (user as any)[key];
    }
  }
  return result;
};

const orderMatchesWhere = (order: any, where: any = {}): boolean => {
  if (where.id && order.id !== where.id) return false;
  if (where.userId && order.userId !== where.userId) return false;
  if (where.orderStatus && order.orderStatus !== where.orderStatus) return false;
  if (where.paymentStatus) {
    if (typeof where.paymentStatus === 'string' && order.paymentStatus !== where.paymentStatus) return false;
    if (where.paymentStatus.not && order.paymentStatus === where.paymentStatus.not) return false;
  }
  if (where.createdAt) {
    if (where.createdAt.gte && order.createdAt.getTime() < new Date(where.createdAt.gte).getTime()) return false;
    if (where.createdAt.lte && order.createdAt.getTime() > new Date(where.createdAt.lte).getTime()) return false;
  }
  if (where.user) {
    const user = userById(order.userId);
    if (!user) return false;
    const search = where.user.OR?.[0]?.name?.contains;
    if (search) {
      const needle = String(search).toLowerCase();
      if (!user.name.toLowerCase().includes(needle) && !user.email.toLowerCase().includes(needle)) return false;
    }
  }
  return true;
};

// ------------------------- Cart / wishlist / review --------------------------
// These live in mutable arrays so ownership checks and business rules (stock,
// duplicates) behave like the real database would.

interface MockCart {
  id: string;
  userId: string;
}

interface MockCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
}

interface MockWishlistItem {
  id: string;
  userId: string;
  productId: string;
}

interface MockReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

interface MockOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const carts: MockCart[] = [];
const cartItems: MockCartItem[] = [];
const wishlistItems: MockWishlistItem[] = [];
const reviews: MockReview[] = [];
const orderItems: MockOrderItem[] = [];

// Every seeded order needs order items so reviews and order detail views have
// real rows to read.
orders.forEach((order, index) => {
  const product = products[index % products.length];
  orderItems.push({
    id: randomUUID(),
    orderId: order.id,
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: 1,
  });
});

const userById = (id: string): MockUser | undefined => users.find((user) => user.id === id);
const productById = (id: string): MockProduct | undefined => products.find((product) => product.id === id);

const orderItemsFor = (orderId: string) =>
  orderItems
    .filter((item) => item.orderId === orderId)
    .map((item) => ({
      ...item,
      product: productById(item.productId)
        ? productRelations(productById(item.productId) as MockProduct, {
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
          })
        : null,
    }));

const cartWithItems = (cart: MockCart) => ({
  ...cart,
  items: cartItems
    .filter((item) => item.cartId === cart.id)
    .map((item) => ({
      ...item,
      product: productById(item.productId) ? productRelations(productById(item.productId) as MockProduct, { include: { images: true } }) : null,
    })),
});

const userSelectFor = (user: MockUser, select?: any) => {
  if (!select) return { ...user };
  const result: any = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) result[key] = (user as any)[key];
  }
  return result;
};

const clearCartItems = (cartId: string) => {
  for (let i = cartItems.length - 1; i >= 0; i--) {
    if (cartItems[i].cartId === cartId) cartItems.splice(i, 1);
  }
};

class MockPrismaClient {
  async $queryRaw() {
    return [{ 1: 1 }];
  }

  // Minimal interactive transaction support: the callback receives this client.
  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn(this);
  }

  user = {
    findUnique: async ({ where, select }: any = {}) => {
      const user = users.find((candidate) => userMatchesWhere(candidate, where));
      return user ? selectUser(user, select) : null;
    },
    findMany: async (args: any = {}) => {
      let result = users.filter((user) => userMatchesWhere(user, args.where));
      const createdAtDir = args.orderBy?.createdAt;
      if (createdAtDir) {
        result = [...result].sort((a, b) =>
          createdAtDir === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime()
        );
      }
      if (typeof args.skip === 'number') result = result.slice(args.skip);
      if (typeof args.take === 'number') result = result.slice(0, args.take);
      return result.map((user) => selectUser(user, args.select));
    },
    count: async (args: any = {}) => users.filter((user) => userMatchesWhere(user, args.where)).length,
    create: async ({ data, select }: any) => {
      const user: MockUser = {
        id: randomUUID(),
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'CUSTOMER',
        createdAt: new Date(),
      };
      users.push(user);
      return selectUser(user, select);
    },
    update: async ({ where, data, select }: any) => {
      const index = users.findIndex((user) => userMatchesWhere(user, where));
      if (index === -1) throw new Error('User not found');
      users[index] = { ...users[index], ...data };
      return selectUser(users[index], select);
    },
  };

  cart = {
    findUnique: async ({ where, include }: any = {}) => {
      const cart = carts.find((candidate) => (where?.userId && candidate.userId === where.userId) || (where?.id && candidate.id === where.id));
      return cart ? cartWithItems(cart) : null;
    },
    create: async ({ data }: any) => {
      const cart: MockCart = { id: randomUUID(), userId: data.userId };
      carts.push(cart);
      return cartWithItems(cart);
    },
    upsert: async ({ where, create }: any) => {
      const existing = carts.find((candidate) => candidate.userId === where.userId);
      if (existing) return cartWithItems(existing);
      const cart: MockCart = { id: randomUUID(), userId: create.userId };
      carts.push(cart);
      return cartWithItems(cart);
    },
  };

  cartItem = {
    findUnique: async ({ where }: any = {}) => {
      const item = cartItems.find(
        (candidate) =>
          (where?.id && candidate.id === where.id) ||
          (where?.cartId_productId && candidate.cartId === where.cartId_productId.cartId && candidate.productId === where.cartId_productId.productId)
      );
      if (!item) return null;
      const cart = carts.find((candidate) => candidate.id === item.cartId);
      return { ...item, cart, product: productById(item.productId) ?? null };
    },
    create: async ({ data }: any) => {
      const item: MockCartItem = { id: randomUUID(), cartId: data.cartId, productId: data.productId, quantity: data.quantity };
      cartItems.push(item);
      return item;
    },
    update: async ({ where, data }: any) => {
      const item = cartItems.find((candidate) => candidate.id === where.id);
      if (!item) throw new Error('Cart item not found');
      item.quantity = data.quantity;
      return item;
    },
    delete: async ({ where }: any = {}) => {
      const index = cartItems.findIndex((candidate) => candidate.id === where.id);
      if (index === -1) throw new Error('Cart item not found');
      return cartItems.splice(index, 1)[0];
    },
    deleteMany: async ({ where }: any = {}) => {
      const before = cartItems.length;
      for (let i = cartItems.length - 1; i >= 0; i--) {
        if (!where?.cartId || cartItems[i].cartId === where.cartId) cartItems.splice(i, 1);
      }
      return { count: before - cartItems.length };
    },
  };

  wishlist = {
    findMany: async ({ where }: any = {}) =>
      wishlistItems
        .filter((item) => !where?.userId || item.userId === where.userId)
        .map((item) => ({
          ...item,
          product: productById(item.productId)
            ? productRelations(productById(item.productId) as MockProduct, { include: { images: true, category: true } })
            : null,
        })),
    findUnique: async ({ where }: any = {}) => {
      const key = where?.userId_productId;
      if (!key) return null;
      return wishlistItems.find((item) => item.userId === key.userId && item.productId === key.productId) ?? null;
    },
    create: async ({ data }: any) => {
      const item: MockWishlistItem = { id: randomUUID(), userId: data.userId, productId: data.productId };
      wishlistItems.push(item);
      return item;
    },
    delete: async ({ where }: any = {}) => {
      const key = where.userId_productId;
      const index = wishlistItems.findIndex((item) => item.userId === key.userId && item.productId === key.productId);
      if (index === -1) throw new Error('Wishlist item not found');
      return wishlistItems.splice(index, 1)[0];
    },
  };

  review = {
    findUnique: async ({ where }: any = {}) => {
      const key = where?.userId_productId;
      if (!key) return null;
      return reviews.find((review) => review.userId === key.userId && review.productId === key.productId) ?? null;
    },
    findMany: async ({ where }: any = {}) =>
      reviews
        .filter((review) => !where?.productId || review.productId === where.productId)
        .map((review) => ({ ...review, user: userById(review.userId) ? userSelectFor(userById(review.userId) as MockUser, { name: true, id: true }) : null })),
    create: async ({ data, include }: any) => {
      const review: MockReview = {
        id: randomUUID(),
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment ?? null,
        createdAt: new Date(),
      };
      reviews.push(review);
      const user = userById(review.userId);
      return {
        ...review,
        user: include?.user?.select && user ? userSelectFor(user, include.user.select) : undefined,
      };
    },
    aggregate: async ({ where }: any = {}) => {
      const matching = reviews.filter((review) => !where?.productId || review.productId === where.productId);
      const average = matching.length ? matching.reduce((sum, review) => sum + review.rating, 0) / matching.length : 0;
      return { _avg: { rating: average }, _count: { rating: matching.length } };
    },
  };

  orderItem = {
    findFirst: async ({ where }: any = {}) => {
      const match = orderItems.find((item) => {
        if (where?.productId && item.productId !== where.productId) return false;
        const order = orders.find((candidate) => candidate.id === item.orderId);
        if (!order) return false;
        if (where?.order?.userId && order.userId !== where.order.userId) return false;
        return true;
      });
      return match ?? null;
    },
    findMany: async ({ where }: any = {}) =>
      orderItems
        .filter((item) => !where?.orderId || item.orderId === where.orderId)
        .map((item) => ({ ...item, product: productById(item.productId) ?? null })),
    create: async ({ data }: any) => {
      const item: MockOrderItem = {
        id: randomUUID(),
        orderId: data.orderId,
        productId: data.productId,
        productName: data.productName,
        price: Number(data.price),
        quantity: data.quantity,
      };
      orderItems.push(item);
      return item;
    },
    createMany: async ({ data }: any) => {
      const rows = Array.isArray(data) ? data : [data];
      rows.forEach((row: any) => {
        orderItems.push({
          id: randomUUID(),
          orderId: row.orderId,
          productId: row.productId,
          productName: row.productName,
          price: Number(row.price),
          quantity: row.quantity,
        });
      });
      return { count: rows.length };
    },
  };

  order = {
    count: async (args: any = {}) => orders.filter((order) => orderMatchesWhere(order, args.where)).length,
    findMany: async (args: any = {}) => {
      let result = orders.filter((order) => orderMatchesWhere(order, args.where));
      const createdAtDir = args.orderBy?.createdAt;
      if (createdAtDir) {
        result = [...result].sort((a, b) =>
          createdAtDir === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime()
        );
      }
      if (typeof args.skip === 'number') result = result.slice(args.skip);
      if (typeof args.take === 'number') result = result.slice(0, args.take);
      return result.map((order) => {
        const row: any = { ...order };
        if (args.include?.user) {
          const user = users.find((candidate) => candidate.id === order.userId);
          if (user) row.user = selectUser(user, args.include.user.select);
        }
        if (args.include?.items) row.items = orderItemsFor(order.id);
        return row;
      });
    },
    findUnique: async ({ where, include }: any = {}) => {
      const order = orders.find((candidate) => orderMatchesWhere(candidate, where));
      if (!order) return null;
      const row: any = { ...order };
      if (include?.user) {
        const user = users.find((candidate) => candidate.id === order.userId);
        if (user) row.user = selectUser(user, include.user.select);
      }
      if (include?.items) row.items = orderItemsFor(order.id);
      return row;
    },
    create: async ({ data, include }: any = {}) => {
      const now = new Date();
      const order: any = {
        id: randomUUID(),
        userId: data.userId,
        totalAmount: Number(data.totalAmount ?? 0),
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus ?? 'SIMULATED',
        orderStatus: data.orderStatus ?? 'CONFIRMED',
        createdAt: now,
        updatedAt: now,
      };
      orders.push(order);
      (data.items?.create ?? []).forEach((item: any) => {
        orderItems.push({
          id: randomUUID(),
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          price: Number(item.price),
          quantity: item.quantity,
        });
      });
      const row: any = { ...order };
      if (include?.items) row.items = orderItemsFor(order.id);
      return row;
    },
    update: async ({ where, data, include }: any = {}) => {
      const order = orders.find((candidate) => orderMatchesWhere(candidate, where));
      if (!order) throw new Error('Order not found');
      Object.assign(order, data, { updatedAt: new Date() });
      const row: any = { ...order };
      if (include?.items) row.items = orderItemsFor(order.id);
      return row;
    },
    aggregate: async (args: any = {}) => {
      const result: any = {};
      if (args._sum) {
        result._sum = {};
        const filtered = orders.filter((order) => orderMatchesWhere(order, args.where));
        if (args._sum.totalAmount) {
          result._sum.totalAmount = filtered.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        }
      }
      if (args._count) {
        result._count = orders.filter((order) => orderMatchesWhere(order, args.where)).length;
      }
      return result;
    },
  };

  category = {
    findMany: async (args: any = {}) => {
      let result = [...categories];
      const nameDir = args.orderBy?.name;
      if (nameDir) {
        result = result.sort((a, b) =>
          nameDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
      }
      return result.map((category) =>
        args.include?._count?.select?.products
          ? { ...category, _count: { products: products.filter((product) => product.categoryId === category.id).length } }
          : { ...category }
      );
    },
    findUnique: async ({ where, include }: any = {}) => {
      const category = categories.find(
        (candidate) => (where?.id && candidate.id === where.id) || (where?.slug && candidate.slug === where.slug)
      );
      if (!category) return null;
      return include?._count?.select?.products
        ? { ...category, _count: { products: products.filter((product) => product.categoryId === category.id).length } }
        : { ...category };
    },
  };

  product = {
    findMany: async (args: any = {}) => {
      let result = products.filter((product) => productMatchesWhere(product, args.where));
      const [field, direction] = Object.entries(args.orderBy || {})[0] ?? [];
      if (field) {
        result = [...result].sort((a: any, b: any) => {
          const left = a[field];
          const right = b[field];
          const comparison = typeof left === 'string' ? left.localeCompare(right) : Number(left) - Number(right);
          return direction === 'desc' ? -comparison : comparison;
        });
      }
      if (typeof args.skip === 'number') result = result.slice(args.skip);
      if (typeof args.take === 'number') result = result.slice(0, args.take);
      return result.map((product) => productRelations(product, args));
    },
    findUnique: async ({ where, include, select }: any = {}) => {
      const product = products.find(
        (candidate) => (where?.id && candidate.id === where.id) || (where?.slug && candidate.slug === where.slug)
      );
      return product ? productRelations(product, { include, select }) : null;
    },
    count: async (args: any = {}) => products.filter((product) => productMatchesWhere(product, args.where)).length,
    create: async ({ data, include }: any) => {
      const { images, specs, ...rest } = data;
      const now = new Date();
      const product: MockProduct = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        name: rest.name,
        slug: rest.slug,
        description: rest.description,
        brand: rest.brand,
        price: Number(rest.price ?? 0),
        discount: Number(rest.discount ?? 0),
        stock: Number(rest.stock ?? 0),
        rating: Number(rest.rating ?? 0),
        reviewCount: Number(rest.reviewCount ?? 0),
        categoryId: rest.categoryId,
      };
      products.push(product);
      (images?.create ?? []).forEach((image: any, index: number) => {
        productImages.push({ id: randomUUID(), productId: product.id, url: image.url, altText: image.altText ?? null, sortOrder: image.sortOrder ?? index + 1 });
      });
      (specs?.create ?? []).forEach((spec: any) => {
        productSpecifications.push({ id: randomUUID(), productId: product.id, key: spec.key, value: spec.value });
      });
      return productRelations(product, { include });
    },
    update: async ({ where, data, include }: any) => {
      const index = products.findIndex(
        (candidate) => (where?.id && candidate.id === where.id) || (where?.slug && candidate.slug === where.slug)
      );
      if (index === -1) throw new Error('Product not found');
      const { images, specs, ...rest } = data;
      // Support atomic number operations like { stock: { decrement: 2 } }.
      const normalized: any = { ...rest };
      for (const key of Object.keys(normalized)) {
        const value = normalized[key];
        if (value && typeof value === 'object') {
          if (typeof value.decrement === 'number') normalized[key] = Number((products[index] as any)[key]) - value.decrement;
          else if (typeof value.increment === 'number') normalized[key] = Number((products[index] as any)[key]) + value.increment;
          else if (value.set !== undefined) normalized[key] = value.set;
        }
      }
      products[index] = { ...products[index], ...normalized, updatedAt: new Date() };
      if (images) {
        for (let i = productImages.length - 1; i >= 0; i--) {
          if (productImages[i].productId === products[index].id) productImages.splice(i, 1);
        }
        (images.create ?? []).forEach((image: any, order: number) => {
          productImages.push({ id: randomUUID(), productId: products[index].id, url: image.url, altText: image.altText ?? null, sortOrder: image.sortOrder ?? order + 1 });
        });
      }
      if (specs) {
        for (let i = productSpecifications.length - 1; i >= 0; i--) {
          if (productSpecifications[i].productId === products[index].id) productSpecifications.splice(i, 1);
        }
        (specs.create ?? []).forEach((spec: any) => {
          productSpecifications.push({ id: randomUUID(), productId: products[index].id, key: spec.key, value: spec.value });
        });
      }
      return productRelations(products[index], { include });
    },
    delete: async ({ where }: any = {}) => {
      const index = products.findIndex(
        (candidate) => (where?.id && candidate.id === where.id) || (where?.slug && candidate.slug === where.slug)
      );
      if (index === -1) throw new Error('Product not found');
      const [removed] = products.splice(index, 1);
      for (let i = productImages.length - 1; i >= 0; i--) {
        if (productImages[i].productId === removed.id) productImages.splice(i, 1);
      }
      for (let i = productSpecifications.length - 1; i >= 0; i--) {
        if (productSpecifications[i].productId === removed.id) productSpecifications.splice(i, 1);
      }
      return removed;
    },
  };
}

// @ts-ignore
const prisma = new MockPrismaClient() as any;

export default prisma;
