import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar, SearchBarProps } from '../components/SearchBar';

const defaultProps: SearchBarProps = {
  onSearchChange: vi.fn(),
  debounceMs: 100, // Use shorter debounce for tests
  placeholder: 'Search bookmarks...',
};

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Fast-forward any pending timers
    vi.advanceTimersByTime(0);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders with empty input by default', () => {
    render(<SearchBar {...defaultProps} />);

    const input = screen.getByRole('textbox', { name: /search bookmarks/i });
    expect(input).toHaveValue('');
  });

  it('renders with initial value when provided', () => {
    render(<SearchBar {...defaultProps} initialValue="react" />);

    expect(screen.getByRole('textbox')).toHaveValue('react');
  });

  it('uses custom placeholder when provided', () => {
    render(<SearchBar {...defaultProps} placeholder="Find something..." />);

    expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
  });

  it('calls onSearchChange after debounce delay when typing', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');

    // Type in the input
    fireEvent.change(input, { target: { value: 'react' } });

    // Should not call immediately (debouncing)
    expect(onSearchChange).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });

    expect(onSearchChange).toHaveBeenCalledWith('react');
  });

  it('debounces and only calls onSearchChange with final value', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');

    // Type multiple times quickly
    fireEvent.change(input, { target: { value: 'r' } });
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.change(input, { target: { value: 'rea' } });
    fireEvent.change(input, { target: { value: 'react' } });

    // Wait for debounce
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });

    // Should only be called once with the final value
    expect(onSearchChange).toHaveBeenCalledWith('react');
  });

  it('calls onSearchChange again when typing continues after debounce', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');

    // First search
    fireEvent.change(input, { target: { value: 'react' } });
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('react');
    }, { timeout: 200 });

    // Continue typing
    fireEvent.change(input, { target: { value: 'react testing' } });
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('react testing');
    }, { timeout: 200 });

    expect(onSearchChange).toHaveBeenCalledTimes(2);
  });

  it('shows clear button when there is a query', () => {
    render(<SearchBar {...defaultProps} initialValue="react" />);

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('does not show clear button when input is empty', () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} initialValue="react" onSearchChange={onSearchChange} debounceMs={100} />);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect(screen.getByRole('textbox')).toHaveValue('');

    // Should call onSearchChange with empty string after debounce
    waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('');
    }, { timeout: 200 });
  });

  it('clears input when escape key is pressed', () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} initialValue="react" onSearchChange={onSearchChange} debounceMs={100} />);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('disables input when isLoading is true', () => {
    render(<SearchBar {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not show loading indicator when isLoading is false', () => {
    render(<SearchBar {...defaultProps} isLoading={false} />);

    // Loading spinner should not be present
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<SearchBar {...defaultProps} isLoading={true} />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays search icon', () => {
    render(<SearchBar {...defaultProps} />);

    // Search icon should be present (svg with search path)
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<SearchBar {...defaultProps} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');

    fireEvent.change(input, { target: { value: 'testing' } });
    expect(input).toHaveValue('testing');
  });

  it('allows typing after clearing', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} initialValue="react" onSearchChange={onSearchChange} debounceMs={100} />);

    // Clear the input
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.getByRole('textbox')).toHaveValue('');

    // Type again
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new search' } });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('new search');
    }, { timeout: 200 });
  });

  it('handles special characters in search', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('test@example.com');
    }, { timeout: 200 });
  });

  it('handles unicode characters in search', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '日本語テスト' } });

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('日本語テスト');
    }, { timeout: 200 });
  });

  it('does not call onSearchChange when undefined', async () => {
    render(<SearchBar initialValue="test" debounceMs={100} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new' } });

    // Should not throw or call anything
    await waitFor(() => {
      // Just wait for debounce to complete
    }, { timeout: 200 });
  });
});
