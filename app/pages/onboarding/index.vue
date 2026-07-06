<script setup lang="ts">
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useLawyerOnboarding, useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import {
  resolveLawyerAwaitingApprovalPath,
  resolveLawyerOnboardingDestination,
} from '~/composables/useLawyerOnboardingEntry'
import { isLawyerAwaitingApproval } from '~/lib/lawyerOnboardingStatus'
import { LAWYER_UX_STEP_LABELS } from '~/lib/lawyer-onboarding-steps'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: ['auth'],
})

const route = useRoute()
const queryClient = useQueryClient()
const { session } = useAuth()
const { firstStep, userType, steps } = useOnboardingNavigation()
const store = useLawyerOnboardingStore()
const { useDraft, useDiscardDraft } = useLawyerOnboarding()
const { mutateAsync: discardDraftApi } = useDiscardDraft()

const isRouting = ref(false)
const isError = ref(false)
const hasRouted = ref(false)
const showWelcome = ref(true)

const isLawyer = computed(() => userType.value === 'lawyer')
const firstName = computed(() => {
  const fullName = session.value?.user?.name
  if (!fullName) return 'User'
  return fullName.split(' ')[0]
})

const {
  data: draftResponse,
  isPending: isDraftPending,
  error: draftFetchError,
  refetch: refetchDraft,
} = useDraft({
  enabled: computed(() => isLawyer.value && import.meta.client),
})

const {
  data: statusPayload,
  isPending: isStatusPending,
  refetch: refetchStatus,
} = useLawyerOnboardingStatus({
  enabled: computed(() => isLawyer.value && import.meta.client),
})

const entryQueriesReady = computed(
  () => !isDraftPending.value && !isStatusPending.value,
)

const shouldSkipWelcome = computed(() => {
  return isLawyer.value && route.query.new === '1'
})

async function routeLawyerToDestination() {
  if (hasRouted.value) return

  isRouting.value = true
  isError.value = false

  try {
    if (route.query.new === '1') {
      try {
        await discardDraftApi()
      } catch {
      }
      store.resetStore()
      hasRouted.value = true
      await navigateTo(firstStep.value?.path || '/onboarding/personal-info', { replace: true })
      return
    }

    const status = statusPayload.value ?? null

    let destination: string
    if (status && isLawyerAwaitingApproval(status)) {
      destination = await resolveLawyerAwaitingApprovalPath(queryClient)
    } else {
      destination = resolveLawyerOnboardingDestination({
        user: session.value?.user ?? null,
        draft: draftResponse.value ?? null,
        lawyerSteps: steps.value,
        status,
      })
    }

    hasRouted.value = true
    await navigateTo(destination, { replace: true })
  } catch (e) {
    console.error('[Onboarding] Failed to resolve lawyer entry route', e)
    isError.value = true
    isRouting.value = false
  }
}

function handleGetStarted() {
  showWelcome.value = false
  if (userType.value === 'client') {
    hasRouted.value = true
    void navigateTo(firstStep.value?.path || '/onboarding/location', { replace: true })
  } else {
    isRouting.value = true
    void routeLawyerToDestination()
  }
}

watch(
  () =>
    [
      userType.value,
      entryQueriesReady.value,
      draftFetchError.value,
      draftResponse.value,
      statusPayload.value,
    ] as const,
  () => {
    if (showWelcome.value && !shouldSkipWelcome.value) return

    if (userType.value === 'client') {
      if (!showWelcome.value) {
        hasRouted.value = true
        void navigateTo(firstStep.value?.path || '/onboarding/location', { replace: true })
      }
      return
    }

    if (import.meta.server || !isLawyer.value) return
    if (!entryQueriesReady.value) return
    if (hasRouted.value) return

    if (draftFetchError.value) {
      const status = (draftFetchError.value as { response?: { status?: number } })?.response
        ?.status
      if (status === 404) {
        if (!showWelcome.value) void routeLawyerToDestination()
        return
      }
      isError.value = true
      isRouting.value = false
      return
    }

    if (!showWelcome.value || shouldSkipWelcome.value) void routeLawyerToDestination()
  },
  { flush: 'post', immediate: true },
)

// Auto-skip welcome for lawyers with ?new=1
watch(
  [shouldSkipWelcome, entryQueriesReady],
  ([skip, ready]) => {
    if (skip && ready && !hasRouted.value) {
      showWelcome.value = false
      isRouting.value = true
      void routeLawyerToDestination()
    }
  },
  { flush: 'post' },
)

function refresh() {
  hasRouted.value = false
  isError.value = false
  isRouting.value = true
  void Promise.all([refetchDraft(), refetchStatus()])
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-5.75rem)] flex-col items-center justify-center px-6 py-12">
    <!-- Welcome Screen -->
    <div v-if="showWelcome && !isError" class="mx-auto w-full max-w-lg space-y-8 rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-sm text-center">
      <div class="space-y-2">
        <h1 class="text-2xl font-medium text-foreground sm:text-3xl tracking-tight">
          Welcome, {{ firstName }} 👋
        </h1>
        <p class="text-base text-muted-foreground">
          {{ isLawyer ? "Let's get your practice ready for review. This takes about 10 minutes." : "Let's personalize your lawyer recommendations. This takes about 2 minutes." }}
        </p>
      </div>

      <!-- Step preview list -->
      <div class="mx-auto max-w-sm text-left">
        <template v-if="!isLawyer">
          <div class="flex items-center gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">1</div>
            <div class="text-sm font-medium text-foreground">Location</div>
          </div>
          <div class="ml-4 h-4 w-px bg-border/60 my-1" aria-hidden="true" />
          <div class="flex items-center gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">2</div>
            <div class="text-sm font-medium text-foreground">Legal interests</div>
          </div>
        </template>
        
        <template v-else>
          <div v-for="(label, idx) in LAWYER_UX_STEP_LABELS" :key="label">
            <div class="flex items-center gap-4">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">{{ idx + 1 }}</div>
              <div class="text-sm font-medium text-foreground">{{ label }}</div>
            </div>
            <div v-if="idx < LAWYER_UX_STEP_LABELS.length - 1" class="ml-4 h-4 w-px bg-border/60 my-1" aria-hidden="true" />
          </div>
        </template>
      </div>

      <div class="pt-4">
        <Button class="h-12 w-full text-base font-semibold" @click="handleGetStarted" :disabled="isLawyer && !entryQueriesReady">
          <HugeiconsIcon v-if="isRouting" :icon="Loading03Icon" class="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          Get started
        </Button>
        <p v-if="isLawyer && draftResponse" class="mt-4 text-xs text-muted-foreground">
          You have a saved draft — we'll pick up where you left off.
        </p>
      </div>
    </div>

    <!-- Loading skeleton (shown while routing after clicking Get Started) -->
    <div v-else-if="isRouting && !isError" class="mx-auto w-full max-w-md space-y-6 rounded-2xl p-8 text-center">
      <Skeleton class="mx-auto size-16 rounded-full" />
      <Skeleton class="mx-auto h-6 w-3/4 rounded-lg" />
      <Skeleton class="mx-auto h-4 w-1/2 rounded-lg" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="isError"
      class="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
    >
      <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <HugeiconsIcon :icon="AlertCircleIcon" class="size-8" aria-hidden="true" />
      </div>
     <h1 class="mb-2 text-xl font-medium text-foreground">
        Could not load your progress
      </h1>
      <p class="mb-6 text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <Button class="h-11 w-full font-medium" @click="refresh">
        Retry
      </Button>
    </div>
  </div>
</template>
