import React from 'react'
import { Tag } from '../services/api'

export interface TagSidebarProps {
  tags: Tag[]
  selectedTag: string | null
  onTagClick: (tag: string | null) => void
  loading?: boolean
}

const TagSidebar: React.FC<TagSidebarProps> = ({
  tags,
  selectedTag,
  onTagClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tags</h3>
        {selectedTag && (
          <button
            onClick={() => onTagClick(null)}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear filter
          </button>
        )}
      </div>

      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">No tags yet</p>
      ) : (
        <div className="space-y-1">
          {tags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagClick(tag.name === selectedTag ? null : tag.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                selectedTag === tag.name
                  ? 'bg-primary-100 text-primary-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="flex items-center">
                <span className="text-primary-500 mr-2">#</span>
                {tag.name}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedTag === tag.name
                    ? 'bg-primary-200 text-primary-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagSidebar
