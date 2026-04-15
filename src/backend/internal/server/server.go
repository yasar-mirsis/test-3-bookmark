package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bookmark-manager/backend/internal/handler"
	"github.com/bookmark-manager/backend/internal/middleware"
	"github.com/bookmark-manager/backend/internal/repository"
	"github.com/bookmark-manager/backend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Server represents the HTTP server
type Server struct {
	httpServer *http.Server
	router     *chi.Mux
}

// NewServer creates a new server instance
func NewServer() *Server {
	// Initialize repository
	repo := repository.NewInMemoryRepository()

	// Initialize service
	svc := service.NewBookmarkService(repo)

	// Initialize handler
	h := handler.NewHandler(svc)

	// Create router
	router := chi.NewRouter()

	// Apply middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Timeout(60 * time.Second))

	// Apply custom middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.RecoveryMiddleware)
	router.Use(middleware.CORSMiddleware)

	// Health check endpoint
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// API routes
	router.Route("/api/bookmarks", func(r chi.Router) {
		r.Get("/", h.GetAllBookmarks)
		r.Post("/", h.CreateBookmark)
		r.Get("/search", h.SearchBookmarks)
		r.Get("/tag/{tag}", h.GetBookmarksByTag)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", h.GetBookmark)
			r.Put("/", h.UpdateBookmark)
			r.Delete("/", h.DeleteBookmark)
		})
	})

	// Tags endpoint
	router.Get("/api/tags", h.GetAllTags)

	// Create server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         ":" + port,
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}

	return server
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Server starting on %s", s.httpServer.Addr)

	// Start server in a goroutine
	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	return nil
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// GetRouter returns the router for testing
func (s *Server) GetRouter() *chi.Mux {
	return s.router
}
