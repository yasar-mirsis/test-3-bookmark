import { useDeleteBookmark } from '../hooks/useBookmarks'
import type { Bookmark } from '../types/bookmark'

interface BookmarkCardProps {
  bookmark: Bookmark
  onRefresh?: () => void
}

export function BookmarkCard({ bookmark, onRefresh }: BookmarkCardProps) {
  const deleteMutation = useDeleteBookmark()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        await deleteMutation.mutateAsync(bookmark.id)
        onRefresh?.()
      } catch (err) {
        console.error('Failed to delete bookmark:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            {bookmark.title}
          </a>
        </h3>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Delete bookmark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {bookmark.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bookmark.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline truncate"
        >
          {bookmark.url}
        </a>
      </div>

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Created: {formatDate(bookmark.createdAt)}
        {bookmark.updatedAt !== bookmark.createdAt && (
          <span className="ml-2">
            | Updated: {formatDate(bookmark.updatedAt)}
          </span>
        )}
      </div>
    </div>
  )
}
