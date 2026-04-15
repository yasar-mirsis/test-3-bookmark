import axios from 'axios'
import { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const bookmarkService = {
  async getAll(page: number = 1, pageSize: number = 20): Promise<{ bookmarks: Bookmark[]; total: number; totalPages: number }> {
    const response = await axios.get(`${API_URL}/bookmarks`, { params: { page, pageSize } })
    return response.data
  },

  async getById(id: string): Promise<Bookmark> {
    const response = await axios.get(`${API_URL}/bookmarks/${id}`)
    return response.data
  },

  async create(data: CreateBookmarkInput): Promise<Bookmark> {
    const response = await axios.post(`${API_URL}/bookmarks`, data)
    return response.data
  },

  async update(id: string, data: UpdateBookmarkInput): Promise<Bookmark> {
    const response = await axios.put(`${API_URL}/bookmarks/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/bookmarks/${id}`)
  },

  async search(query: string, page: number = 1, pageSize: number = 20): Promise<{ bookmarks: Bookmark[]; total: number; totalPages: number }> {
    const response = await axios.get(`${API_URL}/bookmarks/search`, { params: { q: query, page, pageSize } })
    return response.data
  },

  async getByTag(tag: string, page: number = 1, pageSize: number = 20): Promise<{ bookmarks: Bookmark[]; total: number; totalPages: number }> {
    const response = await axios.get(`${API_URL}/bookmarks/tag/${tag}`, { params: { page, pageSize } })
    return response.data
  },

  async getAllTags(): Promise<Record<string, number>> {
    const response = await axios.get(`${API_URL}/tags`)
    return response.data
  }
}
