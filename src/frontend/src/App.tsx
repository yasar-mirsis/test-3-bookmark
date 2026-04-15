import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import BookmarkList from './pages/BookmarkList'
import BookmarkForm from './components/BookmarkForm'
import { useBookmarks } from './hooks/useBookmarks'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-primary-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold">
                Bookmark Manager
              </Link>
              <div className="space-x-4">
                <Link
                  to="/"
                  className="hover:text-primary-200 transition-colors"
                >
                  All Bookmarks
                </Link>
                <Link
                  to="/add"
                  className="bg-primary-500 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Add Bookmark
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<BookmarkList />} />
            <Route path="/add" element={<BookmarkForm />} />
            <Route path="/edit/:id" element={<BookmarkForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
