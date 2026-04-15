package model

import "time"

// Bookmark represents a saved web resource with metadata
type Bookmark struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// CreateBookmarkInput represents the input for creating a bookmark
type CreateBookmarkInput struct {
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}

// UpdateBookmarkInput represents the input for updating a bookmark
type UpdateBookmarkInput struct {
	Title       *string   `json:"title,omitempty"`
	Description *string   `json:"description,omitempty"`
	Tags        *[]string `json:"tags,omitempty"`
}

// PaginatedBookmarks represents a paginated list of bookmarks
type PaginatedBookmarks struct {
	Bookmarks  []Bookmark `json:"bookmarks"`
	Total      int        `json:"total"`
	Page       int        `json:"page"`
	PageSize   int        `json:"pageSize"`
	TotalPages int        `json:"totalPages"`
}
