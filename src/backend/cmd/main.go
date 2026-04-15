package main

import (
	"log"
	"test-3-bookmark/src/backend/internal/server"
)

func main() {
	log.Println("Bookmark Manager API starting...")

	if err := server.Run(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}

	log.Println("Server stopped gracefully")
}
