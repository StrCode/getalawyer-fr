<script lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { useRouter } from '#imports'
import { 
  PhScales, 
  PhCaretRight, 
  PhCaretLeft, 
  PhCircleNotch, 
  PhCheckCircle,
  PhSignOut
} from '@phosphor-icons/vue'

// We still need useStatus to show the initial loading state while syncing (Lawyers ONLY)
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

export default defineComponent({
  components: {
    PhScales,
    PhCaretRight,
    PhCaretLeft,
    PhCircleNotch,
    PhCheckCircle,
    PhSignOut
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
    
    // Fallback for notifications until we fully switch to sonner
    const { $ui } = useNuxtApp() as any
    const toast = {
      add: (params: any) => {
        // Nuxt UI fallback
        if (process.client) {
          (window as any).$nuxt?.$ui?.toast?.add(params)
        }
      }
    }

    // Dynamic resolution of the active store interface
    const store = computed(() => userType.value === 'client' ? clientStore : lawyerStore)

    // Layout loading indicators (clients have instantaneous local renders, lawyers fetch remote status)
    const isPending = computed(() => userType.value === 'lawyer' ? isLawyerPending.value : false)
    const isFetching = computed(() => userType.value === 'lawyer' ? isLawyerFetching.value : false)

    const isSaving = ref(false)

const handleBack = async () => {
  if (isFirst.value || !currentStep.value) return
  
  isSaving.value = true
  try {
      // Save draft of current page before going back
      await store.value.saveStep(currentStep.value.key)
    } catch (e) {
       console.error('[Wizard] Auto-save failed on Back:', e)
  } finally {
    isSaving.value = false
  }
  
  if (prevStep.value) {
    router.push(prevStep.value.path)
  }
}

const handleNext = async () => {
  if (!currentStep.value) return

  isSaving.value = true
  try {
    const success = await store.value.saveStep(currentStep.value.key)
    
    if (success) {
      if (!isLast.value && nextStep.value) {
         router.push(nextStep.value.path)
      } else if (isLast.value) {
         // Final submit logic handled by pages
      }
    } else {
      console.warn('Save failed')
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
     await store.value.saveStep(currentStep.value.key).catch(() => {})
     isSaving.value = false
  }
  await router.push('/dashboard')
}

const isScrolled = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  isScrolled.value = target.scrollTop > 5
}

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', handleScroll)
})

    return {
      isPending,
      isFetching,
      isSaving,
      sectionProgress,
      isFirst,
      isLast,
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
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
           <PhScales class="w-6 h-6 text-white" />
        </div>
        <span class="text-xl font-bold tracking-tight text-gray-900">Getalawyer</span>
      </div>

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
                 <span class="text-[11px] font-bold text-primary/40 uppercase tracking-widest">Auto-saving</span>
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

      <div class="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-6 order-2 sm:order-1">
          <Button
            variant="ghost"
            class="min-h-12 text-base underline underline-offset-4 font-normal"
            :disabled="isFirst || isSaving"
            @click="handleBack"
          >
            Back
          </Button>
          
          <p class="hidden lg:block text-[11px] text-gray-400 max-w-[320px] leading-snug">
            By clicking Continue, you agree to Getalawyer's 
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
              {{ isSaving ? 'Please wait...' : isLast ? 'Submit Application' : 'Next' }}
            </span>
          </Button>
        </div>
      </div>
    </footer>
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

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
