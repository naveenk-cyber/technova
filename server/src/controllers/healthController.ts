import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import prisma from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';

export const healthCheck = catchAsync(async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database connection failed:', error);
    dbStatus = 'error';
  }

  const response: ApiResponse<{ status: string; dbStatus: string; timestamp: string; uptime: number }> = {
    success: true,
    message: 'Technova API is running',
    data: {
      status: 'healthy',
      dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  res.status(200).json(response);
});
