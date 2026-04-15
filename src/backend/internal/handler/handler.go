package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/service"
)

// BookmarkHandler handles HTTP requests for bookmark operations
type BookmarkHandler struct {
	service service.BookmarkService
}

// NewBookmarkHandler creates a new instance of BookmarkHandler
func NewBookmarkHandler(svc service.BookmarkService) *BookmarkHandler {
	return &BookmarkHandler{
		service: svc,
	}
}

// CreateBookmark handles POST /bookmarks
func (h *BookmarkHandler) CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var input model.CreateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	bookmark, err := h.service.CreateBookmark(r.Context(), input)
	if err != nil {
		switch err {
		case service.ErrURLRequired:
			writeError(w, http.StatusBadRequest, err.Error())
		case service.ErrInvalidURL:
			writeError(w, http.StatusBadRequest, err.Error())
		case service.ErrTitleRequired:
			writeError(w, http.StatusBadRequest, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Failed to create bookmark")
		}
		return
	}

	writeJSON(w, http.StatusCreated, bookmark)
}

// GetBookmark handles GET /bookmarks/{id}
func (h *BookmarkHandler) GetBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	bookmark, err := h.service.GetBookmark(r.Context(), id)
	if err != nil {
		if err == service.ErrBookmarkNotFound {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to get bookmark")
		return
	}

	writeJSON(w, http.StatusOK, bookmark)
}

// ListBookmarks handles GET /bookmarks
func (h *BookmarkHandler) ListBookmarks(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	tag := r.URL.Query().Get("tag")
	search := r.URL.Query().Get("search")

	filters := model.ListFilters{
		Tag:    tag,
		Search: search,
	}

	pageResult, err := h.service.ListBookmarks(r.Context(), page, pageSize, filters)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to list bookmarks")
		return
	}

	writeJSON(w, http.StatusOK, pageResult)
}

// UpdateBookmark handles PUT /bookmarks/{id}
func (h *BookmarkHandler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	var input model.UpdateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	bookmark, err := h.service.UpdateBookmark(r.Context(), id, input)
	if err != nil {
		switch err {
		case service.ErrBookmarkNotFound:
			writeError(w, http.StatusNotFound, err.Error())
		case service.ErrInvalidURL:
			writeError(w, http.StatusBadRequest, err.Error())
		default:
			writeError(w, http.StatusInternalServerError, "Failed to update bookmark")
		}
		return
	}

	writeJSON(w, http.StatusOK, bookmark)
}

// DeleteBookmark handles DELETE /bookmarks/{id}
func (h *BookmarkHandler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	err := h.service.DeleteBookmark(r.Context(), id)
	if err != nil {
		if err == service.ErrBookmarkNotFound {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to delete bookmark")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchBookmarks handles GET /bookmarks/search
func (h *BookmarkHandler) SearchBookmarks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		writeError(w, http.StatusBadRequest, "Search query is required")
		return
	}

	results, err := h.service.SearchBookmarks(r.Context(), query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to search bookmarks")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

// GetTags handles GET /tags
func (h *BookmarkHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.service.GetTags(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to get tags")
		return
	}

	writeJSON(w, http.StatusOK, tags)
}

// Helper functions

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
