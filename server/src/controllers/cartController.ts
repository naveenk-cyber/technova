import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as cartService from '../services/cartService';
import { ApiResponse } from '../types';

export const getCart = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await cartService.getCart(req.user.id);
  const response: ApiResponse<typeof result> = { success: true, message: 'Cart retrieved', data: result };
  res.status(200).json(response);
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await cartService.addToCart(req.user.id, req.body);
  const response: ApiResponse<typeof result> = { success: true, message: 'Item added to cart', data: result };
  res.status(200).json(response);
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await cartService.updateCartItem(req.user.id, req.params.itemId, req.body.quantity);
  const response: ApiResponse<typeof result> = { success: true, message: 'Cart item updated', data: result };
  res.status(200).json(response);
});

export const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await cartService.removeFromCart(req.user.id, req.params.itemId);
  const response: ApiResponse<typeof result> = { success: true, message: 'Item removed from cart', data: result };
  res.status(200).json(response);
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await cartService.clearCart(req.user.id);
  const response: ApiResponse<typeof result> = { success: true, message: 'Cart cleared', data: result };
  res.status(200).json(response);
});
