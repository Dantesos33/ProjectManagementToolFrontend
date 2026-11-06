import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ParsedError {
  message: string;
  fields: Record<string, string>;
}

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export function parseApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): ParsedError {
  const fallback: ParsedError = { message: 'Something went wrong. Please try again.', fields: {} };

  if (!error) return fallback;
  if (!('status' in error)) return fallback;

  if (error.status === 'FETCH_ERROR') {
    return { message: 'Cannot reach the server. Check your connection.', fields: {} };
  }
  if (error.status === 429) {
    return { message: 'Too many attempts. Please wait a minute and try again.', fields: {} };
  }

  const body = error.data as LaravelErrorBody | undefined;
  const fields: Record<string, string> = {};

  if (body?.errors) {
    for (const [key, messages] of Object.entries(body.errors)) {
      fields[key] = messages[0];   // show the first message per field
    }
  }

  return { message: body?.message ?? fallback.message, fields };
}