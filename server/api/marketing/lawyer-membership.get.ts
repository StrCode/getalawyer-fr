/**
 * Public marketing pricing for lawyer membership (NGN / month).
 * Source of truth can be upstream API (when configured); otherwise Nitro/env default.
 */

type PricingPayload = {
  monthlyAmountNgn?: number
  currency?: string
}

function coerceAmount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0)
    return Math.round(value)
  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) {
    const n = Math.round(Number.parseFloat(value))
    return n > 0 ? n : undefined
  }
  return undefined
}

function extractFromBody(body: unknown): number | undefined {
  if (!body || typeof body !== 'object')
    return undefined

  const b = body as Record<string, unknown>
  const nested = (b.data && typeof b.data === 'object')
    ? b.data as Record<string, unknown>
    : undefined

  return coerceAmount(b.monthlyAmountNgn ?? b.amountNgn ?? b.priceNgn ?? b.monthly_ngn)
    ?? coerceAmount(nested?.monthlyAmountNgn ?? nested?.amountNgn ?? nested?.priceNgn)
}

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  const fallback = Number(config.lawyerMembershipMonthlyNgn) > 0
    ? Math.round(Number(config.lawyerMembershipMonthlyNgn))
    : 20_000

  const sourceUrl = typeof config.lawyerMembershipPriceSourceUrl === 'string'
    ? config.lawyerMembershipPriceSourceUrl.trim()
    : ''

  let monthlyAmountNgn = fallback
  let source: 'remote' | 'config' = 'config'

  if (sourceUrl) {
    try {
      const payload = await $fetch<PricingPayload | Record<string, unknown>>(sourceUrl, {
        method: 'GET',
        timeout: 4000,
      })

      const fromRemote = extractFromBody(payload ?? {})
      if (fromRemote !== undefined && fromRemote > 0) {
        monthlyAmountNgn = fromRemote
        source = 'remote'
      }
    }
    catch {
      // Ignore; fallback below stays valid for marketing SSR.
    }
  }

  return {
    monthlyAmountNgn,
    currency: 'NGN' as const,
    source,
  }
})
