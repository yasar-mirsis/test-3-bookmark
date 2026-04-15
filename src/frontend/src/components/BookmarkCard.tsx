import { Bookmark } from '../types'

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      onDelete(bookmark.id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              {bookmark.title}
            </a>
          </h3>
          {bookmark.description && (
            <p className="text-gray-600 mb-3">{bookmark.description}</p>
          )}
          <p className="text-sm text-gray-500 mb-3 truncate">{bookmark.url}</p>
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="ml-4 text-red-600 hover:text-red-800"
          aria-label="Delete bookmark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-4">
        Created: {new Date(bookmark.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
