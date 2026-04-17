import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import BookmarkList from './pages/BookmarkList'
import CreateBookmark from './pages/CreateBookmark'
import EditBookmark from './pages/EditBookmark'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BookmarkList />} />
          <Route path="create" element={<CreateBookmark />} />
          <Route path="edit/:id" element={<EditBookmark />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
