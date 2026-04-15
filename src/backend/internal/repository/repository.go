package repository

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/bookmark-manager/backend/internal/model"
	"github.com/google/uuid"
)

var (
	// ErrNotFound is returned when a bookmark is not found
	ErrNotFound = errors.New("bookmark not found")
)

// Repository provides in-memory storage for bookmarks with thread-safe operations
type Repository struct {
	mu        sync.RWMutex
	bookmarks map[string]*model.Bookmark
}

// NewRepository creates a new in-memory bookmark repository
func NewRepository() *Repository {
	return &Repository{
		bookmarks: make(map[string]*model.Bookmark),
	}
}

// Create inserts a new bookmark with generated ID and timestamps
func (r *Repository) Create(ctx context.Context, b *model.Bookmark) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Generate UUID for ID if not set
	if b.ID == "" {
		b.ID = uuid.New().String()
	}

	now := time.Now()
	b.CreatedAt = now
	b.UpdatedAt = now

	r.bookmarks[b.ID] = b
	return nil
}

// FindByID finds a bookmark by its ID, returns nil if not found
func (r *Repository) FindByID(ctx context.Context, id string) (*model.Bookmark, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	b, exists := r.bookmarks[id]
	if !exists {
		return nil, nil
	}

	// Return a copy to prevent external modification
	copy := *b
	return &copy, nil
}

// FindByTag finds all bookmarks with a specific tag
func (r *Repository) FindByTag(ctx context.Context, tag string) ([]*model.Bookmark, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*model.Bookmark
	tagLower := strings.ToLower(tag)

	for _, b := range r.bookmarks {
		for _, t := range b.Tags {
			if strings.ToLower(t) == tagLower {
				// Return a copy to prevent external modification
				copy := *b
				results = append(results, &copy)
				break
			}
		}
	}

	return results, nil
}

// Search performs full-text search across title, description, and URL
func (r *Repository) Search(ctx context.Context, query string) ([]*model.Bookmark, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*model.Bookmark
	queryLower := strings.ToLower(query)

	for _, b := range r.bookmarks {
		if strings.Contains(strings.ToLower(b.Title), queryLower) ||
			strings.Contains(strings.ToLower(b.Description), queryLower) ||
			strings.Contains(strings.ToLower(b.URL), queryLower) {
			// Return a copy to prevent external modification
			copy := *b
			results = append(results, &copy)
		}
	}

	return results, nil
}

// FindAll returns a paginated list of bookmarks with total count
func (r *Repository) FindAll(ctx context.Context, page, pageSize int) ([]*model.Bookmark, int64, error) {
	if ctx.Err() != nil {
		return nil, 0, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	// Get all bookmarks
	allBookmarks := make([]*model.Bookmark, 0, len(r.bookmarks))
	for _, b := range r.bookmarks {
		// Return a copy to prevent external modification
		copy := *b
		allBookmarks = append(allBookmarks, &copy)
	}

	total := int64(len(allBookmarks))

	// Handle pagination
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 1
	}

	start := (page - 1) * pageSize
	if start >= len(allBookmarks) {
		return []*model.Bookmark{}, total, nil
	}

	end := start + pageSize
	if end > len(allBookmarks) {
		end = len(allBookmarks)
	}

	return allBookmarks[start:end], total, nil
}

// Update updates an existing bookmark and refreshes the timestamp
func (r *Repository) Update(ctx context.Context, b *model.Bookmark) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[b.ID]; !exists {
		return ErrNotFound
	}

	b.UpdatedAt = time.Now()
	r.bookmarks[b.ID] = b
	return nil
}

// Delete removes a bookmark by its ID
func (r *Repository) Delete(ctx context.Context, id string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[id]; !exists {
		return ErrNotFound
	}

	delete(r.bookmarks, id)
	return nil
}

// GetAllTags returns all unique tags from all bookmarks
func (r *Repository) GetAllTags(ctx context.Context) ([]string, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	tagSet := make(map[string]bool)
	for _, b := range r.bookmarks {
		for _, tag := range b.Tags {
			tagSet[tag] = true
		}
	}

	tags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		tags = append(tags, tag)
	}

	return tags, nil
}

// Count returns the total number of bookmarks
func (r *Repository) Count(ctx context.Context) (int64, error) {
	if ctx.Err() != nil {
		return 0, ctx.Err()
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	return int64(len(r.bookmarks)), nil
}
