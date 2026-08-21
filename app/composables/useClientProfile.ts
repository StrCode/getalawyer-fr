/**
 * Client profile — GET/PATCH /api/clients/me and avatar upload.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { api, type ClientProfile } from '~/lib/api'
import { ApiError } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

export interface UpdateClientProfileInput {
  name?: string
  image?: string
  company?: string
  city?: string
  bio?: string
  country?: string
  state?: string
  phoneNumber?: string
}

type ClientProfileResponse = { profile: ClientProfile }

const clientProfileAPI = {
  getProfile: async (): Promise<ClientProfile> => {
    const res = await api.client.getProfile()
    if ('profile' in res && res.profile) {
      return res.profile
    }
    throw new Error('Invalid profile response')
  },

  updateProfile: async (data: UpdateClientProfileInput): Promise<ClientProfile> => {
    await api.client.updateProfile(data)
    return clientProfileAPI.getProfile()
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.client.uploadAvatar(formData)
    if (res.imageUrl) {
      return res.imageUrl
    }
    throw new ApiError('Upload failed', 500)
  },

  updateSpecializations: async (specializationIds: string[]): Promise<ClientProfile> => {
    await api.client.updateSpecializations({ specializationIds })
    return clientProfileAPI.getProfile()
  },
}

export const useClientProfile = () => {
  const queryClient = useQueryClient()
  const { refetchSession } = useAuth()

  const useProfile = (options?: { enabled?: Ref<boolean> | boolean }) => {
    return useQuery({
      queryKey: queryKeys.client.profile,
      queryFn: clientProfileAPI.getProfile,
      enabled: options?.enabled ?? true,
    })
  }

  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: clientProfileAPI.updateProfile,
      onSuccess: async (profile) => {
        queryClient.setQueryData(queryKeys.client.profile, profile)
        await refetchSession()
      },
    })
  }

  const useUploadAvatar = () => {
    return useMutation({
      mutationFn: clientProfileAPI.uploadAvatar,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.client.profile })
        await refetchSession()
      },
    })
  }

  const useUpdateSpecializations = () => {
    return useMutation({
      mutationFn: clientProfileAPI.updateSpecializations,
      onSuccess: async (profile) => {
        queryClient.setQueryData(queryKeys.client.profile, profile)
      },
    })
  }

  return {
    useProfile,
    useUpdateProfile,
    useUploadAvatar,
    useUpdateSpecializations,
  }
}
