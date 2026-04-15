package repository

import (
	"errors"
	"sync"

	"github.com/bookmark-manager/backend/internal/model"
)

var (
	ErrNotFound      = errors.New("bookmark not found")
	ErrInvalidInput  = errors.New("invalid input")
	ErrDuplicateID   = errors.New("bookmark with this ID already exists")
)

// BookmarkRepository defines the interface for bookmark data persistence
type BookmarkRepository interface {
	// Create adds a new bookmark to the repository
	Create(bookmark *model.Bookmark) error

	// Get retrieves a bookmark by its ID
	Get(id string) (*model.Bookmark, error)

	// GetAll retrieves all bookmarks with pagination
	GetAll(page, pageSize int) (*model.PaginatedBookmarks, error)

	// Update modifies an existing bookmark
	Update(id string, input model.UpdateBookmarkInput) (*model.Bookmark, error)

	// Delete removes a bookmark by its ID
	Delete(id string) error

	// Search finds bookmarks matching the search query
	Search(query string, page, pageSize int) (*model.PaginatedBookmarks, error)

	// GetByTag finds bookmarks with a specific tag
	GetByTag(tag string, page, pageSize int) (*model.PaginatedBookmarks, error)

	// GetAllTags returns all unique tags with their counts
	GetAllTags() (map[string]int, error)
}

// InMemoryRepository is an in-memory implementation of BookmarkRepository
type InMemoryRepository struct {
	mu       sync.RWMutex
	bookmarks map[string]*model.Bookmark
}

// NewInMemoryRepository creates a new in-memory repository
func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		bookmarks: make(map[string]*model.Bookmark),
	}
}

// Create adds a new bookmark
func (r *InMemoryRepository) Create(bookmark *model.Bookmark) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[bookmark.ID]; exists {
		return ErrDuplicateID
	}

	r.bookmarks[bookmark.ID] = bookmark
	return nil
}

// Get retrieves a bookmark by ID
func (r *InMemoryRepository) Get(id string) (*model.Bookmark, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	bookmark, exists := r.bookmarks[id]
	if !exists {
		return nil, ErrNotFound
	}

	return bookmark, nil
}

// GetAll retrieves all bookmarks with pagination
func (r *InMemoryRepository) GetAll(page, pageSize int) (*model.PaginatedBookmarks, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	total := len(r.bookmarks)
	totalPages := (total + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * pageSize
	end := start + pageSize
	if end > total {
		end = total
	}

	var bookmarks []model.Bookmark
	i := 0
	for _, b := range r.bookmarks {
		if i >= start && i < end {
			bookmarks = append(bookmarks, *b)
		}
		i++
	}

	return &model.PaginatedBookmarks{
		Bookmarks:  bookmarks,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// Update modifies an existing bookmark
func (r *InMemoryRepository) Update(id string, input model.UpdateBookmarkInput) (*model.Bookmark, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	bookmark, exists := r.bookmarks[id]
	if !exists {
		return nil, ErrNotFound
	}

	if input.Title != nil {
		bookmark.Title = *input.Title
	}
	if input.Description != nil {
		bookmark.Description = *input.Description
	}
	if input.Tags != nil {
		bookmark.Tags = *input.Tags
	}
	bookmark.UpdatedAt = time.Now()

	r.bookmarks[id] = bookmark
	return bookmark, nil
}

// Delete removes a bookmark
func (r *InMemoryRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.bookmarks[id]; !exists {
		return ErrNotFound
	}

	delete(r.bookmarks, id)
	return nil
}

// Search finds bookmarks matching the query
func (r *InMemoryRepository) Search(query string, page, pageSize int) (*model.PaginatedBookmarks, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var matches []model.Bookmark
	queryLower := strings.ToLower(query)

	for _, b := range r.bookmarks {
		if strings.Contains(strings.ToLower(b.Title), queryLower) ||
			strings.Contains(strings.ToLower(b.Description), queryLower) ||
			strings.Contains(strings.ToLower(b.URL), queryLower) {
			matches = append(matches, *b)
		}
	}

	total := len(matches)
	totalPages := (total + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * pageSize
	end := start + pageSize
	if end > total {
		end = total
	}

	var paginated []model.Bookmark
	if start < total {
		paginated = matches[start:end]
	}

	return &model.PaginatedBookmarks{
		Bookmarks:  paginated,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetByTag finds bookmarks with a specific tag
func (r *InMemoryRepository) GetByTag(tag string, page, pageSize int) (*model.PaginatedBookmarks, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var matches []model.Bookmark
	for _, b := range r.bookmarks {
		for _, t := range b.Tags {
			if strings.EqualFold(t, tag) {
				matches = append(matches, *b)
				break
			}
		}
	}

	total := len(matches)
	totalPages := (total + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	start := (page - 1) * pageSize
	end := start + pageSize
	if end > total {
		end = total
	}

	var paginated []model.Bookmark
	if start < total {
		paginated = matches[start:end]
	}

	return &model.PaginatedBookmarks{
		Bookmarks:  paginated,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetAllTags returns all unique tags with counts
func (r *InMemoryRepository) GetAllTags() (map[string]int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tagCounts := make(map[string]int)
	for _, b := range r.bookmarks {
		for _, tag := range b.Tags {
			tagCounts[tag]++
		}
	}

	return tagCounts, nil
}
