package repository

import (
	"context"
	"sync"
	"testing"
	"time"

	"test-3-bookmark/src/backend/internal/model"
)

func TestNewInMemoryRepository(t *testing.T) {
	repo := NewInMemoryRepository()
	if repo == nil {
		t.Fatal("Expected non-nil repository")
	}
	if repo.bookmarks == nil {
		t.Error("Expected bookmarks map to be initialized")
	}
}

func TestInMemoryRepository_Create(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	t.Run("Create valid bookmark", func(t *testing.T) {
		bookmark := &model.Bookmark{
			URL:         "https://example.com",
			Title:       "Example",
			Description: "An example bookmark",
			Tags:        []string{"test", "example"},
		}

		err := repo.Create(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if bookmark.ID == "" {
			t.Error("Expected ID to be generated")
		}

		if bookmark.CreatedAt.IsZero() {
			t.Error("Expected CreatedAt to be set")
		}

		if bookmark.UpdatedAt.IsZero() {
			t.Error("Expected UpdatedAt to be set")
		}
	})

	t.Run("Create bookmark with nil input", func(t *testing.T) {
		err := repo.Create(ctx, nil)
		if err != ErrBookmarkRequired {
			t.Errorf("Expected ErrBookmarkRequired, got %v", err)
		}
	})

	t.Run("Create bookmark with duplicate tags", func(t *testing.T) {
		bookmark := &model.Bookmark{
			URL:         "https://example.com",
			Title:       "Example",
			Description: "Test",
			Tags:        []string{"test", "TEST", "Test", "example"},
		}

		err := repo.Create(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Tags should be deduplicated (case-insensitive)
		if len(bookmark.Tags) != 2 {
			t.Errorf("Expected 2 unique tags, got %d: %v", len(bookmark.Tags), bookmark.Tags)
		}
	})

	t.Run("Create bookmark with existing ID", func(t *testing.T) {
		existingID := "custom-id-123"
		bookmark := &model.Bookmark{
			ID:          existingID,
			URL:         "https://example.com",
			Title:       "Example",
			Description: "Test",
			Tags:        []string{"test"},
		}

		err := repo.Create(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if bookmark.ID != existingID {
			t.Errorf("Expected ID to remain %s, got %s", existingID, bookmark.ID)
		}
	})
}

func TestInMemoryRepository_FindByID(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create a bookmark first
	bookmark := &model.Bookmark{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "Test",
		Tags:        []string{"test"},
	}
	repo.Create(ctx, bookmark)

	t.Run("Find existing bookmark", func(t *testing.T) {
		found, err := repo.FindByID(ctx, bookmark.ID)
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

	t.Run("Find bookmark with empty ID", func(t *testing.T) {
		found, err := repo.FindByID(ctx, "")
		if err != ErrInvalidID {
			t.Errorf("Expected ErrInvalidID, got %v", err)
		}
		if found != nil {
			t.Error("Expected nil bookmark for empty ID")
		}
	})

	t.Run("Find non-existent bookmark", func(t *testing.T) {
		found, err := repo.FindByID(ctx, "non-existent-id")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if found != nil {
			t.Error("Expected nil bookmark for non-existent ID")
		}
	})

	t.Run("Find returns copy not reference", func(t *testing.T) {
		found, err := repo.FindByID(ctx, bookmark.ID)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Modify the returned bookmark
		found.Title = "Modified"

		// Fetch again and verify original is unchanged
		original, _ := repo.FindByID(ctx, bookmark.ID)
		if original.Title == "Modified" {
			t.Error("Expected original bookmark to be unchanged (copy returned)")
		}
	})
}

func TestInMemoryRepository_FindAll(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create test bookmarks
	for i := 0; i < 25; i++ {
		bookmark := &model.Bookmark{
			URL:         "https://example.com/" + string(rune('0'+i)),
			Title:       "Bookmark " + string(rune('0'+i)),
			Description: "Test bookmark " + string(rune('0'+i)),
			Tags:        []string{"test"},
		}
		repo.Create(ctx, bookmark)
	}

	t.Run("FindAll with default pagination", func(t *testing.T) {
		bookmarks, total, err := repo.FindAll(ctx, 1, 20)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 20 {
			t.Errorf("Expected 20 bookmarks, got %d", len(bookmarks))
		}

		if total != 25 {
			t.Errorf("Expected total 25, got %d", total)
		}
	})

	t.Run("FindAll with page 2", func(t *testing.T) {
		bookmarks, total, err := repo.FindAll(ctx, 2, 20)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 5 {
			t.Errorf("Expected 5 bookmarks on page 2, got %d", len(bookmarks))
		}

		if total != 25 {
			t.Errorf("Expected total 25, got %d", total)
		}
	})

	t.Run("FindAll with page less than 1", func(t *testing.T) {
		bookmarks, total, err := repo.FindAll(ctx, 0, 20)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 20 {
			t.Errorf("Expected 20 bookmarks (page normalized to 1), got %d", len(bookmarks))
		}

		if total != 25 {
			t.Errorf("Expected total 25, got %d", total)
		}
	})

	t.Run("FindAll with empty repository", func(t *testing.T) {
		emptyRepo := NewInMemoryRepository()
		bookmarks, total, err := emptyRepo.FindAll(ctx, 1, 20)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 0 {
			t.Errorf("Expected 0 bookmarks, got %d", len(bookmarks))
		}

		if total != 0 {
			t.Errorf("Expected total 0, got %d", total)
		}
	})

	t.Run("FindAll with page beyond available data", func(t *testing.T) {
		bookmarks, total, err := repo.FindAll(ctx, 100, 20)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 0 {
			t.Errorf("Expected 0 bookmarks on non-existent page, got %d", len(bookmarks))
		}

		if total != 25 {
			t.Errorf("Expected total 25, got %d", total)
		}
	})
}

func TestInMemoryRepository_Update(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create a bookmark first
	bookmark := &model.Bookmark{
		URL:         "https://example.com",
		Title:       "Original Title",
		Description: "Original Description",
		Tags:        []string{"original"},
	}
	repo.Create(ctx, bookmark)
	originalUpdatedAt := bookmark.UpdatedAt

	t.Run("Update existing bookmark", func(t *testing.T) {
		bookmark.Title = "Updated Title"
		bookmark.Description = "Updated Description"
		bookmark.Tags = []string{"updated", "new"}

		err := repo.Update(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Verify update was persisted
		found, _ := repo.FindByID(ctx, bookmark.ID)
		if found.Title != "Updated Title" {
			t.Errorf("Expected title 'Updated Title', got '%s'", found.Title)
		}
	})

	t.Run("Update updates timestamp", func(t *testing.T) {
		time.Sleep(10 * time.Millisecond) // Ensure time difference

		bookmark.Title = "Another Update"
		err := repo.Update(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		found, _ := repo.FindByID(ctx, bookmark.ID)
		if !found.UpdatedAt.After(originalUpdatedAt) {
			t.Error("Expected UpdatedAt to be updated")
		}
	})

	t.Run("Update with nil bookmark", func(t *testing.T) {
		err := repo.Update(ctx, nil)
		if err != ErrBookmarkRequired {
			t.Errorf("Expected ErrBookmarkRequired, got %v", err)
		}
	})

	t.Run("Update with empty ID", func(t *testing.T) {
		bookmark := &model.Bookmark{
			URL:    "https://example.com",
			Title:  "Test",
			Tags:   []string{"test"},
		}
		err := repo.Update(ctx, bookmark)
		if err != ErrInvalidID {
			t.Errorf("Expected ErrInvalidID, got %v", err)
		}
	})

	t.Run("Update non-existent bookmark", func(t *testing.T) {
		bookmark := &model.Bookmark{
			ID:       "non-existent-id",
			URL:      "https://example.com",
			Title:    "Test",
			Tags:     []string{"test"},
		}
		err := repo.Update(ctx, bookmark)
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
	})

	t.Run("Update deduplicates tags", func(t *testing.T) {
		bookmark := &model.Bookmark{
			URL:         "https://example.com",
			Title:       "Test",
			Tags:        []string{"test", "TEST", "test"},
		}
		repo.Create(ctx, bookmark)

		bookmark.Tags = []string{"updated", "UPDATED", "updated"}
		err := repo.Update(ctx, bookmark)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		found, _ := repo.FindByID(ctx, bookmark.ID)
		if len(found.Tags) != 1 {
			t.Errorf("Expected 1 unique tag after deduplication, got %d: %v", len(found.Tags), found.Tags)
		}
	})
}

func TestInMemoryRepository_Delete(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create a bookmark first
	bookmark := &model.Bookmark{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "Test",
		Tags:        []string{"test"},
	}
	repo.Create(ctx, bookmark)

	t.Run("Delete existing bookmark", func(t *testing.T) {
		err := repo.Delete(ctx, bookmark.ID)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		found, err := repo.FindByID(ctx, bookmark.ID)
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
		if found != nil {
			t.Error("Expected bookmark to be deleted")
		}
	})

	t.Run("Delete with empty ID", func(t *testing.T) {
		err := repo.Delete(ctx, "")
		if err != ErrInvalidID {
			t.Errorf("Expected ErrInvalidID, got %v", err)
		}
	})

	t.Run("Delete non-existent bookmark", func(t *testing.T) {
		err := repo.Delete(ctx, "non-existent-id")
		if err != ErrBookmarkNotFound {
			t.Errorf("Expected ErrBookmarkNotFound, got %v", err)
		}
	})
}

func TestInMemoryRepository_FindByTag(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create bookmarks with various tags
	bookmarks := []*model.Bookmark{
		{URL: "https://example1.com", Title: "Go Tutorial", Tags: []string{"go", "programming"}},
		{URL: "https://example2.com", Title: "Python Tutorial", Tags: []string{"python", "programming"}},
		{URL: "https://example3.com", Title: "JavaScript Guide", Tags: []string{"javascript", "programming"}},
		{URL: "https://example4.com", Title: "Go Advanced", Tags: []string{"go", "advanced"}},
	}
	for _, b := range bookmarks {
		repo.Create(ctx, b)
	}

	t.Run("Find by existing tag", func(t *testing.T) {
		results, err := repo.FindByTag(ctx, "go")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 2 {
			t.Errorf("Expected 2 bookmarks with 'go' tag, got %d", len(results))
		}
	})

	t.Run("Find by tag case-insensitive", func(t *testing.T) {
		results, err := repo.FindByTag(ctx, "GO")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 2 {
			t.Errorf("Expected 2 bookmarks with 'GO' tag (case-insensitive), got %d", len(results))
		}
	})

	t.Run("Find by non-existent tag", func(t *testing.T) {
		results, err := repo.FindByTag(ctx, "nonexistent")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 bookmarks, got %d", len(results))
		}
	})

	t.Run("Find with empty tag", func(t *testing.T) {
		results, err := repo.FindByTag(ctx, "")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 bookmarks for empty tag, got %d", len(results))
		}
	})
}

func TestInMemoryRepository_Search(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	// Create bookmarks for search testing
	bookmarks := []*model.Bookmark{
		{URL: "https://example.com/go-tutorial", Title: "Learn Go", Description: "A comprehensive Go tutorial", Tags: []string{"go"}},
		{URL: "https://example.com/python-basics", Title: "Python Basics", Description: "Introduction to Python programming", Tags: []string{"python"}},
		{URL: "https://example.com/javascript-guide", Title: "JavaScript Guide", Description: "Complete JavaScript reference", Tags: []string{"javascript"}},
	}
	for _, b := range bookmarks {
		repo.Create(ctx, b)
	}

	t.Run("Search by title", func(t *testing.T) {
		results, err := repo.Search(ctx, "Go")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 1 {
			t.Errorf("Expected 1 result for 'Go', got %d", len(results))
		}
	})

	t.Run("Search by description", func(t *testing.T) {
		results, err := repo.Search(ctx, "programming")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 2 {
			t.Errorf("Expected 2 results for 'programming', got %d", len(results))
		}
	})

	t.Run("Search by URL", func(t *testing.T) {
		results, err := repo.Search(ctx, "python")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 1 {
			t.Errorf("Expected 1 result for 'python' in URL, got %d", len(results))
		}
	})

	t.Run("Search case-insensitive", func(t *testing.T) {
		results, err := repo.Search(ctx, "JAVASCRIPT")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 1 {
			t.Errorf("Expected 1 result for 'JAVASCRIPT' (case-insensitive), got %d", len(results))
		}
	})

	t.Run("Search with no results", func(t *testing.T) {
		results, err := repo.Search(ctx, "nonexistent")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 results, got %d", len(results))
		}
	})

	t.Run("Search with empty query", func(t *testing.T) {
		results, err := repo.Search(ctx, "")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(results) != 0 {
			t.Errorf("Expected 0 results for empty query, got %d", len(results))
		}
	})
}

func TestInMemoryRepository_ConcurrentAccess(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	t.Run("Concurrent create and read", func(t *testing.T) {
		var wg sync.WaitGroup
		numGoroutines := 100

		// Concurrent writes
		for i := 0; i < numGoroutines; i++ {
			wg.Add(1)
			go func(idx int) {
				defer wg.Done()
				bookmark := &model.Bookmark{
					URL:         "https://example.com/" + string(rune('0'+idx)),
					Title:       "Bookmark " + string(rune('0'+idx)),
					Description: "Test",
					Tags:        []string{"test"},
				}
				_ = repo.Create(ctx, bookmark)
			}(i)
		}

		// Concurrent reads
		for i := 0; i < numGoroutines; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				_, _, _ = repo.FindAll(ctx, 1, 20)
			}()
		}

		wg.Wait()

		// Verify all bookmarks were created
		bookmarks, total, err := repo.FindAll(ctx, 1, 1000)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != numGoroutines {
			t.Errorf("Expected %d bookmarks, got %d", numGoroutines, len(bookmarks))
		}

		if total != int64(numGoroutines) {
			t.Errorf("Expected total %d, got %d", numGoroutines, total)
		}
	})

	t.Run("Concurrent update and delete", func(t *testing.T) {
		repo := NewInMemoryRepository()

		// Create initial bookmarks
		for i := 0; i < 10; i++ {
			bookmark := &model.Bookmark{
				URL:         "https://example.com/" + string(rune('0'+i)),
				Title:       "Bookmark " + string(rune('0'+i)),
				Description: "Test",
				Tags:        []string{"test"},
			}
			repo.Create(ctx, bookmark)
		}

		var wg sync.WaitGroup

		// Concurrent updates
		for i := 0; i < 20; i++ {
			wg.Add(1)
			go func(idx int) {
				defer wg.Done()
				id := string(rune('0' + (idx % 10)))
				bookmark, err := repo.FindByID(ctx, id)
				if err == nil {
					bookmark.Title = "Updated " + string(rune('0'+idx))
					_ = repo.Update(ctx, bookmark)
				}
			}(i)
		}

		wg.Wait()

		// Verify no race conditions occurred
		bookmarks, _, err := repo.FindAll(ctx, 1, 100)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(bookmarks) != 10 {
			t.Errorf("Expected 10 bookmarks, got %d", len(bookmarks))
		}
	})
}

func TestInMemoryRepository_UUIDUniqueness(t *testing.T) {
	ctx := context.Background()
	repo := NewInMemoryRepository()

	t.Run("Generated UUIDs are unique", func(t *testing.T) {
		numBookmarks := 100
		ids := make(map[string]bool)

		for i := 0; i < numBookmarks; i++ {
			bookmark := &model.Bookmark{
				URL:         "https://example.com/" + string(rune('0'+i)),
				Title:       "Bookmark " + string(rune('0'+i)),
				Description: "Test",
				Tags:        []string{"test"},
			}

			err := repo.Create(ctx, bookmark)
			if err != nil {
				t.Fatalf("Expected no error, got %v", err)
			}

			if ids[bookmark.ID] {
				t.Errorf("Duplicate UUID generated: %s", bookmark.ID)
			}
			ids[bookmark.ID] = true
		}

		if len(ids) != numBookmarks {
			t.Errorf("Expected %d unique IDs, got %d", numBookmarks, len(ids))
		}
	})
}
