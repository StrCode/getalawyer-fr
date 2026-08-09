/** Response from `/api/marketing/subscription-pricing` (proxies law-backend public pricing). */
export interface LawyerMembershipPricing {
  subscriptionPriceNaira: number
  verificationAdminFeeNaira: number
  firstPaymentTotalNaira: number
  renewalPriceNaira: number
  currency: 'NGN'
}

/**
 * Public lawyer annual subscription price for marketing pages.
 */
export function useLawyerMembershipPricing() {
  return useFetch<LawyerMembershipPricing>('/api/marketing/subscription-pricing', {
    key: 'lawyer-subscription-pricing',
  })
}
