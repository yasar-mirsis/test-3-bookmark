/**
 * BookmarkForm component for creating and editing bookmarks.
 * Provides form fields with real-time validation and error display.
 */

import React from 'react';
import { useBookmarkForm } from '../hooks/useBookmarkForm';
import { CreateBookmarkInput, UpdateBookmarkInput, Bookmark } from '../types/bookmark';

export interface BookmarkFormProps {
  /** Initial values for editing an existing bookmark */
  initialValues?: {
    url: string;
    title: string;
    description: string;
    tags: string;
  };
  /** Callback when form is submitted successfully */
  onSubmit: (data: CreateBookmarkInput | UpdateBookmarkInput) => Promise<Bookmark>;
  /** Whether this is an edit form (affects button text) */
  isEdit?: boolean;
  /** Optional label for the form */
  formTitle?: string;
  /** Callback when form is cancelled (edit mode only) */
  onCancel?: () => void;
}

/**
 * BookmarkForm component for creating and editing bookmarks.
 * Handles form state, validation, and submission.
 */
export const BookmarkForm: React.FC<BookmarkFormProps> = ({
  initialValues,
  onSubmit,
  isEdit = false,
  formTitle = isEdit ? 'Edit Bookmark' : 'Create New Bookmark',
  onCancel,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
  } = useBookmarkForm(initialValues);

  // Handle form submission wrapper
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{formTitle}</h2>

      <form onSubmit={handleFormSubmit} noValidate>
        {/* URL Field */}
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? 'url-error' : undefined}
          />
          {errors.url && (
            <p id="url-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.url}
            </p>
          )}
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="A descriptive title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Add a brief description..."
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p id="description-error" className="text-sm text-red-600" role="alert">
                {errors.description}
              </p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-500">
              {formData.description.length}/500
            </span>
          </div>
        </div>

        {/* Tags Field */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400">(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tags ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="react, programming, tutorials"
            aria-invalid={!!errors.tags}
            aria-describedby={errors.tags ? 'tags-error' : undefined}
          />
          {errors.tags && (
            <p id="tags-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.tags}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Tags can only contain letters, numbers, and hyphens. Maximum 10 tags.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                {isEdit ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              isEdit ? 'Update Bookmark' : 'Create Bookmark'
            )}
          </button>

          {isEdit && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookmarkForm;
