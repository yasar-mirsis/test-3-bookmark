package model

import (
	"time"
)

// Bookmark represents a saved web resource with metadata
type Bookmark struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
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
	URL         *string   `json:"url,omitempty"`
	Title       *string   `json:"title,omitempty"`
	Description *string   `json:"description,omitempty"`
	Tags        *[]string `json:"tags,omitempty"`
}

// ListFilters represents filter options for listing bookmarks
type ListFilters struct {
	Page     int
	PageSize int
	Tag      string
	Search   string
}

// BookmarkPage represents a paginated response of bookmarks
type BookmarkPage struct {
	Bookmarks []*Bookmark `json:"bookmarks"`
	Total     int64       `json:"total"`
	Page      int         `json:"page"`
	PageSize  int         `json:"page_size"`
	TotalPages int        `json:"total_pages"`
}

// BookmarkError represents an error response for bookmark operations
type BookmarkError struct {
	Error string `json:"error"`
	Code  int    `json:"code"`
}
