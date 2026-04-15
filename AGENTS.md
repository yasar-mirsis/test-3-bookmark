# AGENTS.md — test-3-bookmark

This file describes the project for AI agents working on implementation issues.

## Project Context

# Bookmark Manager - Analysis Document

## Stakeholders

| Stakeholder | Role | Interests |
|-------------|------|-----------|
| End Users | Bookmark managers/curators | Easy bookmark management, search, organization |
| Backend Developers | Go API implementation | Clean architecture, testability, maintainability |
| Frontend Developers | React UI implementation | Simple state management, responsive design |
| DevOps Engineers | Deployment & monitoring | Health checks, logging, error recovery |
| QA Engineers | Testing | Unit tests, integration tests, edge case coverage |

## User Stories

### US-1: Create a New Bookmark

**As a** user, **I want to** create a new bookmark with URL, title, description, and tags, **so that** I can save and organize web resources.

**Acceptance Criteria:**
- Given a valid URL, title, and optional description/tags, when I submit the create form, then the bookmark is saved and returned.
- Given an invalid URL format, when I submit the form, then an error message is displayed.
- Given empty required fields (URL or title), when I submit the form, then validation error is shown.
- Given duplicate tags in input, when I submit, then tags are deduplicated.
- Given the form is submitted, the tags sidebar updates to reflect new tag count.

**Priority:** Must

### US-2: View All Bookmarks

**As a** user, **I want to** view all my bookmarks in a paginated list, **so that** I can browse my saved resources.

**Acceptance Criteria:**
- Given bookmarks exist, when I load the bookmark list, then bookmarks are displayed as cards.
- Given more than 20 bookmarks, when I view the list, then pagination controls appear.
- Given no bookmarks exist, when I view the list, then an empty state message is shown.
- Given the page changes, when I navigate pages, then the correct subset of bookmarks is displayed.

**Priority:** Must

### US-3: Search Bookmarks

**As a** user, **I want to** search bookmarks by title, description, or URL, **so that** I can quickly find specific bookmarks.

**Acceptance Criteria:**
- Given search text, when I enter it in the search bar, then matching bookmarks are filtered.
- Given partial search text, when I search, then bookmarks containing the text are returned.
- Given no matching bookmarks, when I search, then an empty result message is shown.
- Given I clear the search, when I submit, then all bookmarks are displayed again.

**Priority:** Must

### US-4: Filter by Tag

**As a** user, **I want to** filter bookmarks by clicking on tags, **so that** I can view only bookmarks with specific tags.

**Acceptance Criteria:**
- Given tags exist, when I click a tag in the sidebar, then only bookmarks with that tag are shown.
- Given I click an active tag, when I click it again, then the filter is cleared.
- Given I select multiple filters (search + tag), when I apply them, then bookmarks matching both are shown.
- Given no bookmarks match the tag filter, when I apply it, then an empty state is shown.

**Priority:** Must


[... truncated for brevity ...]

## Architecture

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
| `src/frontend/src/hooks/useBookmarks.ts` | Custom hook for bookmark state management | `useBookmarks(

[... truncated for brevity ...]

## Working Guidelines

- Read this file and README.md before starting any work
- Follow existing code patterns and conventions
- Write clean, production-quality code with proper error handling
- Create or update tests if a testing setup exists
- Do NOT run git commands — the pipeline handles commits and pushes
- Do NOT ask questions — you are running in an automated pipeline