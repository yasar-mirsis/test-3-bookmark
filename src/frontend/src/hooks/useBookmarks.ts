import { useState, useEffect } from 'react'
import { Bookmark } from '../types'
import { bookmarkService } from '../services/bookmarkService'

interface UseBookmarksReturn {
  bookmarks: Bookmark[]
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  fetchBookmarks: () => Promise<void>
  createBookmark: (data: { url: string; title: string; description?: string; tags?: string[] }) => Promise<Bookmark>
  deleteBookmark: (id: string) => Promise<void>
  searchBookmarks: (query: string, page?: number) => Promise<void>
  getByTag: (tag: string, page?: number) => Promise<void>
}

export function useBookmarks(
  page: number = 1,
  pageSize: number = 20
): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookmarks = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await bookmarkService.getAll(page, pageSize)
      setBookmarks(data.bookmarks)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError('Failed to fetch bookmarks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createBookmark = async (data: { url: string; title: string; description?: string; tags?: string[] }) => {
    const bookmark = await bookmarkService.create(data)
    await fetchBookmarks()
    return bookmark
  }

  const deleteBookmark = async (id: string) => {
    await bookmarkService.delete(id)
    await fetchBookmarks()
  }

  const searchBookmarks = async (query: string, pageNum: number = 1) => {
    setLoading(true)
    setError(null)

    try {
      const data = await bookmarkService.search(query, pageNum, pageSize)
      setBookmarks(data.bookmarks)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError('Failed to search bookmarks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getByTag = async (tag: string, pageNum: number = 1) => {
    setLoading(true)
    setError(null)

    try {
      const data = await bookmarkService.getByTag(tag, pageNum, pageSize)
      setBookmarks(data.bookmarks)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError('Failed to fetch bookmarks by tag')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [page, pageSize])

  return {
    bookmarks,
    total,
    totalPages,
    loading,
    error,
    fetchBookmarks,
    createBookmark,
    deleteBookmark,
    searchBookmarks,
    getByTag
  }
}
