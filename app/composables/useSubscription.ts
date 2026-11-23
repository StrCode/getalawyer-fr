import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { unref, type MaybeRef } from 'vue'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type { SubscriptionPlanOption, SubscriptionPlanSummary } from '~/lib/subscription-plans'

export { pickPlanKey, plansOnSale } from '~/lib/subscription-plans'
export type { SubscriptionPlanOption, SubscriptionPlanSummary } from '~/lib/subscription-plans'

interface SubscriptionRecord {
  id: string
  status: string
  /** Paid for, and waiting for the application to be approved before it starts: no dates yet. */
  notStarted?: boolean
  /** When the latest payment arrived. */
  paidAt?: string | null
  subscriptionStartDate?: string | null
  subscriptionEndDate?: string | null
  nextBillingDate?: string | null
  /** To be given back: our team has not sent the refund yet. */
  refundDueAt?: string | null
  /** What is being given back, once a refund has been started. */
  refundNaira?: number | null
  daysRemaining?: number
  cardLast4?: string | null
  bank?: string | null
  autoRenewEnabled?: boolean
  lastFailureReason?: string | null
  /** Amount last recorded on the subscription (previous payment). */
  priceNaira?: number | null
  /** Current catalog price — used for the next checkout or auto-renewal. */
  renewalPriceNaira?: number | null
  /** Months bought with the last payment. */
  termMonths?: number | null
  /** The plan this subscription is on (absent on backends from before plans). */
  plan?: SubscriptionPlanSummary | null
  /** A plan change requested for the next renewal, if any. */
  nextPlan?: SubscriptionPlanSummary | null
  /**
   * Whether the next checkout is a renewal (no verification fee), as the
   * backend will price it. Absent on older backends.
   */
  nextCheckoutIsRenewal?: boolean
}

interface SubscriptionStatusPayload {
  hasActiveSubscription: boolean
  /**
   * What the lawyer may do right now. `read_only`: the membership is not on, so
   * they can read and reply but not take new bookings or change their profile.
   * Absent on backends from before this rule.
   */
  access?: 'full' | 'read_only'
  /** A transfer, cash or POS payment staff have recorded and are confirming. */
  offlinePayment?: { amountNaira: number, method: string, planName: string, receivedOn: string } | null
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
/** Where the payment started (`application` or `dashboard`), so /verify-payment returns the payer there. */
export const SUBSCRIPTION_PAYMENT_FROM_KEY = 'gal_subscription_payment_from'

export interface SubscriptionPricingPayload {
  subscriptionPriceNaira: number
  verificationAdminFeeNaira: number
  /** First onboarding checkout total (subscription + verification fee). */
  firstPaymentTotalNaira?: number
  /** Annual renewal / restore price (subscription only). */
  renewalPriceNaira?: number
  /** Every plan on sale. The single-price fields above describe the default one. */
  plans?: SubscriptionPlanOption[]
  defaultPlanKey?: string | null
  /** The small charge taken, and refunded, to check a new card when the saved card is changed. */
  cardCheckNaira?: number
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

/**
 * True when checkout should use renewal pricing (subscription only).
 * Must stay aligned with law-backend `initiateSubscription` renewal/restore statuses.
 * Verification-failure refunds (`refunded` / `refund_processing`) are first-checkout again.
 */
export function hadPriorMembership(
  subscription: SubscriptionRecord | null | undefined,
): boolean {
  if (!subscription) return false
  // The backend says how it will price the next checkout; trust it when present.
  // Status alone gets this wrong after a first Pay click on a lapsed membership,
  // which turns the row to `pending` and used to make the screen add the fee.
  if (typeof subscription.nextCheckoutIsRenewal === 'boolean') return subscription.nextCheckoutIsRenewal
  return ['expired', 'cancelled', 'failed_renewal'].includes(subscription.status)
}

export function isExpiredMembership(
  subscription: SubscriptionRecord | null | undefined,
): boolean {
  return subscription?.status === 'expired'
}

export function needsMembershipRenewal(
  subscription: SubscriptionRecord | null | undefined,
): boolean {
  if (!subscription) return false
  return ['expired', 'cancelled'].includes(subscription.status)
}

export function useSubscriptionPricing(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.subscription.pricing,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const res = await httpClient.getAuth<SubscriptionPricingPayload>(
        '/api/subscriptions/pricing',
      )
      return res
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Where the lawyer's membership stands; the query below and anything warming its cache share it. */
export async function fetchSubscriptionStatus(): Promise<SubscriptionStatusPayload> {
  return httpClient.getAuth<SubscriptionStatusPayload>('/api/subscriptions/status')
}

export function useSubscriptionStatus(options?: {
  enabled?: MaybeRef<boolean>
  /** Check again once a minute while true: for a screen waiting on a refund to settle. */
  poll?: MaybeRef<boolean>
}) {
  return useQuery({
    queryKey: queryKeys.subscription.status,
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    refetchInterval: () => (unref(options?.poll) ? 60 * 1000 : false),
    queryFn: fetchSubscriptionStatus,
    staleTime: 30 * 1000,
  })
}

export function useInitializeSubscription(from: 'application' | 'dashboard' = 'application') {
  const queryClient = useQueryClient()
  return useMutation({
    // `planKey` is the plan to buy. Without one the backend charges its default
    // plan, so checkout screens should always pass the visitor's choice.
    mutationFn: async (planKey?: string | null) => {
      const res = await httpClient.post<InitializeSubscriptionPayload>(
        '/api/subscriptions/initialize',
        planKey ? { planKey } : undefined,
      )
      return res
    },
    onSuccess: (data) => {
      if (import.meta.client && data?.reference) {
        sessionStorage.setItem(SUBSCRIPTION_PAYMENT_REF_KEY, data.reference)
        sessionStorage.setItem(SUBSCRIPTION_PAYMENT_FROM_KEY, from)
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
      const res = await httpClient.patch<{ autoRenewEnabled: boolean }>(
        '/api/subscriptions/auto-renew',
        { enabled },
      )
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] })
    },
  })
}

interface ChangeSubscriptionPlanPayload {
  plan: SubscriptionPlanSummary
  nextPlan: SubscriptionPlanSummary | null
  /** When the new plan starts (the next renewal date); null if the change was cancelled. */
  effectiveFrom: string | null
}

/**
 * Move to another plan from the next renewal. Nothing is charged now; choosing
 * the plan the subscription is already on cancels a pending change.
 */
export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (planKey: string) => {
      const res = await httpClient.patch<ChangeSubscriptionPlanPayload>(
        '/api/subscriptions/plan',
        { planKey },
      )
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
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
      const res = await httpClient.getAuth<SubscriptionNotificationsPayload>(
        '/api/subscriptions/notifications?limit=20',
      )
      return res
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
  /** A successful payment: it has a receipt to open. */
  hasReceipt?: boolean
  /** For a card-check row: the card it saved (none when refused) and where the refund stands. */
  cardCheck?: {
    saved: boolean
    card: { last4: string | null, brand: string | null, bank: string | null } | null
    refund: CardCheckRefund
  } | null
}

export type CardCheckRefund = 'sent' | 'processed' | 'failed'

/** Where a change of card stands, as the backend reports it. */
export type CardChangeResult
  = | { status: 'changed', card: { last4: string | null, brand: string | null, bank: string | null } | null, refund: CardCheckRefund }
    | { status: 'rejected', message: string, refund: CardCheckRefund }
    | { status: 'pending' }
    | { status: 'not_paid', message: string }

/** Starts a change of the saved card: returns Paystack's page for the small check charge. */
export function useStartCardChange() {
  return useMutation({
    mutationFn: () => httpClient.post<{ redirectUrl: string, reference: string, amountNaira: number }>(
      '/api/subscriptions/card/change',
    ),
  })
}

/** Back from Paystack: asks the backend to finish the change and say where it stands. */
export function useConfirmCardChange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reference: string) => httpClient.post<CardChangeResult>(
      '/api/subscriptions/card/confirm',
      { reference },
    ),
    onSuccess: (result) => {
      if (result.status === 'pending' || result.status === 'not_paid') return
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] })
    },
  })
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
      const res = await httpClient.getAuth<SubscriptionPaymentHistoryPayload>(
        `/api/subscriptions/payment-history?page=${currentPage}&limit=10`,
      )
      return res
    },
    staleTime: 60 * 1000,
  })
}

/** One payment's receipt, as the backend recorded it on the day. */
export interface SubscriptionPaymentReceipt {
  id: string
  kind: 'first_payment' | 'renewal' | 'verification_fee'
  paidAt: string
  totalNaira: number
  lines: Array<{ kind: 'membership' | 'verification_fee', label: string, amountNaira: number }>
  planName: string | null
  termMonths: number | null
  coversFrom: string | null
  coversUntil: string | null
  paymentReference: string | null
  card: { last4: string | null, brand: string | null, bank: string | null } | null
  /** Set when the money was paid outside Paystack. */
  offline?: { method: string, reference: string | null } | null
  /** Set when the payment was recorded by mistake and taken off again. */
  reversedAt?: string | null
  paidBy: { name: string, email: string }
  refund: { amountNaira: number, refundedAt: string } | null
}

export function useSubscriptionPaymentReceipt(
  paymentId: MaybeRef<string>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: computed(() => ['subscription', 'receipt', unref(paymentId)]),
    enabled: options?.enabled !== undefined ? options.enabled : import.meta.client,
    queryFn: async () => {
      const res = await httpClient.getAuth<{ receipt: SubscriptionPaymentReceipt }>(
        `/api/subscriptions/payments/${encodeURIComponent(unref(paymentId))}/receipt`,
      )
      return res.receipt
    },
    // A receipt is a record of something that already happened; only a refund can add to it.
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export type SubscriptionPaymentHistoryStatus = 'paid' | 'failed' | 'refund' | 'pending'

export function formatSubscriptionHistoryAction(action: string): string {
  const labels: Record<string, string> = {
    created: 'Membership',
    renewed: 'Membership renewal',
    verification_fee: 'Verification fee',
    payment_failed: 'Payment failed',
    failed_renewal: 'Renewal failed',
    refund_initiated: 'Refund processing',
    refunded: 'Refund',
    refund_failed: 'Refund failed',
    payment_reversed: 'Payment reversed',
    card_changed: 'Card changed',
    card_check_rejected: 'Card check: card not saved',
  }
  return labels[action] ?? action.replace(/_/g, ' ')
}

export function getSubscriptionHistoryStatus(
  action: string,
): SubscriptionPaymentHistoryStatus {
  if (action === 'refunded') return 'refund'
  if (action === 'refund_initiated') return 'pending'
  if (['payment_failed', 'payment_reversed', 'failed_renewal', 'refund_failed'].includes(action)) {
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
      if (data?.status === 'active' && import.meta.client) {
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
