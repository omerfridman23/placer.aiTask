export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  statusCode: number;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// User-related types
export interface CreateUserRequest {
  name: string;
  last_name?: string;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  createdAt: Date;
}
