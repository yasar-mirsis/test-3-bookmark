package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

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
		writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	bookmark, err := h.service.CreateBookmark(r.Context(), &input)
	if err != nil {
		if bmErr, ok := err.(*model.BookmarkError); ok {
			writeError(w, bmErr.Error, bmErr.Code)
			return
		}
		writeError(w, "Failed to create bookmark", http.StatusInternalServerError)
		return
	}

	writeJSON(w, bookmark, http.StatusCreated)
}

// GetBookmark handles GET /bookmarks/{id}
func (h *BookmarkHandler) GetBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, "Bookmark ID is required", http.StatusBadRequest)
		return
	}

	bookmark, err := h.service.GetBookmark(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, "Bookmark not found", http.StatusNotFound)
			return
		}
		writeError(w, "Failed to get bookmark", http.StatusInternalServerError)
		return
	}

	writeJSON(w, bookmark, http.StatusOK)
}

// UpdateBookmark handles PUT /bookmarks/{id}
func (h *BookmarkHandler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, "Bookmark ID is required", http.StatusBadRequest)
		return
	}

	var input model.UpdateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	bookmark, err := h.service.UpdateBookmark(r.Context(), id, &input)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, "Bookmark not found", http.StatusNotFound)
			return
		}
		writeError(w, "Failed to update bookmark", http.StatusInternalServerError)
		return
	}

	writeJSON(w, bookmark, http.StatusOK)
}

// DeleteBookmark handles DELETE /bookmarks/{id}
func (h *BookmarkHandler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, "Bookmark ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteBookmark(r.Context(), id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, "Bookmark not found", http.StatusNotFound)
			return
		}
		writeError(w, "Failed to delete bookmark", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListBookmarks handles GET /bookmarks
func (h *BookmarkHandler) ListBookmarks(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	tag := r.URL.Query().Get("tag")
	search := r.URL.Query().Get("search")

	filters := model.NewListFilters(page, pageSize, tag, search)

	pageResult, err := h.service.ListBookmarks(r.Context(), filters)
	if err != nil {
		writeError(w, "Failed to list bookmarks", http.StatusInternalServerError)
		return
	}

	writeJSON(w, pageResult, http.StatusOK)
}

// SearchBookmarks handles GET /bookmarks/search
func (h *BookmarkHandler) SearchBookmarks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		writeError(w, "Search query is required", http.StatusBadRequest)
		return
	}

	bookmarks, err := h.service.SearchBookmarks(r.Context(), query)
	if err != nil {
		writeError(w, "Failed to search bookmarks", http.StatusInternalServerError)
		return
	}

	writeJSON(w, bookmarks, http.StatusOK)
}

// FindByTag handles GET /bookmarks/tag/{tag}
func (h *BookmarkHandler) FindByTag(w http.ResponseWriter, r *http.Request) {
	tag := r.PathValue("tag")
	if tag == "" {
		writeError(w, "Tag is required", http.StatusBadRequest)
		return
	}

	bookmarks, err := h.service.FindByTag(r.Context(), tag)
	if err != nil {
		writeError(w, "Failed to find bookmarks by tag", http.StatusInternalServerError)
		return
	}

	writeJSON(w, bookmarks, http.StatusOK)
}

// writeJSON writes a JSON response
func writeJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// writeError writes an error response
func writeError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(model.BookmarkError{
		Error: message,
		Code:  code,
	})
}
