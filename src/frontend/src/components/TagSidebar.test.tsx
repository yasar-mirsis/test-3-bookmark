import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagSidebar, TagSidebarProps, Tag } from '../components/TagSidebar';

const mockTags: Tag[] = [
  { name: 'react', count: 5 },
  { name: 'typescript', count: 3 },
  { name: 'javascript', count: 8 },
  { name: 'testing', count: 2 },
];

const defaultProps: TagSidebarProps = {
  tags: mockTags,
  onTagClick: vi.fn(),
};

describe('TagSidebar', () => {
  it('renders tag list with counts', () => {
    render(<TagSidebar {...defaultProps} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('#javascript')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders "All Bookmarks" option', () => {
    render(<TagSidebar {...defaultProps} />);

    expect(screen.getByText('All Bookmarks')).toBeInTheDocument();
  });

  it('calls onTagClick when a tag is clicked', () => {
    const onTagClick = vi.fn();
    render(<TagSidebar {...defaultProps} onTagClick={onTagClick} />);

    fireEvent.click(screen.getByText('#react'));

    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onTagClick).toHaveBeenCalledWith('react');
  });

  it('calls onTagClick with null when "All Bookmarks" is clicked', () => {
    const onTagClick = vi.fn();
    render(<TagSidebar {...defaultProps} onTagClick={onTagClick} />);

    fireEvent.click(screen.getByText('All Bookmarks'));

    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onTagClick).toHaveBeenCalledWith(null);
  });

  it('toggles tag selection when same tag is clicked twice', () => {
    const onTagClick = vi.fn();
    render(<TagSidebar {...defaultProps} onTagClick={onTagClick} selectedTag="react" />);

    // Click the already selected tag
    fireEvent.click(screen.getByText('#react'));

    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onTagClick).toHaveBeenCalledWith(null); // Should clear filter
  });

  it('shows "Clear" button when a tag is selected', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('does not show "Clear" button when no tag is selected', () => {
    render(<TagSidebar {...defaultProps} />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('calls onTagClick with null when "Clear" button is clicked', () => {
    const onTagClick = vi.fn();
    render(<TagSidebar {...defaultProps} selectedTag="react" onTagClick={onTagClick} />);

    fireEvent.click(screen.getByText('Clear'));

    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onTagClick).toHaveBeenCalledWith(null);
  });

  it('highlights selected tag with active styling', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    const reactButton = screen.getByText('#react').closest('button');
    expect(reactButton).toHaveClass('bg-blue-100');
    expect(reactButton).toHaveClass('text-blue-800');
  });

  it('highlights "All Bookmarks" when no tag is selected', () => {
    render(<TagSidebar {...defaultProps} selectedTag={undefined} />);

    const allBookmarksButton = screen.getByText('All Bookmarks').closest('button');
    expect(allBookmarksButton).toHaveClass('bg-blue-100');
    expect(allBookmarksButton).toHaveClass('text-blue-800');
  });

  it('shows empty state when no tags exist', () => {
    render(<TagSidebar {...defaultProps} tags={[]} />);

    expect(screen.getByText('No tags yet')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<TagSidebar {...defaultProps} isLoading={true} />);

    const skeletonElement = document.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('does not show tag buttons when loading', () => {
    render(<TagSidebar {...defaultProps} isLoading={true} />);

    expect(screen.queryByText('#react')).not.toBeInTheDocument();
    expect(screen.queryByText('All Bookmarks')).not.toBeInTheDocument();
  });

  it('sets aria-pressed on selected tag', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    const reactButton = screen.getByText('#react').closest('button');
    expect(reactButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not set aria-pressed on unselected tags', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    const typescriptButton = screen.getByText('#typescript').closest('button');
    expect(typescriptButton).not.toHaveAttribute('aria-pressed');
  });

  it('truncates long tag names', () => {
    const longTagName: Tag[] = [{ name: 'very-long-tag-name-that-might-need-truncation', count: 1 }];
    render(<TagSidebar tags={longTagName} onTagClick={vi.fn()} />);

    const tagButton = screen.getByText(/very-long-tag-name/).closest('button');
    expect(tagButton).toBeInTheDocument();
  });

  it('shows correct count badge styling for selected tag', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    const countBadge = screen.getByText('5').closest('span');
    expect(countBadge).toHaveClass('bg-blue-200');
    expect(countBadge).toHaveClass('text-blue-800');
  });

  it('shows correct count badge styling for unselected tags', () => {
    render(<TagSidebar {...defaultProps} selectedTag="react" />);

    const typescriptCount = screen.getByText('3').closest('span');
    expect(typescriptCount).toHaveClass('bg-gray-200');
    expect(typescriptCount).toHaveClass('text-gray-600');
  });

  it('handles single tag correctly', () => {
    const singleTag: Tag[] = [{ name: 'only-tag', count: 10 }];
    render(<TagSidebar tags={singleTag} onTagClick={vi.fn()} />);

    expect(screen.getByText('#only-tag')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles tags with zero count', () => {
    const tagsWithZero: Tag[] = [{ name: 'empty-tag', count: 0 }];
    render(<TagSidebar tags={tagsWithZero} onTagClick={vi.fn()} />);

    expect(screen.getByText('#empty-tag')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
