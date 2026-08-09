<script lang="ts">
import { AlertCircleIcon, Home01Icon, Loading03Icon, Logout01Icon, MoreVerticalIcon, Tick01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { LAWYER_UX_STEP_LABELS, LAWYER_STEP_UX_NUMBER } from '~/lib/lawyer-onboarding-steps'

import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useClientOnboardingStore } from '~/stores/clientOnboardingStore'
import { useOnboardingNavigation } from '~/composables/useOnboardingNavigation'
import { nextTick, provide } from 'vue'
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
    const showLeaveConfirm = ref(false)
    // Deferred past the dropdown's close/refocus so the dialog keeps focus.
    const openLeaveConfirm = () => nextTick(() => { showLeaveConfirm.value = true })
    const confirmLeave = async () => {
      showLeaveConfirm.value = false
      await handleExitToHome()
    }

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
            await router.push(nextStep.value.path)
          }
        } else if (!validationErrorBanner.value && !(store.value as { termsError?: string | null }).termsError) {
          // Validation failures surface in the banner (or inline for terms);
          // a false with neither is a failed draft save.
          toast.error("Couldn't save your progress", {
            description: 'Check your connection and try again.',
          })
        }
      } catch (e) {
        console.error('[Wizard] Save failed on Next:', e)
        toast.error("Couldn't save your progress", {
          description: 'Check your connection and try again.',
        })
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

    const CLIENT_UX_STEPS = [
      { label: 'Location', description: 'Where you need legal help' },
      { label: 'Legal needs', description: 'The kinds of matters you care about' },
    ] as const

    const LAWYER_UX_DESCRIPTIONS = [
      'Identity details and NIN verification',
      'Bar credentials and how you practise',
      'Check everything, then submit',
    ] as const

    const sidebarHeading = computed(() =>
      userType.value === 'client' ? 'Set up your account' : 'Lawyer application',
    )

    const sidebarProgressPct = computed(() => {
      if (progressStepTotal.value <= 0) return 0
      return Math.round((progressStepNumber.value / progressStepTotal.value) * 100)
    })

    const accountInitials = computed(() => {
      const parts = String(accountName.value || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
      if (parts.length >= 2) {
        return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
      }
      return (parts[0] ?? 'A').slice(0, 2).toUpperCase()
    })

    const sidebarSteps = computed(() => {
      const isClient = userType.value === 'client'
      const total = progressStepTotal.value

      return Array.from({ length: total }).map((_, idx) => {
        const stepNum = idx + 1
        const isActive = progressStepNumber.value === stepNum
        const isCompleted = progressStepNumber.value > stepNum

        const label = isClient
          ? (CLIENT_UX_STEPS[idx]?.label ?? `Step ${stepNum}`)
          : (LAWYER_UX_STEP_LABELS[idx] ?? `Step ${stepNum}`)

        const description = isClient
          ? (CLIENT_UX_STEPS[idx]?.description ?? '')
          : (LAWYER_UX_DESCRIPTIONS[idx] ?? '')

        const subRoutes = steps.value.filter((s) => {
          if (isClient) {
            return steps.value.indexOf(s) === idx
          }
          return LAWYER_STEP_UX_NUMBER[s.key as keyof typeof LAWYER_STEP_UX_NUMBER] === stepNum
        })

        return {
          stepNum,
          label,
          description,
          isActive,
          isCompleted,
          isUpcoming: progressStepNumber.value < stepNum,
          subRoutes: subRoutes.map(s => ({
            label: s.label,
            isCurrent: currentStep.value?.key === s.key,
            isDone: isCompleted || (isActive && steps.value.indexOf(s) < currentIndex.value),
          })),
        }
      })
    })

    // Mobile disambiguation: consecutive sub-screens of one perceived step
    // otherwise both read "Step N of M".
    const currentSubStep = computed(() => {
      const active = sidebarSteps.value.find(step => step.isActive)
      if (!active || active.subRoutes.length <= 1) return null
      const idx = active.subRoutes.findIndex(sub => sub.isCurrent)
      if (idx === -1) return null
      return { label: active.subRoutes[idx]!.label, index: idx + 1, total: active.subRoutes.length }
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
      sidebarHeading,
      sidebarProgressPct,
      accountInitials,
      currentSubStep,
      isFirst,
      isLast,
      userType,
      isScrolled,
      scrollContainer,
      handleBack,
      handleNext,
      handleSaveProgress,
      handleExitToHome,
      showLeaveConfirm,
      confirmLeave,
      handleSaveAndSignOut,
      handleSignOut
    }
  }
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/15 selection:text-primary">
    <!-- Header (mobile / tablet) -->
    <header
      class="z-30 flex shrink-0 flex-col border-b border-border/40 bg-background transition-all duration-200 lg:hidden"
      :class="isScrolled ? 'shadow-sm' : ''"
    >
      <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
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
            <DropdownMenuItem :disabled="isSaving" @select="openLeaveConfirm">
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

      <div
        v-if="progressStepTotal > 0 && progressStepNumber > 0"
        class="flex gap-1.5 px-4 pb-3 sm:px-8"
        aria-hidden="true"
      >
        <div
          v-for="n in progressStepTotal"
          :key="n"
          class="h-1 flex-1 rounded-full transition-colors duration-300"
          :class="n <= progressStepNumber ? 'bg-primary' : 'bg-border'"
        />
      </div>
    </header>

    <!-- Flex container for Sidebar + Main -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (lg+ only) -->
      <aside
        class="app-scrollbar relative hidden w-84 shrink-0 flex-col overflow-y-auto bg-foreground text-background lg:flex"
      >
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 opacity-[0.06]"
          aria-hidden="true"
          style="background-image: radial-gradient(circle at 85% 90%, oklch(0.55 0.06 161) 0%, transparent 45%);"
        />

        <div class="relative z-10 flex flex-1 flex-col px-7 py-8">
          <LandingBrandLogo
            class="min-w-0"
            on-dark
            :show-wordmark="false"
          />

          <div class="mt-10">
            <p class="text-2xs font-medium tracking-[0.14em] text-background/45 uppercase">
              {{ sidebarHeading }}
            </p>
            <div class="mt-3 flex items-end justify-between gap-3">
              <p class="text-sm font-medium text-background/80">
                Step {{ progressStepNumber }} of {{ progressStepTotal }}
              </p>
              <p class="text-xs tabular-nums text-background/40">
                {{ sidebarProgressPct }}%
              </p>
            </div>
            <div
              class="mt-3 h-1 overflow-hidden rounded-full bg-background/10"
              role="progressbar"
              :aria-valuenow="sidebarProgressPct"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Application progress ${sidebarProgressPct} percent`"
            >
              <div
                class="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                :style="{ width: `${sidebarProgressPct}%` }"
              />
            </div>
          </div>

          <nav
            aria-label="Progress"
            class="mt-10 flex flex-1 flex-col"
          >
            <Stepper
              orientation="vertical"
              :model-value="progressStepNumber"
              class="flex w-full flex-col justify-start gap-10"
            >
              <StepperItem
                v-for="(step, stepIdx) in sidebarSteps"
                :key="step.label"
                v-slot="{ state }"
                :step="step.stepNum"
                class="relative flex w-full items-start gap-4"
              >
                <StepperSeparator
                  v-if="stepIdx !== sidebarSteps.length - 1"
                  class="absolute top-[38px] left-[18px] block h-[105%] w-0.5 shrink-0 rounded-full bg-background/15 group-data-[state=completed]:bg-primary"
                />

                <StepperTrigger
                  class="relative z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                  :class="
                    state === 'completed'
                      ? 'bg-primary text-primary-foreground'
                      : state === 'active'
                        ? 'bg-background text-foreground shadow-xs ring-2 ring-primary ring-offset-2 ring-offset-foreground'
                        : 'border border-background/25 bg-background/5 text-background/55'
                  "
                  :aria-current="state === 'active' ? 'step' : undefined"
                >
                  <HugeiconsIcon
                    v-if="state === 'completed'"
                    :icon="Tick01Icon"
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  <span v-else>{{ step.stepNum }}</span>
                </StepperTrigger>

                <div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                  <StepperTitle
                    class="text-sm font-medium tracking-normal whitespace-normal transition-colors"
                    :class="
                      state === 'active'
                        ? 'font-semibold text-background'
                        : state === 'completed'
                          ? 'text-background/80'
                          : 'text-background/40'
                    "
                  >
                    {{ step.label }}
                  </StepperTitle>

                  <StepperDescription
                    class="text-xs leading-relaxed transition-colors"
                    :class="state === 'active' ? 'text-background/60' : 'text-background/35'"
                  >
                    {{ step.description }}
                  </StepperDescription>

                  <ul
                    v-if="step.isActive && step.subRoutes.length > 1"
                    class="mt-2 flex flex-col gap-2 border-t border-background/10 pt-3"
                  >
                    <li
                      v-for="sub in step.subRoutes"
                      :key="sub.label"
                      class="flex items-center gap-2 text-xs"
                      :class="
                        sub.isCurrent
                          ? 'font-medium text-background'
                          : sub.isDone
                            ? 'text-background/55'
                            : 'text-background/35'
                      "
                    >
                      <span
                        class="size-1.5 shrink-0 rounded-full"
                        :class="
                          sub.isCurrent
                            ? 'bg-primary'
                            : sub.isDone
                              ? 'bg-background/45'
                              : 'bg-background/20'
                        "
                        aria-hidden="true"
                      />
                      {{ sub.label }}
                    </li>
                  </ul>
                </div>
              </StepperItem>
            </Stepper>
          </nav>

          <div class="relative mt-8 border-t border-background/10 pt-5">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="group flex h-auto w-full cursor-pointer items-center justify-start gap-3 rounded-xl border border-transparent px-2 py-2 text-left text-background transition-colors hover:border-background/10 hover:bg-background/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-background/25 data-[state=open]:border-background/10 data-[state=open]:bg-background/10"
                >
                  <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold tracking-wide text-background">
                    {{ accountInitials }}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-background">{{ accountName }}</span>
                    <span
                      v-if="accountEmail"
                      class="block truncate text-xs text-background/45"
                    >{{ accountEmail }}</span>
                  </span>
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-md text-background/45 transition-colors group-hover:bg-background/10 group-hover:text-background">
                    <HugeiconsIcon :icon="MoreVerticalIcon" class="size-4" aria-hidden="true" />
                  </span>
                </button>
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
                <DropdownMenuItem :disabled="isSaving" @select="openLeaveConfirm">
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
        </div>
      </aside>

      <!-- Main column: scrollable body + sticky footer -->
      <div class="relative flex min-w-0 flex-1 flex-col bg-background">
        <main
          ref="scrollContainer"
          class="app-scrollbar relative flex-1 overflow-y-auto"
        >
          <div class="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:px-8 lg:py-12">
            <div class="relative w-full">
              <transition name="fade">
                <div
                  v-if="isFetching || isPending"
                  class="absolute -top-8 right-0 flex items-center gap-2"
                >
                  <span class="text-xs font-bold tracking-widest text-primary/40 uppercase">Syncing</span>
                  <HugeiconsIcon :icon="Loading03Icon" class="h-4 w-4 animate-spin text-primary/40" />
                </div>
              </transition>

              <slot />
            </div>

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
          </div>
        </main>

        <footer
          v-if="progressStepTotal > 0 && progressStepNumber > 0"
          class="z-40 shrink-0 border-t border-border/40 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
        >
          <!-- Step pages can Teleport sticky content here (e.g. review legal acceptances). -->
          <div
            id="onboarding-wizard-footer-above"
            class="mx-auto w-full max-w-3xl border-b border-border/40 px-4 py-3 empty:hidden sm:px-6 md:px-8"
          />

          <div class="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 md:px-8">
            <p class="text-center text-sm font-medium tabular-nums text-muted-foreground sm:text-left lg:hidden">
              Step {{ progressStepNumber }} of {{ progressStepTotal }}<template v-if="currentSubStep"> · {{ currentSubStep.label }} ({{ currentSubStep.index }}/{{ currentSubStep.total }})</template>
            </p>

            <div class="flex w-full items-center justify-end gap-3 sm:ml-auto sm:w-auto">
              <Button
                variant="outline"
                class="h-11 shrink-0 cursor-pointer px-5 text-base font-medium"
                :disabled="isFirst || isSaving"
                @click="handleBack"
              >
                Back
              </Button>
              <Button
                class="inline-flex h-11 min-w-36 flex-1 cursor-pointer items-center justify-center px-8 text-base font-semibold sm:flex-initial"
                :disabled="isSaving"
                @click="handleNext"
              >
                <HugeiconsIcon
                  v-if="isSaving && !isExiting"
                  :icon="Loading03Icon"
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
        </footer>
      </div>
    </div>
    <AlertDialog v-model:open="showLeaveConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave onboarding?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress is saved — you can pick up where you left off.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction @click="confirmLeave">Leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
