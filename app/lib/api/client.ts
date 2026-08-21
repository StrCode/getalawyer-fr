// API Error Class
export type ApiValidationDetail = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
    /** Field-level validation from onboarding submit / step saves */
    public validationDetails?: ApiValidationDetail[] | unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Response Envelope (mirrors the backend's src/lib/http.ts).
// `request()` unwraps success responses to `data` and throws `ApiError` on
// failure, so application code receives the payload directly and never sees
// this wrapper.
export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string | ApiValidationDetail[];
    requestId?: string;
  };
}
export interface ApiSuccessEnvelope<T = unknown> {
  success: true;
  data: T;
}
export type ApiResponse<T = unknown> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

/** Unwrap a success envelope to its payload; pass through non-enveloped bodies. */
function unwrapEnvelope<T>(body: unknown): T {
  if (body && typeof body === "object" && (body as { success?: unknown }).success === true) {
    return (body as ApiSuccessEnvelope<T>).data;
  }
  return body as T;
}

// Retry Configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 0, // TanStack Query handles retries
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (
        error instanceof ApiError &&
        config.retryableStatuses.includes(error.status) &&
        attempt < config.maxRetries
      ) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}

import { DEV_API_URL } from '../api-config';

// Get API URL from runtime config
const getApiUrl = () => {
  const config = useRuntimeConfig();
  return config.public.apiUrl || DEV_API_URL;
};

// HTTP Client
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const API_URL = getApiUrl();
  const url = `${API_URL}${endpoint}`;

  return retryWithBackoff(async () => {
    const response = await fetch(url, {
      ...options,
      credentials: options.credentials || 'include', // Ensure credentials are included by default
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let body: ApiErrorEnvelope | undefined;
      try {
        body = await response.json();
      } catch {
        throw new ApiError(
          response.statusText || "Request failed",
          response.status,
        );
      }

      const err = body?.error;
      const details = err?.details;
      throw new ApiError(
        err?.message || "Request failed",
        response.status,
        err?.code,
        typeof details === "string" ? details : undefined,
        Array.isArray(details) ? details : undefined,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return unwrapEnvelope<T>(await response.json());
  });
}

export const httpClient = {
  // Unauthenticated GET
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  // Authenticated GET (includes credentials)
  getAuth: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "GET",
      credentials: "include",
    }),

  // Authenticated POST
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // POST with FormData (for file uploads)
  postFormData: <T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit,
  ) => {
    const API_URL = getApiUrl();
    const url = `${API_URL}${endpoint}`;

    return retryWithBackoff(async () => {
      const response = await fetch(url, {
        ...options,
        method: "POST",
        credentials: "include",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        let body: ApiErrorEnvelope | undefined;
        try {
          body = await response.json();
        } catch {
          throw new ApiError(
            response.statusText || "Request failed",
            response.status,
          );
        }

        const err = body?.error;
        const details = err?.details;
        throw new ApiError(
          err?.message || "Request failed",
          response.status,
          err?.code,
          typeof details === "string" ? details : undefined,
          Array.isArray(details) ? details : undefined,
        );
      }

      return unwrapEnvelope<T>(await response.json());
    });
  },

  // POST returning Blob (for file downloads)
  postBlob: (endpoint: string, data?: unknown, options?: RequestInit) => {
    const API_URL = getApiUrl();
    const url = `${API_URL}${endpoint}`;

    return retryWithBackoff(async () => {
      const response = await fetch(url, {
        ...options,
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new ApiError(
          response.statusText || "Request failed",
          response.status,
        );
      }

      return response.blob();
    });
  },

  // Authenticated PUT
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // Authenticated PATCH
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // Authenticated DELETE
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
      credentials: "include",
    }),
};
