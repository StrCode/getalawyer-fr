import type { MaybeRef } from "vue";
import { computed, unref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { api } from "~/lib/api";
import { queryKeys } from "~/lib/query-client";

type UseSpecializationsOptions = {
  featured?: boolean;
};

// Query: Fetch specializations (all, or featured homepage subset)
export function useSpecializations(options?: UseSpecializationsOptions) {
  const featured = options?.featured ?? false;

  return useQuery({
    queryKey: featured ? queryKeys.specializations.featured : queryKeys.specializations.all,
    queryFn: async () => {
      const response = await api.specialization.getAll({ featured });
      return response.specializations || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeaturedSpecializations() {
  return useSpecializations({ featured: true });
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
