## Overview

The Bookmark Manager is a full-stack web application built with a Go REST API backend and React frontend that enables users to save, organize, and retrieve web resources through bookmarks with metadata including title, description, and tags. The system implements full CRUD operations, pagination (20 items per page), full-text search, tag-based filtering, and real-time UI updates using in-memory storage. The architecture follows clean architecture patterns with separated concerns for handlers, services, repositories, and models in the backend, and modular React components with custom hooks for state management in the frontend.

## Tasks

### 1. Project Setup and Configuration
**Description:** Initialize the Go backend and React frontend projects with proper configuration files, directory structure, and base dependencies. Set up the project root with a workspace structure containing src/backend and src/frontend directories.

Backend setup includes:
- Go module initialization with `go mod init github.com/bookmark-manager/backend`
- Basic `go.mod` with dependencies: `chi` (router), `log` (standard library)
- Directory structure: `internal/handler`, `internal/service`, `internal/repository`, `internal/model`, `internal/middleware`, `internal/server`, `cmd`
- Frontend setup includes:
- React app created with Vite or Create React App
- `package.json` with dependencies: `react`, `react-dom`, `axios` or `fetch` API
- TypeScript configuration (`tsconfig.json`)
- Tailwind CSS for styling (optional but recommended)
- Directory structure: `src/components`, `src/pages`, `src/hooks`, `src/services`, `src/types`

**Files to create:**
- src/backend/go.mod
- src/backend/internal/model/bookmark.go
- src/backend/internal/repository/repository.go
- src/backend/internal/service/service.go
- src/backend/internal/handler/handler.go
- src/backend/internal/middleware/middleware.go
- src/backend/internal/server/server.go
- src/backend/cmd/main.go
- src/frontend/package.json
- src/frontend/tsconfig.json
- src/frontend/index.html
- src/frontend/src/main.tsx
- src/frontend/src/App.tsx
- src/frontend/src/index.css

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** None

### 2. Backend Model and Data Structures
**Description:** Implement the domain models for bookmarks including the Bookmark entity, pagination response, and input validation structures. Define the data structures that will be used across the repository, service, and handler layers.

Bookmark model includes:
- `Bookmark` struct with fields: ID (string), URL (string), Title (string), Description (string), Tags ([]string), CreatedAt (time.Time), UpdatedAt (time.Time)
- `CreateBookmarkInput` struct with fields: URL (string, required), Title (string, required), Description (string, optional), Tags ([]string, optional)
- `UpdateBookmarkInput` struct with fields: URL (string, optional), Title (string, optional), Description (string, optional), Tags ([]string, optional)
- `ListFilters` struct with fields: Page (int), PageSize (int), Tag (string, optional), Search (string, optional)
- `BookmarkPage` struct with fields: Bookmarks ([]*Bookmark), Total (int64), Page (int), PageSize (int), TotalPages (int)
- `BookmarkError` for error responses with fields: Error (string), Code (int)

Validation rules:
- URL must be valid format (http:// or https://)
- Title and URL are required for create operations
- Tags should be deduplicated and trimmed
- Page size defaults to 20, min 1, max 100

**Files to create:**
- src/backend/internal/model/bookmark.go

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** None

### 3. Backend Repository Layer
**Description:** Implement the in-memory repository for bookmark data persistence with CRUD operations and query capabilities. The repository will use a thread-safe in-memory data structure (map with mutex) to simulate database operations.

Repository methods:
- `Create(ctx context.Context, b *Bookmark) error`: Insert new bookmark, generate UUID for ID, set timestamps
- `FindByID(ctx context.Context, id string) (*Bookmark, error)`: Find bookmark by ID, return nil if not found
- `FindByTag(ctx context.Context, tag string) ([]*Bookmark, error)`: Find all bookmarks with specific tag
- `Search(ctx context.Context, query string) ([]*Bookmark, error)`: Full-text search across title, description, URL
- `FindAll(ctx context.Context, page, pageSize int) ([]*Bookmark, int64, error)`: Paginated list with total count
- `Update(ctx context.Context, b *Bookmark) error`: Update existing bookmark, update timestamp
- `Delete(ctx context.Context, id string) error`: Remove bookmark by ID

Implementation details:
- Use `sync.RWMutex` for thread safety
- Generate UUIDs using `github.com/google/uuid`
- Store bookmarks in `map[string]*Bookmark`
- Implement pagination logic for FindAll

**Files to create:**
- src/backend/internal/repository/repository.go

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** None

### 4. Backend Service Layer
**Description:** Implement the business logic layer that orchestrates repository operations and enforces business rules. The service layer validates inputs, handles errors, and coordinates data flow between repository and handler.

Service methods:
- `CreateBookmark(ctx context.Context, input CreateBookmarkInput) (*Bookmark, error)`: Validate input, deduplicate tags, call repository Create
- `GetBookmark(ctx context.Context, id string) (*Bookmark, error)`: Call repository FindByID, return 404 if not found
- `ListBookmarks(ctx context.Context, page, pageSize int, filters ListFilters) (*BookmarkPage, error)`: Apply pagination and filters, calculate total pages
- `UpdateBookmark(ctx context.Context, id string, input UpdateBookmarkInput) (*Bookmark, error)`: Validate exists, update fields, call repository Update
- `DeleteBookmark(ctx context.Context, id string) error`: Call repository Delete, return 404 if not found
- `SearchBookmarks(ctx context.Context, query string) ([]*Bookmark, error)`: Call repository Search, handle empty query
- `GetTags(ctx context.Context) ([]string, error)`: Extract all unique tags from bookmarks

Business rules:
- Validate URL format (must start with http:// or https://)
- Deduplicate and trim tags
- Default page size to 20, enforce min 1, max 100
- Handle empty search gracefully
- Return appropriate error codes for not found, invalid input

**Files to create:**
- src/backend/internal/service/service.go

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 3

### 5. Backend HTTP Handler and API Endpoints
**Description:** Implement the HTTP handlers that expose REST API endpoints for all bookmark operations. Handlers will parse requests, validate inputs, call service methods, and format JSON responses with appropriate HTTP status codes.

API Endpoints:
- `POST /api/bookmarks`: Create new bookmark
  - Request: JSON body with URL, title, description, tags
  - Response: 201 with created bookmark, or 400 with validation error
- `GET /api/bookmarks`: List all bookmarks with pagination
  - Query params: page (int, default 1), page_size (int, default 20), tag (string), search (string)
  - Response: 200 with BookmarkPage object
- `GET /api/bookmarks/:id`: Get single bookmark by ID
  - Response: 200 with bookmark, or 404 if not found
- `PUT /api/bookmarks/:id`: Update bookmark
  - Request: JSON body with optional fields
  - Response: 200 with updated bookmark, or 404/400
- `DELETE /api/bookmarks/:id`: Delete bookmark
  - Response: 204 No Content, or 404 if not found
- `GET /api/bookmarks/search`: Search bookmarks
  - Query param: q (string, required)
  - Response: 200 with array of bookmarks
- `GET /api/tags`: Get all unique tags
  - Response: 200 with array of tag strings
- `GET /health`: Health check endpoint
  - Response: 200 with `{"status": "healthy"}`

Handler implementation:
- Use chi router for routing
- JSON encoding/decoding with `encoding/json`
- Error middleware for consistent error responses
- Request validation before calling service

**Files to create:**
- src/backend/internal/handler/handler.go

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 3, 4

### 6. Backend Middleware and Server Configuration
**Description:** Implement middleware components for cross-cutting concerns and configure the HTTP server with routing, middleware chain, and health check endpoint.

Middleware components:
- `LoggingMiddleware`: Log all incoming requests with method, path, status, duration
- `ErrorHandler`: Convert errors to consistent JSON error responses
- `RecoveryMiddleware`: Recover from panics and return 500 error

Server configuration:
- Listen on port 8080 (configurable via environment variable PORT)
- Configure routes using chi router
- Mount all middleware in correct order (recovery -> logging -> handler)
- Implement health check endpoint at `/health`
- Enable CORS for frontend (origin from localhost:3000 or localhost:5173)

**Files to create:**
- src/backend/internal/middleware/middleware.go
- src/backend/internal/server/server.go
- src/backend/cmd/main.go

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 5

### 7. Frontend Type Definitions and API Service
**Description:** Create TypeScript type definitions for all bookmark-related data structures and implement the API service layer that handles HTTP communication with the backend.

TypeScript interfaces:
- `Bookmark`: Same structure as Go model
- `CreateBookmarkInput`: For form submission
- `UpdateBookmarkInput`: For edit form
- `BookmarkPage`: For paginated responses
- `ListFilters`: For query parameters
- `APIError`: For error responses

API service implementation:
- `createBookmark(input: CreateBookmarkInput): Promise<Bookmark>`
- `getBookmark(id: string): Promise<Bookmark>`
- `listBookmarks(filters: ListFilters): Promise<BookmarkPage>`
- `updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark>`
- `deleteBookmark(id: string): Promise<void>`
- `searchBookmarks(query: string): Promise<Bookmark[]>`
- `getTags(): Promise<string[]>`

Implementation details:
- Use fetch API or axios for HTTP requests
- Base URL configurable via environment variable (VITE_API_URL)
- Error handling with try/catch and rejection
- Content-Type: application/json for requests

**Files to create:**
- src/frontend/src/types/bookmark.ts
- src/frontend/src/services/api.ts

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** None

### 8. Frontend Custom Hooks for State Management
**Description:** Implement custom React hooks for managing bookmark state, API calls, and form state. These hooks will encapsulate business logic and provide clean interfaces for components.

Custom hooks:
- `useBookmarks()`: Manage list state with pagination
  - State: bookmarks, total, page, pageSize, filters
  - Methods: loadBookmarks, setPage, setFilters, addBookmark, updateBookmark, deleteBookmark
  - Effect: Auto-load on mount, reload on filter change
- `useBookmark(id)`: Manage single bookmark state
  - State: bookmark, loading, error
  - Methods: loadBookmark, refresh
  - Effect: Auto-load on id change
- `useBookmarkForm(initialValues?)`: Manage form state for create/edit
  - State: formData, errors, isSubmitting
  - Methods: handleChange, handleSubmit, reset
  - Validation: URL format, required fields
- `useTags()`: Manage tag list and filtering
  - State: tags, selectedTag, loading
  - Methods: loadTags, toggleFilter

Implementation details:
- Use `useState`, `useEffect`, `useCallback`, `useMemo` hooks
- Proper cleanup in useEffect
- Error handling and loading states
- Optimistic updates where appropriate

**Files to create:**
- src/frontend/src/hooks/useBookmarks.ts
- src/frontend/src/hooks/useBookmark.ts
- src/frontend/src/hooks/useBookmarkForm.ts
- src/frontend/src/hooks/useTags.ts

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 7

### 9. Frontend Layout and Routing
**Description:** Create the main application layout with routing, navigation, and responsive design. Set up the page structure that will contain all feature components.

Components:
- `Layout`: Main container with header, sidebar, and content area
  - Header: App title, search bar position
  - Sidebar: Tag filter list, navigation
  - Content: Route-based content area
- `Header`: Top navigation bar with logo/title
- `Sidebar`: Left sidebar with tag filters and stats

Routing:
- Use React Router (react-router-dom)
- Routes:
  - `/` -> BookmarkList page (default)
  - `/bookmarks/:id` -> Bookmark detail page (optional)
  - `/bookmarks/new` -> Create bookmark form
  - `/bookmarks/:id/edit` -> Edit bookmark form
- Layout wrapper for authenticated pages

Styling:
- Responsive design with Tailwind CSS
- Mobile-first approach
- Grid/flexbox for layout

**Files to create:**
- src/frontend/src/components/Layout.tsx
- src/frontend/src/components/Header.tsx
- src/frontend/src/components/Sidebar.tsx

**Files to modify:**
- src/frontend/src/App.tsx (update with routing)

**Complexity:** Medium
**Dependencies:** 7

### 10. Frontend Bookmark List and Pagination
**Description:** Implement the bookmark list page that displays paginated bookmarks as cards, with pagination controls and empty state handling.

Components:
- `BookmarkList`: Page component
  - Props: None (uses hooks internally)
  - Layout: Grid of BookmarkCard components
  - Features: Refresh button, sort options (optional)
- `BookmarkCard`: Individual bookmark display
  - Props: bookmark (Bookmark), onEdit (id => void), onDelete (id => void)
  - Display: Title, URL preview, description, tags, action buttons
  - Interactions: Click title to view, edit button, delete button with confirmation
- `Pagination`: Page navigation controls
  - Props: currentPage, totalPages, onPageChange
  - Display: Previous/Next buttons, page number indicators
  - Interactions: Click page number or prev/next to navigate

Features:
- Empty state: Show message when no bookmarks exist
- Loading state: Skeleton or spinner while loading
- Error state: Display error message with retry option
- Card layout: Responsive grid (1 column mobile, 2-3 columns desktop)
- Tag display: Limited preview with "more" indicator if too many tags

**Files to create:**
- src/frontend/src/pages/BookmarkList.tsx
- src/frontend/src/components/BookmarkCard.tsx
- src/frontend/src/components/Pagination.tsx

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 8

### 11. Frontend Bookmark Form and Validation
**Description:** Implement the bookmark creation and edit form with real-time validation, error display, and proper form submission handling.

Components:
- `BookmarkForm`: Create/edit form
  - Props: initialData (Bookmark | null), onSubmit (bookmark => void), onCancel => void, submitLabel (string)
  - Fields: URL (text), Title (text), Description (textarea), Tags (comma-separated text)
  - Validation: URL format regex, required fields, character limits
  - Error display: Inline error messages, form-level errors
  - States: Normal, submitting (disabled), error

Features:
- Real-time validation on blur
- URL preview/validation on submit
- Tag parsing: Split by comma, trim, deduplicate
- Loading state during submission
- Success/error feedback
- Form reset on success
- Cancel button returns to list

**Files to create:**
- src/frontend/src/components/BookmarkForm.tsx
- src/frontend/src/pages/CreateBookmark.tsx
- src/frontend/src/pages/EditBookmark.tsx

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 8

### 12. Frontend Search and Tag Filtering
**Description:** Implement search functionality and tag-based filtering with real-time UI updates and debouncing for performance.

Components:
- `SearchBar`: Search input component
  - Props: value (string), onChange (query => void), placeholder (string)
  - Features: Debounced input (300ms), clear button, search icon
  - States: Focused, with/without value
- `TagSidebar`: Tag list with counts and filtering
  - Props: tags (string[]), selectedTag (string | null), onTagSelect (tag => void)
  - Display: Tag name with count badge, selected state
  - Interactions: Click tag to filter, click selected to clear filter
  - Features: Sort by count or alphabetically

Features:
- Search debouncing to avoid excessive API calls
- Combined filters: search + tag filter
- Filter state management in useBookmarks hook
- Visual indication of active filters
- Filter count display
- Responsive sidebar (collapsible on mobile)

**Files to create:**
- src/frontend/src/components/SearchBar.tsx
- src/frontend/src/components/TagSidebar.tsx
- src/frontend/src/pages/BookmarkList.tsx (integrate search and filter)

**Files to modify:**
- src/frontend/src/hooks/useBookmarks.ts (add filter logic)

**Complexity:** Medium
**Dependencies:** 8, 10, 11

### 13. Frontend Error Handling and User Feedback
**Description:** Implement comprehensive error handling, loading states, and user feedback mechanisms throughout the application for a polished user experience.

Components:
- `ErrorBoundary`: React error boundary for catching component errors
- `Notification`: Toast/notification component for user feedback
  - Props: message (string), type (success|error|warning|info), duration (ms)
  - Features: Auto-dismiss, manual close, different styles per type

Features:
- Global error handling for API errors
- Loading states for all async operations
- Optimistic updates with rollback on error
- Confirmation dialogs for destructive actions (delete)
- Form validation error display
- Network error handling
- Empty state messages

Implementation:
- Use Context API for notification management
- Error boundary at root level
- Axios/fetch error interceptors
- User-friendly error messages
- Retry mechanisms where appropriate

**Files to create:**
- src/frontend/src/components/ErrorBoundary.tsx
- src/frontend/src/components/Notification.tsx
- src/frontend/src/contexts/NotificationContext.tsx
- src/frontend/src/hooks/useNotification.ts

**Files to modify:**
- src/frontend/src/main.tsx (add error boundary)
- src/frontend/src/components/BookmarkCard.tsx (add delete confirmation)

**Complexity:** Medium
**Dependencies:** 8

### 14. Testing - Backend Unit Tests
**Description:** Implement comprehensive unit tests for backend components including repository operations, service logic, and handler functionality.

Test coverage:
- Repository tests:
  - Create, FindByID, FindAll, Update, Delete operations
  - Thread safety with concurrent access
  - UUID generation uniqueness
- Service tests:
  - Input validation (invalid URL, missing required fields)
  - Tag deduplication
  - Pagination logic
  - Search functionality
  - Error handling (not found, validation errors)
- Handler tests:
  - HTTP status codes (200, 201, 204, 400, 404, 500)
  - Request parsing and validation
  - Response format (JSON structure)
  - Query parameter handling

Test implementation:
- Use `testing` package
- Mock dependencies where appropriate
- Test helper functions for request/response
- Table-driven tests for multiple cases
- Coverage target: 80%+

**Files to create:**
- src/backend/internal/repository/repository_test.go
- src/backend/internal/service/service_test.go
- src/backend/internal/handler/handler_test.go

**Files to modify:**
- None

**Complexity:** High
**Dependencies:** 2, 3, 4, 5

### 15. Testing - Frontend Component Tests
**Description:** Implement unit and integration tests for frontend components using React Testing Library and Jest/Vitest.

Test coverage:
- Component tests:
  - BookmarkCard: renders correctly, handles actions
  - BookmarkForm: validation, submission, error display
  - Pagination: page navigation, disabled states
  - SearchBar: input handling, debouncing
  - TagSidebar: tag selection, count display
  - BookmarkList: empty state, loading state, error state
- Hook tests:
  - useBookmarks: state management, API calls
  - useBookmarkForm: validation, submission
  - useTags: tag loading, filtering
- Integration tests:
  - Form submission flow
  - Pagination with data loading
  - Search and filter combination

Test implementation:
- Use React Testing Library
- Use Mock Service Worker (MSW) for API mocking
- Test user interactions and async operations
- Snapshot tests for static components
- Coverage target: 75%+

**Files to create:**
- src/frontend/src/components/BookmarkCard.test.tsx
- src/frontend/src/components/BookmarkForm.test.tsx
- src/frontend/src/components/Pagination.test.tsx
- src/frontend/src/components/SearchBar.test.tsx
- src/frontend/src/components/TagSidebar.test.tsx
- src/frontend/src/hooks/useBookmarks.test.ts
- src/frontend/src/hooks/useBookmarkForm.test.ts

**Files to modify:**
- src/frontend/package.json (add testing dependencies)

**Complexity:** High
**Dependencies:** 9, 10, 11, 12

### 16. Documentation and Deployment Configuration
**Description:** Create API documentation, deployment configurations, and README files for the project.

Documentation:
- `README.md` at project root
  - Project overview
  - Tech stack
  - Installation instructions
  - Development setup
  - API reference
- `src/backend/README.md`
  - Backend architecture
  - API endpoint documentation
  - Environment variables
- `src/frontend/README.md`
  - Frontend architecture
  - Component documentation
  - Build and deploy instructions

Deployment:
- `.env.example` for both backend and frontend
- `docker-compose.yml` for local development
- `Dockerfile` for backend
- `Dockerfile` for frontend (nginx static serving)
- `.gitignore` for Go and Node.js

API Documentation:
- OpenAPI/Swagger specification (optional)
- Postman collection for API testing
- cURL examples for each endpoint

**Files to create:**
- README.md
- src/backend/README.md
- src/frontend/README.md
- .env.example
- docker-compose.yml
- src/backend/Dockerfile
- src/frontend/Dockerfile
- .gitignore
- api-collection.json (Postman)

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** None

## File Structure

```
test-3-bookmark/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── api-collection.json
├── artifacts/
│   └── plan.md
├── src/
│   ├── backend/
│   │   ├── README.md
│   │   ├── go.mod
│   │   ├── Dockerfile
│   │   ├── cmd/
│   │   │   └── main.go
│   │   ├── internal/
│   │   │   ├── model/
│   │   │   │   └── bookmark.go
│   │   │   ├── repository/
│   │   │   │   ├── repository.go
│   │   │   │   └── repository_test.go
│   │   │   ├── service/
│   │   │   │   ├── service.go
│   │   │   │   └── service_test.go
│   │   │   ├── handler/
│   │   │   │   ├── handler.go
│   │   │   │   └── handler_test.go
│   │   │   ├── middleware/
│   │   │   │   └── middleware.go
│   │   │   └── server/
│   │   │       └── server.go
│   │   └── test/
│   │       └── integration/
│   └── frontend/
│       ├── README.md
│       ├── package.json
│       ├── tsconfig.json
│       ├── index.html
│       ├── Dockerfile
│       ├── public/
│       │   └── favicon.ico
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           ├── types/
│           │   └── bookmark.ts
│           ├── services/
│           │   └── api.ts
│           ├── components/
│           │   ├── Layout.tsx
│           │   ├── Header.tsx
│           │   ├── Sidebar.tsx
│           │   ├── BookmarkCard.tsx
│           │   ├── BookmarkCard.test.tsx
│           │   ├── BookmarkForm.tsx
│           │   ├── BookmarkForm.test.tsx
│           │   ├── Pagination.tsx
│           │   ├── Pagination.test.tsx
│           │   ├── SearchBar.tsx
│           │   ├── SearchBar.test.tsx
│           │   ├── TagSidebar.tsx
│           │   ├── TagSidebar.test.tsx
│           │   ├── ErrorBoundary.tsx
│           │   └── Notification.tsx
│           ├── pages/
│           │   ├── BookmarkList.tsx
│           │   ├── CreateBookmark.tsx
│           │   └── EditBookmark.tsx
│           ├── hooks/
│           │   ├── useBookmarks.ts
│           │   ├── useBookmarks.test.ts
│           │   ├── useBookmark.ts
│           │   ├── useBookmarkForm.ts
│           │   ├── useBookmarkForm.test.ts
│           │   └── useTags.ts
│           ├── contexts/
│           │   └── NotificationContext.tsx
│           └── utils/
│               └── validation.ts
```

## Testing Strategy

### Backend Testing
1. **Unit Tests**
   - Repository: Test each CRUD operation with mock data, verify thread safety
   - Service: Test business logic, validation, error handling with table-driven tests
   - Handler: Test HTTP endpoints with test server, verify status codes and response formats

2. **Integration Tests**
   - End-to-end API tests using `net/http/httptest`
   - Test complete request/response cycles
   - Verify database-like operations with in-memory repository

3. **Test Cases**
   - Valid bookmark creation with all fields
   - Invalid URL format rejection
   - Missing required fields validation
   - Duplicate tag deduplication
   - Pagination with various page sizes
   - Search with partial matches
   - Tag filtering
   - Concurrent access safety

### Frontend Testing
1. **Component Tests**
   - Render components with different props
   - Test user interactions (clicks, form submissions)
   - Verify conditional rendering (loading, error, empty states)
   - Test form validation

2. **Hook Tests**
   - Test state management and updates
   - Test API call integration with mocking
   - Test error handling and edge cases

3. **Integration Tests**
   - Test complete user flows (create bookmark, filter, search)
   - Test component interactions
   - Use MSW for API mocking

4. **Test Cases**
   - Bookmark card renders correctly with various data
   - Form validation prevents invalid submission
   - Pagination navigates correctly between pages
   - Search debounces input properly
   - Tag filter applies and clears correctly
   - Error states display appropriate messages

### Test Coverage Goals
- Backend: 80%+ line coverage
- Frontend: 75%+ line coverage
- Critical paths: 100% coverage (validation, error handling)

## Risks

1. **In-Memory Storage Limitations**: The in-memory data store will lose all data on server restart. This is acceptable for development/demo but not production. Consider documenting this limitation clearly.

2. **Concurrency Issues**: While using sync.RWMutex for thread safety, there could be edge cases with concurrent read/write operations that need thorough testing under load.

3. **Frontend State Synchronization**: Keeping multiple states in sync (list, individual bookmark, form) could lead to inconsistencies. Careful state management architecture is required.

4. **API Rate Limiting**: Without a real backend, there's no rate limiting. In production, API rate limits could cause issues with rapid successive requests (e.g., quick pagination).

5. **Security Considerations**: The current design lacks authentication/authorization. This should be clearly noted as a future enhancement and not used in production without proper security measures.
