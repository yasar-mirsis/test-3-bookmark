import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { bookmarkService, CreateBookmarkDTO, UpdateBookmarkDTO, Bookmark } from '../services/api'

export interface BookmarkFormProps {
  bookmark?: Bookmark
  onSuccess?: () => void
}

interface FormData {
  url: string
  title: string
  description: string
  tags: string
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ bookmark, onSuccess }) => {
  const navigate = useNavigate()
  const isEdit = !!bookmark

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      url: bookmark?.url || '',
      title: bookmark?.title || '',
      description: bookmark?.description || '',
      tags: bookmark?.tags?.join(', ') || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const tags = data.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)

      if (isEdit && bookmark) {
        const payload: UpdateBookmarkDTO = {
          title: data.title,
          description: data.description,
          tags: tags.length > 0 ? tags : undefined,
        }
        await bookmarkService.updateBookmark(bookmark.id, payload)
      } else {
        const payload: CreateBookmarkDTO = {
          url: data.url,
          title: data.title,
          description: data.description,
          tags: tags.length > 0 ? tags : undefined,
        }
        await bookmarkService.createBookmark(payload)
      }

      onSuccess?.()
      navigate('/')
    } catch (error) {
      console.error('Failed to save bookmark:', error)
      alert('Failed to save bookmark. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEdit ? 'Edit Bookmark' : 'Add New Bookmark'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              {...register('url', {
                required: 'URL is required',
                pattern: {
                  value: /^https?:\/\/.+\..+/,
                  message: 'Please enter a valid URL (e.g., https://example.com)',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Bookmark title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a description (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              {...register('tags')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3 (comma-separated)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Bookmark' : 'Add Bookmark'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookmarkForm
