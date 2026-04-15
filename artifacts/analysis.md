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

### US-5: Edit a Bookmark

**As a** user, **I want to** edit an existing bookmark's URL, title, description, and tags, **so that** I can update incorrect or outdated information.

**Acceptance Criteria:**
- Given a bookmark exists, when I click edit, then a pre-filled edit form is displayed.
- Given I modify fields and save, when I confirm, then the bookmark is updated.
- Given I change the URL to an invalid format, when I save, then validation error is shown.
- Given I save changes, when successful, then the bookmark card updates without page refresh.
- Given the updated_at timestamp, when I edit, then it is refreshed to current time.

**Priority:** Must

### US-6: Delete a Bookmark

**As a** user, **I want to** delete a bookmark, **so that** I can remove unwanted or obsolete entries.

**Acceptance Criteria:**
- Given a bookmark exists, when I click delete and confirm, then the bookmark is removed.
- Given I cancel the delete confirmation, when I cancel, then the bookmark remains.
- Given a bookmark is deleted, when successful, then the list updates immediately.
- Given the bookmark had tags, when deleted, then tag counts are updated.

**Priority:** Must

### US-7: View Tags with Counts

**As a** user, **I want to** see all unique tags with their bookmark counts, **so that** I can understand my bookmark organization.

**Acceptance Criteria:**
- Given tags exist, when I load the tag sidebar, then all tags are listed with counts.
- Given a tag has no bookmarks, when the list loads, then the tag is not shown.
- Given tags are added or removed, when changes occur, then counts update in real-time.
- Given no bookmarks exist, when I view tags, then an empty tag list is shown.

**Priority:** Must

### US-8: Health Check

**As a** system administrator, **I want to** check the API health status, **so that** I can verify the service is running.

**Acceptance Criteria:**
- Given the service is running, when I call /api/health, then status "ok" and uptime are returned.
- Given the service is down, when I call /api/health, then an error or timeout occurs.
- Given the uptime is tracked, when I call health, then uptime reflects service restart time.

**Priority:** Must

## Functional Requirements

### Backend (Go)

#### FR-BE-001: Bookmark CRUD Operations
- POST /api/bookmarks: Create bookmark with {url, title, description?, tags?: string[]}
- GET /api/bookmarks: List all bookmarks with pagination and filtering
- GET /api/bookmarks/:id: Retrieve single bookmark by ID
- PUT /api/bookmarks/:id: Update bookmark fields
- DELETE /api/bookmarks/:id: Delete bookmark by ID

**Priority:** Must

#### FR-BE-002: URL Validation
- Validate URL format using standard URL parsing
- Reject malformed URLs with 400 Bad Request
- Support http and https protocols

**Priority:** Must

#### FR-BE-003: Search Functionality
- Support search query parameter for title, description, and URL
- Case-insensitive search matching
- Return partial matches

**Priority:** Must

#### FR-BE-004: Tag Filtering
- Support tag query parameter to filter bookmarks
- GET /api/tags endpoint returns all unique tags with counts
- Tags stored in separate bookmark_tags table for normalization

**Priority:** Must

#### FR-BE-005: Pagination
- Default page size of 20 bookmarks
- Support page and limit query parameters
- Return paginated results with metadata (total count, current page, total pages)

**Priority:** Must

#### FR-BE-006: Health Check Endpoint
- GET /api/health returns {status: "ok", uptime: seconds}
- Uptime calculated from server start time

**Priority:** Must

#### FR-BE-007: CORS Middleware
- Allow requests from localhost:5173
- Allow standard HTTP methods (GET, POST, PUT, DELETE)
- Allow necessary headers (Content-Type)

**Priority:** Must

#### FR-BE-008: Request Logging
- Log method, path, and duration for each request
- Include request ID for traceability
- Log to stdout/stderr

**Priority:** Must

#### FR-BE-009: Panic Recovery Middleware
- Catch panics and return 500 Internal Server Error
- Log panic details for debugging
- Prevent server crash from unhandled panics

**Priority:** Must

#### FR-BE-010: SQLite Database
- Use go-sqlite3 driver
- Bookmarks table: id (INTEGER PRIMARY KEY), url (TEXT NOT NULL), title (TEXT NOT NULL), description (TEXT), created_at (DATETIME), updated_at (DATETIME)
- bookmark_tags table: bookmark_id (INTEGER), tag (TEXT), PRIMARY KEY(bookmark_id, tag)
- Foreign key constraints between bookmark_tags and bookmarks

**Priority:** Must

#### FR-BE-011: Unit Tests
- Store layer tests for all CRUD operations
- Handler layer tests for all endpoints
- Test URL validation logic
- Test pagination and filtering logic

**Priority:** Must

### Frontend (React + TypeScript)

#### FR-FE-001: BookmarkList Component
- Display bookmarks as cards
- Show title, truncated URL, tags as chips, description preview
- Include search bar for filtering
- Include tag filter dropdown

**Priority:** Must

#### FR-FE-002: AddBookmarkForm Component
- Modal form for creating new bookmarks
- Fields: URL, title, description, tags (comma-separated input)
- URL validation before submission
- Form reset after successful creation

**Priority:** Must

#### FR-FE-003: EditBookmarkModal Component
- Pre-filled form with existing bookmark data
- Same fields as add form
- Update on save, cancel to close

**Priority:** Must

#### FR-FE-004: TagSidebar Component
- Display all tags with bookmark counts
- Clickable tags to filter bookmarks
- Active tag highlighting

**Priority:** Must

#### FR-FE-005: Pagination Component
- Previous/Next buttons
- Page indicator showing current page and total
- Disabled states for boundary pages

**Priority:** Must

#### FR-FE-006: API Integration
- Use fetch for all API calls (no axios)
- Handle loading states
- Handle error states with user-friendly messages
- TypeScript interfaces for all API responses

**Priority:** Must

#### FR-FE-007: State Management
- Use useState and useEffect hooks
- No Redux or external state library
- Local component state for form inputs
- Lifting state for shared data (bookmarks, tags)

**Priority:** Must

#### FR-FE-008: CSS Modules Styling
- Use plain CSS modules (no UI library)
- Responsive design considerations
- Consistent styling across components

**Priority:** Must

#### FR-FE-009: Vite Dev Server Proxy
- Proxy /api requests to Go backend on port 8080
- Frontend served on port 5173
- No CORS issues during development

**Priority:** Must

## Non-Functional Requirements

### NFR-001: Performance
- Backend API response time under 100ms for typical queries
- Frontend initial load under 2 seconds on modern connections
- Efficient database queries with proper indexing on tags and URL

**Priority:** Must

### NFR-002: Scalability
- Support up to 10,000 bookmarks without significant performance degradation
- Pagination prevents loading all bookmarks at once

**Priority:** Should

### NFR-003: Security
- URL validation prevents injection attacks
- Input sanitization for description and title fields
- No authentication required for local development (document for production extension)

**Priority:** Must

### NFR-004: Reliability
- Panic recovery prevents server crashes
- Database connection pooling
- Graceful error handling with appropriate HTTP status codes

**Priority:** Must

### NFR-005: Maintainability
- Clean project structure (cmd/, internal/, pkg/)
- Unit test coverage for critical paths
- TypeScript for type safety in frontend
- Go modules for dependency management

**Priority:** Must

### NFR-006: Usability
- Responsive design for desktop and tablet
- Clear error messages for validation failures
- Loading indicators during async operations
- Keyboard navigation support for forms

**Priority:** Should

### NFR-007: Portability
- SQLite database for easy deployment
- Docker-ready configuration (implied for production)
- Cross-platform Go binary compilation

**Priority:** Should

### NFR-008: Observability
- Request logging for debugging
- Health check endpoint for monitoring
- Console logging during development

**Priority:** Must

## Edge Cases

### EC-001: URL Validation Edge Cases
- URLs without protocol (http/https)
- URLs with special characters or unicode
- Very long URLs exceeding database limits
- Malformed URLs (missing scheme, invalid characters)
- Duplicate URL entries (should allow or reject?)

**Priority:** Must

### EC-002: Empty States
- No bookmarks in database
- No tags in database
- No results from search query
- No results from tag filter
- Empty description field

**Priority:** Must

### EC-003: Pagination Edge Cases
- Page number exceeds total pages
- Limit parameter exceeds maximum allowed
- Zero or negative page/limit values
- Single bookmark pagination
- Exactly 20 bookmarks (boundary case)

**Priority:** Must

### EC-004: Tag Edge Cases
- Empty tag string in input
- Tags with special characters
- Very long tag names
- Duplicate tags in single bookmark
- Case sensitivity (Tag vs tag)
- Leading/trailing whitespace in tags

**Priority:** Must

### EC-005: Network Errors
- API server unavailable
- Request timeout
- Invalid JSON response from API
- Network interruption during form submission

**Priority:** Must

### EC-006: Database Edge Cases
- Database file locked
- Database corruption
- Concurrent access conflicts
- SQLite file permissions

**Priority:** Should

### EC-007: Form Validation Edge Cases
- Empty required fields
- Invalid URL format
- Title exceeding length limits
- Description exceeding length limits
- Special characters in title/description

**Priority:** Must

### EC-008: Concurrent Operations
- Edit bookmark while another user is editing
- Delete bookmark while viewing details
- Rapid successive API calls

**Priority:** Could

### EC-009: Browser Compatibility
- Older browser support (if required)
- JavaScript disabled
- Cookie/localStorage restrictions

**Priority:** Could

### EC-010: Timezone Handling
- created_at and updated_at timezone consistency
- Display timezone for users in different regions

**Priority:** Could

## Assumptions

### A-001: Development Environment
- Development is local-only (localhost:5173 frontend, localhost:8080 backend)
- No authentication/authorization required for initial version
- Single-user application (no multi-tenancy)

**Priority:** Must

### A-002: Database
- SQLite is sufficient for expected data volume (< 10,000 bookmarks)
- Database file stored locally in project directory
- No database migrations required for initial schema

**Priority:** Must

### A-003: URL Handling
- Only http and https protocols need validation
- URL uniqueness is not enforced (duplicate URLs allowed)
- URL truncation is for display only, full URL stored

**Priority:** Must

### A-004: Tag Handling
- Tags are case-sensitive (Tag and tag are different)
- Tags are limited to alphanumeric characters and hyphens
- Maximum tag length is 50 characters
- Maximum tags per bookmark is 20

**Priority:** Should

### A-005: Frontend Architecture
- No build step optimization required for development
- Single-page application (SPA) architecture
- No server-side rendering needed

**Priority:** Must

### A-006: Testing
- Unit tests are sufficient (no integration/E2E tests required initially)
- Tests run in CI/CD pipeline
- Test coverage target is 80% for backend

**Priority:** Should

### A-007: Error Handling
- Client-side validation catches most errors before API calls
- Backend returns standard HTTP status codes
- Error messages are user-friendly and actionable

**Priority:** Must

### A-008: Deployment
- Application runs as standalone processes
- No containerization required for initial deployment
- Environment variables for configuration (port, database path)

**Priority:** Could

### A-009: Data Persistence
- No data export/import functionality required
- No backup/restore mechanism required
- Data loss on database file deletion is acceptable

**Priority:** Could

### A-010: Search Behavior
- Search is simple substring matching (no full-text search)
- Search is case-insensitive
- Search does not support wildcards or advanced queries

**Priority:** Must

## Open Questions

### OQ-001: URL Uniqueness
Should the system enforce unique URLs, preventing duplicate bookmarks for the same URL?

**Review By:** Backend Team

### OQ-002: Tag Case Sensitivity
Should "Tag", "tag", and "TAG" be treated as the same tag or different tags?

**Review By:** Product Owner

### OQ-003: Maximum Field Lengths
What are the maximum allowed lengths for URL, title, description, and tag fields?

**Review By:** Backend Team

### OQ-004: Search Scope
Should search include tags or only title, description, and URL?

**Review By:** Product Owner

### OQ-005: Delete Behavior
Should deleting a bookmark also remove orphaned tags from the tag list, or keep tags for potential reuse?

**Review By:** Backend Team

### OQ-006: Pagination Metadata
What exact format should pagination metadata have in the API response?

**Review By:** Backend Team

### OQ-007: URL Preview
Should the frontend fetch and display page titles/descriptions from the bookmarked URL (Open Graph scraping)?

**Review By:** Product Owner

### OQ-008: Import/Export
Is bookmark import/export functionality required for future iterations?

**Review By:** Product Owner

### OQ-009: Favorite/Starred
Should bookmarks support a "favorite" or "starred" status for prioritization?

**Review By:** Product Owner

### OQ-010: Production Database
Should the system be designed to easily migrate from SQLite to PostgreSQL/MySQL for production?

**Review By:** DevOps Team
