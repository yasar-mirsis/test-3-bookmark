package service

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/bookmark-manager/backend/internal/model"
	"github.com/bookmark-manager/backend/internal/repository"
)

// BookmarkService defines the interface for bookmark business logic
type BookmarkService interface {
	CreateBookmark(url, title, description string, tags []string) (*model.Bookmark, error)
	GetBookmark(id string) (*model.Bookmark, error)
	GetBookmarks(page, pageSize int) ([]*model.Bookmark, int, error)
	UpdateBookmark(id, title, description string, tags []string) (*model.Bookmark, error)
	DeleteBookmark(id string) error
	SearchBookmarks(query string) ([]*model.Bookmark, error)
	FilterByTag(tag string) ([]*model.Bookmark, error)
	GetAllTags() (map[string]int, error)
}

// Service implements BookmarkService
type Service struct {
	repo repository.BookmarkRepository
}

// NewService creates a new bookmark service
func NewService(repo repository.BookmarkRepository) *Service {
	return &Service{repo: repo}
}

// CreateBookmark creates a new bookmark with validation
func (s *Service) CreateBookmark(bookmarkURL, title, description string, tags []string) (*model.Bookmark, error) {
	// Validate URL
	if err := validateURL(bookmarkURL); err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Validate title
	if strings.TrimSpace(title) == "" {
		return nil, fmt.Errorf("title is required")
	}

	bookmark := model.NewBookmark(bookmarkURL, title, description, tags)

	if err := s.repo.Create(bookmark); err != nil {
		return nil, fmt.Errorf("failed to create bookmark: %w", err)
	}

	return bookmark, nil
}

// GetBookmark retrieves a bookmark by ID
func (s *Service) GetBookmark(id string) (*model.Bookmark, error) {
	bookmark, err := s.repo.GetByID(id)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, fmt.Errorf("bookmark not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get bookmark: %w", err)
	}
	return bookmark, nil
}

// GetBookmarks retrieves all bookmarks with pagination
func (s *Service) GetBookmarks(page, pageSize int) ([]*model.Bookmark, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	bookmarks, total, err := s.repo.GetAll(page, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get bookmarks: %w", err)
	}

	return bookmarks, total, nil
}

// UpdateBookmark updates an existing bookmark
func (s *Service) UpdateBookmark(id, title, description string, tags []string) (*model.Bookmark, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, fmt.Errorf("bookmark not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get bookmark: %w", err)
	}

	if strings.TrimSpace(title) == "" {
		return nil, fmt.Errorf("title is required")
	}

	existing.Update(title, description, tags)

	if err := s.repo.Update(id, existing); err != nil {
		return nil, fmt.Errorf("failed to update bookmark: %w", err)
	}

	return existing, nil
}

// DeleteBookmark removes a bookmark
func (s *Service) DeleteBookmark(id string) error {
	if err := s.repo.Delete(id); err != nil {
		if err == repository.ErrNotFound {
			return fmt.Errorf("bookmark not found: %w", err)
		}
		return fmt.Errorf("failed to delete bookmark: %w", err)
	}
	return nil
}

// SearchBookmarks searches bookmarks by query
func (s *Service) SearchBookmarks(query string) ([]*model.Bookmark, error) {
	if strings.TrimSpace(query) == "" {
		return s.repo.GetAll(1, 1000)
	}

	results, err := s.repo.Search(query)
	if err != nil {
		return nil, fmt.Errorf("failed to search bookmarks: %w", err)
	}

	return results, nil
}

// FilterByTag filters bookmarks by a specific tag
func (s *Service) FilterByTag(tag string) ([]*model.Bookmark, error) {
	if strings.TrimSpace(tag) == "" {
		return nil, fmt.Errorf("tag is required")
	}

	results, err := s.repo.FindByTag(tag)
	if err != nil {
		return nil, fmt.Errorf("failed to filter bookmarks: %w", err)
	}

	return results, nil
}

// GetAllTags returns all tags with their counts
func (s *Service) GetAllTags() (map[string]int, error) {
	tags, err := s.repo.GetAllTags()
	if err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}
	return tags, nil
}

// validateURL checks if the URL is valid
func validateURL(input string) error {
	input = strings.TrimSpace(input)
	if input == "" {
		return fmt.Errorf("URL cannot be empty")
	}

	// Add scheme if missing
	if !strings.HasPrefix(input, "http://") && !strings.HasPrefix(input, "https://") {
		input = "https://" + input
	}

	parsed, err := url.Parse(input)
	if err != nil {
		return fmt.Errorf("invalid URL format: %w", err)
	}

	if parsed.Host == "" {
		return fmt.Errorf("URL must have a valid host")
	}

	return nil
}
