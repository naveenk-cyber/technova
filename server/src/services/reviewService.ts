import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const createReview = async (userId: string, data: { productId: string; rating: number; comment?: string }) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId }
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user has already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: data.productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Check if user has purchased the product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: data.productId,
      order: {
        userId: userId
      }
    }
  });

  if (!hasPurchased) {
    throw new AppError('You can only review products you have purchased', 403);
  }

  // Create review and update product in a transaction
  return await prisma.$transaction(async (tx: any) => {
    const review = await tx.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId,
        productId: data.productId,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Calculate new average
    const aggregate = await tx.review.aggregate({
      where: { productId: data.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newRating = aggregate._avg.rating || 0;
    const newCount = aggregate._count.rating || 0;

    await tx.product.update({
      where: { id: data.productId },
      data: {
        rating: newRating,
        reviewCount: newCount,
      }
    });

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: review.user.name
    };
  });
};
