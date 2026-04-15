package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"test-3-bookmark/src/backend/internal/handler"
	"test-3-bookmark/src/backend/internal/middleware"
	"test-3-bookmark/src/backend/internal/model"
	"test-3-bookmark/src/backend/internal/repository"
	"test-3-bookmark/src/backend/internal/service"
)

// Server represents the HTTP server with all routes and middleware
type Server struct {
	httpServer *http.Server
	router     *chi.Mux
}

// NewServer creates a new server instance with all dependencies
func NewServer() *Server {
	// Initialize repository
	repo := repository.NewInMemoryRepository()

	// Initialize service
	svc := service.NewBookmarkService(repo)

	// Initialize handler
	h := handler.NewBookmarkHandler(svc)

	// Create router
	router := chi.NewRouter()

	// Apply middleware
	router.Use(middleware.Recoverer)
	router.Use(middleware.Logger)
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Timeout(60 * time.Second))

	// Health check endpoint
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API routes
	router.Route("/api/v1", func(r chi.Router) {
		// Bookmark routes
		r.Route("/bookmarks", func(r chi.Router) {
			r.Post("/", h.CreateBookmark)
			r.Get("/", h.ListBookmarks)
			r.Get("/search", h.SearchBookmarks)
			r.Put("/", h.UpdateBookmark)
			r.Delete("/", h.DeleteBookmark)
		})

		// Single bookmark by ID
		r.Get("/bookmarks/{id}", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			r.URL.RawQuery = "id=" + id
			h.GetBookmark(w, r)
		})

		// Tags route
		r.Get("/tags", h.GetTags)
	})

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         ":" + port,
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}
}

// Start starts the HTTP server and blocks until shutdown
func (s *Server) Start() error {
	log.Printf("Starting server on %s", s.httpServer.Addr)

	// Channel to listen for errors from the server
	errChan := make(chan error, 1)

	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errChan <- err
		}
	}()

	// Wait for interrupt signal or server error
	select {
	case err := <-errChan:
		return err
	case <-s.httpServer.Context().Done():
		return nil
	}
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// Run starts the server and handles graceful shutdown
func Run() error {
	server := NewServer()

	// Setup signal handler for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		if err := server.Start(); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down server...")

	// Create a context with timeout for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return server.Shutdown(ctx)
}
