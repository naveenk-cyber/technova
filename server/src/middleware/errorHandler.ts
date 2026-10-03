import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.message,
    });
    return;
  }

  // Body-parser throws a SyntaxError when the request body is not valid JSON.
  // This is a client error and must not surface as a 500.
  const parseError = err as any;
  if (parseError?.type === 'entity.parse.failed' || (err instanceof SyntaxError && parseError?.status === 400)) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: 'Invalid JSON payload',
    });
    return;
  }

  // Other body-parser errors (e.g. entity.too.large) carry an HTTP status and
  // are also client errors.
  const httpStatus = Number(parseError?.statusCode ?? parseError?.status);
  if (Number.isInteger(httpStatus) && httpStatus >= 400 && httpStatus < 500) {
    res.status(httpStatus).json({
      success: false,
      message: parseError.type === 'entity.too.large' ? 'Request payload too large' : 'Invalid request payload',
      error: parseError.type === 'entity.too.large' ? 'Request payload too large' : 'Invalid request payload',
    });
    return;
  }

  console.error('Unhandled Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Route ${req.path} not found`, 404));
};
