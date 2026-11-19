/**
 * Lawyer membership plans for marketing pages.
 * Proxies law-backend GET /api/public/subscriptions/pricing.
 *
 * Nothing about the plan set is assumed here: the count, names, terms, prices,
 * which plan is the default and the verification fee all come from the backend.
 * If it cannot be reached the response says so (`available: false`) and pages
 * show an "unavailable" state; there is deliberately no hard-coded price fallback.
 */

export interface MembershipPlan {
  key: string
  name: string
  description: string | null
  termMonths: number
  priceNaira: number
  /** Price plus the one-off verification fee charged on a first checkout. */
  firstPaymentTotalNaira: number
  perMonthNaira: number
  /** Saving against the monthly plan over the same months, whole percent (0 = none). */
  savingsPercent: number
  isDefault: boolean
}

export interface MembershipPlansResponse {
  available: boolean
  plans: MembershipPlan[]
  defaultPlanKey: string | null
  verificationAdminFeeNaira: number
  currency: 'NGN'
}

interface BackendPricing {
  plans?: Array<Partial<MembershipPlan>>
  defaultPlanKey?: string | null
  verificationAdminFeeNaira?: number
  // Single-price fields from backends that predate plans (a one-year membership).
  subscriptionPriceNaira?: number
}

const UNAVAILABLE: MembershipPlansResponse = {
  available: false,
  plans: [],
  defaultPlanKey: null,
  verificationAdminFeeNaira: 0,
  currency: 'NGN',
}

const isPositive = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0

export default defineEventHandler(async (): Promise<MembershipPlansResponse> => {
  const config = useRuntimeConfig()

  try {
    const payload = await $fetch<{ data?: BackendPricing }>(
      `${config.public.apiUrl}/api/public/subscriptions/pricing`,
      { method: 'GET', timeout: 4000 },
    )
    const data = payload?.data
    if (!data) return UNAVAILABLE

    const fee = typeof data.verificationAdminFeeNaira === 'number' && data.verificationAdminFeeNaira >= 0
      ? Math.round(data.verificationAdminFeeNaira)
      : 0

    let plans: MembershipPlan[] = (data.plans ?? [])
      .filter(p => p.key && p.name && isPositive(p.priceNaira) && isPositive(p.termMonths))
      .map((p) => {
        const priceNaira = Math.round(p.priceNaira!)
        const termMonths = Math.round(p.termMonths!)
        return {
          key: String(p.key),
          name: String(p.name),
          description: p.description ?? null,
          termMonths,
          priceNaira,
          firstPaymentTotalNaira: isPositive(p.firstPaymentTotalNaira) ? Math.round(p.firstPaymentTotalNaira) : priceNaira + fee,
          perMonthNaira: isPositive(p.perMonthNaira) ? Math.round(p.perMonthNaira) : Math.round(priceNaira / termMonths),
          savingsPercent: typeof p.savingsPercent === 'number' && p.savingsPercent > 0 ? Math.round(p.savingsPercent) : 0,
          isDefault: Boolean(p.isDefault),
        }
      })

    // A backend from before plans sells exactly one thing: a one-year membership.
    if (plans.length === 0 && isPositive(data.subscriptionPriceNaira)) {
      const priceNaira = Math.round(data.subscriptionPriceNaira)
      plans = [{
        key: 'yearly',
        name: 'One year',
        description: null,
        termMonths: 12,
        priceNaira,
        firstPaymentTotalNaira: priceNaira + fee,
        perMonthNaira: Math.round(priceNaira / 12),
        savingsPercent: 0,
        isDefault: true,
      }]
    }

    if (plans.length === 0) return UNAVAILABLE

    const defaultPlanKey = plans.find(p => p.isDefault)?.key
      ?? (data.defaultPlanKey && plans.some(p => p.key === data.defaultPlanKey) ? data.defaultPlanKey : plans[plans.length - 1]!.key)

    return {
      available: true,
      plans: plans.map(p => ({ ...p, isDefault: p.key === defaultPlanKey })),
      defaultPlanKey,
      verificationAdminFeeNaira: fee,
      currency: 'NGN',
    }
  }
  catch (error) {
    console.error('[api/marketing/subscription-plans] proxy error:', error)
    return UNAVAILABLE
  }
})
