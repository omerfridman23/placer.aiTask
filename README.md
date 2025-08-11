# Placer.ai Task

A full-stack application with a Node.js + Express + TypeScript backend API and PostgreSQL database.

## 🏗️ Project Structure

```
placerAi/
├── backend/                   # Backend API server
│   ├── src/                   # Source code
│   │   ├── lib/              # Database and utilities
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── index.ts          # Application entry point
│   │   └── types.ts          # TypeScript definitions
│   ├── prisma/               # Database schema and migrations
│   ├── .env                  # Environment variables
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
├── frontend/                 # Frontend application (to be added)
└── README.md                 # This file
```

## 🚀 Features

### Backend
- 🚀 **Express.js** with TypeScript
- �️ **PostgreSQL** database with Prisma ORM
- 👤 **User management** CRUD operations
- �🔒 **CORS** configured for frontend integration
- 🛡️ **Centralized error handling** middleware
- 📊 **Type-safe** API responses
- ⚡ **Hot reload** development server

## �️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   The `.env` file is already configured with:
   ```env
   DATABASE_URL="postgresql://postgres:23203Omer@localhost:5433/demoDv?schema=public"
   NODE_ENV=development
   PORT=4000
   ```

4. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The backend server will start on `http://localhost:4000`

## 📡 API Endpoints

### Health & Info
- `GET /api/` - Welcome message
- `GET /api/health` - Health check

### Users
- `GET /api/users` - Get all users

### Example Usage

**Create a user:**
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**Get all users:**
```bash
curl http://localhost:4000/api/users
```

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

## 📚 Documentation

- [Backend API Documentation](./backend/README.md) - Detailed backend setup and API reference

## 🔧 Development

### Backend Scripts
```bash
cd backend

# Development
npm run dev              # Start with hot reload
npm run build           # Build TypeScript
npm start               # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio
```

## 🚦 Status

- ✅ Backend API with TypeScript
- ✅ PostgreSQL database with Prisma
- ✅ User CRUD operations
- ✅ Error handling & validation
- ⏳ Frontend (to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
