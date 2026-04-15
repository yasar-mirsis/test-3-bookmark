package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/service"

	"github.com/go-chi/chi/v5"
)

// Handler represents the HTTP handler for bookmark operations
type Handler struct {
	service service.BookmarkService
}

// NewHandler creates a new Handler instance
func NewHandler(svc service.BookmarkService) *Handler {
	return &Handler{
		service: svc,
	}
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// writeJSON writes a JSON response with the given status code and data
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

// writeError writes an error response with the given status code and message
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{Error: message})
}

// CreateBookmark handles POST /api/bookmarks
// Creates a new bookmark with URL, title, description, and tags
func (h *Handler) CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var input model.CreateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if err := input.ValidateCreateInput(); err != nil {
		writeError(w, err.Code, err.Error)
		return
	}

	bookmark, err := h.service.CreateBookmark(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create bookmark")
		return
	}

	writeJSON(w, http.StatusCreated, bookmark)
}

// ListBookmarks handles GET /api/bookmarks
// Lists all bookmarks with pagination, optional tag and search filters
func (h *Handler) ListBookmarks(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 {
		pageSize = model.DefaultPageSize
	}
	if pageSize > 100 {
		pageSize = 100
	}

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

// GetBookmark handles GET /api/bookmarks/:id
// Retrieves a single bookmark by ID
func (h *Handler) GetBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	bookmark, err := h.service.GetBookmark(r.Context(), id)
	if err != nil {
		if err == service.ErrBookmarkNotFound {
			writeError(w, http.StatusNotFound, "Bookmark not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to get bookmark")
		return
	}

	writeJSON(w, http.StatusOK, bookmark)
}

// UpdateBookmark handles PUT /api/bookmarks/:id
// Updates an existing bookmark with partial or full data
func (h *Handler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	var input model.UpdateBookmarkInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate URL if provided
	if input.URL != nil && !model.ValidateURL(*input.URL) {
		writeError(w, http.StatusBadRequest, "Invalid URL format. URL must start with http:// or https://")
		return
	}

	bookmark, err := h.service.UpdateBookmark(r.Context(), id, input)
	if err != nil {
		if err == service.ErrBookmarkNotFound {
			writeError(w, http.StatusNotFound, "Bookmark not found")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, bookmark)
}

// DeleteBookmark handles DELETE /api/bookmarks/:id
// Deletes a bookmark by ID
func (h *Handler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Bookmark ID is required")
		return
	}

	err := h.service.DeleteBookmark(r.Context(), id)
	if err != nil {
		if err == service.ErrBookmarkNotFound {
			writeError(w, http.StatusNotFound, "Bookmark not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to delete bookmark")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchBookmarks handles GET /api/bookmarks/search
// Searches bookmarks by query string
func (h *Handler) SearchBookmarks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		writeError(w, http.StatusBadRequest, "Search query 'q' is required")
		return
	}

	results, err := h.service.SearchBookmarks(r.Context(), query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to search bookmarks")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

// GetTags handles GET /api/tags
// Returns all unique tags from bookmarks
func (h *Handler) GetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.service.GetTags(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to get tags")
		return
	}

	writeJSON(w, http.StatusOK, map[string][]string{"tags": tags})
}

// HealthCheck handles GET /health
// Returns health status of the API
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
}
