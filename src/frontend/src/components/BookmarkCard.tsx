import React from 'react'
import { Bookmark } from '../services/api'

export interface BookmarkCardProps {
  bookmark: Bookmark
  onEdit: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const truncateUrl = (url: string, maxLength = 60) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800 truncate flex-1">
          {bookmark.title}
        </h3>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(bookmark)}
            className="text-primary-600 hover:text-primary-800 transition-colors"
            aria-label="Edit bookmark"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Delete bookmark"
          >
            Delete
          </button>
        </div>
      </div>

      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:underline text-sm break-all"
      >
        {truncateUrl(bookmark.url)}
      </a>

      {bookmark.description && (
        <p className="mt-3 text-gray-600 text-sm line-clamp-2">
          {bookmark.description}
        </p>
      )}

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Created: {formatDate(bookmark.created_at)}
      </div>
    </div>
  )
}

export default BookmarkCard
