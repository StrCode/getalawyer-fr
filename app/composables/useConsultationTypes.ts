import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { api } from '~/lib/api';
import type { ConsultationType, CreateConsultationTypeInput, UpdateConsultationTypeInput } from '~/types/booking';

export const useConsultationTypes = () => {
  const queryClient = useQueryClient();

  // Fetch all consultation types
  const useConsultationTypesList = (includeInactive = false) => {
    return useQuery({
      queryKey: ['consultation-types', includeInactive],
      queryFn: async () => {
        const response = await api.consultationTypes.getAll(includeInactive);
        return response.consultationTypes;
      },
    });
  };

  // Fetch single consultation type
  const useConsultationType = (id: string) => {
    return useQuery({
      queryKey: ['consultation-type', id],
      queryFn: async () => {
        const response = await api.consultationTypes.getById(id);
        return response.consultationType;
      },
      enabled: !!id,
    });
  };

  // Create consultation type
  const useCreateConsultationType = () => {
    return useMutation({
      mutationFn: async (data: CreateConsultationTypeInput) => {
        return await api.consultationTypes.create(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['consultation-types'] });
      },
    });
  };

  // Update consultation type
  const useUpdateConsultationType = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateConsultationTypeInput }) => {
        return await api.consultationTypes.update(id, data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['consultation-types'] });
        queryClient.invalidateQueries({ queryKey: ['consultation-type', variables.id] });
      },
    });
  };

  // Delete consultation type
  const useDeleteConsultationType = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        return await api.consultationTypes.delete(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['consultation-types'] });
      },
    });
  };

  // Activate consultation type
  const useActivateConsultationType = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        return await api.consultationTypes.activate(id);
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['consultation-types'] });
        queryClient.invalidateQueries({ queryKey: ['consultation-type', id] });
      },
    });
  };

  // Deactivate consultation type
  const useDeactivateConsultationType = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        return await api.consultationTypes.deactivate(id);
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['consultation-types'] });
        queryClient.invalidateQueries({ queryKey: ['consultation-type', id] });
      },
    });
  };

  return {
    useConsultationTypesList,
    useConsultationType,
    useCreateConsultationType,
    useUpdateConsultationType,
    useDeleteConsultationType,
    useActivateConsultationType,
    useDeactivateConsultationType,
  };
};
