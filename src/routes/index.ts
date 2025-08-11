import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Health check endpoint
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'Server is running'
  };
  
  res.json(response);
}));

// Sample endpoint
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: 'Welcome to Placer.ai API',
      version: '1.0.0'
    }
  };
  
  res.json(response);
}));

export default router;
