/**
 * The plan a visitor picked on the pricing page, remembered on this device so
 * checkout can start on it after they have registered and filled in their
 * application. It is only a starting selection: checkout still shows every
 * plan on sale and ignores a remembered plan that is no longer sold.
 */
const STORAGE_KEY = 'gal_preferred_plan'

export function rememberPreferredPlan(planKey: string | null | undefined): void {
  if (!import.meta.client || !planKey) return
  try {
    localStorage.setItem(STORAGE_KEY, planKey)
  }
  catch {
    // Storage can be blocked (private window, site data off). Checkout then starts on the default plan.
  }
}

export function readPreferredPlan(): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  }
  catch {
    return null
  }
}

export function forgetPreferredPlan(): void {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // Nothing to clear if storage is unavailable.
  }
}
