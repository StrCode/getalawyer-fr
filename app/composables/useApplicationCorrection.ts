import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'

/** Sending a corrected application back, paying its fee, and stopping instead. */
interface FeePayment { redirectUrl: string, reference: string, amountNaira: number }
type ResubmitResult = { submitted: true, payment: null } | { submitted: false, payment: FeePayment }
export type FeeResult =
  | { status: 'paid', resubmitted: boolean }
  | { status: 'pending' }
  | { status: 'not_paid', message: string }
  | { status: 'unknown' }

function useRefreshApplication() {
  const queryClient = useQueryClient()
  return () => Promise.all([
    queryClient.refetchQueries({ queryKey: queryKeys.lawyerOnboarding.status }),
    queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.draft }),
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
    queryClient.invalidateQueries({ queryKey: ['subscription', 'payment-history'] }),
    queryClient.invalidateQueries({ queryKey: ['user', 'session'] }),
  ])
}

export function useResubmitCorrection() {
  const refresh = useRefreshApplication()
  return useMutation({
    mutationFn: () => httpClient.post<ResubmitResult>('/api/onboarding/correction/resubmit'),
    onSuccess: async (result) => {
      if (result.submitted) await refresh()
    },
  })
}

export function useConfirmVerificationFee() {
  const refresh = useRefreshApplication()
  return useMutation({
    mutationFn: (reference: string | null) =>
      httpClient.post<FeeResult>('/api/onboarding/correction/confirm-payment', reference ? { reference } : {}),
    onSuccess: refresh,
  })
}

export function useWithdrawApplication() {
  const refresh = useRefreshApplication()
  return useMutation({
    mutationFn: (note: string) => httpClient.post<{ refundNaira: number }>('/api/onboarding/correction/withdraw', { note }),
    onSuccess: refresh,
  })
}
