package service

import (
	"context"
	"errors"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/repository"
)

// BookmarkService defines the interface for bookmark business logic
type BookmarkService interface {
	CreateBookmark(ctx context.Context, input *model.CreateBookmarkInput) (*model.Bookmark, error)
	GetBookmark(ctx context.Context, id string) (*model.Bookmark, error)
	UpdateBookmark(ctx context.Context, id string, input *model.UpdateBookmarkInput) (*model.Bookmark, error)
	DeleteBookmark(ctx context.Context, id string) error
	ListBookmarks(ctx context.Context, filters *model.ListFilters) (*model.BookmarkPage, error)
	SearchBookmarks(ctx context.Context, query string) ([]*model.Bookmark, error)
	FindByTag(ctx context.Context, tag string) ([]*model.Bookmark, error)
}

// BookmarkServiceImpl implements the BookmarkService interface
type BookmarkServiceImpl struct {
	repo repository.BookmarkRepository
}

// NewBookmarkService creates a new instance of BookmarkServiceImpl
func NewBookmarkService(repo repository.BookmarkRepository) *BookmarkServiceImpl {
	return &BookmarkServiceImpl{
		repo: repo,
	}
}

// CreateBookmark creates a new bookmark
func (s *BookmarkServiceImpl) CreateBookmark(ctx context.Context, input *model.CreateBookmarkInput) (*model.Bookmark, error) {
	if input == nil {
		return nil, errors.New("input is required")
	}

	// Validate input
	if err := input.ValidateCreateInput(); err != nil {
		return nil, err
	}

	bookmark := model.NewBookmark(input)

	if err := s.repo.Create(ctx, bookmark); err != nil {
		return nil, err
	}

	return bookmark, nil
}

// GetBookmark retrieves a bookmark by ID
func (s *BookmarkServiceImpl) GetBookmark(ctx context.Context, id string) (*model.Bookmark, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}

	return s.repo.FindByID(ctx, id)
}

// UpdateBookmark updates an existing bookmark
func (s *BookmarkServiceImpl) UpdateBookmark(ctx context.Context, id string, input *model.UpdateBookmarkInput) (*model.Bookmark, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}

	if input == nil {
		return nil, errors.New("input is required")
	}

	// Get existing bookmark
	bookmark, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Apply updates
	bookmark.ApplyUpdate(input)

	// Save updated bookmark
	if err := s.repo.Update(ctx, bookmark); err != nil {
		return nil, err
	}

	return bookmark, nil
}

// DeleteBookmark deletes a bookmark by ID
func (s *BookmarkServiceImpl) DeleteBookmark(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id is required")
	}

	return s.repo.Delete(ctx, id)
}

// ListBookmarks returns a paginated list of bookmarks
func (s *BookmarkServiceImpl) ListBookmarks(ctx context.Context, filters *model.ListFilters) (*model.BookmarkPage, error) {
	if filters == nil {
		filters = model.NewListFilters(1, 20, "", "")
	}

	bookmarks, total, err := s.repo.FindAll(ctx, filters.Page, filters.PageSize)
	if err != nil {
		return nil, err
	}

	return model.NewBookmarkPage(bookmarks, total, filters.Page, filters.PageSize), nil
}

// SearchBookmarks searches bookmarks by query
func (s *BookmarkServiceImpl) SearchBookmarks(ctx context.Context, query string) ([]*model.Bookmark, error) {
	if query == "" {
		return []*model.Bookmark{}, nil
	}

	return s.repo.Search(ctx, query)
}

// FindByTag finds bookmarks by tag
func (s *BookmarkServiceImpl) FindByTag(ctx context.Context, tag string) ([]*model.Bookmark, error) {
	if tag == "" {
		return []*model.Bookmark{}, nil
	}

	return s.repo.FindByTag(ctx, tag)
}
