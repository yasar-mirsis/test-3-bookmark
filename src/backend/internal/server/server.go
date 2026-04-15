package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"test-3-bookmark/src/backend/internal/handler"
	"test-3-bookmark/src/backend/internal/middleware"
	"test-3-bookmark/src/backend/internal/repository"
	"test-3-bookmark/src/backend/internal/service"
)

// Server represents the HTTP server
type Server struct {
	httpServer *http.Server
	router     *chi.Mux
}

// NewServer creates a new server instance
func NewServer(addr string, repo repository.BookmarkRepository) *Server {
	// Initialize service layer
	svc := service.NewBookmarkService(repo)

	// Initialize handler layer
	h := handler.NewBookmarkHandler(svc)

	// Create router
	router := chi.NewRouter()

	// Apply global middleware
	router.Use(middleware.Recovery)
	router.Use(middleware.Logger)
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(app_middleware.LoggingMiddleware)
	router.Use(app_middleware.CORSMiddleware)

	// Health check endpoint
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// Bookmark routes
	router.Route("/bookmarks", func(r chi.Router) {
		r.Get("/", h.ListBookmarks)
		r.Post("/", h.CreateBookmark)
		r.Get("/search", h.SearchBookmarks)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", h.GetBookmark)
			r.Put("/", h.UpdateBookmark)
			r.Delete("/", h.DeleteBookmark)
		})
	})

	// Tag routes
	router.Route("/tags", func(r chi.Router) {
		r.Get("/{tag}", h.FindByTag)
	})

	return &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         addr,
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Starting server on %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// Router returns the underlying router for testing
func (s *Server) Router() *chi.Mux {
	return s.router
}
