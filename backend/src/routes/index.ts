import { Router, Request, Response } from 'express';
import { ApiResponse, CreateUserRequest, UserResponse, AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

const router = Router();




// Get all users
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const mappedUsers: UserResponse[] = users.map(user => ({
    id: user.id,
    name: user.name,
    last_name: (user as any).last_name ?? null, // Use user.last_name if exists, else null
    email: user.email,
    createdAt: user.createdAt
  }));

  const response: ApiResponse<UserResponse[]> = {
    success: true,
    data: mappedUsers,
    message: `Retrieved ${mappedUsers.length} users`
  };
  
  res.json(response);
}));



export default router;
