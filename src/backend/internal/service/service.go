package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/repository"
)

var (
	// ErrInvalidURL is returned when the URL format is invalid
	ErrInvalidURL = errors.New("invalid URL format. URL must start with http:// or https://")
	// ErrURLRequired is returned when URL is empty
	ErrURLRequired = errors.New("URL is required")
	// ErrTitleRequired is returned when title is empty
	ErrTitleRequired = errors.New("title is required")
	// ErrBookmarkNotFound is returned when a bookmark is not found
	ErrBookmarkNotFound = errors.New("bookmark not found")
	// ErrInvalidPage is returned when page number is less than 1
	ErrInvalidPage = errors.New("page must be at least 1")
	// ErrInvalidPageSize is returned when page size is out of range
	ErrInvalidPageSize = errors.New("page size must be between 1 and 100")
)

const (
	// DefaultPageSize is the default number of items per page
	DefaultPageSize = 20
	// MinPageSize is the minimum allowed page size
	MinPageSize = 1
	// MaxPageSize is the maximum allowed page size
	MaxPageSize = 100
)

// BookmarkService defines the interface for bookmark business logic
type BookmarkService interface {
	// CreateBookmark creates a new bookmark with validation and tag deduplication
	CreateBookmark(ctx context.Context, input model.CreateBookmarkInput) (*model.Bookmark, error)
	// GetBookmark retrieves a bookmark by ID
	GetBookmark(ctx context.Context, id string) (*model.Bookmark, error)
	// ListBookmarks returns a paginated list of bookmarks with optional filters
	ListBookmarks(ctx context.Context, page, pageSize int, filters model.ListFilters) (*model.BookmarkPage, error)
	// UpdateBookmark updates an existing bookmark
	UpdateBookmark(ctx context.Context, id string, input model.UpdateBookmarkInput) (*model.Bookmark, error)
	// DeleteBookmark removes a bookmark by ID
	DeleteBookmark(ctx context.Context, id string) error
	// SearchBookmarks searches bookmarks by query string
	SearchBookmarks(ctx context.Context, query string) ([]*model.Bookmark, error)
	// GetTags returns all unique tags from bookmarks
	GetTags(ctx context.Context) ([]string, error)
}

// bookmarkService implements the BookmarkService interface
type bookmarkService struct {
	repo repository.BookmarkRepository
}

// NewBookmarkService creates a new instance of BookmarkService
func NewBookmarkService(repo repository.BookmarkRepository) BookmarkService {
	return &bookmarkService{
		repo: repo,
	}
}

// CreateBookmark creates a new bookmark with validation and tag deduplication
func (s *bookmarkService) CreateBookmark(ctx context.Context, input model.CreateBookmarkInput) (*model.Bookmark, error) {
	// Validate URL
	if input.URL == "" {
		return nil, ErrURLRequired
	}

	if !model.ValidateURL(input.URL) {
		return nil, ErrInvalidURL
	}

	// Validate title
	if input.Title == "" {
		return nil, ErrTitleRequired
	}

	// Deduplicate and trim tags
	input.Tags = model.DeduplicateTags(input.Tags)

	// Create the bookmark
	bookmark := model.NewBookmark(&input)

	// Save to repository
	if err := s.repo.Create(ctx, bookmark); err != nil {
		return nil, fmt.Errorf("failed to create bookmark: %w", err)
	}

	return bookmark, nil
}

// GetBookmark retrieves a bookmark by ID
func (s *bookmarkService) GetBookmark(ctx context.Context, id string) (*model.Bookmark, error) {
	if id == "" {
		return nil, ErrBookmarkNotFound
	}

	bookmark, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrBookmarkNotFound) || errors.Is(err, repository.ErrInvalidID) {
			return nil, ErrBookmarkNotFound
		}
		return nil, fmt.Errorf("failed to get bookmark: %w", err)
	}

	return bookmark, nil
}

// ListBookmarks returns a paginated list of bookmarks with optional filters
func (s *bookmarkService) ListBookmarks(ctx context.Context, page, pageSize int, filters model.ListFilters) (*model.BookmarkPage, error) {
	// Validate and normalize page size
	if pageSize < MinPageSize {
		pageSize = DefaultPageSize
	}
	if pageSize > MaxPageSize {
		pageSize = MaxPageSize
	}
	if page < 1 {
		page = 1
	}

	// If tag filter is specified, fetch bookmarks by tag
	if filters.Tag != "" {
		tags, err := s.repo.FindByTag(ctx, filters.Tag)
		if err != nil {
			return nil, fmt.Errorf("failed to filter by tag: %w", err)
		}

		// Apply search filter if specified
		if filters.Search != "" {
			tags = filterBySearch(tags, filters.Search)
		}

		// Apply pagination to filtered results
		total := int64(len(tags))
		start := (page - 1) * pageSize
		end := start + pageSize

		if start >= len(tags) {
			return model.NewBookmarkPage([]*model.Bookmark{}, total, page, pageSize), nil
		}

		if end > len(tags) {
			end = len(tags)
		}

		return model.NewBookmarkPage(tags[start:end], total, page, pageSize), nil
	}

	// If search filter is specified, fetch bookmarks by search
	if filters.Search != "" {
		results, err := s.repo.Search(ctx, filters.Search)
		if err != nil {
			return nil, fmt.Errorf("failed to search bookmarks: %w", err)
		}

		// Apply pagination to search results
		total := int64(len(results))
		start := (page - 1) * pageSize
		end := start + pageSize

		if start >= len(results) {
			return model.NewBookmarkPage([]*model.Bookmark{}, total, page, pageSize), nil
		}

		if end > len(results) {
			end = len(results)
		}

		return model.NewBookmarkPage(results[start:end], total, page, pageSize), nil
	}

	// No filters, return all bookmarks with pagination
	bookmarks, total, err := s.repo.FindAll(ctx, page, pageSize)
	if err != nil {
		return nil, fmt.Errorf("failed to list bookmarks: %w", err)
	}

	return model.NewBookmarkPage(bookmarks, total, page, pageSize), nil
}

// UpdateBookmark updates an existing bookmark
func (s *bookmarkService) UpdateBookmark(ctx context.Context, id string, input model.UpdateBookmarkInput) (*model.Bookmark, error) {
	if id == "" {
		return nil, ErrBookmarkNotFound
	}

	// Validate URL if provided
	if input.URL != nil && !model.ValidateURL(*input.URL) {
		return nil, ErrInvalidURL
	}

	// Fetch existing bookmark
	bookmark, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrBookmarkNotFound) || errors.Is(err, repository.ErrInvalidID) {
			return nil, ErrBookmarkNotFound
		}
		return nil, fmt.Errorf("failed to get bookmark for update: %w", err)
	}

	// Apply updates
	bookmark.ApplyUpdate(&input)

	// Save to repository
	if err := s.repo.Update(ctx, bookmark); err != nil {
		if errors.Is(err, repository.ErrBookmarkNotFound) {
			return nil, ErrBookmarkNotFound
		}
		return nil, fmt.Errorf("failed to update bookmark: %w", err)
	}

	return bookmark, nil
}

// DeleteBookmark removes a bookmark by ID
func (s *bookmarkService) DeleteBookmark(ctx context.Context, id string) error {
	if id == "" {
		return ErrBookmarkNotFound
	}

	err := s.repo.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrBookmarkNotFound) || errors.Is(err, repository.ErrInvalidID) {
			return ErrBookmarkNotFound
		}
		return fmt.Errorf("failed to delete bookmark: %w", err)
	}

	return nil
}

// SearchBookmarks searches bookmarks by query string
func (s *bookmarkService) SearchBookmarks(ctx context.Context, query string) ([]*model.Bookmark, error) {
	if query == "" {
		return []*model.Bookmark{}, nil
	}

	results, err := s.repo.Search(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to search bookmarks: %w", err)
	}

	return results, nil
}

// GetTags returns all unique tags from bookmarks
func (s *bookmarkService) GetTags(ctx context.Context) ([]string, error) {
	// Get all bookmarks
	bookmarks, _, err := s.repo.FindAll(ctx, 1, 1000) // Get up to 1000 bookmarks
	if err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}

	// Extract unique tags
	tagSet := make(map[string]bool)
	for _, bookmark := range bookmarks {
		for _, tag := range bookmark.Tags {
			tagLower := strings.ToLower(tag)
			if !tagSet[tagLower] {
				tagSet[tagLower] = true
			}
		}
	}

	// Convert to slice
	tags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		tags = append(tags, tag)
	}

	return tags, nil
}

// filterBySearch filters a slice of bookmarks by search query
func filterBySearch(bookmarks []*model.Bookmark, query string) []*model.Bookmark {
	if query == "" {
		return bookmarks
	}

	var results []*model.Bookmark
	queryLower := strings.ToLower(query)

	for _, bookmark := range bookmarks {
		if strings.Contains(strings.ToLower(bookmark.Title), queryLower) ||
			strings.Contains(strings.ToLower(bookmark.Description), queryLower) ||
			strings.Contains(strings.ToLower(bookmark.URL), queryLower) {
			results = append(results, bookmark)
		}
	}

	return results
}
