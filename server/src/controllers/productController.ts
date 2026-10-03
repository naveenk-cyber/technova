import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as productService from '../services/productService';
import { ApiResponse } from '../types';

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProductById(req.params.id as string);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProductBySlug(req.params.slug as string);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  
  const response: ApiResponse<typeof product> = {
    success: true,
    message: 'Product created successfully',
    data: product,
  };
  
  res.status(201).json(response);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.body);
  
  const response: ApiResponse<typeof product> = {
    success: true,
    message: 'Product updated successfully',
    data: product,
  };
  
  res.status(200).json(response);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string);
  
  const response: ApiResponse<null> = {
    success: true,
    message: 'Product deleted successfully',
    data: null,
  };
  
  res.status(200).json(response);
});
