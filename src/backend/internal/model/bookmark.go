package model

import (
	"net/url"
	"strings"
	"time"
)

// Bookmark represents a saved web resource with metadata
type Bookmark struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateBookmarkInput represents the input for creating a new bookmark
type CreateBookmarkInput struct {
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

// UpdateBookmarkInput represents the input for updating an existing bookmark
type UpdateBookmarkInput struct {
	URL         *string   `json:"url"`
	Title       *string   `json:"title"`
	Description *string   `json:"description"`
	Tags        *[]string `json:"tags"`
}

// ListFilters represents filtering options for listing bookmarks
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

// NewBookmark creates a new Bookmark with the given input and timestamps
func NewBookmark(input *CreateBookmarkInput) *Bookmark {
	return &Bookmark{
		URL:         input.URL,
		Title:       input.Title,
		Description: input.Description,
		Tags:        DeduplicateTags(input.Tags),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// ValidateURL checks if the URL is valid (http:// or https://)
func ValidateURL(u string) bool {
	if u == "" {
		return false
	}
	parsedURL, err := url.Parse(u)
	if err != nil {
		return false
	}
	return parsedURL.Scheme == "http" || parsedURL.Scheme == "https"
}

// DeduplicateTags removes duplicates and trims whitespace from tags
func DeduplicateTags(tags []string) []string {
	if len(tags) == 0 {
		return []string{}
	}

	seen := make(map[string]bool)
	result := []string{}

	for _, tag := range tags {
		trimmed := strings.TrimSpace(tag)
		if trimmed == "" {
			continue
		}
		lower := strings.ToLower(trimmed)
		if !seen[lower] {
			seen[lower] = true
			result = append(result, trimmed)
		}
	}

	return result
}

// ValidateCreateInput validates CreateBookmarkInput and returns error if invalid
func (c *CreateBookmarkInput) ValidateCreateInput() *BookmarkError {
	if c.URL == "" {
		return &BookmarkError{Error: "URL is required", Code: 400}
	}

	if !ValidateURL(c.URL) {
		return &BookmarkError{Error: "Invalid URL format. URL must start with http:// or https://", Code: 400}
	}

	if c.Title == "" {
		return &BookmarkError{Error: "Title is required", Code: 400}
	}

	return nil
}

// Apply updates to a bookmark from UpdateBookmarkInput
func (b *Bookmark) ApplyUpdate(input *UpdateBookmarkInput) {
	if input.URL != nil {
		b.URL = *input.URL
	}
	if input.Title != nil {
		b.Title = *input.Title
	}
	if input.Description != nil {
		b.Description = *input.Description
	}
	if input.Tags != nil {
		b.Tags = DeduplicateTags(*input.Tags)
	}
	b.UpdatedAt = time.Now()
}

// NewListFilters creates ListFilters with default values
func NewListFilters(page, pageSize int, tag, search string) *ListFilters {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	return &ListFilters{
		Page:     page,
		PageSize: pageSize,
		Tag:      tag,
		Search:   search,
	}
}

// CalculateTotalPages calculates the total number of pages
func CalculateTotalPages(total, pageSize int) int {
	if total == 0 {
		return 0
	}
	return (total + pageSize - 1) / pageSize
}

// NewBookmarkPage creates a new BookmarkPage with calculated total pages
func NewBookmarkPage(bookmarks []*Bookmark, total int64, page, pageSize int) *BookmarkPage {
	totalPages := 0
	if total > 0 {
		totalPages = (int(total) + pageSize - 1) / pageSize
	}

	return &BookmarkPage{
		Bookmarks:  bookmarks,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
