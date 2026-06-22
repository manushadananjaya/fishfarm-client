import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ProblemDetails } from '../types';
import { isProblemDetails } from '../api/client';

/**
 * Maps API validation error keys back to React Hook Form fields.
 * The backend sends errors under both "Request.FieldName" (FluentValidation)
 * and "FieldName" (business rule handlers). We check both for each field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMapping?: Partial<Record<string, Path<T>>>,
): string | null {
  if (!isProblemDetails(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const problem = error.response!.data as ProblemDetails;
  const errors = problem.errors ?? {};

  let hasFieldErrors = false;

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages[0] ?? 'Invalid value';

    // Try explicit mapping first
    if (fieldMapping && key in fieldMapping) {
      const fieldName = fieldMapping[key] as Path<T>;
      setError(fieldName, { type: 'server', message });
      hasFieldErrors = true;
      continue;
    }

    // Strip "Request." prefix and lowercase first char
    const rawKey = key.startsWith('Request.') ? key.slice(8) : key;
    const camelKey = rawKey.charAt(0).toLowerCase() + rawKey.slice(1) as Path<T>;

    // Skip sub-keys like "Picture.Length" — surface as generic message
    if (rawKey.includes('.')) {
      continue;
    }

    try {
      setError(camelKey, { type: 'server', message });
      hasFieldErrors = true;
    } catch {
      // Field doesn't exist in form — ignore
    }
  }

  if (!hasFieldErrors) {
    return problem.detail ?? problem.title ?? 'An error occurred.';
  }

  // Also collect picture errors as a generic message
  const pictureErrors = [
    errors['Request.Picture'],
    errors['Request.Picture.Length'],
    errors['Request.Picture.ContentType'],
  ]
    .flat()
    .filter(Boolean);

  if (pictureErrors.length > 0) {
    return pictureErrors[0] ?? null;
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (isProblemDetails(error)) {
    const problem = error.response!.data as ProblemDetails;
    return problem.detail ?? problem.title ?? 'An error occurred.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
