import type { MembershipPlansResponse } from '~~/server/api/marketing/subscription-plans.get'

export type { MembershipPlan, MembershipPlansResponse } from '~~/server/api/marketing/subscription-plans.get'

/**
 * Lawyer membership plans for marketing pages, straight from the backend's
 * plan catalog. `data.available` is false when prices could not be loaded;
 * render the unavailable state then, never a made-up price.
 */
export function useMembershipPlans() {
  return useFetch<MembershipPlansResponse>('/api/marketing/subscription-plans', {
    key: 'membership-plans',
  })
}
