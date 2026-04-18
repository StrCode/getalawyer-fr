<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { useToast, useRouter } from '#imports' // fallback for notifications

// We still need useStatus to show the initial loading state while syncing (Lawyers ONLY)
import { useLawyerOnboarding } from '~/composables/useLawyerOnboarding'

export default defineComponent({
  setup() {
    const { useStatus } = useLawyerOnboarding()
    const { data: lawyerStatus, isPending: isLawyerPending, isFetching: isLawyerFetching } = useStatus()

    const lawyerStore = useLawyerOnboardingStore()
    const clientStore = useClientOnboardingStore()

    const { 
       currentStep, prevStep, currentIndex, steps, isFirst, isLast, 
       nextStep, sectionProgress, userType 
    } = useOnboardingNavigation()

    const router = useRouter()
    const toast = useToast()

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
         // Final submit logic will naturally be in the review step, or if we want it here:
         // If it's already on the review step, the page itself manages the submit
         // but if not, we handle it. The store resolves to true basically.
      }
    } else {
      toast.add({
        title: 'Save Failed',
        description: 'Please correct the errors before proceeding.',
        color: 'red'
      })
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
        <div class="w-10 h-10 rounded-xl bg-primary-blue flex items-center justify-center shadow-sm">
           <UIcon name="i-heroicons-scale" class="w-6 h-6 text-white" />
        </div>
        <span class="text-xl font-bold tracking-tight text-gray-900">Getalawyer</span>
      </div>

      <div class="flex items-center gap-3">
        <UButton 
          variant="ghost" 
          color="neutral" 
          size="md" 
          class="font-medium text-gray-600 hover:text-gray-900"
          @click="handleExit"
        >
          Exit & Save
        </UButton>
      </div>
    </header>

    <!-- Main Content -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto relative bg-white border-t border-gray-50">
      <div class="max-w-4xl mx-auto py-16 px-6 sm:px-10 lg:px-12 relative z-10 w-full transition-all duration-300">
         <div v-if="isPending" class="flex flex-col items-center justify-center py-32">
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary-blue animate-spin mb-4" />
            <p class="text-gray-500 font-medium tracking-tight">Syncing your progress...</p>
         </div>
         
         <div v-else class="w-full relative min-h-[400px]">
            <!-- Subtle fetch indicator -->
            <transition name="fade">
              <div v-if="isFetching && !isPending" class="absolute -top-10 right-0 flex items-center gap-2">
                 <span class="text-[11px] font-bold text-primary-200 uppercase tracking-widest">Auto-saving</span>
                 <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-primary-200 animate-spin" />
              </div>
            </transition>
            
            <slot />
         </div>
      </div>
    </main>

    <!-- Footer (Etsy Pattern) -->
    <footer class="border-t border-gray-100 shrink-0 bg-white z-40 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.03)] pb-safe">
      <!-- Segmented Progress Bar -->
      <div class="flex h-1 gap-1 px-1">
        <div 
          v-for="(seg, i) in sectionProgress" 
          :key="i"
          class="relative overflow-hidden flex-1 rounded-full bg-gray-100"
          :style="{ flex: seg.size }"
        >
          <div 
            class="absolute inset-y-0 left-0 bg-primary-blue transition-all duration-700 ease-out"
            :style="{ width: seg.pct + '%' }"
          />
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-6 order-2 sm:order-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xl"
            class="font-semibold text-gray-500 hover:text-gray-900 underline-offset-4 hover:underline transition-all"
            :disabled="isFirst || isSaving"
            @click="handleBack"
          >
            Back
          </UButton>
          
          <p class="hidden lg:block text-[11px] text-gray-400 max-w-[320px] leading-snug">
            By clicking Continue, you agree to Getalawyer's 
            <a href="#" class="text-primary-blue hover:underline">Terms of Use</a> and 
            <a href="#" class="text-primary-blue hover:underline">Privacy Policy</a>.
          </p>
        </div>
        
        <div class="flex items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
          <UButton
            color="primary"
            size="xl"
            class="w-full sm:w-auto px-12 font-bold bg-gray-900 hover:bg-black text-white rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            :loading="isSaving"
            @click="handleNext"
            :icon="isLast ? 'i-heroicons-check' : 'i-heroicons-arrow-right'"
            trailing
          >
            {{ isSaving ? 'Saving...' : isLast ? 'Submit Application' : 'Continue' }}
          </UButton>
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
