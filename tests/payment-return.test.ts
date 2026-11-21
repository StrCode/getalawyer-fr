import { describe, expect, it } from 'vitest'
import { paymentReturn } from '../app/lib/payment-return'

describe('paymentReturn', () => {
  it('sends a renewal paid from the dashboard back to Membership', () => {
    const back = paymentReturn('dashboard')
    expect(back.done).toBe('/dashboard/subscription')
    expect(back.retry).toBe('/dashboard/subscription')
    expect(back.retryLabel).toBe('Back to Membership')
  })

  it('sends a first payment from the application back to the application', () => {
    const back = paymentReturn('application')
    expect(back.done).toBe('/application')
    expect(back.retry).toBe('/application/membership')
  })

  it('treats an unknown or missing start as the application, where most first payments begin', () => {
    expect(paymentReturn(null).done).toBe('/application')
    expect(paymentReturn('somewhere-else').done).toBe('/application')
  })
})
