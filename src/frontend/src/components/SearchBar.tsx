/**
 * SearchBar component for the Bookmark Manager application.
 * Provides a search input with debouncing for performance optimization.
 */

import React, { useState, useEffect, useCallback } from 'react';

export interface SearchBarProps {
  /** Initial search query value */
  initialValue?: string;
  /** Callback when search value changes (debounced) */
  onSearchChange?: (query: string) => void;
  /** Callback when search is submitted (non-debounced) */
  onSearchSubmit?: (query: string) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether the search input is disabled */
  disabled?: boolean;
  /** Size variant of the search input */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SearchBar component with debouncing functionality.
 * Triggers onSearchChange after the user stops typing for debounceMs milliseconds.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearchChange,
  onSearchSubmit,
  placeholder = 'Search bookmarks by title, description, or URL...',
  debounceMs = 300,
  disabled = false,
  size = 'md',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Update local state when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
    setDebouncedQuery(initialValue);
  }, [initialValue]);

  // Debounce effect
  useEffect(() => {
    if (disabled) return;

    const timerId = setTimeout(() => {
      setDebouncedQuery(query);
      if (onSearchChange && query !== debouncedQuery) {
        onSearchChange(query);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [query, debounceMs, disabled, debouncedQuery, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDebouncedQuery(query);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [onSearchChange]);

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400`}
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
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-10 ${sizeClasses[size]}
              rounded-lg border border-gray-300
              bg-white text-gray-900
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:text-gray-500
              transition-colors duration-200
            `}
            aria-label="Search bookmarks"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:text-gray-300"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
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
        </div>
      </form>

      {/* Search Status Indicator */}
      {debouncedQuery && (
        <p className="mt-1 text-xs text-gray-500">
          Searching for "{debouncedQuery}"
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
};

export default SearchBar;
