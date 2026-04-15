package repository

import (
	"errors"
	"sync"

	"github.com/bookmark-manager/backend/internal/model"
)

var (
	ErrNotFound      = errors.New("bookmark not found")
	ErrInvalidInput  = errors.New("invalid input")
)

// BookmarkRepository defines the interface for bookmark data storage
type BookmarkRepository interface {
	Create(bookmark *model.Bookmark) error
	GetByID(id string) (*model.Bookmark, error)
	GetAll(page, pageSize int) ([]*model.Bookmark, int, error)
	Update(id string, bookmark *model.Bookmark) error
	Delete(id string) error
	Search(query string) ([]*model.Bookmark, error)
	FindByTag(tag string) ([]*model.Bookmark, error)
	GetAllTags() (map[string]int, error)
}

// InMemoryRepository implements BookmarkRepository using in-memory storage
type InMemoryRepository struct {
	mu      sync.RWMutex
	bookmarks map[string]*model.Bookmark
}

// NewInMemoryRepository creates a new in-memory repository
func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		bookmarks: make(map[string]*model.Bookmark),
	}
}

// Create adds a new bookmark to the repository
func (r *InMemoryRepository) Create(bookmark *model.Bookmark) error {
	if bookmark == nil || bookmark.URL == "" || bookmark.Title == "" {
		return ErrInvalidInput
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.bookmarks[bookmark.ID] = bookmark
	return nil
}

// GetByID retrieves a bookmark by its ID
func (r *InMemoryRepository) GetByID(id string) (*model.Bookmark, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	bookmark, exists := r.bookmarks[id]
	if !exists {
		return nil, ErrNotFound
	}

	return bookmark, nil
}

// GetAll retrieves all bookmarks with pagination
func (r *InMemoryRepository) GetAll(page, pageSize int) ([]*model.Bookmark, int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	total := len(r.bookmarks)
	start := (page - 1) * pageSize
	if start >= total {
		return []*model.Bookmark{}, total, nil
	}

	end := start + pageSize
	if end > total {
		end = total
	}

	bookmarks := make([]*model.Bookmark, 0, end-start)
	for _, bookmark := range r.bookmarks {
		bookmarks = append(bookmarks, bookmark)
	}

	// Sort by created_at (newest first)
	for i := 0; i < len(bookmarks)-1; i++ {
		for j := i + 1; j < len(bookmarks); j++ {
			if bookmarks[i].CreatedAt.Before(bookmarks[j].CreatedAt) {
				bookmarks[i], bookmarks[j] = bookmarks[j], bookmarks[i]
			}
		}
	}

	return bookmarks[start:end], total, nil
}

// Update modifies an existing bookmark
func (r *InMemoryRepository) Update(id string, bookmark *model.Bookmark) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[id]; !exists {
		return ErrNotFound
	}

	bookmark.ID = id
	bookmark.UpdatedAt = bookmark.UpdatedAt
	r.bookmarks[id] = bookmark
	return nil
}

// Delete removes a bookmark from the repository
func (r *InMemoryRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[id]; !exists {
		return ErrNotFound
	}

	delete(r.bookmarks, id)
	return nil
}

// Search finds bookmarks matching the query in title, description, or URL
func (r *InMemoryRepository) Search(query string) ([]*model.Bookmark, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	query = toLower(query)
	results := make([]*model.Bookmark, 0)

	for _, bookmark := range r.bookmarks {
		if contains(toLower(bookmark.Title), query) ||
			contains(toLower(bookmark.Description), query) ||
			contains(toLower(bookmark.URL), query) {
			results = append(results, bookmark)
		}
	}

	return results, nil
}

// FindByTag finds all bookmarks with a specific tag
func (r *InMemoryRepository) FindByTag(tag string) ([]*model.Bookmark, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tag = toLower(tag)
	results := make([]*model.Bookmark, 0)

	for _, bookmark := range r.bookmarks {
		for _, bTag := range bookmark.Tags {
			if toLower(bTag) == tag {
				results = append(results, bookmark)
				break
			}
		}
	}

	return results, nil
}

// GetAllTags returns all tags with their counts
func (r *InMemoryRepository) GetAllTags() (map[string]int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tagCounts := make(map[string]int)
	for _, bookmark := range r.bookmarks {
		for _, tag := range bookmark.Tags {
			tagCounts[tag]++
		}
	}

	return tagCounts, nil
}

// Helper functions
func toLower(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			result[i] = c + 32
		} else {
			result[i] = c
		}
	}
	return string(result)
}

func contains(s, substr string) bool {
	if len(substr) > len(s) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		match := true
		for j := 0; j < len(substr); j++ {
			if s[i+j] != substr[j] {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}
