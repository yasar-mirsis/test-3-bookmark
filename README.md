# test-3-bookmark

## Overview

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


---

This project is managed by the SDLC Pipeline. Implementation tasks are tracked as GitHub/GitLab issues.
Each issue is solved by an autonomous agent on its own branch with a pull request.