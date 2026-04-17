/**
 * API service for communicating with the Bookmark Manager backend.
 * Handles HTTP requests, error handling, and response parsing.
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
 * Get the base API URL from environment variables.
 * Defaults to 'http://localhost:8080/api' if not configured.
 */
function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
}

/**
 * Build a URL with query parameters from filters object.
 */
function buildUrlWithParams(baseUrl: string, filters?: ListFilters): string {
  const url = new URL(baseUrl, getBaseUrl());
  
  if (filters) {
    if (filters.page !== undefined) {
      url.searchParams.set('page', filters.page.toString());
    }
    if (filters.pageSize !== undefined) {
      url.searchParams.set('pageSize', filters.pageSize.toString());
    }
    if (filters.search) {
      url.searchParams.set('search', filters.search);
    }
    if (filters.tag) {
      url.searchParams.set('tag', filters.tag);
    }
  }
  
  return url.toString();
}

/**
 * Parse a JSON response or throw an error.
 */
async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new APIErrorImpl('Invalid response format', response.status);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const error = data as APIError;
    throw new APIErrorImpl(error.message || error.error, response.status);
  }
  
  return data as T;
}

/**
 * Custom error class for API errors.
 */
class APIErrorImpl extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

/**
 * Create a new bookmark.
 * @param input - The bookmark data to create
 * @returns The created bookmark
 */
export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  const url = `${getBaseUrl()}/bookmarks`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    return parseJsonResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to create bookmark', 500);
  }
}

/**
 * Get a single bookmark by ID.
 * @param id - The bookmark ID
 * @returns The bookmark
 */
export async function getBookmark(id: string): Promise<Bookmark> {
  const url = `${getBaseUrl()}/bookmarks/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return parseJsonResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to get bookmark', 500);
  }
}

/**
 * List bookmarks with optional filters and pagination.
 * @param filters - Filter options (page, pageSize, search, tag)
 * @returns Paginated list of bookmarks
 */
export async function listBookmarks(filters?: ListFilters): Promise<BookmarkPage> {
  const url = buildUrlWithParams('/bookmarks', filters);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return parseJsonResponse<BookmarkPage>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to list bookmarks', 500);
  }
}

/**
 * Update an existing bookmark.
 * @param id - The bookmark ID
 * @param input - The updated bookmark data
 * @returns The updated bookmark
 */
export async function updateBookmark(
  id: string,
  input: UpdateBookmarkInput
): Promise<Bookmark> {
  const url = `${getBaseUrl()}/bookmarks/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    return parseJsonResponse<Bookmark>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to update bookmark', 500);
  }
}

/**
 * Delete a bookmark.
 * @param id - The bookmark ID
 */
export async function deleteBookmark(id: string): Promise<void> {
  const url = `${getBaseUrl()}/bookmarks/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete bookmark' }));
      throw new APIErrorImpl(error.message || error.error, response.status);
    }
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to delete bookmark', 500);
  }
}

/**
 * Search bookmarks by query string.
 * @param query - The search query
 * @returns Array of matching bookmarks
 */
export async function searchBookmarks(query: string): Promise<Bookmark[]> {
  const url = buildUrlWithParams('/bookmarks', { search: query });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return parseJsonResponse<Bookmark[]>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to search bookmarks', 500);
  }
}

/**
 * Get all available tags.
 * @returns Array of tag strings
 */
export async function getTags(): Promise<string[]> {
  const url = `${getBaseUrl()}/tags`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return parseJsonResponse<string[]>(response);
  } catch (error) {
    if (error instanceof APIErrorImpl) {
      throw error;
    }
    throw new APIErrorImpl('Failed to get tags', 500);
  }
}
