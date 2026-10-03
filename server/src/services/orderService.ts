import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const placeOrder = async (userId: string, data: any) => {
  const { shippingAddress, paymentMethod } = data;

  // Duplicate-order guard: reject an identical order (same items and total)
  // submitted by the same user within a short window. This prevents accidental
  // double submits (e.g. a double-clicked "Place order" button).
  const recentOrders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true },
  });

  const duplicateWindowMs = 2 * 60 * 1000;
  const now = Date.now();

  // Load user's cart with full product details
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // Validate stock for every item
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}`,
        400
      );
    }
  }

  // Calculate total
  const totalAmount = cart.items.reduce((sum: number, item: any) => {
    const price = parseFloat(String(item.product.price));
    const discount = parseFloat(String(item.product.discount));
    const effectivePrice = price * (1 - discount / 100);
    return sum + effectivePrice * item.quantity;
  }, 0);

  const cartSignature = cart.items
    .map((item: any) => `${item.productId}:${item.quantity}`)
    .sort()
    .join('|');

  const duplicate = recentOrders.find((order: any) => {
    if (now - new Date(order.createdAt).getTime() > duplicateWindowMs) return false;
    const signature = order.items
      .map((item: any) => `${item.productId}:${item.quantity}`)
      .sort()
      .join('|');
    return signature === cartSignature && Number(order.totalAmount) === Number(totalAmount.toFixed(2));
  });

  if (duplicate) {
    throw new AppError(
      'A duplicate order was detected. Your previous order is already being processed.',
      409
    );
  }

  // Use a transaction for atomicity
  const order = await prisma.$transaction(async (tx: any) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'SIMULATED',
        orderStatus: 'CONFIRMED',
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            productName: item.product.name,
            price: parseFloat(String(item.product.price)) * (1 - parseFloat(String(item.product.discount)) / 100),
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Decrement stock for each product
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
};

export const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
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
    orderBy: { createdAt: 'desc' },
  });

  const formattedOrders = orders.map((order: any) => ({
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        image: item.product.images?.[0]?.url || null,
      } : null
    }))
  }));

  return formattedOrders;
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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

  if (!order) throw new AppError('Order not found', 404);
  if (order.userId !== userId) throw new AppError('Unauthorized', 403);

  const formattedOrder = {
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        image: item.product.images?.[0]?.url || null,
      } : null
    }))
  };

  return formattedOrder;
};

export const getAllOrders = async (query: any) => {
  const { status, date, search, page = '1', limit = '10' } = query;
  
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {};

  if (status) {
    where.orderStatus = status;
  }

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.createdAt = {
      gte: start,
      lte: end,
    };
  }

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAdminOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
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

  if (!order) throw new AppError('Order not found', 404);

  return {
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        image: item.product.images?.[0]?.url || null,
      } : null
    }))
  };
};

export const updateOrderStatus = async (orderId: string, status: any) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Prevent invalid transitions
  const stages = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = stages.indexOf(order.orderStatus);
  const newIndex = stages.indexOf(status);

  if (newIndex === -1) {
    throw new AppError('Invalid order status', 400);
  }

  // Allow transitions only forward or same status, EXCEPT DELIVERED cannot go back
  if (currentIndex === stages.length - 1 && newIndex !== currentIndex) {
     throw new AppError('Cannot change status of a DELIVERED order', 400);
  }

  if (newIndex < currentIndex) {
     throw new AppError('Cannot move order status backwards', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });

  return updatedOrder;
};
