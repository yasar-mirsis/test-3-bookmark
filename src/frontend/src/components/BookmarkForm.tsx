import { useState } from 'react'
import { useCreateBookmark, useUpdateBookmark, useDeleteBookmark } from '../hooks/useBookmarks'
import type { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from '../types/bookmark'

interface BookmarkFormProps {
  bookmark?: Bookmark
  onSuccess?: () => void
  onCancel?: () => void
}

export function BookmarkForm({ bookmark, onSuccess, onCancel }: BookmarkFormProps) {
  const createMutation = useCreateBookmark()
  const updateMutation = useUpdateBookmark()

  const isEditing = !!bookmark
  const [url, setUrl] = useState(bookmark?.url || '')
  const [title, setTitle] = useState(bookmark?.title || '')
  const [description, setDescription] = useState(bookmark?.description || '')
  const [tags, setTags] = useState(bookmark?.tags?.join(', ') || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!url.trim()) {
      setError('URL is required')
      return
    }
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      setError('Invalid URL format. URL must start with http:// or https://')
      return
    }

    // Parse tags
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const input: CreateBookmarkInput = {
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
      tags: tagArray,
    }

    try {
      if (isEditing && bookmark) {
        const updateInput: UpdateBookmarkInput = {
          url: url.trim(),
          title: title.trim(),
          description: description.trim(),
          tags: tagArray,
        }
        await updateMutation.mutateAsync({ id: bookmark.id, input: updateInput })
      } else {
        await createMutation.mutateAsync(input)
      }

      // Reset form
      setUrl('')
      setTitle('')
      setDescription('')
      setTags('')

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Bookmark' : 'Add New Bookmark'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL *
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Bookmark"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="programming, javascript, react"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isEditing
              ? 'Update Bookmark'
              : 'Add Bookmark'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
