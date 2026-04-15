package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/bookmark-manager/backend/internal/model"
	"github.com/bookmark-manager/backend/internal/service"
	"github.com/gorilla/mux"
)

// Handler handles HTTP requests for bookmarks
type Handler struct {
	service service.BookmarkService
}

// NewHandler creates a new handler
func NewHandler(svc service.BookmarkService) *Handler {
	return &Handler{service: svc}
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// successResponse writes a success JSON response
func successResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// errorResponse writes an error JSON response
func errorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
	})
}

// CreateBookmark handles POST /bookmarks
func (h *Handler) CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL         string   `json:"url"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Tags        []string `json:"tags"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Normalize tags
	for i, tag := range req.Tags {
		req.Tags[i] = strings.TrimSpace(strings.ToLower(tag))
	}

	bookmark, err := h.service.CreateBookmark(req.URL, req.Title, req.Description, req.Tags)
	if err != nil {
		if strings.Contains(err.Error(), "invalid URL") || strings.Contains(err.Error(), "title is required") {
			errorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(w, http.StatusCreated, bookmark)
}

// GetBookmark handles GET /bookmarks/{id}
func (h *Handler) GetBookmark(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	bookmark, err := h.service.GetBookmark(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			errorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(w, http.StatusOK, bookmark)
}

// GetBookmarks handles GET /bookmarks
func (h *Handler) GetBookmarks(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	bookmarks, total, err := h.service.GetBookmarks(page, pageSize)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := struct {
		Bookmarks []*model.Bookmark `json:"bookmarks"`
		Page      int               `json:"page"`
		PageSize  int               `json:"pageSize"`
		Total     int               `json:"total"`
	}{
		Bookmarks: bookmarks,
		Page:      page,
		PageSize:  pageSize,
		Total:     total,
	}

	successResponse(w, http.StatusOK, response)
}

// UpdateBookmark handles PUT /bookmarks/{id}
func (h *Handler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Tags        []string `json:"tags"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Normalize tags
	for i, tag := range req.Tags {
		req.Tags[i] = strings.TrimSpace(strings.ToLower(tag))
	}

	bookmark, err := h.service.UpdateBookmark(id, req.Title, req.Description, req.Tags)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			errorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		if strings.Contains(err.Error(), "title is required") {
			errorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(w, http.StatusOK, bookmark)
}

// DeleteBookmark handles DELETE /bookmarks/{id}
func (h *Handler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.service.DeleteBookmark(id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			errorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SearchBookmarks handles GET /bookmarks/search
func (h *Handler) SearchBookmarks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	bookmarks, err := h.service.SearchBookmarks(query)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(w, http.StatusOK, bookmarks)
}

// FilterByTag handles GET /bookmarks/tag/{tag}
func (h *Handler) FilterByTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tag := vars["tag"]

	bookmarks, err := h.service.FilterByTag(tag)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(w, http.StatusOK, bookmarks)
}

// GetTags handles GET /tags
func (h *Handler) GetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.service.GetAllTags()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Convert map to sorted slice for consistent response
	tagList := make([]struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}, 0, len(tags))

	for name, count := range tags {
		tagList = append(tagList, struct {
			Name  string `json:"name"`
			Count int    `json:"count"`
		}{Name: name, Count: count})
	}

	successResponse(w, http.StatusOK, tagList)
}
