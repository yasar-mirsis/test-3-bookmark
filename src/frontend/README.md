# Bookmark Manager - Frontend (React)

## Overview

This is the frontend application for the Bookmark Manager, built with React, TypeScript, and Tailwind CSS.

## Features

- **Bookmark Management**: Create, read, update, and delete bookmarks
- **Search**: Full-text search across title, description, and URL
- **Tag Filtering**: Filter bookmarks by tags with a sidebar
- **Pagination**: Paginated bookmark listing (20 items per page)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Real-time Updates**: UI updates without page refresh

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | latest | Type safety |
| React Router | 6+ | Client-side routing |
| React Query | 5+ | Server state management |
| React Hook Form | 7+ | Form handling |
| Axios | 1+ | HTTP client |
| Tailwind CSS | 3+ | Styling |
| Vite | 5+ | Build tool |

## Project Structure

```
src/frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── BookmarkCard.tsx
│   │   ├── BookmarkForm.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TagSidebar.tsx
│   │   └── index.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useBookmarks.ts
│   │   └── index.ts
│   ├── pages/            # Page components
│   │   └── BookmarkList.tsx
│   ├── services/         # API service layer
│   │   ├── api.ts
│   │   └── index.ts
│   ├── styles/           # Global styles
│   │   └── index.css
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn

### Installation

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## API Integration

The frontend communicates with the backend through the `services/api.ts` module.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | Backend API base URL |

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Components

### BookmarkCard

Displays a single bookmark with title, URL, description, tags, and action buttons.

```tsx
<BookmarkCard
  bookmark={bookmark}
  onEdit={(bookmark) => handleEdit(bookmark)}
  onDelete={(id) => handleDelete(id)}
/>
```

### BookmarkForm

Form for creating and editing bookmarks with validation.

```tsx
<BookmarkForm
  bookmark={bookmark} // Optional for edit mode
  onSuccess={() => navigate('/')}
/>
```

### SearchBar

Debounced search input with clear button.

```tsx
<SearchBar
  onSearch={(query) => setSearchQuery(query)}
  placeholder="Search bookmarks..."
/>
```

### TagSidebar

Sidebar displaying all tags with counts and filter functionality.

```tsx
<TagSidebar
  tags={tags}
  selectedTag={selectedTag}
  onTagClick={(tag) => setSelectedTag(tag)}
/>
```

### Pagination

Page navigation controls.

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={(page) => setPage(page)}
/>
```

## State Management

The application uses React Query for server state management and React Hook Form for form state.

### Custom Hooks

#### useBookmarks

Custom hook for bookmark operations (internal use, managed by pages).

## Styling

The application uses Tailwind CSS for styling. Key design decisions:

- **Color Scheme**: Primary blue (`primary-500` to `primary-700`)
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Responsive**: Mobile-first approach with breakpoints at `md`, `lg`, and `xl`

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Vercel

```bash
npm run build
# Deploy the dist/ folder
```

### Netlify

```bash
npm run build
# Deploy the dist/ folder
```

### Docker

See the root `docker-compose.yml` for containerized deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run lint and tests
5. Submit a pull request

## License

MIT
