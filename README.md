# Placer.ai Task

A Node.js + Express + TypeScript API server with robust error handling and development tools.

## Features

- 🚀 **Express.js** with TypeScript
- 🔒 **CORS** configured for `http://localhost:5173`
- 🛡️ **Centralized error handling** middleware
- 📊 **Zod** for data validation
- 📁 **File upload** support with Multer
- 📄 **CSV parsing** capabilities
- ⚡ **Hot reload** with ts-node-dev
- 🔧 **Environment configuration** with dotenv

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── index.ts           # Main application entry point
├── types.ts           # TypeScript type definitions
├── routes/            # API route handlers
│   └── index.ts       # Sample routes
├── middleware/        # Express middleware
│   └── errorHandler.ts # Centralized error handling
└── lib/               # Utility functions and libraries
```

## API Endpoints

- `GET /api/` - Welcome message
- `GET /api/health` - Health check endpoint

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |

## Dependencies

### Production
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **zod** - Schema validation
- **multer** - File upload handling
- **csv-parse** - CSV file parsing

### Development
- **typescript** - TypeScript support
- **ts-node-dev** - Development server with hot reload
- **@types/*** - TypeScript definitions

## Error Handling

The application includes a centralized error handling system:

- Custom `AppError` class for operational errors
- Global error handler middleware
- Async error handling wrapper
- 404 handler for undefined routes
- Development vs production error responses
