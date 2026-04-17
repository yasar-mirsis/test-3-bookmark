/**
 * Header component for the Bookmark Manager application.
 * Contains the logo/title and navigation elements.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export interface HeaderProps {
  /** Optional callback for search functionality */
  onSearch?: (query: string) => void;
  /** Current search query value */
  searchQuery?: string;
  /** Whether search is loading */
  isLoading?: boolean;
}

/**
 * Header component displaying the app title and navigation.
 */
export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  searchQuery = '', 
  isLoading = false 
}) => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h1 className="text-2xl font-bold">Bookmark Manager</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Bookmarks
            </Link>
            <Link
              to="/bookmarks/new"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
            >
              Add Bookmark
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 max-w-2xl">
          <SearchBar
            initialValue={searchQuery}
            onSearchChange={onSearch}
            isLoading={isLoading}
            placeholder="Search bookmarks by title, description, or URL..."
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
