import { useState, useEffect } from 'react'
import axios from 'axios'
import BookmarkCard from './components/BookmarkCard'
import BookmarkForm from './components/BookmarkForm'
import SearchBar from './components/SearchBar'
import TagSidebar from './components/TagSidebar'
import Pagination from './components/Pagination'
import { Bookmark, Tag } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBookmarks, setTotalBookmarks] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 20

  useEffect(() => {
    fetchBookmarks()
  }, [currentPage, searchQuery, selectedTag])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchBookmarks = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = `${API_URL}/bookmarks?page=${currentPage}&pageSize=${pageSize}`

      if (searchQuery) {
        url = `${API_URL}/bookmarks/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&pageSize=${pageSize}`
      } else if (selectedTag) {
        url = `${API_URL}/bookmarks/tag/${encodeURIComponent(selectedTag)}?page=${currentPage}&pageSize=${pageSize}`
      }

      const response = await axios.get(url)
      setBookmarks(response.data.bookmarks)
      setTotalPages(response.data.totalPages)
      setTotalBookmarks(response.data.total)
    } catch (err) {
      setError('Failed to fetch bookmarks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await axios.get<Record<string, number>>(`${API_URL}/tags`)
      const tagList: Tag[] = Object.entries(response.data).map(([name, count]) => ({ name, count }))
      setTags(tagList)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const handleCreateBookmark = async (bookmarkData: Partial<Bookmark>) => {
    try {
      await axios.post(`${API_URL}/bookmarks`, bookmarkData)
      setShowForm(false)
      fetchBookmarks()
      fetchTags()
    } catch (err) {
      setError('Failed to create bookmark')
      console.error(err)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/bookmarks/${id}`)
      fetchBookmarks()
      fetchTags()
    } catch (err) {
      setError('Failed to delete bookmark')
      console.error(err)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark Manager</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Add Bookmark'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 flex-shrink-0">
            <TagSidebar tags={tags} selectedTag={selectedTag} onTagClick={handleTagClick} />
          </aside>

          <main className="flex-1">
            <SearchBar onSearch={handleSearch} value={searchQuery} />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {showForm && (
              <BookmarkForm onSubmit={handleCreateBookmark} onCancel={() => setShowForm(false)} />
            )}

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || selectedTag ? 'No bookmarks found' : 'No bookmarks yet. Add your first bookmark!'}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onDelete={handleDeleteBookmark}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
