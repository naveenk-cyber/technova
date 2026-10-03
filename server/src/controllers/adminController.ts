import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as adminService from '../services/adminService';
import { ApiResponse } from '../types';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  
  const response: ApiResponse<typeof stats> = {
    success: true,
    message: 'Admin dashboard stats retrieved',
    data: stats
  };
  
  res.status(200).json(response);
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getUsers(req.query);

  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Users retrieved',
    data: result
  };

  res.status(200).json(response);
});
