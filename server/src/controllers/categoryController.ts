import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as categoryService from '../services/categoryService';
import { ApiResponse } from '../types';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategories();
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});

export const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategoryBySlug(req.params.slug as string);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Category retrieved successfully',
    data: result,
  };
  
  res.status(200).json(response);
});
