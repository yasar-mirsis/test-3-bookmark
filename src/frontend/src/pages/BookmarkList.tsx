/**
 * BookmarkList page component for the Bookmark Manager application.
 * Main page that displays paginated bookmarks as cards with pagination controls,
 * search functionality, and tag-based filtering.
 */

import React, { useState, useCallback } from 'react';
import { Bookmark } from '../types/bookmark';
import { BookmarkCard } from '../components/BookmarkCard';
import { Pagination } from '../components/Pagination';
import { Layout } from '../components/Layout';
import { Tag } from '../components/TagSidebar';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTags } from '../hooks/useTags';

export interface BookmarkListProps {
  /** Callback when edit button is clicked */
  onEditBookmark?: (bookmark: Bookmark) => void;
  /** Callback when delete button is clicked */
  onDeleteBookmark?: (bookmark: Bookmark) => void;
  /** Custom page size (default: 20) */
  pageSize?: number;
}

/**
 * BookmarkList page component displaying paginated bookmarks with search and filtering.
 */
export const BookmarkList: React.FC<BookmarkListProps> = ({
  onEditBookmark,
  onDeleteBookmark,
  pageSize = 20,
}) => {
  // Local state for search and tag filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Bookmark state with pagination
  const {
    bookmarks,
    total,
    page,
    totalPages,
    loading,
    error,
    setPage,
    setFilters,
    deleteBookmark,
  } = useBookmarks(pageSize);

  // Tag state - use all bookmarks to calculate tag counts
  const {
    tags,
    loading: loadingTags,
  } = useTags(bookmarks);

  // Handle search query change (debounced via SearchBar component)
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Filters are synced via useEffect below
  }, []);

  // Handle tag click - toggle filter on/off
  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    // Filters are synced via useEffect below
  }, []);

  // Sync filters with local state changes
  React.useEffect(() => {
    setFilters({
      tag: selectedTag || '',
      search: searchQuery || '',
    });
  }, [selectedTag, searchQuery, setFilters]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle edit bookmark
  const handleEdit = (bookmark: Bookmark) => {
    if (onEditBookmark) {
      onEditBookmark(bookmark);
    }
  };

  // Handle delete bookmark
  const handleDelete = async (bookmark: Bookmark) => {
    if (onDeleteBookmark) {
      onDeleteBookmark(bookmark);
    } else {
      try {
        await deleteBookmark(bookmark.id);
      } catch (err) {
        console.error('Failed to delete bookmark:', err);
      }
    }
  };

  return (
    <Layout
      tags={tags}
      selectedTag={selectedTag || undefined}
      onTagClick={handleTagClick}
      onSearch={handleSearchChange}
      searchQuery={searchQuery}
      isLoadingTags={loadingTags}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedTag ? `#${selectedTag}` : 'All Bookmarks'}
          </h2>
          <span className="text-sm text-gray-600">
            {total} bookmark{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">
                {error.message || 'An error occurred while loading bookmarks'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && bookmarks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <BookmarkCard
                key={index}
                bookmark={{} as Bookmark}
                isLoading={true}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Empty State */}
            {!loading && bookmarks.length === 0 && !error && (
              <div className="bg-white shadow-md rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedTag
                    ? `No bookmarks with #${selectedTag}`
                    : searchQuery
                    ? 'No bookmarks found'
                    : 'No bookmarks yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedTag
                    ? 'Try selecting a different tag or add a new bookmark with this tag.'
                    : searchQuery
                    ? 'Try a different search term or clear the search to see all bookmarks.'
                    : 'Start by adding your first bookmark to save and organize web resources.'}
                </p>
                {!selectedTag && !searchQuery && (
                  <a
                    href="/bookmarks/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Bookmark
                  </a>
                )}
              </div>
            )}

            {/* Bookmark Grid */}
            {!loading && bookmarks.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={total}
                  pageSize={pageSize}
                  isLoading={loading}
                />
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BookmarkList;
