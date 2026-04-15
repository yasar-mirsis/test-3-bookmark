# Bookmark Manager - System Architecture

## System Overview

The Bookmark Manager is a full-stack web application that enables users to save, organize, and retrieve web resources through bookmarks with metadata (title, description, tags). The system follows a clean architecture pattern with a Go REST API backend and a React frontend, communicating via HTTP/JSON.

**Key Capabilities:**
- Full CRUD operations for bookmarks
- Pagination support (20 items per page)
- Full-text search across title, description, and URL
- Tag-based filtering with multi-filter support
- Real-time UI updates without page refresh
- Health check endpoints for monitoring

**System Boundaries:**
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

## Components

### Backend Components

| Component | Responsibility | Interfaces |
|-----------|---------------|------------|
| `src/backend/cmd/main.go` | Application entry point, dependency injection | `main()` |
| `src/backend/internal/handler/` | HTTP request handling, validation, response formatting | `http.Handler` |
| `src/backend/internal/service/` | Business logic, bookmark operations, search/filter logic | `BookmarkService` |
| `src/backend/internal/repository/` | Data persistence layer, CRUD operations | `BookmarkRepository` |
| `src/backend/internal/model/` | Domain entities and data structures | Go structs |
| `src/backend/internal/middleware/` | Cross-cutting concerns (logging, error handling) | `func(http.Handler) http.Handler` |
| `src/backend/internal/server/` | HTTP server configuration, routing, health checks | `*http.Server` |

### Frontend Components

| Component | Responsibility | Interfaces |
|-----------|---------------|------------|
| `src/frontend/src/App.tsx` | Root component, routing, layout | React Component |
| `src/frontend/src/pages/BookmarkList.tsx` | Displays paginated bookmark cards | `BookmarkListProps` |
| `src/frontend/src/components/BookmarkCard.tsx` | Individual bookmark display with actions | `BookmarkCardProps` |
| `src/frontend/src/components/BookmarkForm.tsx` | Create/Edit bookmark form with validation | `BookmarkFormProps` |
| `src/frontend/src/components/SearchBar.tsx` | Search input with debouncing | `SearchBarProps` |
| `src/frontend/src/components/TagSidebar.tsx` | Tag list with counts, filter toggle | `TagSidebarProps` |
| `src/frontend/src/components/Pagination.tsx` | Page navigation controls | `PaginationProps` |
| `src/frontend/src/hooks/useBookmarks.ts` | Custom hook for bookmark state management | `useBookmarks()` |
| `src/frontend/src/services/api.ts` | HTTP client for API communication | `ApiService` |

### Component Interfaces

#### BookmarkService Interface (Go)
```go
type BookmarkService interface {
    CreateBookmark(ctx context.Context, input CreateBookmarkInput) (*Bookmark, error)
    GetBookmark(ctx context.Context, id string) (*Bookmark, error)
    ListBookmarks(ctx context.Context, page, pageSize int, filters ListFilters) (*BookmarkPage, error)
    UpdateBookmark(ctx context.Context, id string, input UpdateBookmarkInput) (*Bookmark, error)
    DeleteBookmark(ctx context.Context, id string) error
    SearchBookmarks(ctx context.Context, query string) ([]*Bookmark, error)
}
```

#### BookmarkRepository Interface (Go)
```go
type BookmarkRepository interface {
    Create(ctx context.Context, b *Bookmark) error
    FindByID(ctx context.Context, id string) (*Bookmark, error)
    FindAll(ctx context.Context, page, pageSize int) ([]*Bookmark, int64, error)
    FindByTag(ctx context.Context, tag string, page, pageSize int) ([]*Bookmark, int64, error)
    Search(ctx context.Context, query string) ([]*Bookmark, error)
    Update(ctx context.Context, b *Bookmark) error
    Delete(ctx context.Context, id string) error
}
```

## Data Model

### Entities

#### Bookmark
```go
type Bookmark struct {
    ID          string    `json:"id"`
    URL         string    `json:"url"`
    Title       string    `json:"title"`
    Description string    `json:"description,omitempty"`
    Tags        []string  `json:"tags"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| ID | string | Yes | UUID v4, auto-generated |
| URL | string | Yes | Valid URL format, max 2048 chars |
| Title | string | Yes | Max 500 chars |
| Description | string | No | Max 2000 chars |
| Tags | []string | No | Max 10 tags, deduplicated, trimmed |
| CreatedAt | time.Time | Yes | Auto-set on creation |
| UpdatedAt | time.Time | Yes | Auto-updated on modification |

### Relationships

```
┌─────────────┐
│  Bookmark   │
├─────────────┤
│ ID          │
│ URL         │
│ Title       │
│ Description │
│ Tags[]      │ ──► (many-to-many via tag strings)
│ CreatedAt   │
│ UpdatedAt   │
└─────────────┘
```

**Tag Handling:**
- Tags are stored as a slice of strings within Bookmark
- Tags are normalized: trimmed, lowercase, deduplicated
- Tag counts are computed dynamically from all bookmarks
- No separate Tag entity for simplicity (single-user scope)

### Pagination Model
```go
type BookmarkPage struct {
    Items      []*Bookmark `json:"items"`
    Total      int64       `json:"total"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalPages int         `json:"total_pages"`
}
```

### Filter Model
```go
type ListFilters struct {
    Search string   `json:"search,omitempty"`
    Tag    string   `json:"tag,omitempty"`
}
```

## API Contracts

### Base URL
All endpoints are relative to `/api/v1`

### Endpoints

#### 1. Health Check
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Application health status |

**Response (200 OK):**
```json
{
    "status": "healthy",
    "timestamp": "2026-04-15T10:30:00Z"
}
```

#### 2. List Bookmarks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/bookmarks` | Get paginated bookmarks with optional filters |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | int | No | 1 | Page number (1-indexed) |
| page_size | int | No | 20 | Items per page (max 100) |
| search | string | No | - | Search query |
| tag | string | No | - | Filter by tag |

**Response (200 OK):**
```json
{
    "items": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "url": "https://example.com",
            "title": "Example Site",
            "description": "A sample website",
            "tags": ["example", "sample"],
            "created_at": "2026-04-15T10:00:00Z",
            "updated_at": "2026-04-15T10:00:00Z"
        }
    ],
    "total": 45,
    "page": 1,
    "page_size": 20,
    "total_pages": 3
}
```

#### 3. Create Bookmark
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/bookmarks` | Create a new bookmark |

**Request Body:**
```json
{
    "url": "https://example.com",
    "title": "Example Site",
    "description": "A sample website",
    "tags": ["example", "sample"]
}
```

**Validation Rules:**
- `url`: Required, must be valid URL format (http/https)
- `title`: Required, non-empty, max 500 chars
- `description`: Optional, max 2000 chars
- `tags`: Optional, array of strings, auto-deduplicated

**Response (201 Created):**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com",
    "title": "Example Site",
    "description": "A sample website",
    "tags": ["example", "sample"],
    "created_at": "2026-04-15T10:00:00Z",
    "updated_at": "2026-04-15T10:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "validation_failed",
    "message": "Invalid URL format",
    "details": {
        "url": ["must be a valid URL starting with http:// or https://"]
    }
}
```

#### 4. Get Bookmark
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/bookmarks/{id}` | Get a single bookmark by ID |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Response (200 OK):**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com",
    "title": "Example Site",
    "description": "A sample website",
    "tags": ["example", "sample"],
    "created_at": "2026-04-15T10:00:00Z",
    "updated_at": "2026-04-15T10:00:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "not_found",
    "message": "Bookmark not found"
}
```

#### 5. Update Bookmark
| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/v1/bookmarks/{id}` | Update an existing bookmark |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Request Body:** (All fields optional, partial update supported)
```json
{
    "url": "https://newexample.com",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["updated", "new"]
}
```

**Response (200 OK):**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://newexample.com",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["updated", "new"],
    "created_at": "2026-04-15T10:00:00Z",
    "updated_at": "2026-04-15T11:00:00Z"
}
```

#### 6. Delete Bookmark
| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/api/v1/bookmarks/{id}` | Delete a bookmark |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Bookmark UUID |

**Response (204 No Content):**
(empty body)

**Error Response (404 Not Found):**
```json
{
    "error": "not_found",
    "message": "Bookmark not found"
}
```

#### 7. Get Tag Statistics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/tags` | Get all tags with counts |

**Response (200 OK):**
```json
{
    "tags": [
        {"name": "example", "count": 15},
        {"name": "sample", "count": 10},
        {"name": "tutorial", "count": 5}
    ]
}
```

### Error Response Format
All errors follow this structure:
```json
{
    "error": "<error_code>",
    "message": "<human readable message>",
    "details": { /* optional validation details */ }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_failed` | 400 | Invalid request data |
| `not_found` | 404 | Resource not found |
| `internal_error` | 500 | Server error |

## Technology Stack

### Backend

| Technology | Version | Justification |
|------------|---------|---------------|
| Go | 1.21+ | Required by project; excellent performance, built-in HTTP server, strong typing, simple concurrency model ideal for REST APIs |
| Gorilla Mux | latest | Lightweight, mature routing library with URL pattern matching and middleware support |
| Go UUID | latest | Standard UUID generation for bookmark IDs |
| Go Validator | latest | Input validation for URL format and other constraints |
| In-Memory Storage | N/A | Simplest storage for single-user bookmark manager; no external dependencies; fast operations |

**Why In-Memory Storage?**
- No persistence requirement specified in user stories
- Eliminates database setup complexity for MVP
- Provides instant startup and zero configuration
- Can be replaced with SQLite/PostgreSQL repository implementation without API changes

### Frontend

| Technology | Version | Justification |
|------------|---------|---------------|
| React | 18+ | Industry standard, component-based architecture, virtual DOM for efficient updates |
| TypeScript | latest | Type safety, better IDE support, catches errors at compile time |
| React Query | latest | Server state management, built-in caching, pagination, and refetching |
| Tailwind CSS | latest | Utility-first CSS, rapid UI development, responsive design support |
| React Hook Form | latest | Performant form handling with validation, minimal re-renders |
| Axios | latest | Promise-based HTTP client with interceptors for error handling |

**Why React Query?**
- Handles server state (bookmarks) separate from client state
- Built-in pagination, caching, and background refetching
- Reduces boilerplate for loading/error states
- Automatic UI updates on mutations

### Development Tools

| Tool | Purpose |
|------|---------|
| Go Modules | Dependency management |
| Vite | Fast frontend build tool and dev server |
| ESLint + Prettier | Code quality and formatting |
| Go Test | Unit and integration testing |
| React Testing Library | Component testing |

## Data Flow

### Bookmark Creation Flow

```
┌─────────────┐    1. Submit    ┌──────────────┐    2. POST     ┌──────────────┐
│   User      │────────────────►│ BookmarkForm │───────────────►│ BookmarkForm │
│             │                 │ (Frontend)   │   /api/bookmarks│ (Frontend)   │
└─────────────┘                 └──────────────┘                └──────┬───────┘
                                                                       │
                                                                       ▼
┌─────────────┐   7. Update    ┌──────────────┐    6. Return    ┌──────────────┐
│   User      │◄───────────────│BookmarkList  │◄───────────────│ BookmarkCard │
│             │     UI         │ (Frontend)   │     Data       │ (Frontend)   │
└─────────────┘                └──────────────┘                └──────┬───────┘
                                                                       │
                                                                       ▼
┌─────────────┐   5. Return    ┌──────────────┐    4. Persist   ┌──────────────┐
│ Bookmark    │◄───────────────│ Bookmark     │◄───────────────│ Bookmark     │
│ Object      │     JSON       │ Service      │     Data       │ Repository   │
└─────────────┘                └──────┬───────┘                └──────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ HTTP Handler │
                               │ (Go)         │
                               └──────────────┘
```

**Step-by-step:**
1. User fills form and submits
2. Frontend validates URL format, required fields
3. Axios POST request to `/api/v1/bookmarks`
4. Handler validates request body, calls service
5. Service deduplicates tags, generates UUID, sets timestamps
6. Repository stores bookmark in memory map
7. Bookmark returned with 201 status
8. React Query invalidates list cache, triggers refetch
9. UI updates showing new bookmark

### Search and Filter Flow

```
┌─────────────┐    1. Type/Search    ┌──────────────┐    2. Query Params    ┌──────────────┐
│   User      │─────────────────────►│ SearchBar    │─────────────────────►│ BookmarkList │
│             │                      │ (Frontend)   │  ?search=foo&tag=bar│ (Frontend)   │
└─────────────┘                      └──────────────┘                      └──────┬───────┘
                                                                                  │
                                                                                  ▼
┌─────────────┐    5. Filtered   ┌──────────────┐    4. Query      ┌──────────────┐
│ Bookmark    │◄─────────────────│ BookmarkPage │◄─────────────────│ Bookmark     │
│ List        │     Items        │              │     Data         │ Repository   │
└─────────────┘                  └──────┬───────┘                └──────────────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │ HTTP Handler │
                                 │ (Go)         │
                                 └──────────────┘
```

**Step-by-step:**
1. User types in search or clicks tag
2. Debounced search (500ms) or immediate tag toggle
3. React Query updates query params: `?page=1&search=foo&tag=bar`
4. Handler extracts params, passes to service
5. Repository performs case-insensitive search on title/description/url
6. Results filtered by tag if specified
7. Paginated results returned
8. UI updates with filtered cards

### Tag Sidebar Update Flow

```
┌─────────────┐    Bookmark      ┌──────────────┐    2. GET /tags   ┌──────────────┐
│ Bookmark    │     Mutation     │ useBookmarks │─────────────────►│ TagSidebar   │
│ Form        │                  │ (Frontend)   │                 │ (Frontend)   │
└─────────────┘                  └──────────────┘                 └──────────────┘
                                       │                                 │
                                       │ 3. Refetch                      │
                                       └─────────────────────────────────┘
```

**Step-by-step:**
1. Bookmark created/updated/deleted
2. React Query invalidates "tags" query
3. TagSidebar automatically refetches tag statistics
4. Sidebar updates with new tag counts

## Security Considerations

### Input Validation
- **URL Validation**: All URLs validated against RFC 3986; only http/https schemes allowed
- **XSS Prevention**: All user input sanitized before storage; React escapes output by default
- **Length Limits**: Enforced limits prevent DoS via large payloads (URL: 2KB, Title: 500 chars, Description: 2KB)
- **Tag Sanitization**: Tags trimmed, lowercased, special characters stripped

### HTTP Security Headers
```go
// Middleware adds these headers
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting (Recommended for Production)
- Implement per-IP rate limiting: 100 requests/minute
- Use token bucket algorithm for burst handling
- Return 429 status with Retry-After header when exceeded

### CORS Configuration
```go
// Allowed origins (configurable via environment)
AllowedOrigins: ["http://localhost:5173", "https://bookmark-app.example.com"]
AllowedMethods: ["GET", "POST", "PUT", "DELETE"]
AllowedHeaders: ["Content-Type", "Authorization"]
```

### Authentication (Future Enhancement)
- Current design assumes single-user, no auth required
- For multi-user: Add JWT authentication middleware
- Store user_id with each bookmark for isolation
- Implement OAuth2 for social login integration

### Data Protection
- In-memory storage: Data lost on restart (acceptable for MVP)
- For production: Add periodic snapshots or database persistence
- Consider encryption at rest if sensitive URLs stored

## Scalability Notes

### Current Limitations (Single-User, In-Memory)
- No horizontal scaling (single process)
- No data persistence across restarts
- No concurrent user support
- Memory bounded by available RAM

### Scaling Path

#### Phase 1: Persistence (SQLite)
```go
// Replace in-memory repository with SQLite
type SQLiteRepository struct {
    db *sql.DB
}

// Migration: Add SQLite as drop-in replacement
// Zero API changes required
```

**Benefits:**
- Data persists across restarts
- No external database dependency
- Simple deployment

#### Phase 2: Multi-User Support
```
┌─────────────┐
│   User A    │ ──► │ User Bookmarks │
└─────────────┘     │ (filtered by    │
┌─────────────┐     │  user_id)       │
│   User B    │ ──► └─────────────────┘
└─────────────┘
```

**Changes Required:**
- Add user_id field to Bookmark
- Implement JWT authentication
- Add user scoping to all repository queries

#### Phase 3: Horizontal Scaling
```
┌─────────────┐     ┌─────────────┐
│  Load       │────►│  API        │
│  Balancer   │     │  Instance 1 │
└─────────────┘     └──────┬──────┘
                           │
┌─────────────┐     ┌──────▼──────┐
│  API        │     │  Redis      │
│  Instance 2 │◄───►│  (Cache)    │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    └─────────────┘
```

**Changes Required:**
- Externalize state (Redis for sessions, PostgreSQL for data)
- Stateless API instances behind load balancer
- Implement cache-aside pattern for frequent queries

### Performance Optimizations

#### Current Implementation
- O(n) search through in-memory slice (acceptable for <10,000 bookmarks)
- Tag counts computed on-demand (acceptable for <10,000 bookmarks)

#### Future Optimizations
1. **Tag Indexing**: Maintain tag→bookmark_id map for O(1) tag lookups
2. **Full-Text Search**: Implement trigram indexing for faster search
3. **Query Caching**: Cache frequent search results in Redis
4. **Database Indexing**: Add indexes on (user_id, tags), (user_id, title)

### Resource Estimates
| Metric | Current | Phase 1 | Phase 3 |
|--------|---------|---------|---------|
| Max Bookmarks | ~100K | ~1M | ~100M |
| Concurrent Users | 1 | 100 | 10,000+ |
| Memory | ~50MB | ~100MB | ~500MB/instance |
| Startup Time | <1s | <5s | <30s |
