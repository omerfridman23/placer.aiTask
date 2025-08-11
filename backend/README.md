# Placer.ai Backend API

This is the backend API for the Placer.ai application built with Node.js, Express, TypeScript, and PostgreSQL using Prisma ORM.

## 🚀 Features

- RESTful API with TypeScript
- PostgreSQL database with Prisma ORM
- User management CRUD operations
- Error handling middleware
- CORS configuration for frontend integration
- Environment-based configuration

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy the `.env` file and update the database connection string if needed:
```env
DATABASE_URL="postgresql://postgres:23203Omer@localhost:5433/demoDv?schema=public"
NODE_ENV=development
PORT=4000
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Request/Response Examples

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-08-11T14:18:55.000Z"
  },
  "message": "User created successfully"
}
```

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   └── errorHandler.ts    # Error handling middleware
│   ├── routes/
│   │   └── index.ts           # API routes
│   ├── index.ts               # Application entry point
│   └── types.ts               # TypeScript type definitions
├── prisma/
│   ├── migrations/            # Database migrations
│   └── schema.prisma          # Prisma schema
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |

## 🐛 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
