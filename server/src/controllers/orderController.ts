import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as orderService from '../services/orderService';
import { ApiResponse } from '../types';

export const placeOrder = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await orderService.placeOrder(req.user.id, req.body);
  const response: ApiResponse<typeof result> = { success: true, message: 'Order placed successfully', data: result };
  res.status(201).json(response);
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await orderService.getMyOrders(req.user.id);
  const response: ApiResponse<typeof result> = { success: true, message: 'Orders retrieved', data: result };
  res.status(200).json(response);
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const result = await orderService.getOrderById(req.user.id, req.params.orderId);
  const response: ApiResponse<typeof result> = { success: true, message: 'Order retrieved', data: result };
  res.status(200).json(response);
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getAllOrders(req.query);
  const response: ApiResponse<typeof result> = { success: true, message: 'All orders retrieved', data: result };
  res.status(200).json(response);
});

export const getAdminOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getAdminOrderById(req.params.orderId as string);
  const response: ApiResponse<typeof result> = { success: true, message: 'Order retrieved', data: result };
  res.status(200).json(response);
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.updateOrderStatus(req.params.orderId as string, req.body.status);
  const response: ApiResponse<typeof result> = { success: true, message: 'Order status updated', data: result };
  res.status(200).json(response);
});
