import { httpClient } from "./client";
import type { ApiResponse } from "./client";

// Type definitions for API responses
export interface Country {
  code2: string;
  code3: string;
  name: string;
  capital: string;
  region: string;
  subregion: string;
  states: State[];
}

export interface State {
  code: string;
  name: string;
  subdivision: string;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LawyerListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  yearsOfExperience: number;
  specializations: Specialization[];
  rating: number;
  reviewCount: number;
}

export interface LawyerProfile extends LawyerListItem {
  barLicenseNumber: string;
  consultationTypes: ConsultationType[];
}

export interface ConsultationType {
  id: string;
  lawyerId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  lawyerId: string;
  consultationTypeId: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  onboardingCompleted: boolean;
  clientId: string;
  company: string | null;
  country: string;
  state: string;
  phoneNumber: string | null;
  clientCreatedAt: string;
}

// API namespace
export const api = {
  // Countries API
  countries: {
    getAll: () =>
      httpClient.getAuth<ApiResponse<Country[]>>("/api/countries"),
    getStates: (countryCode: string) =>
      httpClient.getAuth<ApiResponse<State[]>>(
        `/api/countries/${countryCode}/states`,
      ),
  },

  // Specializations API
  specialization: {
    getAll: () =>
      httpClient.get<{ specializations: Specialization[] }>(
        "/api/specializations",
      ),
    getById: (id: string) =>
      httpClient.get<{ specialization: Specialization }>(
        `/api/specializations/${id}`,
      ),
  },

  // Client API
  client: {
    getProfile: () =>
      httpClient.getAuth<ApiResponse<{ profile: ClientProfile }>>(
        "/api/clients/me",
      ),
    updateProfile: (data: {
      name: string;
      state: string;
      country: string;
    }) =>
      httpClient.patch<ApiResponse>("/api/clients/me", data),
    uploadAvatar: (formData: FormData) =>
      httpClient.postFormData<ApiResponse<{ imageUrl: string }>>(
        "/api/clients/upload-avatar",
        formData,
      ),
    completeOnboarding: (data: {
      country: string;
      state: string;
      specializationIds: string[];
    }) =>
      httpClient.post<ApiResponse>("/api/clients/onboarding/complete", data),
  },

  // Lawyer API
  lawyer: {
    getAll: () =>
      httpClient.get<ApiResponse<LawyerListItem[]>>("/api/lawyers"),
    getById: (id: string) =>
      httpClient.get<ApiResponse<LawyerProfile>>(`/api/lawyers/${id}`),
    getPublicProfile: (id: string) =>
      httpClient.get<ApiResponse<LawyerProfile>>(
        `/api/public/lawyers/${id}`,
      ),
    getProfile: () =>
      httpClient.getAuth<ApiResponse<LawyerProfile>>("/api/lawyers/profile"),
    getOnboardingStatus: () =>
      httpClient.getAuth<ApiResponse>("/api/lawyers/onboarding/status"),
    savePracticeInfo: (data: {
      phoneNumber: string;
      country: string;
      state: string;
      yearsOfExperience: number;
      barLicenseNumber: string;
      barAssociation: string;
      licenseStatus: string;
    }) =>
      httpClient.patch<ApiResponse>(
        "/api/lawyers/onboarding/practice-info",
        data,
      ),
    saveDocuments: (data: {
      documents: Array<{
        type: "bar_license" | "certification";
        url: string;
        publicId: string;
        originalName?: string;
      }>;
    }) =>
      httpClient.patch<ApiResponse>(
        "/api/lawyers/onboarding/documents",
        data,
      ),
    completeOnboarding: (data: {
      specializations: Array<{
        specializationId: string;
        yearsOfExperience: number;
      }>;
      experienceDescription?: string;
    }) =>
      httpClient.post<ApiResponse>(
        "/api/lawyers/onboarding/complete",
        data,
      ),
    uploadDocument: (formData: FormData) =>
      httpClient.postFormData<ApiResponse>(
        "/api/lawyers/upload-document",
        formData,
      ),
    getDocuments: () =>
      httpClient.getAuth<ApiResponse>("/api/lawyers/documents"),
    deleteDocument: (id: string) =>
      httpClient.delete<ApiResponse>(`/api/lawyers/documents/${id}`),
    updateDocument: (id: string, data: { type?: string; originalName?: string }) =>
      httpClient.patch<ApiResponse>(`/api/lawyers/documents/${id}`, data),
  },

  // Bookings API
  bookings: {
    // Client bookings
    getClientBookings: () =>
      httpClient.getAuth<ApiResponse<Booking[]>>("/api/bookings"),
    getClientBooking: (id: string) =>
      httpClient.getAuth<ApiResponse<Booking>>(`/api/bookings/${id}`),
    createBooking: (data: {
      lawyerId: string;
      consultationTypeId: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }) =>
      httpClient.post<ApiResponse<Booking>>("/api/bookings", data),
    updateClientBooking: (
      id: string,
      data: {
        startTime?: string;
        endTime?: string;
        notes?: string;
        status?: "pending" | "confirmed" | "cancelled";
      },
    ) =>
      httpClient.put<ApiResponse<Booking>>(`/api/bookings/${id}`, data),

    // Lawyer bookings
    getLawyerBookings: () =>
      httpClient.getAuth<ApiResponse<Booking[]>>("/api/lawyer/bookings"),
    getLawyerBooking: (id: string) =>
      httpClient.getAuth<ApiResponse<Booking>>(
        `/api/lawyer/bookings/${id}`,
      ),
    updateLawyerBooking: (
      id: string,
      data: {
        status: "confirmed" | "rejected" | "completed";
        notes?: string;
      },
    ) =>
      httpClient.put<ApiResponse<Booking>>(
        `/api/lawyer/bookings/${id}`,
        data,
      ),
  },

  // Consultation Types API
  consultationTypes: {
    getAll: () =>
      httpClient.getAuth<ApiResponse<ConsultationType[]>>(
        "/api/consultation-types",
      ),
    getById: (id: string) =>
      httpClient.getAuth<ApiResponse<ConsultationType>>(
        `/api/consultation-types/${id}`,
      ),
    create: (data: {
      name: string;
      description: string;
      duration: number;
      price: number;
      currency: string;
      isActive: boolean;
    }) =>
      httpClient.post<ApiResponse<ConsultationType>>(
        "/api/consultation-types",
        data,
      ),
    update: (
      id: string,
      data: {
        name?: string;
        description?: string;
        duration?: number;
        price?: number;
        currency?: string;
        isActive?: boolean;
      },
    ) =>
      httpClient.put<ApiResponse<ConsultationType>>(
        `/api/consultation-types/${id}`,
        data,
      ),
    delete: (id: string) =>
      httpClient.delete<ApiResponse>(`/api/consultation-types/${id}`),
  },

  // Search API
  search: {
    lawyers: (params: {
      q?: string;
      specializations?: string[];
      minExperience?: number;
      maxExperience?: number;
      page?: number;
      limit?: number;
      sortBy?: "relevance" | "experience" | "recent";
    }) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.specializations?.length) {
        searchParams.set("specializations", params.specializations.join(","));
      }
      if (params.minExperience !== undefined) {
        searchParams.set("minExperience", params.minExperience.toString());
      }
      if (params.maxExperience !== undefined) {
        searchParams.set("maxExperience", params.maxExperience.toString());
      }
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);

      return httpClient.get<ApiResponse>(
        `/api/search/lawyers?${searchParams.toString()}`,
      );
    },
    autocomplete: (query: string) =>
      httpClient.get<ApiResponse>(`/api/search/autocomplete?q=${query}`),
    getFilters: (params: { q?: string; minExperience?: number }) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.minExperience !== undefined) {
        searchParams.set("minExperience", params.minExperience.toString());
      }

      return httpClient.get<ApiResponse>(
        `/api/search/filters?${searchParams.toString()}`,
      );
    },
  },

  // Onboarding Check API
  checks: {
    onboardingStatus: () =>
      httpClient.getAuth<ApiResponse<{ onboarding_completed: boolean }>>(
        "/api/boards",
      ),
  },
};
