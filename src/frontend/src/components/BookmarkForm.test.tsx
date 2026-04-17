import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookmarkForm, BookmarkFormProps } from '../components/BookmarkForm';
import { Bookmark } from '../types/bookmark';

const mockOnSubmit = vi.fn();

const defaultProps: BookmarkFormProps = {
  onSubmit: mockOnSubmit,
  formTitle: 'Create New Bookmark',
};

describe('BookmarkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<BookmarkForm {...defaultProps} />);

    expect(screen.getByLabelText(/url \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create bookmark/i })).toBeInTheDocument();
  });

  it('renders with initial values when provided', () => {
    const initialValues = {
      url: 'https://example.com',
      title: 'Example Title',
      description: 'Example description',
      tags: 'react,testing',
    };

    render(<BookmarkForm {...defaultProps} initialValues={initialValues} />);

    expect(screen.getByLabelText(/url \*/i)).toHaveValue(initialValues.url);
    expect(screen.getByLabelText(/title \*/i)).toHaveValue(initialValues.title);
    expect(screen.getByLabelText(/description/i)).toHaveValue(initialValues.description);
    expect(screen.getByLabelText(/tags/i)).toHaveValue(initialValues.tags);
  });

  it('shows validation error when URL is empty', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Try to submit without filling URL
    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when title is empty', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill URL but not title
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid URL format', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill with invalid URL
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'not-a-valid-url' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when title is less than 2 characters', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill URL and short title
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'A' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for too many tags', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill required fields and too many tags
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'tag1,tag2,tag3,tag4,tag5,tag6,tag7,tag8,tag9,tag10,tag11' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/maximum 10 tags allowed/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid tag characters', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill required fields and invalid tags
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'valid-tag,invalid tag!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/tags can only contain letters, numbers, and hyphens/i)).toBeInTheDocument();
    });
  });

  it('clears validation error when user starts typing', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument();
    });

    // Start typing
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https' },
    });

    expect(screen.queryByText(/url is required/i)).not.toBeInTheDocument();
  });

  it('calls onSubmit with valid form data', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'react, testing' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com',
        title: 'Test Title',
        description: 'Test description',
        tags: ['react', 'testing'],
      })
    );
  });

  it('deduplicates tags in form data', async () => {
    render(<BookmarkForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'react, react, testing, testing' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedData = mockOnSubmit.mock.calls[0][0];
    expect(submittedData.tags).toEqual(['react', 'testing']);
  });

  it('shows loading state when submitting', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: Bookmark) => void;
    const pendingPromise = new Promise<Bookmark>((resolve) => {
      resolvePromise = resolve;
    });

    const onSubmitPromise = vi.fn(() => pendingPromise);

    render(<BookmarkForm {...defaultProps} onSubmit={onSubmitPromise} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    // Check loading state
    expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating\.\.\./i })).toBeDisabled();

    // Resolve the promise
    resolvePromise!(
      {
        id: '1',
        url: 'https://example.com',
        title: 'Test Title',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    await waitFor(() => {
      expect(screen.queryByText(/creating\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('shows update button text when isEdit is true', () => {
    render(<BookmarkForm {...defaultProps} isEdit={true} />);

    expect(screen.getByRole('button', { name: /update bookmark/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create bookmark/i })).not.toBeInTheDocument();
  });

  it('shows cancel button when isEdit and onCancel are provided', () => {
    const onCancel = vi.fn();
    render(<BookmarkForm {...defaultProps} isEdit={true} onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<BookmarkForm {...defaultProps} isEdit={true} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables cancel button when submitting', async () => {
    let resolvePromise: (value: Bookmark) => void;
    const pendingPromise = new Promise<Bookmark>((resolve) => {
      resolvePromise = resolve;
    });

    const onSubmitPromise = vi.fn(() => pendingPromise);
    const onCancel = vi.fn();

    render(
      <BookmarkForm
        {...defaultProps}
        isEdit={true}
        onSubmit={onSubmitPromise}
        onCancel={onCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    // Click submit
    fireEvent.click(screen.getByRole('button', { name: /updating\.\.\./i }));

    // Cancel should be disabled
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

    // Resolve promise
    resolvePromise!(
      {
        id: '1',
        url: 'https://example.com',
        title: 'Test Title',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  });

  it('shows character count for description', () => {
    render(<BookmarkForm {...defaultProps} />);

    expect(screen.getByText(/0\/500/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test' },
    });

    expect(screen.getByText(/4\/500/i)).toBeInTheDocument();
  });

  it('shows description validation error when over 500 characters', async () => {
    render(<BookmarkForm {...defaultProps} />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/url \*/i), {
      target: { value: 'https://example.com' },
    });

    fireEvent.change(screen.getByLabelText(/title \*/i), {
      target: { value: 'Test Title' },
    });

    // Fill description with over 500 characters
    const longDescription = 'a'.repeat(501);
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: longDescription },
    });

    fireEvent.click(screen.getByRole('button', { name: /create bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText(/description must be less than 500 characters/i)).toBeInTheDocument();
    });
  });
});
