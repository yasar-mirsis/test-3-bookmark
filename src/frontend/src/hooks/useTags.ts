/**
 * useTags - Custom hook for managing tag list and filtering.
 * Handles loading tags, selecting/deselecting filters, and tag counts.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bookmark } from '../types/bookmark';

interface TagInfo {
  name: string;
  count: number;
}

interface UseTagsReturn {
  // State
  tags: TagInfo[];
  selectedTag: string | null;
  loading: boolean;
  error: Error | null;

  // Methods
  loadTags: () => Promise<void>;
  toggleFilter: (tag: string) => void;
  clearFilter: () => void;
  refresh: () => Promise<void>;
}

/**
 * Calculate tag counts from a list of bookmarks.
 * @param bookmarks - Array of bookmarks to count tags from
 * @returns Map of tag names to counts
 */
const calculateTagCounts = (bookmarks: Bookmark[]): Map<string, number> => {
  const counts = new Map<string, number>();

  bookmarks.forEach((bookmark) => {
    bookmark.tags.forEach((tag) => {
      const currentCount = counts.get(tag) || 0;
      counts.set(tag, currentCount + 1);
    });
  });

  return counts;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Custom hook for managing tags and tag-based filtering.
 * @param bookmarks - Optional array of bookmarks to calculate counts from locally
 * @returns Object containing state and methods for tag management
 */
export function useTags(bookmarks?: Bookmark[]): UseTagsReturn {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchedTags, setFetchedTags] = useState<TagInfo[]>([]);

  // Load tags from API or calculate from bookmarks
  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // If bookmarks are provided, calculate tags locally
      if (bookmarks && bookmarks.length > 0) {
        const counts = calculateTagCounts(bookmarks);
        const tagList: TagInfo[] = Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setTags(tagList);
        setFetchedTags(tagList);
        return;
      }

      // Otherwise, fetch from API
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If tags endpoint doesn't exist, try to get from bookmarks
        if (response.status === 404) {
          // Load all bookmarks and calculate tags
          const bookmarksResponse = await fetch(`${API_BASE_URL}/api/bookmarks?pageSize=1000`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (bookmarksResponse.ok) {
            const data = await bookmarksResponse.json();
            const counts = calculateTagCounts(data.bookmarks || []);
            const tagList: TagInfo[] = Array.from(counts.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => a.name.localeCompare(b.name));

            setTags(tagList);
            setFetchedTags(tagList);
            return;
          }
        }

        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch tags' }));
        throw new Error(errorData.error || 'Failed to fetch tags');
      }

      const data: TagInfo[] = await response.json();
      setTags(data);
      setFetchedTags(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [bookmarks]);

  // Auto-load on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Toggle tag filter selection
  const toggleFilter = useCallback((tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }, []);

  // Clear the selected filter
  const clearFilter = useCallback(() => {
    setSelectedTag(null);
  }, []);

  // Refresh tags
  const refresh = useCallback(async () => {
    await loadTags();
  }, [loadTags]);

  // Filter tags based on selection (for display purposes)
  const filteredTags = useMemo(() => {
    if (!selectedTag) return tags;
    return tags.filter((tag) => tag.name === selectedTag);
  }, [tags, selectedTag]);

  // Selected tag info
  const selectedTagInfo = useMemo(() => {
    if (!selectedTag) return null;
    return tags.find((tag) => tag.name === selectedTag) || null;
  }, [tags, selectedTag]);

  // Return tags (use fetched or filtered based on selection)
  const displayTags = selectedTag ? filteredTags : tags;

  return {
    tags: displayTags,
    selectedTag,
    loading,
    error,
    loadTags,
    toggleFilter,
    clearFilter,
    refresh,
  };
}

export default useTags;
