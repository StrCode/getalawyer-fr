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
  lastFailureReason?: string | null
  /** Amount last recorded on the subscription (previous payment). */
  priceNaira?: number | null
  /** Current catalog price — used for the next checkout or auto-renewal. */
  renewalPriceNaira?: number | null
}

interface SubscriptionStatusPayload {
  hasActiveSubscription: boolean
  subscription: SubscriptionRecord | null
}

export type { SubscriptionRecord, SubscriptionStatusPayload }

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

export const SUBSCRIPTION_PAYMENT_REF_KEY = 'gal_subscription_payment_ref'

export interface SubscriptionPricingPayload {
  subscriptionPriceNaira: number
  verificationAdminFeeNaira: number
}

export function formatNairaAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatSubscriptionStatusLabel(status: string | null | undefined): string {
  if (!status) return 'No subscription'
  const labels: Record<string, string> = {
    pending: 'Payment pending',
    active: 'Active',
    cancelled: 'Cancelled',
    expired: 'Expired',
    failed_renewal: 'Renewal failed',
    verification_failed: 'Verification failed',
    refund_processing: 'Refund processing',
    refunded: 'Refunded',
  }
  return labels[status] ?? status.replace(/_/g, ' ')
}

export function getSubscriptionPaymentFailureMessage(
  subscription: SubscriptionRecord | null | undefined,
): string | null {
  const reason = subscription?.lastFailureReason?.trim()
  return reason || null
}

export function hasSubscriptionRenewalIssue(
  subscription: SubscriptionRecord | null | undefined,
): boolean {
  return subscription?.status === 'failed_renewal'
}

export function hasPendingCheckoutFailure(
  subscription: SubscriptionRecord | null | undefined,
): boolean {
  return subscription?.status === 'pending' && Boolean(getSubscriptionPaymentFailureMessage(subscription))
}

export function useSubscriptionPricing(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.subscription.pricing,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const res = await httpClient.getAuth<{ success: boolean; data: SubscriptionPricingPayload }>(
        '/api/subscriptions/pricing',
      )
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

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
    onSuccess: (data) => {
      if (import.meta.client && data?.reference) {
        sessionStorage.setItem(SUBSCRIPTION_PAYMENT_REF_KEY, data.reference)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] })
    },
  })
}

export function useUpdateSubscriptionAutoRenew() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await httpClient.patch<{ success: boolean; data: { autoRenewEnabled: boolean } }>(
        '/api/subscriptions/auto-renew',
        { enabled },
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] })
    },
  })
}

export interface SubscriptionNotificationRecord {
  id: string
  type: string
  message: string
  isRead: boolean
  sentAt: string
  createdAt: string
}

interface SubscriptionNotificationsPayload {
  notifications: SubscriptionNotificationRecord[]
  unreadCount: number
}

export function useSubscriptionNotifications(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.subscription.notifications,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const res = await httpClient.getAuth<{
        success: boolean
        data: SubscriptionNotificationsPayload
      }>('/api/subscriptions/notifications?limit=20')
      return res.data
    },
    staleTime: 30 * 1000,
  })
}

export function useMarkSubscriptionNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await httpClient.patch(`/api/subscriptions/notifications/${encodeURIComponent(notificationId)}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.notifications })
    },
  })
}

export function useMarkAllSubscriptionNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await httpClient.patch('/api/subscriptions/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.notifications })
    },
  })
}

export interface SubscriptionPaymentHistoryRecord {
  id: string
  action: string
  amountNaira: number | null
  paymentReference: string | null
  paymentMethod: string | null
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
  createdAt: string
}

interface SubscriptionPaymentHistoryPayload {
  payments: SubscriptionPaymentHistoryRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useSubscriptionPaymentHistory(
  page: MaybeRef<number> = 1,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: computed(() => queryKeys.subscription.paymentHistory(unref(page))),
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const currentPage = unref(page)
      const res = await httpClient.getAuth<{
        success: boolean
        data: SubscriptionPaymentHistoryPayload
      }>(`/api/subscriptions/payment-history?page=${currentPage}&limit=10`)
      return res.data
    },
    staleTime: 60 * 1000,
  })
}

export type SubscriptionPaymentHistoryStatus = 'paid' | 'failed' | 'refund' | 'pending'

export function formatSubscriptionHistoryAction(action: string): string {
  const labels: Record<string, string> = {
    created: 'Annual membership',
    renewed: 'Membership renewal',
    payment_failed: 'Payment failed',
    failed_renewal: 'Renewal failed',
    refund_initiated: 'Refund processing',
    refunded: 'Refund',
    refund_failed: 'Refund failed',
  }
  return labels[action] ?? action.replace(/_/g, ' ')
}

export function getSubscriptionHistoryStatus(
  action: string,
): SubscriptionPaymentHistoryStatus {
  if (action === 'refunded') return 'refund'
  if (action === 'refund_initiated') return 'pending'
  if (['payment_failed', 'failed_renewal', 'refund_failed'].includes(action)) {
    return 'failed'
  }
  return 'paid'
}

export function formatSubscriptionNotificationType(type: string): string {
  const labels: Record<string, string> = {
    expiring_soon: 'Expiring soon',
    pre_renewal_charge: 'Upcoming charge',
    renewal_success: 'Payment successful',
    renewal_failed: 'Renewal issue',
    expired: 'Expired',
    checkout_abandoned: 'Incomplete payment',
    price_change: 'Price update',
  }
  return labels[type] ?? type.replace(/_/g, ' ')
}

export function useSyncPendingSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.post<VerifySubscriptionPayload>(
        '/api/subscriptions/sync-pending',
      )
      return res
    },
    onSuccess: (data) => {
      if (data?.success && data.status === 'active' && import.meta.client) {
        sessionStorage.removeItem(SUBSCRIPTION_PAYMENT_REF_KEY)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.status })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] })
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
