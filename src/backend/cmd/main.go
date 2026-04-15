package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"test-3-bookmark/src/backend/internal/repository"
	"test-3-bookmark/src/backend/internal/server"
)

func main() {
	// Get port from environment variable or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	// Initialize in-memory repository
	repo := repository.NewInMemoryRepository()

	// Create and start server
	srv := server.NewServer(addr, repo)

	// Handle graceful shutdown
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		log.Println("Shutting down server...")

		// Give outstanding requests 10 seconds to complete
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	// Start the server
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
