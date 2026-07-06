<script lang="ts">
import { AlertCircleIcon, Cancel01Icon, Loading03Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { LAWYER_UX_STEP_LABELS, LAWYER_STEP_UX_NUMBER } from '~/lib/lawyer-onboarding-steps'

import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { provide } from 'vue'
import { useRouter } from '#imports'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'
import { toast } from 'vue-sonner'
// Draft query: initial loading while syncing (lawyers only)
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

export default defineComponent({
  components: {
    HugeiconsIcon,
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
    const canSaveAndExit = computed(() => userType.value === 'lawyer')

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
              description: 'Complete your annual subscription payment on the next screen.',
            })
            await router.push('/onboarding/subscription')
          } else if (userType.value === 'client' && isLast.value) {
            await refetchSession()
            await queryClient.invalidateQueries({ queryKey: queryKeys.client.profile })
            toast.success('You’re all set', {
              description: 'Your preferences were saved. Opening your dashboard.'
            })
            await router.push('/dashboard')
          } else if (!isLast.value && nextStep.value) {
            toast.success('Saved', { duration: 1500 })
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
      if (isSaving.value || !canSaveAndExit.value) return

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

    const sidebarSteps = computed(() => {
      const isClient = userType.value === 'client'
      const total = progressStepTotal.value
      
      return Array.from({ length: total }).map((_, idx) => {
        const stepNum = idx + 1
        const isActive = progressStepNumber.value === stepNum
        const isCompleted = progressStepNumber.value > stepNum
        
        let label = ''
        if (isClient) {
           label = idx === 0 ? 'Location' : 'Legal needs'
        } else {
           label = LAWYER_UX_STEP_LABELS[idx]
        }
        
        // Find sub-routes (paths) for this UX step
        const subRoutes = steps.value.filter(s => {
          if (isClient) {
            // Client: index maps 1:1 to step
            const currentStepIdx = steps.value.indexOf(s)
            return currentStepIdx === idx
          } else {
            // Lawyer: use mapping
            return LAWYER_STEP_UX_NUMBER[s.key as keyof typeof LAWYER_STEP_UX_NUMBER] === stepNum
          }
        })
        
        return {
          stepNum,
          label,
          isActive,
          isCompleted,
          isUpcoming: progressStepNumber.value < stepNum,
          subRoutes: subRoutes.map(s => ({
            label: s.label,
            isCurrent: currentStep.value?.key === s.key,
            isDone: isCompleted || (isActive && steps.value.indexOf(s) < currentIndex.value)
          }))
        }
      })
    })

    const progressSegments = computed(() => {
      const total = progressStepTotal.value
      if (total <= 0) return []
      return Array.from({ length: total }, (_, i) => i + 1)
    })

    return {
      AlertCircleIcon,
      Cancel01Icon,
      Loading03Icon,
      Tick01Icon,
      validationErrorBanner,
      isPending,
      isFetching,
      isSaving,
      isExiting,
      currentStep,
      canSaveAndExit,
      steps,
      progressStepNumber,
      progressStepTotal,
      progressSegments,
      sidebarSteps,
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
      class="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background px-4 py-3 transition-all duration-200 sm:px-8 sm:py-3 md:px-12"
      :class="isScrolled ? 'shadow-sm' : ''"
    >
      <LandingBrandLogo class="min-w-0 shrink" />

      <Button
        v-if="canSaveAndExit"
        type="button"
        variant="outline"
        class="h-8 shrink-0 gap-2 border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted sm:h-9 sm:px-4"
        :disabled="isSaving"
        :aria-busy="isExiting"
        @click="handleExit"
      >
        <HugeiconsIcon :icon="Loading03Icon"
          v-if="isExiting"
          class="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <span v-if="isExiting" class="hidden sm:inline">Saving…</span>
        <template v-else>
          <span class="hidden sm:inline">Save &amp; exit</span>
          <span class="sm:hidden">Save</span>
          <HugeiconsIcon :icon="Cancel01Icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <!-- Flex container for Sidebar + Main -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (lg+ only) -->
      <aside class="hidden lg:flex w-64 flex-col overflow-y-auto border-r border-border/40 bg-background px-6 py-8">
        <nav aria-label="Progress">
          <ol role="list" class="overflow-hidden">
            <li v-for="(step, stepIdx) in sidebarSteps" :key="step.label" class="relative pb-10">
              <!-- Connecting line -->
              <div v-if="stepIdx !== sidebarSteps.length - 1"
                   class="absolute left-3 top-3 -ml-px mt-0.5 h-full w-px"
                   :class="step.isCompleted ? 'bg-primary' : 'bg-border/60'"
                   aria-hidden="true" />
                   
              <div class="relative flex items-start group">
                <span class="h-9 flex items-center" aria-hidden="true">
                  <span v-if="step.isCompleted" class="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors">
                    <HugeiconsIcon :icon="Tick01Icon" class="size-3.5 text-primary-foreground" />
                  </span>
                  <span v-else-if="step.isActive" class="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary ring-offset-1 ring-offset-background">
                    <span class="size-2.5 rounded-full bg-primary" />
                  </span>
                  <span v-else class="relative z-10 flex size-6 items-center justify-center rounded-full bg-muted/60 ring-1 ring-inset ring-border">
                    <span class="size-2.5 rounded-full bg-transparent" />
                  </span>
                </span>
                <span class="ml-4 flex min-w-0 flex-col w-full">
                  <span class="text-sm font-medium tracking-tight mt-1.5"
                        :class="[
                          step.isActive || step.isCompleted ? 'text-foreground' : 'text-muted-foreground',
                          step.isActive ? 'text-primary font-semibold' : ''
                        ]">
                    {{ step.label }}
                  </span>
                  
                  <!-- Sub routes (lawyer flow) -->
                  <div v-if="step.isActive && step.subRoutes.length > 1" class="mt-2 flex flex-col gap-2">
                    <div v-for="sub in step.subRoutes" :key="sub.label" 
                         class="flex items-center gap-2 text-xs"
                         :class="sub.isCurrent ? 'text-primary font-medium' : (sub.isDone ? 'text-foreground' : 'text-muted-foreground')">
                      <div class="size-1.5 rounded-full" :class="sub.isCurrent ? 'bg-primary' : (sub.isDone ? 'bg-foreground/40' : 'bg-muted-foreground/30')" />
                      {{ sub.label }}
                    </div>
                  </div>
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </aside>

      <!-- Main Content -->
      <main ref="scrollContainer" class="relative flex-1 overflow-y-auto bg-background flex flex-col">
        <div class="relative mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:px-8 lg:py-12 flex flex-1 flex-col">
           <div class="w-full relative min-h-[400px] flex-1">
            <!-- Subtle fetch indicator -->
            <transition name="fade">
              <div v-if="isFetching || isPending" class="absolute -top-10 right-0 flex items-center gap-2">
                 <span class="text-xs font-bold text-primary/40 uppercase tracking-widest">Syncing</span>
                 <HugeiconsIcon :icon="Loading03Icon" class="w-4 h-4 text-primary/40 animate-spin" />
              </div>
            </transition>
            
            <slot />
          </div>

          <!-- Validation error -->
          <div
            v-if="validationErrorBanner"
            class="mt-8 w-full"
          >
            <div
              class="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-destructive shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 sm:text-sm"
              role="alert"
            >
              <HugeiconsIcon :icon="AlertCircleIcon" class="mt-0.5 size-4 shrink-0 sm:size-5" />
              <span class="whitespace-pre-line">{{ validationErrorBanner }}</span>
            </div>
          </div>

          <!-- Integrated Footer / Navigation -->
          <template v-if="progressStepTotal > 0 && progressStepNumber > 0">
            <div class="mt-12 flex flex-col gap-6 pt-6 border-t border-border/40 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-center text-sm font-medium tabular-nums text-muted-foreground sm:text-left lg:hidden">
                Step {{ progressStepNumber }} of {{ progressStepTotal }}
              </p>

              <div class="flex items-center justify-end w-full sm:w-auto gap-3">
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
                  <HugeiconsIcon :icon="Loading03Icon"
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
      </main>
    </div>
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
