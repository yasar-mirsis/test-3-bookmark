/**
 * CreateBookmark page component.
 * Provides a form for creating new bookmarks with proper navigation.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkForm } from '../components/BookmarkForm';
import { CreateBookmarkInput, Bookmark } from '../types/bookmark';
import { createBookmark } from '../services/api';

/**
 * Props for CreateBookmark component (currently unused but kept for extensibility).
 */
export interface CreateBookmarkProps {
  /** Optional callback after successful creation */
  onSuccess?: (bookmark: Bookmark) => void;
}

/**
 * CreateBookmark page component.
 * Renders a form for creating new bookmarks.
 */
export const CreateBookmark: React.FC<CreateBookmarkProps> = ({ onSuccess }) => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateBookmarkInput): Promise<Bookmark> => {
    const newBookmark = await createBookmark(data);
    return newBookmark;
  };

  const handleSuccess = (bookmark: Bookmark) => {
    // Call custom success callback if provided
    if (onSuccess) {
      onSuccess(bookmark);
    }
    // Navigate back to bookmark list
    navigate('/');
  };

  const handleSubmitWrapper = async (data: CreateBookmarkInput): Promise<Bookmark> => {
    const bookmark = await handleSubmit(data);
    handleSuccess(bookmark);
    return bookmark;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Bookmarks
        </button>
      </div>

      <BookmarkForm
        formTitle="Create New Bookmark"
        onSubmit={handleSubmitWrapper}
        isEdit={false}
      />
    </div>
  );
};

export default CreateBookmark;
