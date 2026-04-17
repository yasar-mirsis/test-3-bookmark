/**
 * Bookmark type definitions for the Bookmark Manager application.
 * These interfaces mirror the Go backend model structures.
 */

/**
 * Represents a single bookmark with all its metadata.
 */
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Input data for creating a new bookmark.
 * Used in form submissions.
 */
export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
}

/**
 * Input data for updating an existing bookmark.
 * All fields are optional to support partial updates.
 */
export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

/**
 * Paginated response for bookmark listing.
 */
export interface BookmarkPage {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter options for listing bookmarks.
 * Used as query parameters in API requests.
 */
export interface ListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
}

/**
 * Error response structure from the API.
 */
export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}
