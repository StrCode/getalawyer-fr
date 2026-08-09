/**
 * Public marketing pricing for lawyer annual subscription.
 * Proxies to law-backend GET /api/public/subscriptions/pricing.
 */

interface PublicSubscriptionPricingData {
  subscriptionPriceNaira: number
  verificationAdminFeeNaira: number
  firstPaymentTotalNaira: number
  renewalPriceNaira: number
  currency: 'NGN'
}

interface PublicSubscriptionPricingResponse {
  success?: boolean
  data?: Partial<PublicSubscriptionPricingData>
}

const FALLBACK_PRICING: PublicSubscriptionPricingData = {
  subscriptionPriceNaira: 30_000,
  verificationAdminFeeNaira: 500,
  firstPaymentTotalNaira: 30_500,
  renewalPriceNaira: 30_000,
  currency: 'NGN',
}

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  const url = `${config.public.apiUrl}/api/public/subscriptions/pricing`

  try {
    const payload = await $fetch<PublicSubscriptionPricingResponse>(url, {
      method: 'GET',
      timeout: 4000,
    })

    const data = payload?.data
    if (
      data
      && Number.isFinite(data.subscriptionPriceNaira)
      && data.subscriptionPriceNaira! > 0
      && Number.isFinite(data.verificationAdminFeeNaira)
      && data.verificationAdminFeeNaira! >= 0
    ) {
      const subscriptionPriceNaira = Math.round(data.subscriptionPriceNaira!)
      const verificationAdminFeeNaira = Math.round(data.verificationAdminFeeNaira!)
      const firstPaymentTotalNaira = Number.isFinite(data.firstPaymentTotalNaira)
        ? Math.round(data.firstPaymentTotalNaira!)
        : subscriptionPriceNaira + verificationAdminFeeNaira
      return {
        subscriptionPriceNaira,
        verificationAdminFeeNaira,
        firstPaymentTotalNaira,
        renewalPriceNaira: Number.isFinite(data.renewalPriceNaira)
          ? Math.round(data.renewalPriceNaira!)
          : subscriptionPriceNaira,
        currency: 'NGN' as const,
      }
    }
  }
  catch (error) {
    console.error('[api/marketing/subscription-pricing] proxy error:', error)
  }

  return FALLBACK_PRICING
})
