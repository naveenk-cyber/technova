import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/authService';
import { ApiResponse } from '../types';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'User registered successfully',
    data: result,
  };
  
  res.status(201).json(response);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Login successful',
    data: result,
  };
  
  res.status(200).json(response);
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const result = await authService.getProfile(userId);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const result = await authService.updateProfile(userId, req.body);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Profile updated successfully',
    data: result,
  };
  
  res.status(200).json(response);
});
