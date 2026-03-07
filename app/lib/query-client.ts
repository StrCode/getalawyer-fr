import { QueryClient } from "@tanstack/vue-query";
import { ApiError } from "./api/client";

// Query Client Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query Key Factory
export const queryKeys = {
  consultationTypes: {
    all: ["consultation-types"] as const,
    detail: (id: string) => ["consultation-types", id] as const,
  },
  availability: {
    schedule: ["availability", "schedule"] as const,
    exceptions: ["availability", "exceptions"] as const,
  },
  bookings: {
    client: ["bookings", "client"] as const,
    lawyer: ["bookings", "lawyer"] as const,
    detail: (id: string) => ["bookings", id] as const,
  },
  availableSlots: (
    lawyerId: string,
    consultationTypeId: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      "available-slots",
      lawyerId,
      consultationTypeId,
      startDate,
      endDate,
    ] as const,
  lawyers: {
    all: ["lawyers"] as const,
    detail: (id: string) => ["lawyers", id] as const,
    public: (id: string) => ["lawyers", "public", id] as const,
  },
  calendar: {
    connection: ["calendar", "connection"] as const,
  },
  registration: {
    status: ["registration", "status"] as const,
    step2: ["registration", "step2"] as const,
    step4: ["registration", "step4"] as const,
    step5: ["registration", "step5"] as const,
    summary: ["registration", "summary"] as const,
  },
  specializations: {
    all: ["specializations"] as const,
    detail: (id: string) => ["specializations", id] as const,
  },
  countries: {
    all: ["countries"] as const,
    states: (countryCode: string) => ["countries", countryCode, "states"] as const,
  },
  client: {
    profile: ["client", "profile"] as const,
  },
};
