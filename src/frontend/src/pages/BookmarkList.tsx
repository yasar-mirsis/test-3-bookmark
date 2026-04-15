import { Bookmark } from '../types'

interface BookmarkListProps {
  bookmarks: Bookmark[]
  loading: boolean
  error: string | null
  onDelete: (id: string) => void
}

export default function BookmarkList({ bookmarks, loading, error, onDelete }: BookmarkListProps) {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bookmarks found. Add your first bookmark!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold">{bookmark.title}</h3>
          {bookmark.description && <p className="text-gray-600">{bookmark.description}</p>}
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {bookmark.url}
          </a>
          <button onClick={() => onDelete(bookmark.id)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
