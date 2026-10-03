import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
// @ts-ignore
import { Prisma } from '@prisma/client';

export const getProducts = async (query: any) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = '1',
    limit = '12',
  } = query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (brand) {
    where.brand = brand;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }

  if (minRating) {
    where.rating = {
      gte: parseFloat(minRating as string),
    };
  }

  // Build order clause
  let orderBy: any = {};
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'relevance':
    default:
      // In a real scenario, this might use full-text search rankings.
      // For standard Prisma, we'll sort by newest or popularity.
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNumber,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      specifications: true,
      reviews: {
        include: {
          user: {
            select: { name: true, id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5, // Just load recent reviews for the details page
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      specifications: true,
      reviews: {
        include: {
          user: {
            select: { name: true, id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const createProduct = async (data: any) => {
  const { images, specifications, ...productData } = data;
  
  const product = await prisma.product.create({
    data: {
      ...productData,
      images: {
        create: images.map((url: string, index: number) => ({
          url,
          sortOrder: index,
        })),
      },
      specs: specifications ? {
        create: Object.entries(specifications).map(([key, value]) => ({
          key,
          value: value as string,
        })),
      } : undefined,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      specs: true,
      category: true,
    },
  });
  
  return product;
};

export const updateProduct = async (id: string, data: any) => {
  const { images, specifications, ...productData } = data;
  
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      ...(images && {
        images: {
          deleteMany: {},
          create: images.map((url: string, index: number) => ({
            url,
            sortOrder: index,
          })),
        }
      }),
      ...(specifications && {
        specs: {
          deleteMany: {},
          create: Object.entries(specifications).map(([key, value]) => ({
            key,
            value: value as string,
          })),
        }
      })
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      specs: true,
      category: true,
    },
  });
  
  return product;
};

export const deleteProduct = async (id: string) => {
  await prisma.product.delete({
    where: { id }
  });
};
