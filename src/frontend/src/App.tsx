import { useState } from 'react'
import { useBookmarks } from './hooks/useBookmarks'
import { useTags } from './hooks/useTags'
import { BookmarkCard } from './components/BookmarkCard'
import { SearchBar } from './components/SearchBar'
import { TagSidebar } from './components/TagSidebar'
import { Pagination } from './components/Pagination'
import type { ListFilters } from './types/bookmark'

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize] = useState(20)

  const filters: ListFilters = {
    tag: selectedTag,
    search: searchQuery,
  }

  const { data: bookmarkData, isLoading, error, refetch } = useBookmarks(
    currentPage,
    pageSize,
    filters
  )

  const { data: tags } = useTags()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag)
    setCurrentPage(1) // Reset to first page on new filter
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark Manager</h1>
          <div className="mt-4">
            <SearchBar onSearch={handleSearch} defaultValue={searchQuery} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 flex-shrink-0">
            <TagSidebar
              tags={tags || []}
              selectedTag={selectedTag}
              onTagClick={handleTagClick}
            />
          </aside>

          <main className="flex-1">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                An error occurred while loading bookmarks.
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">Loading bookmarks...</div>
            ) : bookmarkData?.bookmarks && bookmarkData.bookmarks.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {bookmarkData.bookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onRefresh={refetch}
                    />
                  ))}
                </div>

                {bookmarkData.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={bookmarkData.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || selectedTag
                  ? 'No bookmarks found matching your criteria.'
                  : 'No bookmarks yet. Add your first bookmark!'}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
