# Backend API Documentation

Go REST API for the Bookmark Manager application.

## Overview

The backend is built with Go and provides a RESTful API for managing bookmarks. It uses an in-memory storage layer and follows clean architecture principles.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Go | 1.21+ | Programming language |
| Gorilla Mux | latest | HTTP routing |
| Go UUID | latest | UUID generation |
| Go Validator | latest | Input validation |

## Project Structure

```
src/backend/
├── cmd/
│   └── main.go              # Application entry point
├── internal/
│   ├── handler/             # HTTP request handlers
│   │   ├── bookmark.go      # Bookmark CRUD handlers
│   │   └── health.go        # Health check handlers
│   ├── service/             # Business logic layer
│   │   └── service.go       # Bookmark service interface
│   ├── repository/          # Data access layer
│   │   └── repository.go    # In-memory repository
│   ├── model/               # Domain models
│   │   └── bookmark.go      # Bookmark structs
│   ├── middleware/          # HTTP middleware
│   │   └── middleware.go    # Logging, error handling
│   └── server/              # Server configuration
│       └── server.go        # HTTP server setup
└── go.mod                   # Go module definition
```

## API Endpoints

### Health Check

**GET /api/health**

Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Bookmarks

#### List All Bookmarks

**GET /api/bookmarks**

Returns a paginated list of bookmarks.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number (minimum 1) |
| pageSize | int | 20 | Items per page (1-100) |
| search | string | - | Search query for title, description, URL |
| tag | string | - | Filter by tag |

**Example:**
```
GET /api/bookmarks?page=1&pageSize=20
GET /api/bookmarks?search=react
GET /api/bookmarks?tag=programming
GET /api/bookmarks?search=go&tag=backend
```

**Response:**
```json
{
  "bookmarks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://golang.org",
      "title": "Go Programming Language",
      "description": "Official Go language website",
      "tags": ["go", "programming", "backend"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

---

#### Create Bookmark

**POST /api/bookmarks**

Creates a new bookmark.

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Website",
  "description": "An example website for testing",
  "tags": ["example", "test"]
}
```

**Validation Rules:**
- `url`: Required, must start with http:// or https://
- `title`: Required, non-empty string
- `description`: Optional, string
- `tags`: Optional, array of strings (automatically deduplicated)

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com",
  "title": "Example Website",
  "description": "An example website for testing",
  "tags": ["example", "test"],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "URL is required",
  "code": 400
}
```

---

#### Get Bookmark

**GET /api/bookmarks/:id**

Retrieves a specific bookmark by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com",
  "title": "Example Website",
  "description": "An example website for testing",
  "tags": ["example", "test"],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "bookmark not found",
  "code": 404
}
```

---

#### Update Bookmark

**PUT /api/bookmarks/:id**

Updates an existing bookmark. All fields are optional for partial updates.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Request Body (all fields optional):**
```json
{
  "url": "https://updated-example.com",
  "title": "Updated Website Title",
  "description": "Updated description",
  "tags": ["updated", "example"]
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://updated-example.com",
  "title": "Updated Website Title",
  "description": "Updated description",
  "tags": ["updated", "example"],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

#### Delete Bookmark

**DELETE /api/bookmarks/:id**

Deletes a bookmark by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Response (204 No Content):**
```
(empty)
```

**Error Response (404 Not Found):**
```json
{
  "error": "bookmark not found",
  "code": 404
}
```

---

### Tags

#### Get All Tags

**GET /api/tags**

Returns all unique tags from all bookmarks.

**Response (200 OK):**
```json
["go", "programming", "backend", "example", "test"]
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message description",
  "code": 400
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Unexpected server error |

## Data Models

### Bookmark

```go
type Bookmark struct {
    ID          string    `json:"id"`
    URL         string    `json:"url"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Tags        []string  `json:"tags"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### CreateBookmarkInput

```go
type CreateBookmarkInput struct {
    URL         string   `json:"url"`
    Title       string   `json:"title"`
    Description string   `json:"description"`
    Tags        []string `json:"tags"`
}
```

### UpdateBookmarkInput

```go
type UpdateBookmarkInput struct {
    URL         *string   `json:"url"`
    Title       *string   `json:"title"`
    Description *string   `json:"description"`
    Tags        *[]string `json:"tags"`
}
```

### BookmarkPage

```go
type BookmarkPage struct {
    Bookmarks  []*Bookmark `json:"bookmarks"`
    Total      int64       `json:"total"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalPages int         `json:"total_pages"`
}
```

## Running the Server

### Development

```bash
go run cmd/main.go
```

The server will start on `http://localhost:8080`

### With Custom Port

```bash
PORT=3000 go run cmd/main.go
```

## Testing

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/service/...
```

## Architecture

### Clean Architecture Layers

1. **Handler Layer**: HTTP request/response handling, validation, routing
2. **Service Layer**: Business logic, orchestration, validation rules
3. **Repository Layer**: Data access, persistence abstraction
4. **Model Layer**: Domain entities and data structures

### Request Flow

```
HTTP Request → Handler → Service → Repository → In-Memory Storage
                ↓         ↓           ↓
            Response ← Service ← Repository
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| HOST | 0.0.0.0 | Server host |
