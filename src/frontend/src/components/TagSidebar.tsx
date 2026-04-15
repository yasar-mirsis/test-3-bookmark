import { Tag } from '../types'

interface TagSidebarProps {
  tags: Tag[]
  selectedTag: string | null
  onTagClick: (tag: string) => void
}

export default function TagSidebar({ tags, selectedTag, onTagClick }: TagSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Tags</h2>

      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">No tags yet</p>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => onTagClick('')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              selectedTag === null
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            All Bookmarks
          </button>

          {tags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagClick(tag.name)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center ${
                selectedTag === tag.name
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="truncate">{tag.name}</span>
              <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedTag && (
        <button
          onClick={() => onTagClick('')}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
