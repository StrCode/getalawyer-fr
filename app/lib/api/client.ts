// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Response Format
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: string;
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

// Get API URL from runtime config
const getApiUrl = () => {
  const config = useRuntimeConfig();
  return config.public.apiUrl || "http://localhost:3000";
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
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: ApiResponse;
      try {
        errorData = await response.json();
      } catch {
        throw new ApiError(
          response.statusText || "Request failed",
          response.status,
        );
      }

      throw new ApiError(
        errorData.error || errorData.message || "Request failed",
        response.status,
        errorData.code,
        errorData.details,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json();
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
        let errorData: ApiResponse;
        try {
          errorData = await response.json();
        } catch {
          throw new ApiError(
            response.statusText || "Request failed",
            response.status,
          );
        }

        throw new ApiError(
          errorData.error || errorData.message || "Request failed",
          response.status,
          errorData.code,
          errorData.details,
        );
      }

      return response.json() as Promise<T>;
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
