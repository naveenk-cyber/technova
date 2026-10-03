// Simple fetch wrapper for the application API
const API_BASE = '/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  /** HTTP status of the failed request, so callers can tell a missing
   *  resource (404) apart from a transient failure worth retrying. */
  status?: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Turns an API failure into a message safe to show a shopper. Validation and
 * not-found errors describe the request, not the problem the visitor cares
 * about, so pages pass their own copy instead of surfacing raw server text.
 */
export function friendlyError(
  response: { error?: string | null; status?: number | null },
  fallback: string
): string {
  if (response.status === 404 || response.status === 400) return fallback;
  return response.error || fallback;
}

/**
 * Builds a readable message from an API error body. The server returns
 * `{ message: 'Validation failed', errors: [{ field, message }] }`, and the
 * bare "Validation failed" string is useless on its own, so prefer the
 * per-field detail when it is available.
 */
function messageFromBody(body: any, status: number): string {
  const details = Array.isArray(body?.errors) ? body.errors : [];
  if (details.length > 0) {
    const text = details
      .map((e: any) => {
        const field = typeof e?.field === 'string' ? e.field.split('.').pop() : '';
        const msg = typeof e?.message === 'string' ? e.message : '';
        if (field && msg) return `${field}: ${msg}`;
        return msg || field;
      })
      .filter(Boolean)
      .join(', ');
    if (text) return text;
  }
  if (status === 400) return 'Some of the details you entered are not valid. Please check and try again.';
  if (status === 404) return 'We could not find what you were looking for.';
  return body?.error || body?.message || 'Something went wrong. Please try again.';
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle 204 No Content
    if (response.status === 204) {
      return { data: {} as T };
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized, maybe clear token
        localStorage.removeItem('token');
      }
      const error = new Error(messageFromBody(data, response.status)) as Error & {
        status?: number;
      };
      error.status = response.status;
      throw error;
    }
    
    return data as ApiResponse<T>;
  } catch (error: any) {
    return { error: error.message || 'Network error', status: error?.status };
  }
}
