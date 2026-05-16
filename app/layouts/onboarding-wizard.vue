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
  PhSignOut,
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
    PhSignOut,
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
      if (currentStep.value) {
        isSaving.value = true
        try {
          const saved = await store.value.saveStep(currentStep.value.key)
          if (!saved) {
            toast.warning('Changes may not be saved', {
              description:
                'We could not sync your latest edits. You can return to onboarding from the dashboard.'
            })
          }
        } catch (e) {
          console.error('[Wizard] Save failed on exit:', e)
          toast.warning('Changes may not be saved', {
            description:
              'We could not sync your latest edits. You can return to onboarding from the dashboard.'
          })
        } finally {
          isSaving.value = false
        }
      }
      await router.push('/dashboard')
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

    return {
      validationErrorBanner,
      isPending,
      isFetching,
      isSaving,
      sectionProgress,
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
  <div class="h-screen flex flex-col overflow-hidden bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
    <!-- Header -->
    <header 
      class="px-8 md:px-12 py-5 flex items-center justify-between shrink-0 transition-all duration-200 z-30"
      :class="isScrolled ? 'border-b border-gray-100 bg-white/80 backdrop-blur-md' : ''"
    >
      <AppHeaderBrand variant="wordmark" />

      <div class="flex items-center gap-3">
        <Button 
          variant="ghost" 
          class="font-medium text-gray-600 hover:text-gray-900 gap-2"
          @click="handleExit"
        >
          <PhSignOut class="w-4 h-4" />
          Exit & Save
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto relative bg-white border-t border-gray-50">
      <div class="max-w-4xl mx-auto py-16 px-6 sm:px-10 lg:px-12 relative z-10 w-full transition-all duration-300">
         <div v-if="isPending" class="flex flex-col items-center justify-center py-32">
            <PhCircleNotch class="w-10 h-10 text-primary animate-spin mb-4" />
            <p class="text-gray-500 font-medium tracking-tight">Syncing your progress...</p>
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

    <!-- Footer (Etsy Pattern) -->
    <footer class="border-t border-gray-100 shrink-0 bg-white z-40 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.03)] pb-safe">
      <!-- Progress bar: 3 segments sized proportionally to step count, with gaps -->
      <div class="flex h-1 gap-1">
        <div
          v-for="(seg, i) in sectionProgress"
          :key="i"
          class="relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          :style="{ flex: seg.size }"
        >
          <div
            class="absolute inset-y-0 left-0 bg-black dark:bg-white transition-all duration-300 ease-out"
            :style="{ width: seg.pct + '%' }"
          />
        </div>
      </div>

      <div class="relative max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
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
          
          <p class="hidden lg:block text-3 text-gray-400 max-w-[320px] leading-snug">
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
            class="min-h-10 px-8 bg-black text-white hover:bg-gray-800 disabled:opacity-50 font-medium w-full sm:w-auto"
            :disabled="isSaving"
            @click="handleNext"
          >
            <PhCircleNotch
              v-if="isSaving"
              class="animate-spin w-5 h-5 mr-2 shrink-0"
            />
            <span>
              {{
                isSaving
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
