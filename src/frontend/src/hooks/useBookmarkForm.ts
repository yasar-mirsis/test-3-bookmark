/**
 * useBookmarkForm - Custom hook for managing bookmark form state.
 * Handles form data, validation, and submission for create/edit operations.
 */

import { useState, useCallback, useMemo } from 'react';
import { CreateBookmarkInput, UpdateBookmarkInput, Bookmark } from '../types/bookmark';

interface BookmarkFormData {
  url: string;
  title: string;
  description: string;
  tags: string;
}

interface FormErrors {
  url?: string;
  title?: string;
  description?: string;
  tags?: string;
}

interface UseBookmarkFormReturn {
  // State
  formData: BookmarkFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;

  // Methods
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (submitFn: (data: CreateBookmarkInput | UpdateBookmarkInput) => Promise<Bookmark>) => Promise<void>;
  reset: (initialValues?: Partial<BookmarkFormData>) => void;
  validateField: (name: keyof BookmarkFormData) => string | undefined;
  setFormData: (data: Partial<BookmarkFormData>) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Validates a URL format.
 * @param url - The URL to validate
 * @returns Error message if invalid, undefined if valid
 */
const validateUrl = (url: string): string | undefined => {
  if (!url || url.trim() === '') {
    return 'URL is required';
  }

  try {
    new URL(url);
    return undefined;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
};

/**
 * Validates a title.
 * @param title - The title to validate
 * @returns Error message if invalid, undefined if valid
 */
const validateTitle = (title: string): string | undefined => {
  if (!title || title.trim() === '') {
    return 'Title is required';
  }
  if (title.length < 2) {
    return 'Title must be at least 2 characters';
  }
  return undefined;
};

/**
 * Validates tags input.
 * @param tags - The tags string to validate
 * @returns Error message if invalid, undefined if valid
 */
const validateTags = (tags: string): string | undefined => {
  if (!tags || tags.trim() === '') {
    return undefined; // Tags are optional
  }

  const tagList = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');
  if (tagList.length > 10) {
    return 'Maximum 10 tags allowed';
  }

  const invalidTags = tagList.filter((t) => !/^[a-zA-Z0-9-]+$/.test(t));
  if (invalidTags.length > 0) {
    return 'Tags can only contain letters, numbers, and hyphens';
  }

  return undefined;
};

/**
 * Parses tags string into array, deduplicating and trimming.
 * @param tagsString - Comma-separated tags string
 * @returns Array of unique, trimmed tags
 */
const parseTags = (tagsString: string): string[] => {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }

  return tagsString
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
    .filter((tag, index, self) => self.indexOf(tag) === index); // Deduplicate
};

/**
 * Custom hook for managing bookmark form state.
 * @param initialValues - Initial form values (optional)
 * @returns Object containing state and methods for form management
 */
export function useBookmarkForm(
  initialValues?: Partial<BookmarkFormData>
): UseBookmarkFormReturn {
  const defaultValues: BookmarkFormData = {
    url: '',
    title: '',
    description: '',
    tags: '',
  };

  const [formData, setFormDataState] = useState<BookmarkFormData>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate a single field
  const validateField = useCallback((name: keyof BookmarkFormData): string | undefined => {
    switch (name) {
      case 'url':
        return validateUrl(formData.url);
      case 'title':
        return validateTitle(formData.title);
      case 'description':
        if (formData.description && formData.description.length > 500) {
          return 'Description must be less than 500 characters';
        }
        return undefined;
      case 'tags':
        return validateTags(formData.tags);
      default:
        return undefined;
    }
  }, [formData]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const urlError = validateUrl(formData.url);
    if (urlError) newErrors.url = urlError;

    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateField('description');
    if (descriptionError) newErrors.description = descriptionError;

    const tagsError = validateTags(formData.tags);
    if (tagsError) newErrors.tags = tagsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return (
      !validateUrl(formData.url) &&
      !validateTitle(formData.title) &&
      !validateTags(formData.tags) &&
      (!formData.description || formData.description.length <= 500)
    );
  }, [formData]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    submitFn: (data: CreateBookmarkInput | UpdateBookmarkInput) => Promise<Bookmark>
  ): Promise<void> => {
    // Clear previous errors
    setErrors({});

    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const inputData: CreateBookmarkInput = {
        url: formData.url.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        tags: parseTags(formData.tags),
      };

      await submitFn(inputData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setErrors((prev) => ({
        ...prev,
        url: errorMessage.includes('URL') ? errorMessage : prev.url,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAll]);

  // Reset form to initial values
  const reset = useCallback((newInitialValues?: Partial<BookmarkFormData>) => {
    setFormDataState({
      ...defaultValues,
      ...newInitialValues,
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Update form data programmatically
  const setFormData = useCallback((data: Partial<BookmarkFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
    reset,
    validateField,
    setFormData,
  };
}

export default useBookmarkForm;
