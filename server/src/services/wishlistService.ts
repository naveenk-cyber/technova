import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const getWishlist = async (userId: string) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  return items.map((item: any) => ({
    id: item.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      brand: item.product.brand,
      price: parseFloat(String(item.product.price)),
      discount: parseFloat(String(item.product.discount)),
      stock: item.product.stock,
      rating: parseFloat(String(item.product.rating)),
      category: item.product.category.name,
      image: item.product.images[0]?.url || null,
    },
  }));
};

export const addToWishlist = async (userId: string, productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) throw new AppError('Product already in wishlist', 400);

  await prisma.wishlist.create({ data: { userId, productId } });
  return getWishlist(userId);
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!existing) throw new AppError('Product not in wishlist', 404);

  await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
  return getWishlist(userId);
};
