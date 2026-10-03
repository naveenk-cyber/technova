import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

// Get or create a cart for the user (cart is auto-created on first use)
const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

const formatCart = (cart: any) => {
  const items = cart.items.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      brand: item.product.brand,
      price: parseFloat(item.product.price),
      discount: parseFloat(item.product.discount),
      stock: item.product.stock,
      image: item.product.images[0]?.url || null,
    },
    subtotal: parseFloat(item.product.price) * (1 - parseFloat(item.product.discount) / 100) * item.quantity,
  }));

  const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

  return {
    id: cart.id,
    items,
    itemCount: items.length,
    total: parseFloat(total.toFixed(2)),
  };
};

export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  return formatCart(cart);
};

export const addToCart = async (userId: string, data: { productId: string; quantity: number }) => {
  const { productId, quantity } = data;

  // Verify product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError(`Only ${product.stock} units available`, 400);

  // Get or create cart
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // Upsert cart item
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) throw new AppError(`Only ${product.stock} units available`, 400);

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart(userId);
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!item) throw new AppError('Cart item not found', 404);
  if (item.cart.userId !== userId) throw new AppError('Unauthorized', 403);
  if (item.product.stock < quantity) throw new AppError(`Only ${item.product.stock} units available`, 400);

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getCart(userId);
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) throw new AppError('Cart item not found', 404);
  if (item.cart.userId !== userId) throw new AppError('Unauthorized', 403);

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return getCart(userId);
};
