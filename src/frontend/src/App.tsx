import { useState, useEffect } from 'react'
import { Bookmark, BookmarkPage } from './types/bookmark'
import { api } from './services/api'

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchBookmarks()
  }, [searchQuery, selectedTag])

  const fetchBookmarks = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (searchQuery) params.search = searchQuery
      if (selectedTag) params.tag = selectedTag
      
      const response = await api.get<BookmarkPage>('/bookmarks', { params })
      setBookmarks(response.data.bookmarks)
    } catch (err) {
      setError('Failed to fetch bookmarks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks(bookmarks.filter(b => b.id !== id))
    } catch (err) {
      setError('Failed to delete bookmark')
      console.error(err)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Bookmark Manager</h1>
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </header>

      <div className="main-content">
        <aside className="tag-sidebar">
          <h2>Tags</h2>
          {selectedTag && (
            <button onClick={() => setSelectedTag(null)} className="clear-filter">
              Clear filter
            </button>
          )}
          <div className="tag-list">
            {/* Tag list would be populated from bookmarks */}
            <p>No tags yet</p>
          </div>
        </aside>

        <main className="bookmark-list">
          <h2>Bookmarks</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && bookmarks.length === 0 && (
            <p>No bookmarks found</p>
          )}
          {!loading && !error && bookmarks.length > 0 && (
            <div className="bookmarks-grid">
              {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="bookmark-card">
                  <h3>{bookmark.title}</h3>
                  <p>{bookmark.description}</p>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    Visit
                  </a>
                  <div className="tags">
                    {bookmark.tags.map(tag => (
                      <span
                        key={tag}
                        className="tag"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => handleDelete(bookmark.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <p>Bookmark Manager - Full Stack Application</p>
      </footer>
    </div>
  )
}

export default App
