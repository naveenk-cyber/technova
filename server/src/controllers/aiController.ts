import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as aiService from '../services/aiService';
import { ApiResponse } from '../types';

export const postAdvisor = catchAsync(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const result = await aiService.getAdvice(message, history ?? []);

  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'AI advisor recommendation generated',
    data: result,
  };

  res.status(200).json(response);
});
