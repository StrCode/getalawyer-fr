<script setup lang="ts">
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useLawyerOnboarding, useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  resolveLawyerAwaitingApprovalPath,
  resolveLawyerOnboardingDestination,
} from '~/composables/useLawyerOnboardingEntry'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { isLawyerAwaitingApproval } from '~/lib/lawyerOnboardingStatus'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

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

const isRouting = ref(true)
const isError = ref(false)
const hasRouted = ref(false)

const isLawyer = computed(() => userType.value === 'lawyer')

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
    const destination = status && isLawyerAwaitingApproval(status)
      ? await resolveLawyerAwaitingApprovalPath(queryClient)
      : resolveLawyerOnboardingDestination({
          user: session.value?.user ?? null,
          draft: draftResponse.value ?? null,
          lawyerSteps: steps.value,
          status,
        })

    hasRouted.value = true
    await navigateTo(destination, { replace: true })
  } catch (e) {
    console.error('[Onboarding] Failed to resolve lawyer entry route', e)
    isError.value = true
    isRouting.value = false
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
    if (hasRouted.value || import.meta.server) return

    if (userType.value === 'client') {
      hasRouted.value = true
      void navigateTo(firstStep.value?.path || '/onboarding/location', { replace: true })
      return
    }

    if (!isLawyer.value || !entryQueriesReady.value) return

    if (draftFetchError.value) {
      const status = (draftFetchError.value as { response?: { status?: number } })?.response
        ?.status
      if (status !== 404) {
        isError.value = true
        isRouting.value = false
        return
      }
    }

    void routeLawyerToDestination()
  },
  { flush: 'post', immediate: true },
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
    <div
      v-if="isRouting && !isError"
      class="mx-auto flex w-full max-w-sm flex-col items-center gap-4 px-4 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <HugeiconsIcon
        :icon="Loading03Icon"
        class="size-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <div class="space-y-1.5">
        <p class="text-base font-medium text-foreground">
          Loading your application
        </p>
        <p class="text-sm text-muted-foreground">
          Checking your progress and opening the right step…
        </p>
      </div>
    </div>

    <div
      v-else-if="isError"
      class="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs"
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
      <Button class="h-11 w-full cursor-pointer font-medium" @click="refresh">
        Retry
      </Button>
    </div>
  </div>
</template>
