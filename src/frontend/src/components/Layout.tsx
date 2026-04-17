/**
 * Layout component for the Bookmark Manager application.
 * Provides the main page structure with header and content area.
 */

import React from 'react';
import { Header } from './Header';

export interface LayoutProps {
  /** Main content to render in the center area */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Main layout component providing the application structure.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
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
