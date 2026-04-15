# Bookmark Manager - Backend (Go)

## Overview

This is the backend API service for the Bookmark Manager application, built with Go and following clean architecture principles.

## Architecture

The backend follows a clean architecture pattern with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                         Main                                 │
│  (cmd/main.go - Dependency injection, server startup)       │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│   Handler     │ │   Service     │ │ Repository    │
│  (HTTP layer) │ │ (Business     │ │ (Data layer)  │
│               │ │  Logic)       │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
                          │
                    ┌─────▼─────┐
                    │  Model    │
                    │ (Domain)  │
                    └───────────┘
```

## Project Structure

```
src/backend/
├── cmd/
│   └── main.go           # Application entry point
├── internal/
│   ├── handler/          # HTTP request handlers
│   │   └── handler.go
│   ├── service/          # Business logic
│   │   └── service.go
│   ├── repository/       # Data persistence
│   │   └── repository.go
│   ├── model/            # Domain entities
│   │   └── bookmark.go
│   ├── middleware/       # HTTP middleware
│   │   └── middleware.go
│   └── server/           # Server configuration
│       └── server.go
├── go.mod
└── go.sum
```

## API Endpoints

### Bookmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookmarks` | Get all bookmarks (paginated) |
| GET | `/api/v1/bookmarks/{id}` | Get a specific bookmark |
| POST | `/api/v1/bookmarks` | Create a new bookmark |
| PUT | `/api/v1/bookmarks/{id}` | Update a bookmark |
| DELETE | `/api/v1/bookmarks/{id}` | Delete a bookmark |
| GET | `/api/v1/bookmarks/search` | Search bookmarks |
| GET | `/api/v1/bookmarks/tag/{tag}` | Filter bookmarks by tag |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tags` | Get all tags with counts |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## Request/Response Examples

### Create Bookmark

**Request:**
```json
POST /api/v1/bookmarks
{
  "url": "https://example.com",
  "title": "Example Website",
  "description": "A sample website",
  "tags": ["example", "sample"]
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com",
  "title": "Example Website",
  "description": "A sample website",
  "tags": ["example", "sample"],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Get Bookmarks (Paginated)

**Request:**
```
GET /api/v1/bookmarks?page=1&pageSize=20
```

**Response:**
```json
{
  "bookmarks": [...],
  "page": 1,
  "pageSize": 20,
  "total": 150
}
```

### Search Bookmarks

**Request:**
```
GET /api/v1/bookmarks/search?q=example
```

**Response:**
```json
[
  {
    "id": "...",
    "url": "...",
    "title": "...",
    ...
  }
]
```

## Running the Server

### Prerequisites

- Go 1.22 or later
- Go modules enabled

### Development

```bash
cd src/backend

# Install dependencies
go mod download

# Run the server
go run cmd/main.go

# Or build and run
go build -o bookmark-api ./cmd/main.go
./bookmark-api
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/service/...
```

## Dependencies

- **Gorilla Mux** - HTTP routing
- **Go UUID** - UUID generation
- **Go Validator** - Input validation
- **In-Memory Storage** - Simple data storage (no external dependencies)

## Error Handling

The API uses standard HTTP status codes and returns JSON error responses:

```json
{
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

| Status Code | Usage |
|-------------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

## CORS

CORS is enabled for all origins. In production, configure specific allowed origins.

## License

MIT
