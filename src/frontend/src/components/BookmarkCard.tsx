/**
 * BookmarkCard component for the Bookmark Manager application.
 * Displays individual bookmark with title, description, URL, tags, and action buttons.
 */

import React, { useState } from 'react';
import { Bookmark } from '../types/bookmark';

export interface BookmarkCardProps {
  /** The bookmark data to display */
  bookmark: Bookmark;
  /** Callback when edit button is clicked */
  onEdit?: (bookmark: Bookmark) => void;
  /** Callback when delete button is clicked */
  onDelete?: (bookmark: Bookmark) => void;
  /** Whether the component is in loading state */
  isLoading?: boolean;
}

/**
 * BookmarkCard component displaying a single bookmark with actions.
 */
export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(bookmark);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Title and URL */}
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">
          {bookmark.title}
        </h3>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
          title={bookmark.url}
        >
          {truncateUrl(bookmark.url)}
        </a>
      </div>

      {/* Description */}
      {bookmark.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {bookmark.description}
        </p>
      )}

      {/* Tags */}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4">
        Added on {formatDate(bookmark.createdAt)}
        {bookmark.updatedAt !== bookmark.createdAt && (
          <span className="ml-2">
            | Updated {formatDate(bookmark.updatedAt)}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(bookmark)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            aria-label={`Edit ${bookmark.title}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        )}
        {onDelete && (
          <>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Delete?</span>
                <button
                  onClick={handleDeleteClick}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  aria-label={`Confirm delete ${bookmark.title}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                aria-label={`Delete ${bookmark.title}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookmarkCard;
