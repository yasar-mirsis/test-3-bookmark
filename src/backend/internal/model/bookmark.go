package model

import (
	"time"

	"github.com/google/uuid"
)

// Bookmark represents a saved web resource
type Bookmark struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewBookmark creates a new Bookmark instance with generated ID and timestamps
func NewBookmark(url, title, description string, tags []string) *Bookmark {
	now := time.Now()
	// Deduplicate tags
	uniqueTags := deduplicateTags(tags)

	return &Bookmark{
		ID:          uuid.New().String(),
		URL:         url,
		Title:       title,
		Description: description,
		Tags:        uniqueTags,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// deduplicateTags removes duplicate tags from the slice
func deduplicateTags(tags []string) []string {
	seen := make(map[string]bool)
	var result []string

	for _, tag := range tags {
		trimmed := trimString(tag)
		if trimmed != "" && !seen[trimmed] {
			seen[trimmed] = true
			result = append(result, trimmed)
		}
	}

	return result
}

// trimString trims whitespace from a string
func trimString(s string) string {
	if s == "" {
		return s
	}
	start := 0
	end := len(s)
	for start < end && s[start] == ' ' {
		start++
	}
	for end > start && s[end-1] == ' ' {
		end--
	}
	return s[start:end]
}

// Update updates the bookmark fields
func (b *Bookmark) Update(title, description string, tags []string) {
	b.Title = title
	b.Description = description
	b.Tags = deduplicateTags(tags)
	b.UpdatedAt = time.Now()
}
