import { useQuery } from "@tanstack/vue-query";
import { api } from "~/lib/api";
import { queryKeys } from "~/lib/query-client";

// Query: Fetch all specializations
export function useSpecializations() {
  return useQuery({
    queryKey: queryKeys.specializations.all,
    queryFn: async () => {
      const response = await api.specialization.getAll();
      return response.specializations || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - specializations don't change often
  });
}

// Query: Fetch single specialization
export function useSpecialization(id: MaybeRef<string>) {
  const specializationId = computed(() => unref(id));

  return useQuery({
    queryKey: computed(() => queryKeys.specializations.detail(specializationId.value)),
    queryFn: async () => {
      const response = await api.specialization.getById(specializationId.value);
      return response.specialization;
    },
    enabled: computed(() => !!specializationId.value),
    staleTime: 10 * 60 * 1000,
  });
}
