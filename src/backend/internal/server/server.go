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

	"github.com/bookmark-manager/backend/internal/handler"
	"github.com/bookmark-manager/backend/internal/middleware"
	"github.com/bookmark-manager/backend/internal/repository"
	"github.com/bookmark-manager/backend/internal/service"
	"github.com/gorilla/mux"
)

// Server represents the HTTP server
type Server struct {
	httpServer *http.Server
	router     *mux.Router
}

// NewServer creates a new server instance
func NewServer(addr string) *Server {
	// Initialize repository
	repo := repository.NewInMemoryRepository()

	// Initialize service
	svc := service.NewService(repo)

	// Initialize handler
	h := handler.NewHandler(svc)

	// Create router
	router := mux.NewRouter()

	// Apply middleware
	router.Use(middleware.RecoveryMiddleware)
	router.Use(middleware.LoggerMiddleware)
	router.Use(middleware.CORSMiddleware)

	// Setup routes
	setupRoutes(router, h)

	// Create server
	server := &Server{
		router: router,
		httpServer: &http.Server{
			Addr:         addr,
			Handler:      router,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}

	return server
}

// setupRoutes configures all routes
func setupRoutes(router *mux.Router, h *handler.Handler) {
	// Health check
	router.HandleFunc("/health", healthCheck).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()

	// Bookmarks routes
	api.HandleFunc("/bookmarks", h.CreateBookmark).Methods("POST")
	api.HandleFunc("/bookmarks", h.GetBookmarks).Methods("GET")
	api.HandleFunc("/bookmarks/search", h.SearchBookmarks).Methods("GET")
	api.HandleFunc("/bookmarks/tag/{tag}", h.FilterByTag).Methods("GET")
	api.HandleFunc("/bookmarks/{id}", h.GetBookmark).Methods("GET")
	api.HandleFunc("/bookmarks/{id}", h.UpdateBookmark).Methods("PUT")
	api.HandleFunc("/bookmarks/{id}", h.DeleteBookmark).Methods("DELETE")

	// Tags route
	api.HandleFunc("/tags", h.GetTags).Methods("GET")

	// Root endpoint
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"message": "Bookmark Manager API", "version": "1.0.0"}`))
	}).Methods("GET")
}

// healthCheck handles health check requests
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "healthy", "timestamp": "` + time.Now().Format(time.RFC3339) + `"}`))
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Starting server on %s", s.httpServer.Addr)

	// Start server in goroutine
	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	log.Println("Server stopped")
	return nil
}

// Router returns the router instance
func (s *Server) Router() *mux.Router {
	return s.router
}
