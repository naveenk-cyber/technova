import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return categories;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};
