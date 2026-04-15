package main

import (
	"log"
	"os"

	"github.com/bookmark-manager/backend/internal/server"
)

func main() {
	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port

	// Create and start server
	srv := server.NewServer(addr)

	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
