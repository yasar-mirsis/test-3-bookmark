/**
 * SearchBar component for the Bookmark Manager application.
 * Provides a search input with debouncing for performance optimization.
 */

import React, { useState, useEffect, useCallback } from 'react';

export interface SearchBarProps {
  /** Initial search query value */
  initialValue?: string;
  /** Callback when search query changes (debounced) */
  onSearchChange?: (query: string) => void;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the search is loading */
  isLoading?: boolean;
}

/**
 * SearchBar component with debounced search functionality.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearchChange,
  debounceMs = 300,
  placeholder = 'Search bookmarks by title, description, or URL...',
  isLoading = false,
}) => {
  const [query, setQuery] = useState(initialValue);

  // Debounce effect - only call onSearchChange after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(query);
      }
    }, debounceMs);

    // Cleanup timer on unmount or when query changes
    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearchChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full px-4 py-2 pl-10 pr-10 rounded-lg text-gray-800 placeholder-gray-500 
                   bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label="Search bookmarks"
      />
      
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Clear button (shown when there's a query) */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                     hover:text-gray-600 transition-colors duration-200"
          aria-label="Clear search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
