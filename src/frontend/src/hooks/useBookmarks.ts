/**
 * useBookmarks - Custom hook for managing bookmark list state with pagination.
 * Handles loading, filtering, pagination, and CRUD operations for bookmarks.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  BookmarkPage,
  ListFilters,
} from '../types/bookmark';

interface UseBookmarksReturn {
  // State
  bookmarks: Bookmark[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  filters: ListFilters;

  // Methods
  loadBookmarks: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<ListFilters>) => void;
  addBookmark: (input: CreateBookmarkInput) => Promise<Bookmark>;
  updateBookmark: (id: string, input: UpdateBookmarkInput) => Promise<Bookmark>;
  deleteBookmark: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Custom hook for managing bookmark list state.
 * @param initialPageSize - Initial page size (default: 20)
 * @returns Object containing state and methods for bookmark management
 */
export function useBookmarks(initialPageSize: number = 20): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPageState] = useState<number>(1);
  const [pageSize] = useState<number>(initialPageSize);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<ListFilters>({
    page: 1,
    pageSize: initialPageSize,
    search: '',
    tag: '',
  });

  // Build query params from filters
  const buildQueryParams = useCallback((filters: ListFilters): string => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.tag) params.set('tag', filters.tag);
    return params.toString();
  }, []);

  // Load bookmarks from API
  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(filters);
      const url = `${API_BASE_URL}/api/bookmarks?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch bookmarks' }));
        throw new Error(errorData.error || 'Failed to fetch bookmarks');
      }

      const data: BookmarkPage = await response.json();
      setBookmarks(data.bookmarks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [filters, buildQueryParams]);

  // Auto-load on mount and when filters change
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Set page
  const setPage = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageState(newPage);
    setFiltersState((prev) => ({ ...prev, page: newPage }));
  }, [totalPages]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<ListFilters>) => {
    setFiltersState((prev) => {
      const updated = { ...prev, ...newFilters };
      // Reset to page 1 when filters change (except page itself)
      if (newFilters.search !== undefined || newFilters.tag !== undefined) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  // Add a new bookmark (optimistic update)
  const addBookmark = useCallback(async (input: CreateBookmarkInput): Promise<Bookmark> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create bookmark' }));
        throw new Error(errorData.error || 'Failed to create bookmark');
      }

      const newBookmark: Bookmark = await response.json();

      // Optimistic update - add to current list
      setBookmarks((prev) => [...prev, newBookmark]);

      return newBookmark;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }, []);

  // Update an existing bookmark
  const updateBookmark = useCallback(async (id: string, input: UpdateBookmarkInput): Promise<Bookmark> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update bookmark' }));
        throw new Error(errorData.error || 'Failed to update bookmark');
      }

      const updatedBookmark: Bookmark = await response.json();

      // Optimistic update - replace in current list
      setBookmarks((prev) =>
        prev.map((bookmark) => (bookmark.id === id ? updatedBookmark : bookmark))
      );

      return updatedBookmark;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a bookmark
  const deleteBookmark = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete bookmark' }));
        throw new Error(errorData.error || 'Failed to delete bookmark');
      }

      // Optimistic update - remove from current list
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }, []);

  // Refresh bookmarks
  const refresh = useCallback(async () => {
    await loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    filters,
    loadBookmarks,
    setPage,
    setFilters,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    refresh,
  };
}

export default useBookmarks;
