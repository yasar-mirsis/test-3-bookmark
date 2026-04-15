# Frontend Documentation

React frontend for the Bookmark Manager application.

## Overview

The frontend is built with React and TypeScript, providing a modern, responsive user interface for managing bookmarks. It uses React Query for server state management and Tailwind CSS for styling.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI component library |
| TypeScript | latest | Type safety |
| Vite | latest | Build tool and dev server |
| React Query | latest | Server state management |
| Tailwind CSS | latest | Utility-first CSS |
| React Hook Form | latest | Form handling |
| Axios | latest | HTTP client |

## Project Structure

```
src/frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── BookmarkCard.tsx      # Individual bookmark display
│   │   ├── BookmarkForm.tsx      # Create/Edit form
│   │   ├── SearchBar.tsx         # Search input component
│   │   ├── TagSidebar.tsx        # Tag filter sidebar
│   │   └── Pagination.tsx        # Pagination controls
│   ├── pages/             # Page components
│   │   └── BookmarkList.tsx      # Main bookmark list page
│   ├── hooks/             # Custom React hooks
│   │   └── useBookmarks.ts       # Bookmark state management
│   ├── services/          # API service layer
│   │   └── api.ts         # API client functions
│   ├── types/             # TypeScript type definitions
│   │   └── bookmark.ts    # Type interfaces
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Components

### BookmarkCard

Displays a single bookmark with its metadata and actions.

**Props:**
```typescript
interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}
```

**Features:**
- Displays title, URL, description, and tags
- Edit and delete action buttons
- Clickable URL link
- Formatted date display

**Usage:**
```tsx
<BookmarkCard
  bookmark={bookmark}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### BookmarkForm

Form component for creating and editing bookmarks.

**Props:**
```typescript
interface BookmarkFormProps {
  bookmark?: Bookmark;      // If provided, form is in edit mode
  onSubmit: (data: CreateBookmarkInput | UpdateBookmarkInput) => void;
  onCancel?: () => void;
}
```

**Fields:**
- URL (required, validated)
- Title (required)
- Description (optional)
- Tags (optional, comma-separated)

**Features:**
- Real-time URL validation
- Tag deduplication
- Form reset on successful submission
- Error display for each field

**Usage:**
```tsx
<BookmarkForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

---

### SearchBar

Search input component with debouncing.

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}
```

**Features:**
- Debounced input (300ms delay)
- Clear button
- Keyboard support (Enter to search)

**Usage:**
```tsx
<SearchBar
  onSearch={handleSearch}
  placeholder="Search bookmarks..."
/>
```

---

### TagSidebar

Sidebar component displaying all tags with counts.

**Props:**
```typescript
interface TagSidebarProps {
  tags: TagWithCount[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}
```

**Features:**
- Displays tag names with bookmark counts
- Click to filter by tag
- Click again to clear filter
- Active state highlighting

**Usage:**
```tsx
<TagSidebar
  tags={tags}
  selectedTag={selectedTag}
  onSelectTag={setSelectedTag}
/>
```

---

### Pagination

Pagination controls for navigating bookmark pages.

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Features:**
- Previous/Next buttons
- Page number buttons
- Current page indicator
- Disabled states for first/last page

**Usage:**
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

## Pages

### BookmarkList

Main page component displaying the bookmark list with all features.

**Features:**
- Search functionality
- Tag filtering
- Pagination
- Create/Edit modal
- Delete confirmation
- Empty state display

**State Management:**
Uses React Query for server state and React Hook Form for form management.

---

## Types

### Bookmark

```typescript
interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### CreateBookmarkInput

```typescript
interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
}
```

### UpdateBookmarkInput

```typescript
interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string;
  tags?: string[];
}
```

### BookmarkPage

```typescript
interface BookmarkPage {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### ListFilters

```typescript
interface ListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
}
```

---

## API Service

The `api.ts` module provides functions for communicating with the backend API.

### Functions

```typescript
// Create a new bookmark
createBookmark(input: CreateBookmarkInput): Promise<Bookmark>

// Get a bookmark by ID
getBookmark(id: string): Promise<Bookmark>

// List bookmarks with filters
listBookmarks(filters?: ListFilters): Promise<BookmarkPage>

// Update a bookmark
updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark>

// Delete a bookmark
deleteBookmark(id: string): Promise<void>

// Search bookmarks
searchBookmarks(query: string): Promise<Bookmark[]>

// Get all tags
getTags(): Promise<string[]>
```

### Configuration

The API base URL is configured via environment variable:

```bash
VITE_API_URL=http://localhost:8080/api
```

---

## Custom Hooks

### useBookmarks

Custom hook for managing bookmark state with React Query.

```typescript
const {
  // Query hooks
  useBookmarksList,
  useBookmark,
  useTags,
  
  // Mutation hooks
  useCreateBookmark,
  useUpdateBookmark,
  useDeleteBookmark,
  
  // Utilities
  refetchBookmarks,
  invalidateBookmarks,
} = useBookmarks();
```

**Usage:**
```tsx
function BookmarkList() {
  const { data: bookmarks, isLoading } = useBookmarksList();
  const createBookmark = useCreateBookmark();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {bookmarks?.bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}
```

---

## Styling

The application uses Tailwind CSS for styling. Key design decisions:

### Color Palette
- Primary: Blue (buttons, links)
- Success: Green (success messages)
- Error: Red (error messages, delete buttons)
- Gray scale: Text, borders, backgrounds

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tag sidebar collapses on mobile

### Components
- Cards with shadow and rounded corners
- Consistent spacing using Tailwind utilities
- Hover and focus states for interactive elements

---

## Development

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8080/api | Backend API URL |

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
