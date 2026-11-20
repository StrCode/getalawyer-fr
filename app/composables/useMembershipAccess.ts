import { toast } from 'vue-sonner'
import { getSessionUserType } from '~/lib/session-user'

/**
 * What a lawyer may do right now, as the backend decides it.
 *
 * `readOnly` is true when the membership is not on (never paid, payment
 * unfinished, renewal failed, ended, refund in progress). The lawyer can still
 * see everything and finish work with clients they already have, but cannot
 * take new bookings or change their profile, consultation types or
 * availability; the API refuses those with MEMBERSHIP_REQUIRED.
 *
 * It is false until the answer is known, and for clients, so nothing is
 * blocked or announced on a guess.
 */
export function useMembershipAccess() {
  const { session } = useAuth()
  const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
  const { data } = useSubscriptionStatus({ enabled: computed(() => import.meta.client && isLawyer.value) })

  const readOnly = computed(() => isLawyer.value && data.value?.access === 'read_only')
  /** Read-only because there has never been a membership, as opposed to one that lapsed. */
  const neverPaid = computed(() => readOnly.value && !data.value?.subscription)

  /**
   * Call first in anything that changes the profile, consultation types or
   * availability, or accepts a booking: `if (membershipBlocks('change your
   * profile')) return`. When the lawyer is read-only it says why, offers the
   * way to put it right, and returns true. The API refuses these too; this
   * only saves someone filling in a form that cannot be saved.
   */
  function membershipBlocks(what: string): boolean {
    if (!readOnly.value) return false
    toast.error(neverPaid.value ? 'You do not have a membership yet' : 'Your membership is not active', {
      id: 'membership-required',
      description: `${neverPaid.value ? 'Join' : 'Renew'} to ${what}.`,
      action: {
        label: neverPaid.value ? 'Choose a plan' : 'Renew',
        onClick: () => { void navigateTo('/dashboard/subscription') },
      },
    })
    return true
  }

  return { readOnly, neverPaid, membershipBlocks }
}
