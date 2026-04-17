import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, PaginationProps } from '../components/Pagination';

const defaultProps: PaginationProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: vi.fn(),
  totalItems: 100,
  pageSize: 20,
};

describe('Pagination', () => {
  it('renders pagination controls with correct page info', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText('Showing 1 to 20 of 100 results')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<Pagination {...defaultProps} totalPages={0} />);
    expect(container2.firstChild).toBeNull();
  });

  it('does not render when totalItems is 0', () => {
    const { container } = render(<Pagination {...defaultProps} totalItems={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onPageChange when a page number button is clicked', () => {
    render(<Pagination {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(defaultProps.onPageChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when previous button is clicked', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(defaultProps.onPageChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when next button is clicked', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(defaultProps.onPageChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button when on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables next button when on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('does not call onPageChange when clicking disabled previous button', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('does not call onPageChange when clicking disabled next button', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('shows ellipsis when there are many pages', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows first and last page with ellipsis when in the middle', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2);
  });

  it('does not show ellipsis near the beginning', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={2} />);

    // Should show pages 1, 2, 3, 4 without ellipsis after 1
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('does not show ellipsis near the end', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={9} />);

    // Should show pages 8, 9, 10 without ellipsis before 10
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('highlights current page with different style', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
    expect(currentPageButton).toHaveClass('bg-blue-600');
    expect(currentPageButton).toHaveClass('text-white');
  });

  it('shows correct item range for different pages', () => {
    const { rerender } = render(<Pagination {...defaultProps} currentPage={1} />);

    expect(screen.getByText('Showing 1 to 20 of 100 results')).toBeInTheDocument();

    rerender(<Pagination {...defaultProps} currentPage={2} />);

    expect(screen.getByText('Showing 21 to 40 of 100 results')).toBeInTheDocument();

    rerender(<Pagination {...defaultProps} currentPage={5} />);

    expect(screen.getByText('Showing 81 to 100 of 100 results')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<Pagination {...defaultProps} isLoading={true} />);

    const skeletonElement = document.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('does not allow clicking on current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(defaultProps.onPageChange).not.toHaveBeenCalled();
  });

  it('handles custom page size correctly', () => {
    render(<Pagination {...defaultProps} pageSize={10} totalItems={50} currentPage={2} />);

    expect(screen.getByText('Showing 11 to 20 of 50 results')).toBeInTheDocument();
  });

  it('calls onPageChange with correct page when clicking on non-adjacent pages', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

    // Click on first page
    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);

    // Click on last page
    fireEvent.click(screen.getByRole('button', { name: 'Page 10' }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(10);
  });
});
