package service

import (
	"errors"
	"strings"
	"time"

	"github.com/bookmark-manager/backend/internal/model"
	"github.com/bookmark-manager/backend/internal/repository"
	"github.com/google/uuid"
)

var (
	ErrInvalidURL     = errors.New("invalid URL format")
	ErrInvalidTitle   = errors.New("title is required")
	ErrBookmarkExists = errors.New("bookmark not found")
)

// BookmarkService handles business logic for bookmarks
type BookmarkService struct {
	repo repository.BookmarkRepository
}

// NewBookmarkService creates a new bookmark service
func NewBookmarkService(repo repository.BookmarkRepository) *BookmarkService {
	return &BookmarkService{repo: repo}
}

// CreateBookmark creates a new bookmark
func (s *BookmarkService) CreateBookmark(input model.CreateBookmarkInput) (*model.Bookmark, error) {
	// Validate input
	if input.URL == "" {
		return nil, ErrInvalidURL
	}
	if input.Title == "" {
		return nil, ErrInvalidTitle
	}

	// Deduplicate and normalize tags
	uniqueTags := s.deduplicateTags(input.Tags)

	bookmark := &model.Bookmark{
		ID:          uuid.New().String(),
		URL:         input.URL,
		Title:       input.Title,
		Description: input.Description,
		Tags:        uniqueTags,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.repo.Create(bookmark); err != nil {
		return nil, err
	}

	return bookmark, nil
}

// GetBookmark retrieves a bookmark by ID
func (s *BookmarkService) GetBookmark(id string) (*model.Bookmark, error) {
	return s.repo.Get(id)
}

// GetAllBookmarks retrieves all bookmarks with pagination
func (s *BookmarkService) GetAllBookmarks(page, pageSize int) (*model.PaginatedBookmarks, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	return s.repo.GetAll(page, pageSize)
}

// UpdateBookmark updates an existing bookmark
func (s *BookmarkService) UpdateBookmark(id string, input model.UpdateBookmarkInput) (*model.Bookmark, error) {
	bookmark, err := s.repo.Get(id)
	if err != nil {
		return nil, err
	}

	// Prepare update input
	updateInput := model.UpdateBookmarkInput{}

	if input.Title != nil {
		if *input.Title == "" {
			return nil, ErrInvalidTitle
		}
		updateInput.Title = input.Title
	}

	if input.Description != nil {
		updateInput.Description = input.Description
	}

	if input.Tags != nil {
		uniqueTags := s.deduplicateTags(*input.Tags)
		updateInput.Tags = &uniqueTags
	}

	return s.repo.Update(id, updateInput)
}

// DeleteBookmark deletes a bookmark
func (s *BookmarkService) DeleteBookmark(id string) error {
	return s.repo.Delete(id)
}

// SearchBookmarks searches bookmarks by query
func (s *BookmarkService) SearchBookmarks(query string, page, pageSize int) (*model.PaginatedBookmarks, error) {
	if query == "" {
		return s.GetAllBookmarks(page, pageSize)
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	return s.repo.Search(query, page, pageSize)
}

// GetBookmarksByTag retrieves bookmarks by tag
func (s *BookmarkService) GetBookmarksByTag(tag string, page, pageSize int) (*model.PaginatedBookmarks, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	return s.repo.GetByTag(tag, page, pageSize)
}

// GetAllTags retrieves all tags with counts
func (s *BookmarkService) GetAllTags() (map[string]int, error) {
	return s.repo.GetAllTags()
}

// deduplicateTags removes duplicate tags and normalizes them
func (s *BookmarkService) deduplicateTags(tags []string) []string {
	seen := make(map[string]bool)
	var result []string

	for _, tag := range tags {
		normalized := strings.TrimSpace(strings.ToLower(tag))
		if normalized != "" && !seen[normalized] {
			seen[normalized] = true
			result = append(result, normalized)
		}
	}

	return result
}
