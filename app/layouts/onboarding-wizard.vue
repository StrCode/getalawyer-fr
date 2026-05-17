<script lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { provide } from 'vue'
import { useRouter } from '#imports'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'
import { toast } from 'vue-sonner'
import {
  PhCaretRight,
  PhCaretLeft,
  PhCircleNotch,
  PhCheckCircle,
  PhX,
  PhWarningCircle
} from '@phosphor-icons/vue'

// Draft query: initial loading while syncing (lawyers only)
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

export default defineComponent({
  components: {
    PhCaretRight,
    PhCaretLeft,
    PhCircleNotch,
    PhCheckCircle,
    PhX,
    PhWarningCircle
  },
  setup() {
    const lawyerStore = useLawyerOnboardingStore()
    const clientStore = useClientOnboardingStore()

    const {
      currentStep, prevStep, currentIndex, steps, isFirst, isLast,
      nextStep, userType, lawyerUxStepNumber, lawyerUxStepTotal,
    } = useOnboardingNavigation()

    const wizardMounted = ref(false)

    const { useDraft } = useLawyerOnboarding()
    const {
      isPending: isLawyerPending,
      isFetching: isLawyerFetching,
      data: lawyerDraftData,
    } = useDraft({
      enabled: computed(() => userType.value === 'lawyer' && wizardMounted.value),
    })

    const router = useRouter()
    const queryClient = useQueryClient()
    const { refetchSession } = useAuth()

    const store = computed(() => userType.value === 'client' ? clientStore : lawyerStore)

    // Layout loading indicators (clients have instantaneous local renders, lawyers fetch remote status)
    const isPending = computed(
      () =>
        userType.value === 'lawyer'
        && wizardMounted.value
        && isLawyerPending.value
        && !lawyerDraftData.value,
    )
    const isFetching = computed(
      () => userType.value === 'lawyer' && wizardMounted.value && isLawyerFetching.value,
    )

    const validationErrorBanner = computed(() => {
      if (!wizardMounted.value) return null
      const s = store.value as { validationError?: string | null }
      return s.validationError ?? null
    })

    const isSaving = ref(false)
    const isExiting = ref(false)

    /** Lawyer step pages (e.g. professional info) can register async validation before save. */
    const lawyerStepValidate = ref<(() => Promise<boolean>) | null>(null)
    provide('registerLawyerOnboardingStepValidate', (fn: (() => Promise<boolean>) | null) => {
      lawyerStepValidate.value = fn
    })

    /** Navigate only — form state lives in Pinia and survives route changes. Persisting is Next / Exit. */
    const handleBack = () => {
      if (isFirst.value || !prevStep.value) return
      if (userType.value === 'lawyer') {
        lawyerStore.validationError = null
      }
      router.push(prevStep.value.path)
    }

    const handleNext = async () => {
      if (!currentStep.value) return

      isSaving.value = true
      try {
        if (userType.value === 'lawyer' && lawyerStepValidate.value) {
          const stepOk = await lawyerStepValidate.value()
          if (!stepOk) {
            return
          }
        }

        const success = await store.value.saveStep(currentStep.value.key)

        if (success) {
          if (userType.value === 'lawyer' && isLast.value) {
            toast.success('Application submitted', {
              description: 'Your application is now pending review.'
            })
            await router.push('/onboarding/pending')
          } else if (userType.value === 'client' && isLast.value) {
            await refetchSession()
            await queryClient.invalidateQueries({ queryKey: queryKeys.client.profile })
            toast.success('You’re all set', {
              description: 'Your preferences were saved. Opening your dashboard.'
            })
            await router.push('/dashboard')
          } else if (!isLast.value && nextStep.value) {
            router.push(nextStep.value.path)
          }
        } else {
          console.warn('[Wizard] saveStep returned false')
        }
      } catch (e) {
        console.error('[Wizard] Save failed on Next:', e)
      } finally {
        isSaving.value = false
      }
    }

    const handleExit = async () => {
      if (isSaving.value) return

      isExiting.value = true
      isSaving.value = true
      try {
        if (currentStep.value) {
          const saved = await store.value.saveStep(currentStep.value.key)
          if (saved) {
            toast.success('Progress saved', {
              description: 'You can pick up onboarding again from your dashboard.',
            })
          } else {
            toast.warning('Changes may not be saved', {
              description:
                'We could not sync your latest edits. You can return to onboarding from the dashboard.',
            })
          }
        }
        await router.push('/dashboard')
      } catch (e) {
        console.error('[Wizard] Save failed on exit:', e)
        toast.warning('Changes may not be saved', {
          description:
            'We could not sync your latest edits. You can return to onboarding from the dashboard.',
        })
        await router.push('/dashboard')
      } finally {
        isSaving.value = false
        isExiting.value = false
      }
    }

    const isScrolled = ref(false)
    const scrollContainer = ref<HTMLElement | null>(null)

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      isScrolled.value = target.scrollTop > 5
    }

    const scrollListenerOpts: AddEventListenerOptions = { passive: true }

    onMounted(() => {
      wizardMounted.value = true
      scrollContainer.value?.addEventListener('scroll', handleScroll, scrollListenerOpts)
    })

    onUnmounted(() => {
      scrollContainer.value?.removeEventListener('scroll', handleScroll, scrollListenerOpts)
    })

    const progressStepNumber = computed(() => {
      if (userType.value === 'lawyer') {
        return lawyerUxStepNumber.value
      }
      const idx = currentIndex.value
      return idx >= 0 ? idx + 1 : 0
    })

    const progressStepTotal = computed(() => {
      if (userType.value === 'lawyer') {
        return lawyerUxStepTotal.value
      }
      return steps.value.length
    })

    const progressSegments = computed(() => {
      const total = progressStepTotal.value
      if (total <= 0) return []
      return Array.from({ length: total }, (_, i) => i + 1)
    })

    return {
      validationErrorBanner,
      isPending,
      isFetching,
      isSaving,
      isExiting,
      currentStep,
      steps,
      progressStepNumber,
      progressStepTotal,
      progressSegments,
      isFirst,
      isLast,
      userType,
      isScrolled,
      scrollContainer,
      handleBack,
      handleNext,
      handleExit
    }
  }
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/15 selection:text-primary">
    <!-- Header -->
    <header
      class="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background px-4 py-4 transition-all duration-200 sm:px-8 sm:py-5 md:px-12"
      :class="isScrolled ? 'shadow-sm' : ''"
    >
      <AuthLogo class="min-w-0 shrink" />

      <Button
        type="button"
        variant="outline"
        class="h-10 shrink-0 gap-2 rounded-full border-border bg-background px-3.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/60 sm:h-11 sm:px-5"
        :disabled="isSaving"
        :aria-busy="isExiting"
        @click="handleExit"
      >
        <PhCircleNotch
          v-if="isExiting"
          class="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <span v-if="isExiting" class="hidden sm:inline">Saving…</span>
        <template v-else>
          <span class="hidden sm:inline">Save &amp; exit</span>
          <span class="sm:hidden">Save</span>
          <PhX class="size-4 shrink-0 text-muted-foreground" weight="bold" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <!-- Main Content -->
    <main ref="scrollContainer" class="relative flex-1 overflow-y-auto bg-brand-cream-warm">
      <div class="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:px-12 lg:py-16">
         <div v-if="isPending" class="flex flex-col items-center justify-center py-32">
            <PhCircleNotch class="w-10 h-10 text-primary animate-spin mb-4" />
            <p class="font-medium tracking-tight text-muted-foreground">Syncing your progress...</p>
         </div>
         
         <div v-else class="w-full relative min-h-[400px]">
            <!-- Subtle fetch indicator -->
            <transition name="fade">
              <div v-if="isFetching && !isPending" class="absolute -top-10 right-0 flex items-center gap-2">
                 <span class="text-3 font-bold text-primary/40 uppercase tracking-widest">Syncing</span>
                 <PhCircleNotch class="w-4 h-4 text-primary/40 animate-spin" />
              </div>
            </transition>
            
            <slot />
         </div>
      </div>
    </main>

    <!-- Footer: unified progress + navigation -->
    <footer class="z-40 shrink-0 border-t border-border/60 bg-background pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.04)]">
      <div class="relative mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5 md:px-12">
        <!-- Validation error (client-only: avoids SSR/client DOM mismatch on Pinia) -->
        <div
          v-if="validationErrorBanner"
          class="absolute -top-14 left-1/2 z-10 w-full max-w-xl -translate-x-1/2 px-4 sm:-top-16"
        >
          <div
            class="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-red-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 sm:text-sm"
            role="alert"
          >
            <PhWarningCircle class="mt-0.5 size-4 shrink-0 sm:size-5" />
            <span class="whitespace-pre-line">{{ validationErrorBanner }}</span>
          </div>
        </div>

        <template v-if="progressStepTotal > 0 && progressStepNumber > 0">
          <div
            class="mb-4 flex gap-1"
            role="progressbar"
            :aria-valuenow="progressStepNumber"
            aria-valuemin="1"
            :aria-valuemax="progressStepTotal"
            :aria-label="`Step ${progressStepNumber} of ${progressStepTotal}`"
          >
            <span
              v-for="segment in progressSegments"
              :key="segment"
              class="h-1 flex-1 rounded-full transition-colors duration-300"
              :class="segment <= progressStepNumber ? 'bg-primary' : 'bg-muted'"
            />
          </div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-center text-sm font-medium tabular-nums text-foreground sm:text-left">
              Step {{ progressStepNumber }} of {{ progressStepTotal }}
            </p>

            <div class="flex items-center gap-3">
              <Button
                variant="outline"
                class="h-11 shrink-0 px-5 text-base font-medium"
                :disabled="isFirst || isSaving"
                @click="handleBack"
              >
                Back
              </Button>
              <Button
                class="inline-flex h-11 min-w-36 flex-1 items-center justify-center px-8 text-base font-semibold sm:flex-initial"
                :disabled="isSaving"
                @click="handleNext"
              >
                <PhCircleNotch
                  v-if="isSaving && !isExiting"
                  class="mr-2 h-4 w-4 shrink-0 animate-spin"
                />
                <span>
                  {{
                    isSaving && !isExiting
                      ? 'Please wait...'
                      : !isLast
                        ? 'Continue'
                        : userType === 'client'
                          ? 'Save and continue'
                          : 'Submit application'
                  }}
                </span>
              </Button>
            </div>
          </div>
        </template>
      </div>
    </footer>
    <Toaster position="top-right" />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
