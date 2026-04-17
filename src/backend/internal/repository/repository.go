package repository

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"test-3-bookmark/src/backend/internal/model"
)

// BookmarkRepository defines the interface for bookmark data persistence
type BookmarkRepository interface {
	Create(ctx context.Context, b *model.Bookmark) error
	FindByID(ctx context.Context, id string) (*model.Bookmark, error)
	FindByTag(ctx context.Context, tag string) ([]*model.Bookmark, error)
	Search(ctx context.Context, query string) ([]*model.Bookmark, error)
	FindAll(ctx context.Context, page, pageSize int) ([]*model.Bookmark, int64, error)
	Update(ctx context.Context, b *model.Bookmark) error
	Delete(ctx context.Context, id string) error
}

// InMemoryRepository provides an in-memory implementation of BookmarkRepository
type InMemoryRepository struct {
	mu       sync.RWMutex
	bookmarks map[string]*model.Bookmark
}

// NewInMemoryRepository creates a new instance of InMemoryRepository
func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		bookmarks: make(map[string]*model.Bookmark),
	}
}

// Create inserts a new bookmark, generating a UUID for ID and setting timestamps
func (r *InMemoryRepository) Create(ctx context.Context, b *model.Bookmark) error {
	if b == nil {
		return ErrBookmarkRequired
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Generate UUID if not set
	if b.ID == "" {
		b.ID = uuid.New().String()
	}

	// Set timestamps
	now := time.Now()
	b.CreatedAt = now
	b.UpdatedAt = now

	// Deduplicate tags
	b.Tags = deduplicateTags(b.Tags)

	r.bookmarks[b.ID] = b
	return nil
}

// FindByID finds a bookmark by its ID, returns nil if not found
func (r *InMemoryRepository) FindByID(ctx context.Context, id string) (*model.Bookmark, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	bookmark, exists := r.bookmarks[id]
	if !exists {
		return nil, ErrBookmarkNotFound
	}

	// Return a copy to prevent external modification
	copy := *bookmark
	return &copy, nil
}

// FindByTag finds all bookmarks with the specified tag
func (r *InMemoryRepository) FindByTag(ctx context.Context, tag string) ([]*model.Bookmark, error) {
	if tag == "" {
		return []*model.Bookmark{}, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*model.Bookmark
	tagLower := strings.ToLower(tag)

	for _, bookmark := range r.bookmarks {
		for _, bTag := range bookmark.Tags {
			if strings.ToLower(bTag) == tagLower {
				// Return a copy to prevent external modification
				copy := *bookmark
				results = append(results, &copy)
				break
			}
		}
	}

	return results, nil
}

// Search performs a full-text search across title, description, and URL
func (r *InMemoryRepository) Search(ctx context.Context, query string) ([]*model.Bookmark, error) {
	if query == "" {
		return []*model.Bookmark{}, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*model.Bookmark
	queryLower := strings.ToLower(query)

	for _, bookmark := range r.bookmarks {
		if strings.Contains(strings.ToLower(bookmark.Title), queryLower) ||
			strings.Contains(strings.ToLower(bookmark.Description), queryLower) ||
			strings.Contains(strings.ToLower(bookmark.URL), queryLower) {
			// Return a copy to prevent external modification
			copy := *bookmark
			results = append(results, &copy)
		}
	}

	return results, nil
}

// FindAll returns a paginated list of bookmarks with total count
func (r *InMemoryRepository) FindAll(ctx context.Context, page, pageSize int) ([]*model.Bookmark, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	total := int64(len(r.bookmarks))

	// Convert map to slice
	allBookmarks := make([]*model.Bookmark, 0, total)
	for _, bookmark := range r.bookmarks {
		// Return a copy to prevent external modification
		copy := *bookmark
		allBookmarks = append(allBookmarks, &copy)
	}

	// Calculate pagination offsets
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(allBookmarks) {
		return []*model.Bookmark{}, total, nil
	}

	if end > len(allBookmarks) {
		end = len(allBookmarks)
	}

	return allBookmarks[start:end], total, nil
}

// Update updates an existing bookmark and updates the timestamp
func (r *InMemoryRepository) Update(ctx context.Context, b *model.Bookmark) error {
	if b == nil {
		return ErrBookmarkRequired
	}
	if b.ID == "" {
		return ErrInvalidID
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	_, exists := r.bookmarks[b.ID]
	if !exists {
		return ErrBookmarkNotFound
	}

	// Update timestamp
	b.UpdatedAt = time.Now()

	// Deduplicate tags
	b.Tags = deduplicateTags(b.Tags)

	r.bookmarks[b.ID] = b
	return nil
}

// Delete removes a bookmark by its ID
func (r *InMemoryRepository) Delete(ctx context.Context, id string) error {
	if id == "" {
		return ErrInvalidID
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	_, exists := r.bookmarks[id]
	if !exists {
		return ErrBookmarkNotFound
	}

	delete(r.bookmarks, id)
	return nil
}

// deduplicateTags removes duplicate tags while preserving order
func deduplicateTags(tags []string) []string {
	if len(tags) == 0 {
		return tags
	}

	seen := make(map[string]bool)
	var result []string

	for _, tag := range tags {
		tagLower := strings.ToLower(tag)
		if !seen[tagLower] {
			seen[tagLower] = true
			result = append(result, tag)
		}
	}

	return result
}
