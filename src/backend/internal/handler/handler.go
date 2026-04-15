package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/bookmark-manager/backend/internal/model"
	"github.com/bookmark-manager/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

// Handler handles HTTP requests for bookmarks
type Handler struct {
	service *service.BookmarkService
}

// NewHandler creates a new handler
func NewHandler(svc *service.BookmarkService) *Handler {
	return &Handler{service: svc}
}

// CreateBookmark handles POST /bookmarks
func (h *Handler) CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var input model.CreateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	bookmark, err := h.service.CreateBookmark(input)
	if err != nil {
		switch err {
		case service.ErrInvalidURL:
			http.Error(w, `{"error": "Invalid URL"}`, http.StatusBadRequest)
		case service.ErrInvalidTitle:
			http.Error(w, `{"error": "Title is required"}`, http.StatusBadRequest)
		default:
			http.Error(w, `{"error": "Failed to create bookmark"}`, http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(bookmark)
}

// GetBookmark handles GET /bookmarks/{id}
func (h *Handler) GetBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	bookmark, err := h.service.GetBookmark(id)
	if err != nil {
		http.Error(w, `{"error": "Bookmark not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmark)
}

// GetAllBookmarks handles GET /bookmarks
func (h *Handler) GetAllBookmarks(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	result, err := h.service.GetAllBookmarks(page, pageSize)
	if err != nil {
		http.Error(w, `{"error": "Failed to get bookmarks"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// UpdateBookmark handles PUT /bookmarks/{id}
func (h *Handler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input model.UpdateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	bookmark, err := h.service.UpdateBookmark(id, input)
	if err != nil {
		if err == service.ErrBookmarkExists {
			http.Error(w, `{"error": "Bookmark not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "Failed to update bookmark"}`, http.StatusBadRequest)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmark)
}

// DeleteBookmark handles DELETE /bookmarks/{id}
func (h *Handler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.service.DeleteBookmark(id); err != nil {
		http.Error(w, `{"error": "Bookmark not found"}`, http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchBookmarks handles GET /bookmarks/search
func (h *Handler) SearchBookmarks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	result, err := h.service.SearchBookmarks(query, page, pageSize)
	if err != nil {
		http.Error(w, `{"error": "Failed to search bookmarks"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GetBookmarksByTag handles GET /bookmarks/tag/{tag}
func (h *Handler) GetBookmarksByTag(w http.ResponseWriter, r *http.Request) {
	tag := chi.URLParam(r, "tag")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	result, err := h.service.GetBookmarksByTag(tag, page, pageSize)
	if err != nil {
		http.Error(w, `{"error": "Failed to get bookmarks by tag"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GetAllTags handles GET /tags
func (h *Handler) GetAllTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.service.GetAllTags()
	if err != nil {
		http.Error(w, `{"error": "Failed to get tags"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}
