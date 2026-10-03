import prisma from '../config/prisma';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    revenueResult,
    lowStockProducts,
    recentOrders
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        paymentStatus: {
          not: 'FAILED'
        }
      }
    }),
    prisma.product.findMany({
      where: {
        stock: { lte: 10 }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        brand: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' } }
      },
      take: 5,
      orderBy: {
        stock: 'asc'
      }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ]);

  return {
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount || 0,
    lowStockProducts: lowStockProducts.map((p: any) => ({
      ...p,
      image: p.images[0]?.url || null
    })),
    recentOrders
  };
};

export const getUsers = async (query: any) => {
  const requestedPage = parseInt(String(query.page ?? ''), 10);
  const requestedLimit = parseInt(String(query.limit ?? ''), 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Only select the fields this feature needs. Never expose passwordHash or
  // any other authentication material to the client.
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      orderCount: user._count?.orders ?? 0,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
