import { describe, expect, it } from 'vitest'
import { pickPlanKey, plansOnSale, type SubscriptionPlanOption } from '../app/lib/subscription-plans'

function plan(key: string, termMonths: number, priceNaira: number, isDefault = false): SubscriptionPlanOption {
  return {
    key,
    name: key,
    description: null,
    termMonths,
    priceNaira,
    firstPaymentTotalNaira: priceNaira + 500,
    perMonthNaira: Math.round(priceNaira / termMonths),
    savingsPercent: 0,
    isDefault,
  }
}

const catalog = [plan('monthly', 1, 5000), plan('half_yearly', 6, 10000), plan('yearly', 12, 15000, true)]

describe('plansOnSale', () => {
  it('returns nothing until pricing has loaded', () => {
    expect(plansOnSale(null)).toEqual([])
    expect(plansOnSale(undefined)).toEqual([])
  })

  it('returns the plans exactly as the backend lists them', () => {
    const plans = plansOnSale({ subscriptionPriceNaira: 15000, verificationAdminFeeNaira: 500, plans: catalog })
    expect(plans).toBe(catalog)
  })

  it('describes a backend from before plans as a single one-year plan', () => {
    const plans = plansOnSale({ subscriptionPriceNaira: 30000, verificationAdminFeeNaira: 500, firstPaymentTotalNaira: 30500 })
    expect(plans).toHaveLength(1)
    expect(plans[0]).toMatchObject({
      key: 'yearly',
      termMonths: 12,
      priceNaira: 30000,
      firstPaymentTotalNaira: 30500,
      perMonthNaira: 2500,
      isDefault: true,
    })
  })

  it('adds the verification fee itself when the old backend sends no first-payment total', () => {
    const [only] = plansOnSale({ subscriptionPriceNaira: 30000, verificationAdminFeeNaira: 500 })
    expect(only?.firstPaymentTotalNaira).toBe(30500)
  })

  it('offers nothing when there is no usable price', () => {
    expect(plansOnSale({ subscriptionPriceNaira: 0, verificationAdminFeeNaira: 500, plans: [] })).toEqual([])
  })
})

describe('pickPlanKey', () => {
  it('starts on the default plan when nothing is preferred', () => {
    expect(pickPlanKey(catalog)).toBe('yearly')
  })

  it('takes the first preferred plan that is still on sale', () => {
    expect(pickPlanKey(catalog, null, 'monthly', 'half_yearly')).toBe('monthly')
    expect(pickPlanKey(catalog, undefined, 'half_yearly')).toBe('half_yearly')
  })

  it('ignores a preferred plan that is no longer sold', () => {
    expect(pickPlanKey(catalog, 'quarterly')).toBe('yearly')
    expect(pickPlanKey(catalog, 'quarterly', 'monthly')).toBe('monthly')
  })

  it('falls back to the last plan listed when none is marked default', () => {
    expect(pickPlanKey([plan('monthly', 1, 5000), plan('yearly', 12, 15000)])).toBe('yearly')
  })

  it('returns null when there are no plans', () => {
    expect(pickPlanKey([], 'monthly')).toBeNull()
  })
})
