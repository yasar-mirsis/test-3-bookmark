package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"test-3-bookmark/src/backend/internal/handler"
	custommiddleware "test-3-bookmark/src/backend/internal/middleware"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

// Server represents the HTTP server
type Server struct {
	httpServer *http.Server
	router     *chi.Mux
}

// NewServer creates a new Server instance
func NewServer(handler *handler.Handler) *Server {
	router := chi.NewRouter()

	// Apply custom recovery middleware first (to catch panics from other middleware)
	router.Use(custommiddleware.RecoveryMiddleware)

	// Apply custom logging middleware
	router.Use(custommiddleware.LoggingMiddleware)

	// Apply CORS middleware for frontend origins
	allowedOrigins := []string{"http://localhost:3000", "http://localhost:5173"}
	router.Use(custommiddleware.CORSMiddleware(allowedOrigins))

	// Apply chi middleware for request ID, real IP, and timeout
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.RealIP)
	router.Use(chiMiddleware.Timeout(60 * time.Second))

	// Set up routes
	setupRoutes(router, handler)

	// Get port from environment variable or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Server{
		router: router,
		httpServer: &http.Server{
			Handler:      router,
			Addr:         ":" + port,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}
}

// setupRoutes configures all the API routes
func setupRoutes(router *chi.Mux, h *handler.Handler) {
	// Health check endpoint
	router.Get("/health", h.HealthCheck)

	// API routes
	api := router.Route("/api", func(r chi.Router) {
		// Bookmark routes
		r.Route("/bookmarks", func(r chi.Router) {
			r.Post("/", h.CreateBookmark)
			r.Get("/", h.ListBookmarks)
			r.Get("/search", h.SearchBookmarks)
			r.Get("/{id}", h.GetBookmark)
			r.Put("/{id}", h.UpdateBookmark)
			r.Delete("/{id}", h.DeleteBookmark)
		})

		// Tags endpoint
		r.Get("/tags", h.GetTags)
	})

	log.Printf("Routes configured under /api")
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

// Router returns the underlying router
func (s *Server) Router() *chi.Mux {
	return s.router
}
