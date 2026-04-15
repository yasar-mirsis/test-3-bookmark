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
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}

// UpdateBookmarkInput represents the input for updating an existing bookmark
// All fields are optional for partial updates
type UpdateBookmarkInput struct {
	URL         *string   `json:"url,omitempty"`
	Title       *string   `json:"title,omitempty"`
	Description *string   `json:"description,omitempty"`
	Tags        *[]string `json:"tags,omitempty"`
}

// ListFilters represents filters for listing bookmarks with pagination
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

// Constants for pagination
const (
	DefaultPageSize = 20
	MinPageSize     = 1
	MaxPageSize     = 100
)

// Validate validates the CreateBookmarkInput and returns an error if invalid
func (c *CreateBookmarkInput) Validate() error {
	// Check required URL
	if strings.TrimSpace(c.URL) == "" {
		return BookmarkError{Error: "URL is required", Code: 400}
	}

	// Validate URL format (must be http:// or https://)
	if err := validateURL(c.URL); err != nil {
		return BookmarkError{Error: err.Error(), Code: 400}
	}

	// Check required Title
	if strings.TrimSpace(c.Title) == "" {
		return BookmarkError{Error: "Title is required", Code: 400}
	}

	return nil
}

// ProcessTags deduplicates and trims the tags
func (c *CreateBookmarkInput) ProcessTags() []string {
	if len(c.Tags) == 0 {
		return []string{}
	}

	// Use map for deduplication while preserving order
	seen := make(map[string]bool)
	result := make([]string, 0, len(c.Tags))

	for _, tag := range c.Tags {
		trimmed := strings.TrimSpace(tag)
		if trimmed != "" && !seen[trimmed] {
			seen[trimmed] = true
			result = append(result, trimmed)
		}
	}

	return result
}

// Validate validates the UpdateBookmarkInput and returns an error if invalid
func (u *UpdateBookmarkInput) Validate() error {
	// If URL is being updated, validate it
	if u.URL != nil {
		if strings.TrimSpace(*u.URL) == "" {
			return BookmarkError{Error: "URL cannot be empty", Code: 400}
		}
		if err := validateURL(*u.URL); err != nil {
			return BookmarkError{Error: err.Error(), Code: 400}
		}
	}

	// If Title is being updated, validate it
	if u.Title != nil && strings.TrimSpace(*u.Title) == "" {
		return BookmarkError{Error: "Title cannot be empty", Code: 400}
	}

	return nil
}

// ProcessTags deduplicates and trims the tags if provided
func (u *UpdateBookmarkInput) ProcessTags() *[]string {
	if u.Tags == nil {
		return nil
	}

	tags := *u.Tags
	if len(tags) == 0 {
		return &[]string{}
	}

	// Use map for deduplication while preserving order
	seen := make(map[string]bool)
	result := make([]string, 0, len(tags))

	for _, tag := range tags {
		trimmed := strings.TrimSpace(tag)
		if trimmed != "" && !seen[trimmed] {
			seen[trimmed] = true
			result = append(result, trimmed)
		}
	}

	return &result
}

// NewListFilters creates a new ListFilters with default values
func NewListFilters(page, pageSize int, tag, search string) ListFilters {
	// Apply defaults and bounds for page
	if page < 1 {
		page = 1
	}

	// Apply defaults and bounds for pageSize
	if pageSize < MinPageSize {
		pageSize = DefaultPageSize
	} else if pageSize > MaxPageSize {
		pageSize = MaxPageSize
	}

	return ListFilters{
		Page:     page,
		PageSize: pageSize,
		Tag:      strings.TrimSpace(tag),
		Search:   strings.TrimSpace(search),
	}
}

// Offset calculates the offset for database queries
func (l *ListFilters) Offset() int {
	return (l.Page - 1) * l.PageSize
}

// validateURL checks if the URL is valid and uses http:// or https://
func validateURL(rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return BookmarkError{Error: "Invalid URL format", Code: 400}
	}

	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return BookmarkError{Error: "URL must use http:// or https://", Code: 400}
	}

	if parsed.Host == "" {
		return BookmarkError{Error: "URL must have a valid host", Code: 400}
	}

	return nil
}

// NewBookmark creates a new Bookmark with the given input and ID
func NewBookmark(id string, input *CreateBookmarkInput) *Bookmark {
	now := time.Now().UTC()
	tags := input.ProcessTags()

	return &Bookmark{
		ID:          id,
		URL:         strings.TrimSpace(input.URL),
		Title:       strings.TrimSpace(input.Title),
		Description: strings.TrimSpace(input.Description),
		Tags:        tags,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Update applies the update input to the bookmark
func (b *Bookmark) Update(input *UpdateBookmarkInput) {
	now := time.Now().UTC()

	if input.URL != nil {
		b.URL = strings.TrimSpace(*input.URL)
	}
	if input.Title != nil {
		b.Title = strings.TrimSpace(*input.Title)
	}
	if input.Description != nil {
		b.Description = strings.TrimSpace(*input.Description)
	}
	if input.Tags != nil {
		b.Tags = *input.ProcessTags()
	}

	b.UpdatedAt = now
}

// CalculateTotalPages calculates the total number of pages
func CalculateTotalPages(total, pageSize int64) int {
	if total == 0 {
		return 0
	}
	if pageSize <= 0 {
		pageSize = DefaultPageSize
	}
	return int((total + pageSize - 1) / pageSize)
}

// NewBookmarkPage creates a new BookmarkPage with calculated total pages
func NewBookmarkPage(bookmarks []*Bookmark, total int64, page, pageSize int) *BookmarkPage {
	totalPages := CalculateTotalPages(total, int64(pageSize))

	// Ensure page is within bounds
	if page < 1 {
		page = 1
	}
	if totalPages > 0 && page > totalPages {
		page = totalPages
	}

	return &BookmarkPage{
		Bookmarks:  bookmarks,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
