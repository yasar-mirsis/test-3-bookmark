/**
 * Sidebar component for the Bookmark Manager application.
 * Displays tags with counts and provides filtering functionality.
 */

import React from 'react';

export interface Tag {
  name: string;
  count: number;
}

export interface SidebarProps {
  /** List of tags with their counts */
  tags: Tag[];
  /** Currently selected filter tag (if any) */
  selectedTag?: string;
  /** Callback when a tag is clicked */
  onTagClick?: (tag: string | null) => void;
  /** Loading state for tags */
  isLoading?: boolean;
}

/**
 * Sidebar component displaying tags and filter options.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  tags,
  selectedTag,
  onTagClick,
  isLoading = false,
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

  if (isLoading) {
    return (
      <aside className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tags</h2>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white shadow-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Tags</h2>
        {selectedTag && (
          <button
            onClick={handleClearFilter}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Clear
          </button>
        )}
      </div>

      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">No tags yet</p>
      ) : (
        <nav className="space-y-1">
          <button
            onClick={handleClearFilter}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
              selectedTag === null
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-between">
              <span>All Bookmarks</span>
            </span>
          </button>

          {tags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                selectedTag === tag.name
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="truncate">#{tag.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedTag === tag.name
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tag.count}
                </span>
              </span>
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
