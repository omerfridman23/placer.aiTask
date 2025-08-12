import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

const router = Router();

// Health check endpoint
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  // Test database connection
  await prisma.$queryRaw`SELECT 1`;
  
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    message: 'API is healthy and database is connected'
  };
  
  res.json(response);
}));

// Get database statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const [chainCount, storeCount, entityCount] = await Promise.all([
    prisma.chain.count(),
    prisma.store.count(),
    prisma.entity.count()
  ]);

  const response: ApiResponse<{ chains: number; stores: number; entities: number }> = {
    success: true,
    data: {
      chains: chainCount,
      stores: storeCount,
      entities: entityCount
    },
    message: 'Database statistics retrieved successfully'
  };
  
  res.json(response);
}));

export default router;
