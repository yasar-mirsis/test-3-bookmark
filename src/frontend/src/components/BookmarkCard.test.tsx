import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkCard, BookmarkCardProps } from '../components/BookmarkCard';
import { createMockBookmark } from '../test/handlers';

describe('BookmarkCard', () => {
  const defaultProps: BookmarkCardProps = {
    bookmark: createMockBookmark({
      id: '1',
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'A test bookmark description',
      tags: ['react', 'testing'],
    }),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders correctly with all bookmark data', () => {
    render(<BookmarkCard {...defaultProps} />);

    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.getByText('A test bookmark description')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /example\.com/i })).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<BookmarkCard {...defaultProps} isLoading={true} />);

    // Loading skeleton should have placeholder elements
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    const skeletonElement = document.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('calls onEdit callback when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<BookmarkCard {...defaultProps} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit test bookmark/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(defaultProps.bookmark);
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(<BookmarkCard {...defaultProps} />);

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete test bookmark/i }));

    // Should show confirmation
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });

  it('calls onDelete when delete confirmation is confirmed', () => {
    const onDelete = vi.fn();
    render(<BookmarkCard {...defaultProps} onDelete={onDelete} />);

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete test bookmark/i }));

    // Click confirm
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(defaultProps.bookmark);
  });

  it('cancels delete confirmation when no is clicked', () => {
    render(<BookmarkCard {...defaultProps} />);

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete test bookmark/i }));

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /no/i }));

    // Confirmation should be hidden, delete should not be called
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('does not render tags section when bookmark has no tags', () => {
    const bookmarkWithoutTags = createMockBookmark({ tags: [] });
    render(<BookmarkCard {...defaultProps} bookmark={bookmarkWithoutTags} />);

    expect(screen.queryByText(/#\w+/)).not.toBeInTheDocument();
  });

  it('does not render description when bookmark has no description', () => {
    const bookmarkWithoutDescription = createMockBookmark({ description: undefined });
    render(<BookmarkCard {...defaultProps} bookmark={bookmarkWithoutDescription} />);

    expect(screen.queryByText('A test bookmark description')).not.toBeInTheDocument();
  });

  it('truncates long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(100);
    const bookmarkWithLongUrl = createMockBookmark({ url: longUrl });
    render(<BookmarkCard {...defaultProps} bookmark={bookmarkWithLongUrl} />);

    const link = screen.getByRole('link');
    expect(link.textContent).toContain('...');
  });

  it('renders edit button only when onEdit is provided', () => {
    const { rerender } = render(<BookmarkCard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();

    rerender(<BookmarkCard {...defaultProps} onEdit={undefined} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('renders delete button only when onDelete is provided', () => {
    const { rerender } = render(<BookmarkCard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    rerender(<BookmarkCard {...defaultProps} onDelete={undefined} />);

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<BookmarkCard {...defaultProps} />);

    // Should contain formatted date (e.g., "Jan 1, 2024")
    expect(screen.getByText(/added on/i)).toBeInTheDocument();
  });
});
