import { http, HttpResponse } from 'msw';
import { Bookmark, BookmarkPage } from '../types/bookmark';

// Sample bookmark data for testing
export const mockBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'React Documentation',
    url: 'https://react.dev',
    description: 'The official React documentation',
    tags: ['react', 'javascript', 'frontend'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/',
    description: 'Comprehensive TypeScript guide',
    tags: ['typescript', 'javascript'],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    title: 'Vite Documentation',
    url: 'https://vitejs.dev',
    description: 'Next generation frontend tooling',
    tags: ['vite', 'build-tools'],
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
];

// MSW handlers for API mocking
export const handlers = [
  // GET /api/bookmarks - List bookmarks
  http.get('/api/bookmarks', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || '';
    const tag = url.searchParams.get('tag') || '';

    // Filter bookmarks based on search and tag
    let filtered = [...mockBookmarks];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.description?.toLowerCase().includes(searchLower) ||
          b.url.toLowerCase().includes(searchLower)
      );
    }

    if (tag) {
      filtered = filtered.filter((b) => b.tags.includes(tag));
    }

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    const response: BookmarkPage = {
      bookmarks: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/bookmarks/:id - Get single bookmark
  http.get('/api/bookmarks/:id', ({ params }) => {
    const { id } = params;
    const bookmark = mockBookmarks.find((b) => b.id === id);

    if (!bookmark) {
      return HttpResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return HttpResponse.json(bookmark);
  }),

  // POST /api/bookmarks - Create bookmark
  http.post('/api/bookmarks', async ({ request }) => {
    const body = await request.json();
    const newBookmark: Bookmark = {
      id: String(mockBookmarks.length + 1),
      ...body,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBookmarks.push(newBookmark);
    return HttpResponse.json(newBookmark, { status: 201 });
  }),

  // PUT /api/bookmarks/:id - Update bookmark
  http.put('/api/bookmarks/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = mockBookmarks.findIndex((b) => b.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    const updatedBookmark: Bookmark = {
      ...mockBookmarks[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    mockBookmarks[index] = updatedBookmark;

    return HttpResponse.json(updatedBookmark);
  }),

  // DELETE /api/bookmarks/:id - Delete bookmark
  http.delete('/api/bookmarks/:id', ({ params }) => {
    const { id } = params;
    const index = mockBookmarks.findIndex((b) => b.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    mockBookmarks.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/tags - Get all tags
  http.get('/api/tags', () => {
    const tagMap = new Map<string, number>();

    mockBookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    const tags = Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));

    return HttpResponse.json(tags);
  }),

  // GET /api/health - Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];

// Helper function to create a mock bookmark
export const createMockBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 'test-id',
  title: 'Test Bookmark',
  url: 'https://example.com',
  description: 'Test description',
  tags: ['test'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});
