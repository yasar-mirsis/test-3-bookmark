package service

import (
	"context"
	"testing"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/repository"
)

func TestNewBookmarkService(t *testing.T) {
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	if svc == nil {
		t.Fatal("Expected non-nil service")
	}
}

func TestBookmarkService_CreateBookmark(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	t.Run("Create valid bookmark", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:         "https://example.com",
			Title:       "Example Bookmark",
			Description: "A test bookmark",
			Tags:        []string{"test", "example"},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if bookmark.ID == "" {
			t.Error("Expected ID to be generated")
		}

		if bookmark.URL != input.URL {
			t.Errorf("Expected URL %s, got %s", input.URL, bookmark.URL)
		}

		if bookmark.Title != input.Title {
			t.Errorf("Expected title %s, got %s", input.Title, bookmark.Title)
		}
	})

	t.Run("Create bookmark with empty URL", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "",
			Title:  "Test",
			Tags:   []string{"test"},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != ErrURLRequired {
			t.Errorf("Expected ErrURLRequired, got %v", err)
		}
		if bookmark != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Create bookmark with invalid URL format", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "not-a-valid-url",
			Title:  "Test",
			Tags:   []string{"test"},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != ErrInvalidURL {
			t.Errorf("Expected ErrInvalidURL, got %v", err)
		}
		if bookmark != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Create bookmark with empty title", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "https://example.com",
			Title:  "",
			Tags:   []string{"test"},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != ErrTitleRequired {
			t.Errorf("Expected ErrTitleRequired, got %v", err)
		}
		if bookmark != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Create bookmark with duplicate tags", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "https://example.com",
			Title:  "Test",
			Tags:   []string{"test", "TEST", "Test", "example"},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Tags should be deduplicated (case-insensitive)
		if len(bookmark.Tags) != 2 {
			t.Errorf("Expected 2 unique tags, got %d: %v", len(bookmark.Tags), bookmark.Tags)
		}
	})

	t.Run("Create bookmark with empty tags", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "https://example.com",
			Title:  "Test",
			Tags:   []string{},
		}

		bookmark, err := svc.CreateBookmark(ctx, input)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmark.Tags) != 0 {
			t.Errorf("Expected 0 tags, got %d", len(bookmark.Tags))
		}
	})
}

func TestBookmarkService_GetBookmark(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create a bookmark first
	input := model.CreateBookmarkInput{
		URL:    "https://example.com",
		Title:  "Example",
		Tags:   []string{"test"},
	}
	bookmark, _ := svc.CreateBookmark(ctx, input)

	t.Run("Get existing bookmark", func(t *testing.T) {
		found, err := svc.GetBookmark(ctx, bookmark.ID)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if found == nil {
			t.Fatal("Expected bookmark to be found")
		}

		if found.ID != bookmark.ID {
			t.Errorf("Expected ID %s, got %s", bookmark.ID, found.ID)
		}
	})

	t.Run("Get bookmark with empty ID", func(t *testing.T) {
		found, err := svc.GetBookmark(ctx, "")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if found != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Get non-existent bookmark", func(t *testing.T) {
		found, err := svc.GetBookmark(ctx, "non-existent-id")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if found != nil {
			t.Error("Expected nil bookmark")
		}
	})
}

func TestBookmarkService_ListBookmarks(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create test bookmarks
	for i := 0; i < 25; i++ {
		input := model.CreateBookmarkInput{
			URL:    "https://example.com/" + string(rune('0'+i)),
			Title:  "Bookmark " + string(rune('0'+i)),
			Tags:   []string{"test"},
		}
		_, _ = svc.CreateBookmark(ctx, input)
	}

	t.Run("List bookmarks with default pagination", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 1, 20, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(page.Bookmarks) != 20 {
			t.Errorf("Expected 20 bookmarks, got %d", len(page.Bookmarks))
		}

		if page.Total != 25 {
			t.Errorf("Expected total 25, got %d", page.Total)
		}

		if page.Page != 1 {
			t.Errorf("Expected page 1, got %d", page.Page)
		}

		if page.PageSize != 20 {
			t.Errorf("Expected page size 20, got %d", page.PageSize)
		}

		if page.TotalPages != 2 {
			t.Errorf("Expected total pages 2, got %d", page.TotalPages)
		}
	})

	t.Run("List bookmarks page 2", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 2, 20, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(page.Bookmarks) != 5 {
			t.Errorf("Expected 5 bookmarks on page 2, got %d", len(page.Bookmarks))
		}
	})

	t.Run("List bookmarks with tag filter", func(t *testing.T) {
		// Add a bookmark with a different tag
		input := model.CreateBookmarkInput{
			URL:    "https://example.com/go",
			Title:  "Go Tutorial",
			Tags:   []string{"go"},
		}
		_, _ = svc.CreateBookmark(ctx, input)

		page, err := svc.ListBookmarks(ctx, 1, 20, model.ListFilters{Tag: "go"})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(page.Bookmarks) != 1 {
			t.Errorf("Expected 1 bookmark with 'go' tag, got %d", len(page.Bookmarks))
		}
	})

	t.Run("List bookmarks with search filter", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 1, 20, model.ListFilters{Search: "Bookmark 5"})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(page.Bookmarks) != 1 {
			t.Errorf("Expected 1 bookmark matching search, got %d", len(page.Bookmarks))
		}
	})

	t.Run("List bookmarks with empty repository", func(t *testing.T) {
		emptyRepo := repository.NewInMemoryRepository()
		emptySvc := NewBookmarkService(emptyRepo)

		page, err := emptySvc.ListBookmarks(ctx, 1, 20, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(page.Bookmarks) != 0 {
			t.Errorf("Expected 0 bookmarks, got %d", len(page.Bookmarks))
		}

		if page.Total != 0 {
			t.Errorf("Expected total 0, got %d", page.Total)
		}

		if page.TotalPages != 0 {
			t.Errorf("Expected total pages 0, got %d", page.TotalPages)
		}
	})

	t.Run("List bookmarks with page less than 1", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 0, 20, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if page.Page != 1 {
			t.Errorf("Expected page normalized to 1, got %d", page.Page)
		}
	})

	t.Run("List bookmarks with page size out of range", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 1, 0, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if page.PageSize != DefaultPageSize {
			t.Errorf("Expected page size normalized to %d, got %d", DefaultPageSize, page.PageSize)
		}
	})

	t.Run("List bookmarks with page size exceeding max", func(t *testing.T) {
		page, err := svc.ListBookmarks(ctx, 1, 200, model.ListFilters{})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if page.PageSize != MaxPageSize {
			t.Errorf("Expected page size capped at %d, got %d", MaxPageSize, page.PageSize)
		}
	})
}

func TestBookmarkService_UpdateBookmark(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create a bookmark first
	input := model.CreateBookmarkInput{
		URL:    "https://example.com",
		Title:  "Original Title",
		Description: "Original Description",
		Tags:   []string{"original"},
	}
	bookmark, _ := svc.CreateBookmark(ctx, input)

	t.Run("Update existing bookmark", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title:       strPtr("Updated Title"),
			Description: strPtr("Updated Description"),
			Tags:        &[]string{"updated", "new"},
		}

		updated, err := svc.UpdateBookmark(ctx, bookmark.ID, updateInput)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if updated.Title != "Updated Title" {
			t.Errorf("Expected title 'Updated Title', got '%s'", updated.Title)
		}

		if updated.Description != "Updated Description" {
			t.Errorf("Expected description 'Updated Description', got '%s'", updated.Description)
		}
	})

	t.Run("Update with empty ID", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("Test"),
		}

		updated, err := svc.UpdateBookmark(ctx, "", updateInput)
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if updated != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Update non-existent bookmark", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("Test"),
		}

		updated, err := svc.UpdateBookmark(ctx, "non-existent-id", updateInput)
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if updated != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Update with invalid URL", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			URL: strPtr("not-a-valid-url"),
		}

		updated, err := svc.UpdateBookmark(ctx, bookmark.ID, updateInput)
		if err != ErrInvalidURL {
			t.Errorf("Expected ErrInvalidURL, got %v", err)
		}
		if updated != nil {
			t.Error("Expected nil bookmark")
		}
	})

	t.Run("Update deduplicates tags", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Tags: &[]string{"test", "TEST", "test"},
		}

		updated, err := svc.UpdateBookmark(ctx, bookmark.ID, updateInput)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(updated.Tags) != 1 {
			t.Errorf("Expected 1 unique tag, got %d: %v", len(updated.Tags), updated.Tags)
		}
	})

	t.Run("Update preserves unchanged fields", func(t *testing.T) {
		// First update only title
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("New Title Only"),
		}

		updated, err := svc.UpdateBookmark(ctx, bookmark.ID, updateInput)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if updated.Title != "New Title Only" {
			t.Errorf("Expected title 'New Title Only', got '%s'", updated.Title)
		}

		// Description should remain unchanged
		if updated.Description != "Original Description" {
			t.Errorf("Expected description 'Original Description', got '%s'", updated.Description)
		}
	})
}

func TestBookmarkService_DeleteBookmark(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create a bookmark first
	input := model.CreateBookmarkInput{
		URL:    "https://example.com",
		Title:  "Example",
		Tags:   []string{"test"},
	}
	bookmark, _ := svc.CreateBookmark(ctx, input)

	t.Run("Delete existing bookmark", func(t *testing.T) {
		err := svc.DeleteBookmark(ctx, bookmark.ID)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Verify bookmark is deleted
		found, err := svc.GetBookmark(ctx, bookmark.ID)
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if found != nil {
			t.Error("Expected bookmark to be deleted")
		}
	})

	t.Run("Delete with empty ID", func(t *testing.T) {
		err := svc.DeleteBookmark(ctx, "")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
	})

	t.Run("Delete non-existent bookmark", func(t *testing.T) {
		err := svc.DeleteBookmark(ctx, "non-existent-id")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
	})
}

func TestBookmarkService_SearchBookmarks(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create test bookmarks
	bookmarks := []model.CreateBookmarkInput{
		{URL: "https://example.com/go", Title: "Learn Go", Description: "Go programming tutorial", Tags: []string{"go"}},
		{URL: "https://example.com/python", Title: "Python Basics", Description: "Python introduction", Tags: []string{"python"}},
		{URL: "https://example.com/js", Title: "JavaScript Guide", Description: "JS reference", Tags: []string{"javascript"}},
	}
	for _, input := range bookmarks {
		_, _ = svc.CreateBookmark(ctx, input)
	}

	t.Run("Search by title", func(t *testing.T) {
		results, err := svc.SearchBookmarks(ctx, "Go")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 1 {
			t.Errorf("Expected 1 result, got %d", len(results))
		}
	})

	t.Run("Search by description", func(t *testing.T) {
		results, err := svc.SearchBookmarks(ctx, "programming")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 1 {
			t.Errorf("Expected 1 result, got %d", len(results))
		}
	})

	t.Run("Search with no results", func(t *testing.T) {
		results, err := svc.SearchBookmarks(ctx, "nonexistent")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 results, got %d", len(results))
		}
	})

	t.Run("Search with empty query", func(t *testing.T) {
		results, err := svc.SearchBookmarks(ctx, "")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 results for empty query, got %d", len(results))
		}
	})
}

func TestBookmarkService_GetTags(t *testing.T) {
	ctx := context.Background()
	repo := repository.NewInMemoryRepository()
	svc := NewBookmarkService(repo)

	// Create bookmarks with various tags
	bookmarks := []model.CreateBookmarkInput{
		{URL: "https://example.com/go", Title: "Go Tutorial", Tags: []string{"go", "programming"}},
		{URL: "https://example.com/python", Title: "Python Guide", Tags: []string{"python", "programming"}},
		{URL: "https://example.com/js", Title: "JS Basics", Tags: []string{"javascript", "frontend"}},
	}
	for _, input := range bookmarks {
		_, _ = svc.CreateBookmark(ctx, input)
	}

	t.Run("Get all unique tags", func(t *testing.T) {
		tags, err := svc.GetTags(ctx)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		expectedTags := map[string]bool{
			"go": true, "programming": true, "python": true, "javascript": true, "frontend": true,
		}

		if len(tags) != len(expectedTags) {
			t.Errorf("Expected %d unique tags, got %d", len(expectedTags), len(tags))
		}

		for _, tag := range tags {
			if !expectedTags[tag] {
				t.Errorf("Unexpected tag: %s", tag)
			}
		}
	})

	t.Run("Get tags from empty repository", func(t *testing.T) {
		emptyRepo := repository.NewInMemoryRepository()
		emptySvc := NewBookmarkService(emptyRepo)

		tags, err := emptySvc.GetTags(ctx)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(tags) != 0 {
			t.Errorf("Expected 0 tags, got %d", len(tags))
		}
	})
}

// Helper function to create string pointer
func strPtr(s string) *string {
	return &s
}

// Test filterBySearch helper function
func TestFilterBySearch(t *testing.T) {
	bookmarks := []*model.Bookmark{
		{Title: "Go Tutorial", Description: "Learn Go programming", URL: "https://example.com/go"},
		{Title: "Python Guide", Description: "Python for beginners", URL: "https://example.com/python"},
		{Title: "JavaScript Basics", Description: "JS fundamentals", URL: "https://example.com/js"},
	}

	t.Run("Filter by title", func(t *testing.T) {
		results := filterBySearch(bookmarks, "Go")
		if len(results) != 1 {
			t.Errorf("Expected 1 result, got %d", len(results))
		}
	})

	t.Run("Filter by description", func(t *testing.T) {
		results := filterBySearch(bookmarks, "programming")
		if len(results) != 1 {
			t.Errorf("Expected 1 result, got %d", len(results))
		}
	})

	t.Run("Filter with no matches", func(t *testing.T) {
		results := filterBySearch(bookmarks, "nonexistent")
		if len(results) != 0 {
			t.Errorf("Expected 0 results, got %d", len(results))
		}
	})

	t.Run("Filter with empty query", func(t *testing.T) {
		results := filterBySearch(bookmarks, "")
		if len(results) != len(bookmarks) {
			t.Errorf("Expected all %d results for empty query, got %d", len(bookmarks), len(results))
		}
	})

	t.Run("Filter case-insensitive", func(t *testing.T) {
		results := filterBySearch(bookmarks, "JAVASCRIPT")
		if len(results) != 1 {
			t.Errorf("Expected 1 result (case-insensitive), got %d", len(results))
		}
	})
}
