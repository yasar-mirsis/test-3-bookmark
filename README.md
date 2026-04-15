# Bookmark Manager

A full-stack web application that enables users to save, organize, and retrieve web resources through bookmarks with metadata (title, description, tags).

## Overview

The Bookmark Manager provides a clean, modern interface for managing your saved web resources. Built with a Go REST API backend and a React frontend, it follows clean architecture principles for maintainability and testability.

### Key Features

- **Full CRUD Operations**: Create, read, update, and delete bookmarks
- **Pagination**: Browse bookmarks with configurable page sizes (default 20 items per page)
- **Full-Text Search**: Search across title, description, and URL fields
- **Tag-Based Filtering**: Filter bookmarks by tags with multi-filter support
- **Real-Time Updates**: UI updates without page refresh
- **Health Checks**: Monitoring endpoints for deployment health checks

## System Architecture

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────┐
│   React Frontend│◄──────────────────►│   Go REST API   │
│   (src/frontend)│                    │   (src/backend) │
└─────────────────┘                    └────────┬────────┘
                                                │
                                        ┌───────▼───────┐
                                        │   In-Memory   │
                                        │    Storage    │
                                        └───────────────┘
```

## Technology Stack

### Backend
- **Go 1.21+**: High-performance backend with built-in HTTP server
- **Gorilla Mux**: Lightweight routing library
- **Go UUID**: UUID generation for bookmark IDs
- **Go Validator**: Input validation

### Frontend
- **React 18+**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **React Query**: Server state management
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Performant form handling
- **Axios**: HTTP client for API requests

## Quick Start

### Prerequisites
- Go 1.21 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd src/backend

# Install dependencies
go mod download

# Run the server
go run cmd/main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Configuration

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Frontend .env
VITE_API_URL=http://localhost:8080/api
```

## API Documentation

See [src/backend/README.md](src/backend/README.md) for detailed API documentation.

## Frontend Documentation

See [src/frontend/README.md](src/frontend/README.md) for frontend component documentation.

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Individual Container Build

```bash
# Build backend
docker build -f src/backend/Dockerfile -t bookmark-backend:latest .

# Build frontend
docker build -f src/frontend/Dockerfile -t bookmark-frontend:latest .
```

## Project Structure

```
.
├── README.md                 # This file
├── AGENTS.md                 # Agent instructions
├── docker-compose.yml        # Docker Compose configuration
├── .env.example              # Environment variable template
├── .gitignore               # Git ignore patterns
├── api-collection.json       # Postman API collection
└── src/
    ├── backend/
    │   ├── README.md         # Backend documentation
    │   ├── Dockerfile        # Backend container configuration
    │   ├── cmd/
    │   │   └── main.go       # Application entry point
    │   └── internal/
    │       ├── handler/      # HTTP handlers
    │       ├── service/      # Business logic
    │       ├── repository/   # Data access layer
    │       ├── model/        # Domain models
    │       ├── middleware/   # HTTP middleware
    │       └── server/       # Server configuration
    └── frontend/
        ├── README.md         # Frontend documentation
        ├── Dockerfile        # Frontend container configuration
        └── src/
            ├── components/   # Reusable UI components
            ├── pages/        # Page components
            ├── hooks/        # Custom React hooks
            ├── services/     # API service layer
            └── types/        # TypeScript type definitions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/bookmarks` | List all bookmarks (paginated) |
| POST | `/api/bookmarks` | Create a new bookmark |
| GET | `/api/bookmarks/:id` | Get a specific bookmark |
| PUT | `/api/bookmarks/:id` | Update a bookmark |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark |
| GET | `/api/tags` | Get all unique tags |

## Testing

### Backend Tests

```bash
cd src/backend
go test ./...
```

### Frontend Tests

```bash
cd src/frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details
