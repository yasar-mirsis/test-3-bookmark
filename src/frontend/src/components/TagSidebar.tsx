/**
 * TagSidebar component for the Bookmark Manager application.
 * Displays tags with counts and provides filtering functionality.
 */

import React from 'react';

export interface Tag {
  /** The tag name */
  name: string;
  /** The number of bookmarks with this tag */
  count: number;
}

export interface TagSidebarProps {
  /** List of tags with their counts */
  tags: Tag[];
  /** Currently selected filter tag (null means no filter) */
  selectedTag?: string | null;
  /** Callback when a tag is clicked */
  onTagClick?: (tag: string | null) => void;
  /** Loading state for tags */
  isLoading?: boolean;
  /** Custom title for the sidebar */
  title?: string;
}

/**
 * TagSidebar component displaying tags and filter options.
 * Supports single tag selection with toggle functionality.
 */
export const TagSidebar: React.FC<TagSidebarProps> = ({
  tags,
  selectedTag = null,
  onTagClick,
  isLoading = false,
  title = 'Tags',
}) => {
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      // Toggle: if same tag is clicked, clear filter
      onTagClick(selectedTag === tag ? null : tag);
    }
  };

  const handleClearFilter = () => {
    if (onTagClick) {
      onTagClick(null);
    }
  };

  // Calculate total bookmark count from all tags
  const totalBookmarks = tags.reduce((sum, tag) => sum + tag.count, 0);

  if (isLoading) {
    return (
      <aside className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white shadow-md rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {selectedTag && (
          <button
            onClick={handleClearFilter}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            aria-label="Clear tag filter"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tag List */}
      {tags.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-gray-500 text-sm">No tags yet</p>
          <p className="text-gray-400 text-xs mt-1">Add bookmarks with tags to see them here</p>
        </div>
      ) : (
        <nav className="space-y-1" role="navigation" aria-label="Tag filter">
          {/* All Bookmarks Button */}
          <button
            onClick={handleClearFilter}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
              selectedTag === null
                ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-pressed={selectedTag === null}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>All Bookmarks</span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                selectedTag === null
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
              }`}
            >
              {totalBookmarks}
            </span>
          </button>

          {/* Tag Buttons */}
          {tags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                selectedTag === tag.name
                  ? 'bg-blue-100 text-blue-800 font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-pressed={selectedTag === tag.name}
            >
              <span className="flex items-center gap-2 truncate">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="truncate">#{tag.name}</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                  selectedTag === tag.name
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                }`}
              >
                {tag.count}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Footer with tag count */}
      {tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
            {selectedTag && ` • Showing #${selectedTag}`}
          </p>
        </div>
      )}
    </aside>
  );
};

export default TagSidebar;
