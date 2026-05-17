<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import {
  fetchLawyerDashboardMe,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import {
  isLawyerAwaitingApproval,
  isPendingApprovalDashboard,
  type LawyerDashboardMePayload,
  type OnboardingStatusPayload
} from '~/lib/lawyerOnboardingStatus'
import {
  PhCircleNotch,
  PhCheckCircle,
  PhFileSearch,
  PhEnvelope,
  PhClock,
  PhWarningCircle,
  PhSignOut
} from '@phosphor-icons/vue'

definePageMeta({
  layout: 'listing-wizard',
  middleware: ['auth']
})

const router = useRouter()
const { session, signOut } = useAuth()

const {
  data: statusPayload,
  isPending: statusPending,
  isError: statusError,
  refetch: refetchStatus,
} = useLawyerOnboardingStatus()

const {
  data: dashboardPayload,
  isPending: dashboardPending,
  isError: dashboardError,
  refetch: refetchDashboard
} = useQuery<LawyerDashboardMePayload>({
  queryKey: ['lawyer', 'dashboard', 'me'],
  queryFn: fetchLawyerDashboardMe,
  staleTime: 30 * 1000
})

const loading = computed(() => statusPending.value || dashboardPending.value)

const showSpinner = computed(() => {
  const st = statusPayload.value
  const dash = dashboardPayload.value
  if (st != null && (isLawyerAwaitingApproval(st) || st.application_status === 'rejected')) {
    return false
  }
  if (
    dash != null &&
    (isPendingApprovalDashboard(dash) ||
      dash.application_status === 'rejected' ||
      dash.status === 'rejected')
  ) {
    return false
  }
  return loading.value
})

const statusUnavailable = computed(
  () => !loading.value && statusError.value && dashboardError.value
)

const isAwaiting = computed(() => {
  const st = statusPayload.value
  const dash = dashboardPayload.value
  return (
    (st != null && isLawyerAwaitingApproval(st)) ||
    (dash != null && isPendingApprovalDashboard(dash))
  )
})

const isRejected = computed(() => {
  const st = statusPayload.value
  const dash = dashboardPayload.value
  return (
    st?.application_status === 'rejected' ||
    dash?.application_status === 'rejected' ||
    dash?.status === 'rejected'
  )
})

const submittedAt = computed(() => {
  const st = statusPayload.value
  const dash = dashboardPayload.value
  if (st?.submitted_at) return st.submitted_at
  return dash?.submittedAt ?? null
})

const formatSubmitted = (iso: string | null) => {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return null
  }
}

watchEffect(() => {
  const u = session.value?.user as {
    onboarding_completed?: boolean
    userType?: string
    role?: string
  } | null
  const ut = u?.userType ?? u?.role
  if (ut && ut !== 'lawyer') {
    router.replace('/dashboard')
  }
  if (u?.onboarding_completed) {
    router.replace('/dashboard')
  }
})

watchEffect(() => {
  if (showSpinner.value) return
  if ((session.value?.user as { onboarding_completed?: boolean })?.onboarding_completed) return
  if (statusUnavailable.value) return
  if (isAwaiting.value || isRejected.value) return

  router.replace('/onboarding')
})

async function retryStatus() {
  await Promise.all([refetchStatus(), refetchDashboard()])
}
</script>

<template>
  <div class="text-center">
    <div v-if="showSpinner" class="flex flex-col items-center justify-center gap-3 py-20">
      <PhCircleNotch class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm font-medium text-gray-500">Loading your application status…</p>
    </div>

    <div v-else-if="statusUnavailable" class="mx-auto max-w-md space-y-4 py-12">
      <p class="text-sm text-gray-600">
        We could not load your application status. Check your connection and try again.
      </p>
      <Button class="w-full font-semibold" @click="retryStatus"> Retry </Button>
    </div>

    <div v-else-if="isRejected">
      <div class="mb-12 text-center">
        <div
          class="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-red-50 text-red-600 shadow-lg"
        >
          <PhWarningCircle class="h-10 w-10" weight="fill" />
        </div>
        <h1 class="text-title mb-3">Application Rejected</h1>
        <p class="text-subtitle mx-auto max-w-md font-medium">
          Unfortunately, your application was not approved. You can review the issues and resubmit after making the
          necessary changes.
        </p>
      </div>

      <div class="mt-12">
        <Button
          as-child
          class="h-14 rounded-xl bg-gray-900 px-10 font-bold text-white shadow-lg transition-all hover:bg-black active:scale-95"
        >
          <NuxtLink to="/onboarding">Update Application</NuxtLink>
        </Button>
      </div>
    </div>

    <template v-else-if="isAwaiting">
      <div class="mb-12 text-center">
        <div
          class="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-primary shadow-lg"
        >
          <PhCheckCircle class="h-10 w-10" weight="fill" />
        </div>
        <h1 class="text-title mb-3">Application Submitted</h1>
        <p class="text-subtitle mx-auto max-w-md font-medium">
          Our team is currently reviewing your profile and credentials. We'll notify you once your application has been
          verified.
        </p>
        <p v-if="formatSubmitted(submittedAt)" class="mt-4 text-sm font-semibold text-gray-700">
          Submitted {{ formatSubmitted(submittedAt) }}
        </p>
      </div>

      <div class="mt-8">
        <div
          class="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-left transition-all hover:shadow-sm"
        >
          <h3 class="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">What happens next?</h3>
          <ul class="space-y-5 text-gray-600">
            <li class="flex items-start">
              <div class="mr-4 shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                <PhFileSearch class="h-5 w-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Verification Review</p>
                <p class="text-xs font-medium text-gray-500">
                  Our verification team will review your submitted credentials.
                </p>
              </div>
            </li>
            <li class="flex items-start">
              <div class="mr-4 shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                <PhEnvelope class="h-5 w-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Email Notification</p>
                <p class="text-xs font-medium text-gray-500">
                  We'll notify you via email once approved or if we need further information.
                </p>
              </div>
            </li>
            <li class="flex items-start">
              <div class="mr-4 shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                <PhClock class="h-5 w-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-bold text-gray-900">Processing Time</p>
                <p class="text-xs font-medium text-gray-500">This process typically takes 1-2 business days.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center gap-4">
        <Button variant="ghost" as-child class="font-bold text-gray-500 underline-offset-4 hover:underline">
          <NuxtLink to="/">Return to Home</NuxtLink>
        </Button>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
          @click="signOut()"
        >
          <PhSignOut class="h-4 w-4" />
          Sign out
        </button>
        <button
          v-if="statusError || dashboardError"
          type="button"
          class="text-xs font-medium text-primary underline"
          @click="retryStatus"
        >
          Refresh status
        </button>
      </div>
    </template>
  </div>
</template>
