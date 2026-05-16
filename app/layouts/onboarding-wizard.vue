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
    const { useDraft } = useLawyerOnboarding()
    const { isPending: isLawyerPending, isFetching: isLawyerFetching } = useDraft()

    const lawyerStore = useLawyerOnboardingStore()
    const clientStore = useClientOnboardingStore()

    const { 
       currentStep, prevStep, currentIndex, steps, isFirst, isLast, 
       nextStep, sectionProgress, userType 
    } = useOnboardingNavigation()

    const router = useRouter()
    const queryClient = useQueryClient()

    // Dynamic resolution of the active store interface
    const store = computed(() => userType.value === 'client' ? clientStore : lawyerStore)

    // Lawyer draft only runs on client; without this gate SSR renders the slot while the first
    // client paint would show "Syncing...", causing hydration mismatches.
    const wizardMounted = ref(false)

    // Layout loading indicators (clients have instantaneous local renders, lawyers fetch remote status)
    const isPending = computed(
      () => userType.value === 'lawyer' && wizardMounted.value && isLawyerPending.value
    )
    const isFetching = computed(
      () => userType.value === 'lawyer' && wizardMounted.value && isLawyerFetching.value
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
            await queryClient.invalidateQueries({ queryKey: ['user', 'session'] })
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
      const idx = currentIndex.value
      return idx >= 0 ? idx + 1 : 0
    })

    /** Weighted across onboarding sections (matches former segmented bar logic). */
    const overallProgress = computed(() => {
      const segs = sectionProgress.value
      if (!segs.length) return 0
      const totalSize = segs.reduce((sum, s) => sum + (s.size ?? 0), 0)
      const filled = segs.reduce((sum, s) => sum + (s.pct / 100) * (s.size ?? 0), 0)
      return Math.round((filled / totalSize) * 100)
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
      overallProgress,
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
      class="z-30 flex shrink-0 items-center justify-between gap-4 px-4 py-4 transition-all duration-200 sm:px-8 sm:py-5 md:px-12"
      :class="isScrolled ? 'border-b border-border bg-background/90 backdrop-blur-md' : ''"
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
    <main ref="scrollContainer" class="relative flex-1 overflow-y-auto border-t border-border/60 bg-background">
      <div class="max-w-4xl mx-auto py-16 px-6 sm:px-10 lg:px-12 relative z-10 w-full transition-all duration-300">
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

    <!-- Footer -->
    <footer class="z-40 shrink-0 border-t border-border bg-background pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.04)]">
      <div
        v-if="steps.length > 0 && progressStepNumber > 0"
        class="border-b border-border/60 bg-muted/25 px-4 py-3 sm:px-6 md:px-12"
      >
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <div class="flex items-center justify-between gap-3 text-sm">
            <p class="shrink-0 font-medium tabular-nums text-foreground">
              Step {{ progressStepNumber }} of {{ steps.length }}
            </p>
            <p
              v-if="currentStep"
              class="min-w-0 truncate text-muted-foreground"
            >
              {{ currentStep.label }}
            </p>
          </div>
          <Progress
            :model-value="overallProgress"
            class="h-1 bg-muted"
          />
        </div>
      </div>

      <div class="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-6 sm:flex-row">
        <!-- Validation error (client-only: avoids SSR/client DOM mismatch on Pinia) -->
        <div v-if="validationErrorBanner" class="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
          <div class="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
             <PhWarningCircle class="w-4 h-4" />
             {{ validationErrorBanner }}
          </div>
        </div>

        <div class="flex items-center gap-6 order-2 sm:order-1">
          <Button
            variant="ghost"
            class="min-h-12 text-base underline underline-offset-4 font-normal"
            :disabled="isFirst || isSaving"
            @click="handleBack"
          >
            Back
          </Button>
          
          <p class="hidden max-w-[320px] text-xs leading-snug text-muted-foreground lg:block">
            <template v-if="userType === 'client' && isLast">
              By saving and continuing, you agree to Getalawyer's
            </template>
            <template v-else>
              By clicking Continue, you agree to Getalawyer's
            </template>
            <a href="#" class="text-primary hover:underline">Terms of Use</a> and
            <a href="#" class="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
        
        <div class="flex items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
          <Button
            class="min-h-10 w-full px-8 font-medium sm:w-auto"
            :disabled="isSaving"
            @click="handleNext"
          >
            <PhCircleNotch
              v-if="isSaving && !isExiting"
              class="mr-2 size-5 shrink-0 animate-spin"
            />
            <span>
              {{
                isSaving && !isExiting
                  ? 'Please wait...'
                  : !isLast
                    ? 'Next'
                    : userType === 'client'
                      ? 'Save and continue'
                      : 'Submit Application'
              }}
            </span>
          </Button>
        </div>
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
