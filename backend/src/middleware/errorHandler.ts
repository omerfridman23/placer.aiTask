import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorDetails, ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  }

  // Log error details (in production, you might want to use a proper logging service)
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
  });

  // Don't leak error details in production for security reasons
  const errorDetails: ErrorDetails = {
    message: isOperational ? message : 'Something went wrong',
    statusCode,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorDetails.stack = error.stack;
  }

  const response: ApiResponse = {
    success: false,
    error: errorDetails.message,
  };

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};