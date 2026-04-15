/**
 * useBookmark - Custom hook for managing single bookmark state.
 * Handles loading, refreshing, and CRUD operations for a single bookmark.
 */

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, UpdateBookmarkInput, CreateBookmarkInput } from '../types/bookmark';

interface UseBookmarkReturn {
  // State
  bookmark: Bookmark | null;
  loading: boolean;
  error: Error | null;

  // Methods
  loadBookmark: () => Promise<void>;
  refresh: () => Promise<void>;
  update: (input: UpdateBookmarkInput) => Promise<Bookmark>;
  delete: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Custom hook for managing a single bookmark by ID.
 * @param id - The bookmark ID to load
 * @returns Object containing state and methods for single bookmark management
 */
export function useBookmark(id: string): UseBookmarkReturn {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Load bookmark from API
  const loadBookmark = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setBookmark(null);
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch bookmark' }));
        throw new Error(errorData.error || 'Failed to fetch bookmark');
      }

      const data: Bookmark = await response.json();
      setBookmark(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Auto-load on mount and when id changes
  useEffect(() => {
    loadBookmark();
  }, [loadBookmark]);

  // Refresh bookmark
  const refresh = useCallback(async () => {
    await loadBookmark();
  }, [loadBookmark]);

  // Update the bookmark
  const update = useCallback(async (input: UpdateBookmarkInput): Promise<Bookmark> => {
    if (!id) {
      throw new Error('Cannot update: no bookmark ID provided');
    }

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
      setBookmark(updatedBookmark);

      return updatedBookmark;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }, [id]);

  // Delete the bookmark
  const deleteBookmark = useCallback(async (): Promise<void> => {
    if (!id) {
      throw new Error('Cannot delete: no bookmark ID provided');
    }

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

      setBookmark(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }, [id]);

  return {
    bookmark,
    loading,
    error,
    loadBookmark,
    refresh,
    update,
    delete: deleteBookmark,
  };
}

export default useBookmark;
