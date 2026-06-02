import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { unref, type MaybeRef } from 'vue'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

interface SubscriptionRecord {
  id: string
  status: string
  subscriptionStartDate?: string | null
  subscriptionEndDate?: string | null
  nextBillingDate?: string | null
  daysRemaining?: number
  cardLast4?: string | null
  bank?: string | null
  autoRenewEnabled?: boolean
}

interface SubscriptionStatusPayload {
  hasActiveSubscription: boolean
  subscription: SubscriptionRecord | null
}

interface InitializeSubscriptionPayload {
  redirectUrl: string
  reference: string
  subscriptionId: string
}

interface VerifySubscriptionPayload {
  success: boolean
  status: string
  message?: string
  subscription?: {
    id: string
    status: string
    subscriptionEndDate?: string | null
  }
}

const FINAL_VERIFY_STATUSES = new Set(['active', 'failed', 'abandoned', 'cancelled'])

export function useSubscriptionStatus(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.subscription.status,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const res = await httpClient.getAuth<{ success: boolean; data: SubscriptionStatusPayload }>(
        '/api/subscriptions/status',
      )
      return res.data
    },
    staleTime: 30 * 1000,
  })
}

export function useInitializeSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.post<{ success: boolean; data: InitializeSubscriptionPayload }>(
        '/api/subscriptions/initialize',
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
    },
  })
}

export function useVerifySubscription(reference: MaybeRef<string | null | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.subscription.verify(unref(reference) ?? '')),
    enabled: computed(() => {
      const ref = unref(reference)
      return import.meta.client && typeof ref === 'string' && ref.length > 0
    }),
    queryFn: async () => {
      const ref = unref(reference)
      const res = await httpClient.getAuth<VerifySubscriptionPayload>(
        `/api/subscriptions/verify/${encodeURIComponent(String(ref))}`,
      )
      return res
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: (query) => {
      const status = String((query.state.data as VerifySubscriptionPayload | undefined)?.status ?? '')
      return FINAL_VERIFY_STATUSES.has(status) ? false : 3000
    },
    refetchOnWindowFocus: false,
  })
}
