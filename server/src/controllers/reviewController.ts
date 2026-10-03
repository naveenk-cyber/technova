import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as reviewService from '../services/reviewService';
import { ApiResponse } from '../types';

export const createReview = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const result = await reviewService.createReview(userId, req.body);
  
  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Review created successfully',
    data: result
  };
  
  res.status(201).json(response);
});
