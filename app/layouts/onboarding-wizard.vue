<script lang="ts">
import { AlertCircleIcon, Home01Icon, Loading03Icon, Logout01Icon, MoreVerticalIcon, Tick01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
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
    const { refetchSession, session } = useAuth()
    const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })

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

    const accountName = computed(() => session.value?.user?.name || session.value?.user?.email || 'Account')
    const accountEmail = computed(() => session.value?.user?.email || '')

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

    const saveCurrentProgress = async () => {
      if (!currentStep.value || userType.value !== 'lawyer') return true
      const saved = await store.value.saveStep(currentStep.value.key)
      if (saved) {
        toast.success('Progress saved', { duration: 1800 })
        return true
      }
      toast.warning('Could not save progress', {
        description: 'Please check this step and try again.',
      })
      return false
    }

    const handleSaveProgress = async () => {
      if (isSaving.value) return
      isSaving.value = true
      try {
        await saveCurrentProgress()
      } finally {
        isSaving.value = false
      }
    }

    const handleExitToHome = async () => {
      if (isSaving.value) return

      isExiting.value = true
      isSaving.value = true
      try {
        if (userType.value === 'lawyer') {
          const saved = await saveCurrentProgress()
          if (!saved) return
        }
        await router.push('/')
      } catch (e) {
        console.error('[Wizard] Exit failed:', e)
        toast.warning('Changes may not be saved', {
          description: 'We could not sync your latest edits.',
        })
      } finally {
        isSaving.value = false
        isExiting.value = false
      }
    }

    const handleSaveAndSignOut = async () => {
      if (isSaving.value || isSigningOut.value) return
      isSaving.value = true
      try {
        if (userType.value === 'lawyer') {
          const saved = await saveCurrentProgress()
          if (!saved) return
        }
        await handleSignOut('login')
      } finally {
        isSaving.value = false
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

    return {
      AlertCircleIcon,
      Home01Icon,
      Loading03Icon,
      Logout01Icon,
      MoreVerticalIcon,
      Tick01Icon,
      UserCircleIcon,
      validationErrorBanner,
      isPending,
      isFetching,
      isSaving,
      isExiting,
      isSigningOut,
      accountName,
      accountEmail,
      currentStep,
      steps,
      progressStepNumber,
      progressStepTotal,
      sidebarSteps,
      isFirst,
      isLast,
      userType,
      isScrolled,
      scrollContainer,
      handleBack,
      handleNext,
      handleSaveProgress,
      handleExitToHome,
      handleSaveAndSignOut,
      handleSignOut
    }
  }
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/15 selection:text-primary">
    <!-- Header -->
    <header
      class="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background px-4 py-3 transition-all duration-200 sm:px-8 sm:py-3 lg:hidden"
      :class="isScrolled ? 'shadow-sm' : ''"
    >
      <LandingBrandLogo class="min-w-0 shrink" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            variant="outline"
            size="icon"
            class="size-9 shrink-0 cursor-pointer rounded-full border-border bg-background shadow-sm transition-all hover:border-foreground/20 hover:bg-muted hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:border-foreground/30 data-[state=open]:bg-muted data-[state=open]:shadow-md"
            aria-label="Open account menu"
          >
            <HugeiconsIcon :icon="UserCircleIcon" class="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-60" :side-offset="8">
          <DropdownMenuLabel class="font-normal">
            <div class="truncate text-sm font-medium text-foreground">{{ accountName }}</div>
            <div v-if="accountEmail" class="truncate text-xs text-muted-foreground">{{ accountEmail }}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-if="userType === 'lawyer'" :disabled="isSaving" @click="handleSaveProgress">
            <HugeiconsIcon :icon="Tick01Icon" class="size-4" />
            Save progress
          </DropdownMenuItem>
          <DropdownMenuItem :disabled="isSaving" @click="handleExitToHome">
            <HugeiconsIcon :icon="Home01Icon" class="size-4" />
            {{ userType === 'lawyer' ? 'Save and leave' : 'Leave onboarding' }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            :disabled="isSaving || isSigningOut"
            @click="userType === 'lawyer' ? handleSaveAndSignOut() : handleSignOut('login')"
          >
            <HugeiconsIcon :icon="Logout01Icon" class="size-4" />
            {{ isSigningOut ? 'Signing out...' : userType === 'lawyer' ? 'Save and sign out' : 'Sign out' }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>

    <!-- Flex container for Sidebar + Main -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (lg+ only) -->
      <aside class="app-scrollbar hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border/50 bg-card/35 lg:flex">
        <div class="border-b border-border/40 px-8 py-7">
          <LandingBrandLogo class="min-w-0" />
        </div>

        <nav aria-label="Progress" class="px-8 py-10">
          <Stepper
            orientation="vertical"
            :model-value="progressStepNumber"
            class="flex flex-col gap-0"
          >
            <StepperItem
              v-for="(step, stepIdx) in sidebarSteps"
              :key="step.label"
              v-slot="{ state }"
              :step="step.stepNum"
              class="relative flex w-full items-start gap-4"
              :class="stepIdx === sidebarSteps.length - 1 ? 'pb-1' : 'pb-9'"
            >
              <StepperSeparator
                v-if="stepIdx !== sidebarSteps.length - 1"
                class="absolute left-[13px] top-8 block h-[calc(100%-1rem)] w-px shrink-0 rounded-full bg-border/70 group-data-[state=completed]:bg-primary"
              />

              <StepperTrigger as-child>
                <Button
                  type="button"
                  :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                  size="icon"
                  class="z-10 size-7 shrink-0 rounded-full"
                  :class="state === 'active' ? 'ring-1 ring-primary ring-offset-2 ring-offset-card' : ''"
                >
                  <HugeiconsIcon
                    v-if="state === 'completed'"
                    :icon="Tick01Icon"
                    class="size-3.5"
                  />
                  <span
                    v-else
                    class="size-2.5 rounded-full"
                    :class="state === 'active' ? 'bg-primary-foreground' : 'bg-muted-foreground/30'"
                  />
                </Button>
              </StepperTrigger>

              <div class="min-w-0 flex-1 pt-0.5">
                <StepperTitle
                  class="text-sm font-medium tracking-normal whitespace-normal"
                  :class="[
                    state === 'active' || state === 'completed' ? 'text-foreground' : 'text-muted-foreground',
                    state === 'active' ? 'font-semibold text-primary' : ''
                  ]"
                >
                  {{ step.label }}
                </StepperTitle>

                <StepperDescription
                  v-if="step.isActive && step.subRoutes.length > 1"
                  class="mt-2.5 flex flex-col gap-2 text-xs"
                >
                  <span
                    v-for="sub in step.subRoutes"
                    :key="sub.label"
                    class="flex items-center gap-2"
                    :class="sub.isCurrent ? 'font-medium text-primary' : (sub.isDone ? 'text-foreground' : 'text-muted-foreground')"
                  >
                    <span
                      class="size-1.5 rounded-full"
                      :class="sub.isCurrent ? 'bg-primary' : (sub.isDone ? 'bg-foreground/40' : 'bg-muted-foreground/30')"
                    />
                    {{ sub.label }}
                  </span>
                </StepperDescription>
              </div>
            </StepperItem>
          </Stepper>
        </nav>

        <div class="mt-auto border-t border-border/40 px-8 py-6">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                class="group h-auto w-full cursor-pointer justify-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-all hover:border-border hover:bg-background hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:border-border data-[state=open]:bg-background data-[state=open]:shadow-sm"
              >
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-foreground/20 group-hover:text-foreground">
                  <HugeiconsIcon :icon="UserCircleIcon" class="size-4 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-foreground">{{ accountName }}</span>
                  <span v-if="accountEmail" class="block truncate text-xs text-muted-foreground">{{ accountEmail }}</span>
                </span>
                <span class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                  <HugeiconsIcon :icon="MoreVerticalIcon" class="size-4" aria-hidden="true" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-64" side="top" align="end" :side-offset="8">
              <DropdownMenuLabel class="font-normal text-muted-foreground">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="userType === 'lawyer'" :disabled="isSaving" @click="handleSaveProgress">
                <HugeiconsIcon :icon="Tick01Icon" class="size-4" />
                Save progress
              </DropdownMenuItem>
              <DropdownMenuItem :disabled="isSaving" @click="handleExitToHome">
                <HugeiconsIcon :icon="Home01Icon" class="size-4" />
                {{ userType === 'lawyer' ? 'Save and leave' : 'Leave onboarding' }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                :disabled="isSaving || isSigningOut"
                @click="userType === 'lawyer' ? handleSaveAndSignOut() : handleSignOut('login')"
              >
                <HugeiconsIcon :icon="Logout01Icon" class="size-4" />
                {{ isSigningOut ? 'Signing out...' : userType === 'lawyer' ? 'Save and sign out' : 'Sign out' }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <!-- Main Content -->
      <main ref="scrollContainer" class="app-scrollbar relative flex flex-1 flex-col overflow-y-auto bg-background">
        <div class="relative mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:px-8 lg:py-12">
           <div class="relative w-full">
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
            <div class="mt-6 flex flex-col gap-4 pt-5 border-t border-border/40 sm:flex-row sm:items-center sm:justify-between">
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
