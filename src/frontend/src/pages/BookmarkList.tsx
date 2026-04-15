import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookmarkCard } from '../components/BookmarkCard'
import SearchBar from '../components/SearchBar'
import TagSidebar from '../components/TagSidebar'
import Pagination from '../components/Pagination'
import { bookmarkService, Bookmark, Tag } from '../services/api'

const BookmarkList: React.FC = () => {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const pageSize = 20

  const fetchBookmarks = async () => {
    setLoading(true)
    setError(null)

    try {
      let result
      if (searchQuery) {
        result = await bookmarkService.searchBookmarks(searchQuery)
        setBookmarks(result)
        setTotal(result.length)
      } else if (selectedTag) {
        result = await bookmarkService.filterByTag(selectedTag)
        setBookmarks(result)
        setTotal(result.length)
      } else {
        const response = await bookmarkService.getBookmarks(page, pageSize)
        setBookmarks(response.bookmarks)
        setTotal(response.total)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bookmarks'))
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const tagsData = await bookmarkService.getTags()
      setTags(tagsData)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [page, searchQuery, selectedTag])

  useEffect(() => {
    fetchTags()
  }, [])

  const handleEdit = (bookmark: Bookmark) => {
    navigate(`/edit/${bookmark.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    try {
      await bookmarkService.deleteBookmark(id)
      setBookmarks(bookmarks.filter((b) => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete bookmark'))
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <TagSidebar
          tags={tags}
          selectedTag={selectedTag}
          onTagClick={setSelectedTag}
          loading={loading}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search bookmarks by title, URL, or description..."
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error.message}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookmarks found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || selectedTag
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first bookmark!'}
            </p>
            {!searchQuery && !selectedTag && (
              <button
                onClick={() => navigate('/add')}
                className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Bookmark
              </button>
            )}
          </div>
        ) : (
          /* Bookmark Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default BookmarkList
