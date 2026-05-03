/** Response from `/api/marketing/lawyer-membership` */
export interface LawyerMembershipPricing {
  monthlyAmountNgn: number
  currency: 'NGN'
  source?: 'remote' | 'config'
}

export function formatMembershipNgn(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Public lawyer membership monthly price for marketing/checkout copy.
 */
export function useLawyerMembershipPricing() {
  return useFetch<LawyerMembershipPricing>('/api/marketing/lawyer-membership', {
    key: 'lawyer-membership-pricing',
  })
}
