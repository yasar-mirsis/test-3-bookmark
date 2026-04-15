import { useState, useCallback } from 'react'
import { bookmarkService, Bookmark, CreateBookmarkDTO, UpdateBookmarkDTO } from '../services/api'

export interface UseBookmarksReturn {
  bookmarks: Bookmark[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: Error | null
  searchQuery: string
  selectedTag: string | null
  setPage: (page: number) => void
  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  createBookmark: (data: CreateBookmarkDTO) => Promise<void>
  updateBookmark: (id: string, data: UpdateBookmarkDTO) => Promise<void>
  deleteBookmark: (id: string) => Promise<void>
  refresh: () => void
}

export const useBookmarks = (): UseBookmarksReturn => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const fetchBookmarks = useCallback(async () => {
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
  }, [page, pageSize, searchQuery, selectedTag])

  const createBookmark = async (data: CreateBookmarkDTO) => {
    try {
      await bookmarkService.createBookmark(data)
      await fetchBookmarks()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create bookmark')
    }
  }

  const updateBookmark = async (id: string, data: UpdateBookmarkDTO) => {
    try {
      await bookmarkService.updateBookmark(id, data)
      await fetchBookmarks()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update bookmark')
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      await bookmarkService.deleteBookmark(id)
      await fetchBookmarks()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete bookmark')
    }
  }

  const setPage = (newPage: number) => {
    setPageState(newPage)
  }

  const refresh = () => {
    fetchBookmarks()
  }

  return {
    bookmarks,
    total,
    page,
    pageSize,
    loading,
    error,
    searchQuery,
    selectedTag,
    setPage,
    setSearchQuery,
    setSelectedTag,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    refresh,
  }
}
