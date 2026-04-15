package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"test-3-bookmark/src/backend/internal/handler"
	"test-3-bookmark/src/backend/internal/repository"
	"test-3-bookmark/src/backend/internal/server"
	"test-3-bookmark/src/backend/internal/service"
)

func main() {
	// Initialize repository
	repo := repository.NewInMemoryRepository()

	// Initialize service
	svc := service.NewBookmarkService(repo)

	// Initialize handler
	h := handler.NewHandler(svc)

	// Initialize server
	srv := server.NewServer(h)

	// Handle graceful shutdown
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		log.Println("Shutting down server...")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	// Start server
	if err := srv.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}

	log.Println("Server stopped")
}
