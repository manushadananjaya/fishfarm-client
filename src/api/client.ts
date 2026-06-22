import axios, { AxiosError } from 'axios';
import type { ProblemDetails } from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5235',
  timeout: 15000,
});

// Extract ProblemDetails from 4xx/5xx responses so callers get a typed error
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    return Promise.reject(error);
  },
);

export function isProblemDetails(
  error: unknown,
): error is AxiosError<ProblemDetails> {
  return (
    axios.isAxiosError(error) &&
    error.response !== undefined &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'title' in error.response.data
  );
}
