/**
 * Layout component for the Bookmark Manager application.
 * Provides the main page structure with header, sidebar, and content area.
 */

import React from 'react';
import { Header, HeaderProps } from './Header';
import { TagSidebar, TagSidebarProps } from './TagSidebar';

export interface LayoutProps {
  /** Main content to render in the center area */
  children: React.ReactNode;
  /** List of tags for the sidebar */
  tags?: TagSidebarProps['tags'];
  /** Currently selected filter tag */
  selectedTag?: TagSidebarProps['selectedTag'];
  /** Callback when a tag is clicked */
  onTagClick?: TagSidebarProps['onTagClick'];
  /** Callback for search functionality */
  onSearch?: HeaderProps['onSearch'];
  /** Current search query */
  searchQuery?: HeaderProps['searchQuery'];
  /** Loading state for tags */
  isLoadingTags?: TagSidebarProps['isLoading'];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Main layout component providing the application structure.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  tags = [],
  selectedTag,
  onTagClick,
  onSearch,
  searchQuery = '',
  isLoadingTags = false,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        onSearch={onSearch} 
        searchQuery={searchQuery} 
        isLoading={isLoadingTags}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Tags */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-6">
              <TagSidebar
                tags={tags}
                selectedTag={selectedTag}
                onTagClick={onTagClick}
                isLoading={isLoadingTags}
              />
            </div>
          </div>

          {/* Main Content */}
          <main className={`flex-1 min-w-0 ${className}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600 text-sm">
            Bookmark Manager &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
