package repository

import "errors"

var (
	// ErrBookmarkRequired is returned when a nil bookmark is passed
	ErrBookmarkRequired = errors.New("bookmark is required")
	
	// ErrInvalidID is returned when an empty or invalid ID is provided
	ErrInvalidID = errors.New("invalid bookmark ID")
	
	// ErrBookmarkNotFound is returned when a bookmark with the given ID doesn't exist
	ErrBookmarkNotFound = errors.New("bookmark not found")
)
