import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "~/lib/api";
import { queryKeys } from "~/lib/query-client";

// Query: Fetch all lawyers with 5-minute stale time
export function useLawyers() {
  return useQuery({
    queryKey: queryKeys.lawyers.all,
    queryFn: async () => {
      const response = await api.lawyer.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Query: Fetch single lawyer with consultation types
export function useLawyer(id: MaybeRef<string>) {
  const lawyerId = computed(() => unref(id));

  return useQuery({
    queryKey: computed(() => queryKeys.lawyers.detail(lawyerId.value)),
    queryFn: async () => {
      const response = await api.lawyer.getById(lawyerId.value);
      return response.data;
    },
    enabled: computed(() => !!lawyerId.value),
    staleTime: 5 * 60 * 1000,
  });
}

// Query: Fetch public lawyer profile
export function usePublicLawyerProfile(id: MaybeRef<string>) {
  const lawyerId = computed(() => unref(id));

  return useQuery({
    queryKey: computed(() => queryKeys.lawyers.public(lawyerId.value)),
    queryFn: async () => {
      const response = await api.lawyer.getPublicProfile(lawyerId.value);
      return response.data;
    },
    enabled: computed(() => !!lawyerId.value),
    staleTime: 5 * 60 * 1000,
  });
}

// Query: Fetch own lawyer profile (authenticated)
export function useLawyerProfile() {
  return useQuery({
    queryKey: queryKeys.lawyers.all,
    queryFn: async () => {
      const response = await api.lawyer.getProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
