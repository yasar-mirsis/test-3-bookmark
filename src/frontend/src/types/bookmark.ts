/**
 * Bookmark type definitions
 * Matches the Go model structure from the backend
 */

/**
 * Represents a bookmark with all its metadata
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
 * Input for creating a new bookmark
 * Used in form submissions
 */
export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
}

/**
 * Input for updating an existing bookmark
 * All fields are optional to support partial updates
 */
export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

/**
 * Paginated response for bookmark list operations
 */
export interface BookmarkPage {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Query parameters for filtering bookmark lists
 */
export interface ListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
}

/**
 * Error response from the API
 */
export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}
