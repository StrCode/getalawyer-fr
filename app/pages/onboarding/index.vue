<script setup lang="ts">
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { PhCircleNotch, PhWarningCircle, PhHouse, PhPlus, PhArrowRight } from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: ['auth'],
})

const { session } = useAuth()
const { getPathByState, firstStep, userType } = useOnboardingNavigation()

const { useDraft, useDiscardDraft } = useLawyerOnboarding()
const store = useLawyerOnboardingStore()

const { mutateAsync: discardDraftApi, isPending: isDiscarding } = useDiscardDraft()

const firstName = computed(() => {
  return session.value?.user?.name?.split(' ')[0] || ''
})

const isVerifyingDraft = ref(true)
const existingDraft = ref<any>(null)
const isRestoring = ref(false)
const isError = ref(false)

const { data: draftResponse, isPending: isDraftFetchPending, error: draftFetchError, refetch } = useDraft()

watchEffect(() => {
  if (userType.value === 'client') {
    navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
    return
  }

  /** Draft query is client-only; on SSR pending is false and data is absent — don't mis-route. */
  if (import.meta.server) return

  if (isDraftFetchPending.value) return

  if (draftFetchError.value) {
    const status = (draftFetchError.value as any)?.response?.status
    if (status === 404) {
      startNewListingBypass()
    } else {
      isError.value = true
      isVerifyingDraft.value = false
    }
    return
  }

  if (draftResponse.value) {
    const payload = draftResponse.value.data
    const hasResumePayload =
      payload != null &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      Object.keys(payload).length > 0

    if (hasResumePayload) {
      existingDraft.value = draftResponse.value
      isVerifyingDraft.value = false
    } else {
      startNewListingBypass()
    }
  } else {
    startNewListingBypass()
  }
})

function startNewListingBypass() {
  store.resetStore()
  navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
}

async function startNewListing() {
  if (isDiscarding.value) return
  try {
    await discardDraftApi()
    store.resetStore()
    navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
  } catch (err) {
    console.warn("Failed to clear draft", err)
    // Even if deletion fails locally, we can still route to start over
    store.resetStore()
    navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
  }
}

function restoreDraft() {
  isRestoring.value = true
  const stepPathRaw =
    existingDraft.value.last_step || existingDraft.value.lastStep || 'personal_info'
  const destination = getPathByState(stepPathRaw)
  navigateTo(destination, { replace: true })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const refresh = () => {
  isError.value = false
  isVerifyingDraft.value = true
  refetch()
}
</script>

<template>
  <div class="min-h-[calc(100dvh-5.75rem)] flex flex-col items-center justify-center bg-gray-50 py-12 px-6">
    <!-- Initial Loading State -->
    <div v-if="isVerifyingDraft" class="flex flex-col items-center justify-center space-y-4">
      <PhCircleNotch class="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
      <p class="text-gray-500 font-medium tracking-tight">Checking application status...</p>
    </div>

    <div v-else-if="isError" class="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
      <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <PhWarningCircle class="w-8 h-8" />
      </div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">Sync Error</h1>
      <p class="text-gray-500 mb-6">We couldn't retrieve your application status. Please verify your connection and try again.</p>
      <Button variant="default" class="w-full h-12 text-base font-semibold" @click="refresh">
        Retry Sync
      </Button>
    </div>

    <!-- Welcome Back Splash -->
    <div v-else class="w-full max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 text-center sm:text-left">
        Welcome back{{ firstName ? ', ' + firstName : '' }}
      </h1>

      <div class="space-y-8">
        <!-- Finish Action -->
        <div class="space-y-3">
          <h2 class="text-xl font-medium text-gray-900">Continue your application</h2>

          <button
            type="button"
            :disabled="isRestoring"
            class="w-full group text-left bg-white border border-gray-200 hover:border-gray-900 rounded-2xl p-4 sm:p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-between"
            @click="restoreDraft"
          >
            <div class="flex items-center gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition-colors group-hover:bg-gray-200">
                <PhHouse class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <p class="font-semibold text-gray-900 group-hover:text-black">
                  Lawyer Onboarding
                </p>
                <p class="text-sm text-gray-500">
                  Started {{ (existingDraft?.last_saved_at || existingDraft?.lastSavedAt) ? formatDate(existingDraft.last_saved_at || existingDraft.lastSavedAt) : 'recently' }}
                </p>
              </div>
            </div>

            <div class="pr-2">
              <PhCircleNotch v-if="isRestoring" class="w-5 h-5 text-gray-400 animate-spin" />
              <PhArrowRight v-else class="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
        </div>

        <!-- Start New Action -->
        <div class="space-y-3">
          <h2 class="text-xl font-medium text-gray-900">Start over</h2>

          <button
            type="button"
            :disabled="isDiscarding"
            class="w-full group text-left bg-white border border-gray-200 hover:border-red-600 rounded-2xl p-4 sm:p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 flex items-center justify-between"
            @click="startNewListing"
          >
            <div class="flex items-center gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                <PhPlus class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <p class="font-semibold text-gray-900 group-hover:text-red-600">Create a new application</p>
                <p class="text-sm text-gray-500">This will permanently delete your in-progress draft.</p>
              </div>
            </div>

            <div class="pr-2">
              <PhCircleNotch v-if="isDiscarding" class="w-5 h-5 text-gray-400 animate-spin" />
              <PhArrowRight v-else class="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>