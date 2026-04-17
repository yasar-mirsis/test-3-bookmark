package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/service"
)

// MockBookmarkService is a mock implementation of service.BookmarkService
type MockBookmarkService struct {
	CreateBookmarkFunc    func(ctx interface{}, input model.CreateBookmarkInput) (*model.Bookmark, error)
	GetBookmarkFunc       func(ctx interface{}, id string) (*model.Bookmark, error)
	ListBookmarksFunc     func(ctx interface{}, page, pageSize int, filters model.ListFilters) (*model.BookmarkPage, error)
	UpdateBookmarkFunc    func(ctx interface{}, id string, input model.UpdateBookmarkInput) (*model.Bookmark, error)
	DeleteBookmarkFunc    func(ctx interface{}, id string) error
	SearchBookmarksFunc   func(ctx interface{}, query string) ([]*model.Bookmark, error)
	GetTagsFunc           func(ctx interface{}) ([]string, error)
}

func (m *MockBookmarkService) CreateBookmark(ctx interface{}, input model.CreateBookmarkInput) (*model.Bookmark, error) {
	if m.CreateBookmarkFunc != nil {
		return m.CreateBookmarkFunc(ctx, input)
	}
	return nil, nil
}

func (m *MockBookmarkService) GetBookmark(ctx interface{}, id string) (*model.Bookmark, error) {
	if m.GetBookmarkFunc != nil {
		return m.GetBookmarkFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockBookmarkService) ListBookmarks(ctx interface{}, page, pageSize int, filters model.ListFilters) (*model.BookmarkPage, error) {
	if m.ListBookmarksFunc != nil {
		return m.ListBookmarksFunc(ctx, page, pageSize, filters)
	}
	return nil, nil
}

func (m *MockBookmarkService) UpdateBookmark(ctx interface{}, id string, input model.UpdateBookmarkInput) (*model.Bookmark, error) {
	if m.UpdateBookmarkFunc != nil {
		return m.UpdateBookmarkFunc(ctx, id, input)
	}
	return nil, nil
}

func (m *MockBookmarkService) DeleteBookmark(ctx interface{}, id string) error {
	if m.DeleteBookmarkFunc != nil {
		return m.DeleteBookmarkFunc(ctx, id)
	}
	return nil
}

func (m *MockBookmarkService) SearchBookmarks(ctx interface{}, query string) ([]*model.Bookmark, error) {
	if m.SearchBookmarksFunc != nil {
		return m.SearchBookmarksFunc(ctx, query)
	}
	return nil, nil
}

func (m *MockBookmarkService) GetTags(ctx interface{}) ([]string, error) {
	if m.GetTagsFunc != nil {
		return m.GetTagsFunc(ctx)
	}
	return nil, nil
}

// Helper to create test handler with real service
func createTestHandler() *Handler {
	repo := &mockRepository{}
	svc := service.NewBookmarkService(repo)
	return NewHandler(svc)
}

// mockRepository implements repository.BookmarkRepository for testing
type mockRepository struct {
	bookmarks map[string]*model.Bookmark
}

func (m *mockRepository) Create(ctx interface{}, b *model.Bookmark) error {
	if m.bookmarks == nil {
		m.bookmarks = make(map[string]*model.Bookmark)
	}
	m.bookmarks[b.ID] = b
	return nil
}

func (m *mockRepository) FindByID(ctx interface{}, id string) (*model.Bookmark, error) {
	bookmark, exists := m.bookmarks[id]
	if !exists {
		return nil, service.ErrBookmarkNotFound
	}
	return bookmark, nil
}

func (m *mockRepository) FindByTag(ctx interface{}, tag string) ([]*model.Bookmark, error) {
	var results []*model.Bookmark
	for _, bookmark := range m.bookmarks {
		for _, bTag := range bookmark.Tags {
			if strings.ToLower(bTag) == strings.ToLower(tag) {
				results = append(results, bookmark)
				break
			}
		}
	}
	return results, nil
}

func (m *mockRepository) Search(ctx interface{}, query string) ([]*model.Bookmark, error) {
	var results []*model.Bookmark
	for _, bookmark := range m.bookmarks {
		if strings.Contains(strings.ToLower(bookmark.Title), strings.ToLower(query)) ||
			strings.Contains(strings.ToLower(bookmark.Description), strings.ToLower(query)) ||
			strings.Contains(strings.ToLower(bookmark.URL), strings.ToLower(query)) {
			results = append(results, bookmark)
		}
	}
	return results, nil
}

func (m *mockRepository) FindAll(ctx interface{}, page, pageSize int) ([]*model.Bookmark, int64, error) {
	all := make([]*model.Bookmark, 0, len(m.bookmarks))
	for _, bookmark := range m.bookmarks {
		all = append(all, bookmark)
	}
	total := int64(len(all))

	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(all) {
		return []*model.Bookmark{}, total, nil
	}

	if end > len(all) {
		end = len(all)
	}

	return all[start:end], total, nil
}

func (m *mockRepository) Update(ctx interface{}, b *model.Bookmark) error {
	if _, exists := m.bookmarks[b.ID]; !exists {
		return service.ErrBookmarkNotFound
	}
	m.bookmarks[b.ID] = b
	return nil
}

func (m *mockRepository) Delete(ctx interface{}, id string) error {
	if _, exists := m.bookmarks[id]; !exists {
		return service.ErrBookmarkNotFound
	}
	delete(m.bookmarks, id)
	return nil
}

func TestNewHandler(t *testing.T) {
	svc := &service.MockBookmarkService{}
	handler := NewHandler(svc)

	if handler == nil {
		t.Fatal("Expected non-nil handler")
	}
}

func TestHandler_CreateBookmark(t *testing.T) {
	handler := createTestHandler()

	t.Run("Create valid bookmark returns 201", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:         "https://example.com",
			Title:       "Test Bookmark",
			Description: "A test bookmark",
			Tags:        []string{"test"},
		}

		body, _ := json.Marshal(input)
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateBookmark(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
		}

		var bookmark model.Bookmark
		if err := json.NewDecoder(w.Body).Decode(&bookmark); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if bookmark.URL != input.URL {
			t.Errorf("Expected URL %s, got %s", input.URL, bookmark.URL)
		}
	})

	t.Run("Create bookmark with invalid JSON returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", strings.NewReader("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Create bookmark with empty URL returns 400", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "",
			Title:  "Test",
			Tags:   []string{"test"},
		}

		body, _ := json.Marshal(input)
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Create bookmark with invalid URL returns 400", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "not-a-url",
			Title:  "Test",
			Tags:   []string{"test"},
		}

		body, _ := json.Marshal(input)
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Create bookmark with empty title returns 400", func(t *testing.T) {
		input := model.CreateBookmarkInput{
			URL:    "https://example.com",
			Title:  "",
			Tags:   []string{"test"},
		}

		body, _ := json.Marshal(input)
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestHandler_ListBookmarks(t *testing.T) {
	handler := createTestHandler()

	t.Run("List bookmarks returns 200", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks", nil)
		w := httptest.NewRecorder()

		handler.ListBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var page model.BookmarkPage
		if err := json.NewDecoder(w.Body).Decode(&page); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		// Should have default pagination
		if page.Page != 1 {
			t.Errorf("Expected page 1, got %d", page.Page)
		}
	})

	t.Run("List bookmarks with page parameter", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks?page=2", nil)
		w := httptest.NewRecorder()

		handler.ListBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var page model.BookmarkPage
		if err := json.NewDecoder(w.Body).Decode(&page); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if page.Page != 2 {
			t.Errorf("Expected page 2, got %d", page.Page)
		}
	})

	t.Run("List bookmarks with tag filter", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks?tag=test", nil)
		w := httptest.NewRecorder()

		handler.ListBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	t.Run("List bookmarks with search parameter", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks?search=example", nil)
		w := httptest.NewRecorder()

		handler.ListBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	t.Run("List bookmarks with invalid page normalized to 1", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks?page=invalid", nil)
		w := httptest.NewRecorder()

		handler.ListBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var page model.BookmarkPage
		if err := json.NewDecoder(w.Body).Decode(&page); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if page.Page != 1 {
			t.Errorf("Expected page normalized to 1, got %d", page.Page)
		}
	})
}

func TestHandler_GetBookmark(t *testing.T) {
	handler := createTestHandler()

	t.Run("Get existing bookmark returns 200", func(t *testing.T) {
		// First create a bookmark
		input := model.CreateBookmarkInput{
			URL:    "https://example.com",
			Title:  "Test",
			Tags:   []string{"test"},
		}
		body, _ := json.Marshal(input)
		createReq := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
		createReq.Header.Set("Content-Type", "application/json")
		createW := httptest.NewRecorder()
		handler.CreateBookmark(createW, createReq)

		var created model.Bookmark
		json.NewDecoder(createW.Body).Decode(&created)

		// Now get the bookmark
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks/"+created.ID, nil)
		w := httptest.NewRecorder()

		handler.GetBookmark(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var bookmark model.Bookmark
		if err := json.NewDecoder(w.Body).Decode(&bookmark); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if bookmark.ID != created.ID {
			t.Errorf("Expected ID %s, got %s", created.ID, bookmark.ID)
		}
	})

	t.Run("Get bookmark with empty ID returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks/", nil)
		w := httptest.NewRecorder()

		handler.GetBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Get non-existent bookmark returns 404", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks/non-existent-id", nil)
		w := httptest.NewRecorder()

		handler.GetBookmark(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
		}
	})
}

func TestHandler_UpdateBookmark(t *testing.T) {
	handler := createTestHandler()

	// Create a bookmark first
	input := model.CreateBookmarkInput{
		URL:    "https://example.com",
		Title:  "Original",
		Tags:   []string{"original"},
	}
	body, _ := json.Marshal(input)
	createReq := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	handler.CreateBookmark(createW, createReq)

	var created model.Bookmark
	json.NewDecoder(createW.Body).Decode(&created)

	t.Run("Update existing bookmark returns 200", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("Updated Title"),
		}
		body, _ := json.Marshal(updateInput)
		req := httptest.NewRequest(http.MethodPut, "/api/bookmarks/"+created.ID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.UpdateBookmark(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var bookmark model.Bookmark
		if err := json.NewDecoder(w.Body).Decode(&bookmark); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if bookmark.Title != "Updated Title" {
			t.Errorf("Expected title 'Updated Title', got '%s'", bookmark.Title)
		}
	})

	t.Run("Update bookmark with empty ID returns 400", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("Test"),
		}
		body, _ := json.Marshal(updateInput)
		req := httptest.NewRequest(http.MethodPut, "/api/bookmarks/", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.UpdateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Update non-existent bookmark returns 404", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			Title: strPtr("Test"),
		}
		body, _ := json.Marshal(updateInput)
		req := httptest.NewRequest(http.MethodPut, "/api/bookmarks/non-existent-id", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.UpdateBookmark(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
		}
	})

	t.Run("Update bookmark with invalid URL returns 400", func(t *testing.T) {
		updateInput := model.UpdateBookmarkInput{
			URL: strPtr("not-a-valid-url"),
		}
		body, _ := json.Marshal(updateInput)
		req := httptest.NewRequest(http.MethodPut, "/api/bookmarks/"+created.ID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.UpdateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Update bookmark with invalid JSON returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPut, "/api/bookmarks/"+created.ID, strings.NewReader("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.UpdateBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestHandler_DeleteBookmark(t *testing.T) {
	handler := createTestHandler()

	// Create a bookmark first
	input := model.CreateBookmarkInput{
		URL:    "https://example.com",
		Title:  "Test",
		Tags:   []string{"test"},
	}
	body, _ := json.Marshal(input)
	createReq := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBuffer(body))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	handler.CreateBookmark(createW, createReq)

	var created model.Bookmark
	json.NewDecoder(createW.Body).Decode(&created)

	t.Run("Delete existing bookmark returns 204", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/bookmarks/"+created.ID, nil)
		w := httptest.NewRecorder()

		handler.DeleteBookmark(w, req)

		if w.Code != http.StatusNoContent {
			t.Errorf("Expected status %d, got %d", http.StatusNoContent, w.Code)
		}
	})

	t.Run("Delete bookmark with empty ID returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/bookmarks/", nil)
		w := httptest.NewRecorder()

		handler.DeleteBookmark(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Delete non-existent bookmark returns 404", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/bookmarks/non-existent-id", nil)
		w := httptest.NewRecorder()

		handler.DeleteBookmark(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
		}
	})
}

func TestHandler_SearchBookmarks(t *testing.T) {
	handler := createTestHandler()

	t.Run("Search with valid query returns 200", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks/search?q=test", nil)
		w := httptest.NewRecorder()

		handler.SearchBookmarks(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	t.Run("Search with empty query returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks/search", nil)
		w := httptest.NewRecorder()

		handler.SearchBookmarks(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestHandler_GetTags(t *testing.T) {
	handler := createTestHandler()

	t.Run("Get tags returns 200", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/tags", nil)
		w := httptest.NewRecorder()

		handler.GetTags(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response map[string][]string
		if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if _, ok := response["tags"]; !ok {
			t.Error("Expected 'tags' key in response")
		}
	})
}

func TestHandler_HealthCheck(t *testing.T) {
	handler := createTestHandler()

	t.Run("Health check returns 200", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		w := httptest.NewRecorder()

		handler.HealthCheck(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response map[string]string
		if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response["status"] != "healthy" {
			t.Errorf("Expected status 'healthy', got '%s'", response["status"])
		}
	})
}

// Helper function to create string pointer
func strPtr(s string) *string {
	return &s
}
