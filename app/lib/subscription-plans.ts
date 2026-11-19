/**
 * Membership plans as the subscription endpoints return them, and the two
 * decisions every checkout screen makes about them: which plans can be bought,
 * and which one to start on. Kept free of Nuxt and network code so it can be
 * unit-tested.
 */

/** A plan on sale, as the pricing endpoints return it. */
export interface SubscriptionPlanOption {
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

/** The plan a subscription is on (or moves to), as the status endpoint returns it. */
export interface SubscriptionPlanSummary {
  key: string
  name: string
  termMonths: number
  priceNaira: number
}

/** The parts of the pricing response these helpers read. */
export interface PlanPricingSource {
  subscriptionPriceNaira: number
  verificationAdminFeeNaira: number
  firstPaymentTotalNaira?: number
  plans?: SubscriptionPlanOption[]
}

/**
 * The plans a lawyer can buy. Nothing about the set is assumed: count, names,
 * terms and prices all come from the pricing response. A backend from before
 * plans sells exactly one thing, a one-year membership, which its single-price
 * fields describe.
 */
export function plansOnSale(
  pricing: PlanPricingSource | null | undefined,
): SubscriptionPlanOption[] {
  if (!pricing) return []
  if (pricing.plans?.length) return pricing.plans
  const price = pricing.subscriptionPriceNaira
  if (!(price > 0)) return []
  return [{
    key: 'yearly',
    name: 'One year',
    description: null,
    termMonths: 12,
    priceNaira: price,
    firstPaymentTotalNaira: pricing.firstPaymentTotalNaira && pricing.firstPaymentTotalNaira > 0
      ? pricing.firstPaymentTotalNaira
      : price + (pricing.verificationAdminFeeNaira || 0),
    perMonthNaira: Math.round(price / 12),
    savingsPercent: 0,
    isDefault: true,
  }]
}

/**
 * Which plan to preselect: the first of `preferred` that is still on sale,
 * else the default plan, else the last one listed.
 */
export function pickPlanKey(
  plans: SubscriptionPlanOption[],
  ...preferred: Array<string | null | undefined>
): string | null {
  for (const key of preferred) {
    if (key && plans.some(plan => plan.key === key)) return key
  }
  return (plans.find(plan => plan.isDefault) ?? plans[plans.length - 1])?.key ?? null
}
