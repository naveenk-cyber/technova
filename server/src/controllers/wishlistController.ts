import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as wishlistService from '../services/wishlistService';
import { ApiResponse } from '../types';

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await wishlistService.getWishlist(req.user.id);
  const response: ApiResponse<typeof result> = { success: true, message: 'Wishlist retrieved', data: result };
  res.status(200).json(response);
});

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await wishlistService.addToWishlist(req.user.id, req.body.productId);
  const response: ApiResponse<typeof result> = { success: true, message: 'Added to wishlist', data: result };
  res.status(200).json(response);
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  const response: ApiResponse<typeof result> = { success: true, message: 'Removed from wishlist', data: result };
  res.status(200).json(response);
});
