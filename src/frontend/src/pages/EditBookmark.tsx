/**
 * EditBookmark page component.
 * Provides a form for editing existing bookmarks with proper navigation.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookmarkForm } from '../components/BookmarkForm';
import { Bookmark, UpdateBookmarkInput } from '../types/bookmark';
import { getBookmark, updateBookmark } from '../services/api';

/**
 * Props for EditBookmark component (currently unused but kept for extensibility).
 */
export interface EditBookmarkProps {
  /** Optional callback after successful update */
  onSuccess?: (bookmark: Bookmark) => void;
}

interface BookmarkData {
  url: string;
  title: string;
  description: string;
  tags: string;
}

/**
 * EditBookmark page component.
 * Renders a form for editing existing bookmarks.
 */
export const EditBookmark: React.FC<EditBookmarkProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<BookmarkData | null>(null);

  useEffect(() => {
    const loadBookmark = async () => {
      if (!id) {
        setError('Bookmark ID is required');
        setLoading(false);
        return;
      }

      try {
        const bookmark = await getBookmark(id);
        setInitialValues({
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description || '',
          tags: bookmark.tags.join(', '),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bookmark';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadBookmark();
  }, [id]);

  const handleSubmit = async (data: UpdateBookmarkInput): Promise<Bookmark> => {
    if (!id) {
      throw new Error('Bookmark ID is required');
    }
    const updatedBookmark = await updateBookmark(id, data);
    return updatedBookmark;
  };

  const handleSuccess = (bookmark: Bookmark) => {
    // Call custom success callback if provided
    if (onSuccess) {
      onSuccess(bookmark);
    }
    // Navigate back to bookmark list
    navigate('/');
  };

  const handleSubmitWrapper = async (data: UpdateBookmarkInput): Promise<Bookmark> => {
    const bookmark = await handleSubmit(data);
    handleSuccess(bookmark);
    return bookmark;
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Bookmarks
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Bookmark Not Found</h2>
            <p className="text-gray-600 mb-4">The bookmark you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Bookmarks
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        initialValues={initialValues}
        onSubmit={handleSubmitWrapper}
        isEdit={true}
        formTitle="Edit Bookmark"
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditBookmark;
