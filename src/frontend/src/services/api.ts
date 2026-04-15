/**
 * API service for communicating with the bookmark backend
 * Uses the Fetch API for HTTP requests
 */

import {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  BookmarkPage,
  ListFilters,
  APIError,
} from '../types/bookmark';

/**
 * Get the base URL for the API from environment variables
 * Falls back to default development URL if not set
 */
function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080';
}

/**
 * Build a URL with query parameters from filters
 */
function buildUrlWithFilters(endpoint: string, filters?: ListFilters): string {
  const url = new URL(`${getBaseUrl()}/${endpoint.replace(/^\//, '')}`);

  if (filters) {
    if (filters.page !== undefined) {
      url.searchParams.set('page', filters.page.toString());
    }
    if (filters.pageSize !== undefined) {
      url.searchParams.set('pageSize', filters.pageSize.toString());
    }
    if (filters.search !== undefined && filters.search !== '') {
      url.searchParams.set('search', filters.search);
    }
    if (filters.tag !== undefined && filters.tag !== '') {
      url.searchParams.set('tag', filters.tag);
    }
  }

  return url.toString();
}

/**
 * Handle API errors and throw appropriate exceptions
 */
function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return response.json().then((error: APIError) => {
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    });
  }
  return response.json();
}

/**
 * Create a new bookmark
 * @param input - The bookmark data to create
 * @returns The created bookmark with generated ID and timestamps
 */
export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  const url = `${getBaseUrl()}/api/bookmarks`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create bookmark: Unknown error');
  }
}

/**
 * Get a single bookmark by ID
 * @param id - The bookmark ID
 * @returns The bookmark
 */
export async function getBookmark(id: string): Promise<Bookmark> {
  const url = `${getBaseUrl()}/api/bookmarks/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get bookmark: Unknown error');
  }
}

/**
 * List bookmarks with optional filters
 * @param filters - Pagination and filtering options
 * @returns Paginated list of bookmarks
 */
export async function listBookmarks(filters?: ListFilters): Promise<BookmarkPage> {
  const url = buildUrlWithFilters('api/bookmarks', filters);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<BookmarkPage>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to list bookmarks: Unknown error');
  }
}

/**
 * Update an existing bookmark
 * @param id - The bookmark ID to update
 * @param input - The updated bookmark data (partial update supported)
 * @returns The updated bookmark
 */
export async function updateBookmark(
  id: string,
  input: UpdateBookmarkInput,
): Promise<Bookmark> {
  const url = `${getBaseUrl()}/api/bookmarks/${id}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update bookmark: Unknown error');
  }
}

/**
 * Delete a bookmark by ID
 * @param id - The bookmark ID to delete
 * @returns Resolves when deletion is complete
 */
export async function deleteBookmark(id: string): Promise<void> {
  const url = `${getBaseUrl()}/api/bookmarks/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: 'Failed to delete bookmark',
      }));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete bookmark: Unknown error');
  }
}

/**
 * Search bookmarks by title, description, or URL
 * @param query - The search query string
 * @returns Array of matching bookmarks
 */
export async function searchBookmarks(query: string): Promise<Bookmark[]> {
  const url = buildUrlWithFilters('api/bookmarks', { search: query });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // The search endpoint may return a BookmarkPage or Bookmark[]
    // Handle both cases
    const data = await handleResponse<BookmarkPage | Bookmark[]>(response);
    
    if (Array.isArray(data)) {
      return data;
    }
    return (data as BookmarkPage).bookmarks;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to search bookmarks: Unknown error');
  }
}

/**
 * Get all available tags
 * @returns Array of tag strings
 */
export async function getTags(): Promise<string[]> {
  const url = `${getBaseUrl()}/api/tags`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<string[]>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get tags: Unknown error');
  }
}
