export interface Bookmark {
  id: string
  url: string
  title: string
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Tag {
  name: string
  count: number
}

export interface CreateBookmarkInput {
  url: string
  title: string
  description?: string
  tags?: string[]
}

export interface UpdateBookmarkInput {
  title?: string
  description?: string
  tags?: string[]
}
