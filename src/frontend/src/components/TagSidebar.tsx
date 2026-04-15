import { useTags } from '../hooks/useTags'

interface TagSidebarProps {
  selectedTag: string
  onTagClick: (tag: string) => void
}

interface TagCount {
  tag: string
  count: number
}

export function TagSidebar({ selectedTag, onTagClick }: TagSidebarProps) {
  const { data: tags, isLoading, error } = useTags()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Tags</h2>
        <div className="text-gray-500">Loading tags...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Tags</h2>
        <div className="text-red-500">Failed to load tags</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Tags</h2>
      
      {selectedTag && (
        <button
          onClick={() => onTagClick(selectedTag)}
          className="w-full mb-4 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-between"
        >
          <span>Filtering by: {selectedTag}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {tags && tags.length > 0 ? (
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onTagClick('')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                !selectedTag
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Bookmarks
            </button>
          </li>
          {tags.map((tag) => (
            <li key={tag}>
              <button
                onClick={() => onTagClick(tag)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                  selectedTag === tag
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="capitalize">{tag}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {Math.floor(Math.random() * 10) + 1} {/* Placeholder count - would come from API */}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm">No tags yet</div>
      )}
    </div>
  )
}
