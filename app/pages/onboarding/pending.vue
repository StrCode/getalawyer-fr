<script setup lang="ts">
import { AlertCircleIcon, CheckmarkCircle01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  ensureLawyerOnboardingStatus,
  useLawyerOnboardingStatus,
} from '~/composables/useLawyerOnboarding'
import { useSubscriptionStatus } from '~/composables/useSubscription'
import {
  getLawyerApplicationStatusNotice,
  isLawyerAwaitingApproval,
  isLawyerRejected,
  isLawyerVerificationFailed,
  onboardingSubmittedAt,
} from '~/lib/lawyerOnboardingStatus'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: ['auth'],
})

useHead({
  title: 'Application pending — GetaLawyer',
  meta: [
    {
      name: 'description',
      content: 'Your lawyer application is under review.',
    },
  ],
})

const router = useRouter()
const { session } = useAuth()
const queryClient = useQueryClient()

await useAsyncData('onboarding-pending-status', () =>
  ensureLawyerOnboardingStatus(queryClient),
)

const {
  data: statusPayload,
  isPending: statusPending,
  isLoading: statusLoading,
  isError: statusError,
  refetch: refetchStatus,
} = useLawyerOnboardingStatus({ enabled: true })

const isAwaiting = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerAwaitingApproval(st)
})

const {
  data: subscriptionStatus,
  isPending: subscriptionStatusPending,
} = useSubscriptionStatus({
  enabled: computed(() => isAwaiting.value),
})

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null,
)

const showSpinner = computed(() => {
  if (statusPending.value || statusLoading.value) return true
  const st = statusPayload.value
  if (
    st != null
    && (isLawyerAwaitingApproval(st) || isRejectedState(st) || isLawyerVerificationFailed(st))
  ) {
    return false
  }
  if (statusError.value) return false
  return st == null
})

const statusUnavailable = computed(() => !statusPending.value && statusError.value)

function isRejectedState(st: Parameters<typeof isLawyerRejected>[0]) {
  return isLawyerRejected(st)
}

const isRejected = computed(() => {
  const st = statusPayload.value
  return st != null && isRejectedState(st)
})

const isVerificationFailed = computed(() => {
  const st = statusPayload.value
  return st != null && isLawyerVerificationFailed(st)
})

const submittedAt = computed(() => {
  const st = statusPayload.value
  return st ? onboardingSubmittedAt(st) : null
})

const submittedLabel = computed(() => {
  if (!submittedAt.value) return null
  try {
    return new Date(submittedAt.value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
})

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true,
)

const currentStep = computed(() => (hasActiveSubscription.value ? 3 : 2))

const progressSteps = computed(() => [
  {
    step: 1,
    title: 'Applied',
    description: 'Done',
  },
  {
    step: 2,
    title: 'Paid',
    description: hasActiveSubscription.value ? 'Done' : 'Now',
  },
  {
    step: 3,
    title: 'Review',
    description: hasActiveSubscription.value ? 'Now' : 'Next',
  },
])

watchEffect(() => {
  const u = session.value?.user as {
    onboarding_completed?: boolean
    userType?: string
    role?: string
  } | null
  const ut = u?.userType ?? u?.role
  if (ut && ut !== 'lawyer') {
    router.replace('/')
  }
  if (u?.onboarding_completed) {
    router.replace('/dashboard')
  }
})

watchEffect(() => {
  if (showSpinner.value) return
  if ((session.value?.user as { onboarding_completed?: boolean })?.onboarding_completed) return
  if (statusUnavailable.value) return

  if (isRejected.value) {
    router.replace('/onboarding/rejected')
    return
  }

  if (isAwaiting.value) return

  router.replace('/onboarding')
})

watchEffect(() => {
  if (showSpinner.value) return
  if (!isAwaiting.value) return
  if (subscriptionStatusPending.value) return
  if (!hasActiveSubscription.value) {
    router.replace('/onboarding/subscription')
  }
})

async function retryStatus() {
  await refetchStatus()
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-stretch gap-8">
    <div
      v-if="showSpinner"
      class="flex flex-col items-center gap-3 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton class="size-11 rounded-full" />
      <div class="flex w-full flex-col items-center gap-2">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-4 w-64 max-w-full" />
        <Skeleton class="h-4 w-40" />
      </div>
      <Skeleton class="mt-1 h-14 w-full rounded-xl" />
      <Skeleton class="h-36 w-full rounded-xl" />
    </div>

    <Card v-else-if="statusUnavailable" class="gap-4 py-5">
      <CardHeader class="px-5 text-center">
        <CardTitle>Could not load status</CardTitle>
        <CardDescription>
          Check your connection and try again.
        </CardDescription>
      </CardHeader>
      <CardFooter class="justify-center px-5">
        <Button class="cursor-pointer" @click="retryStatus">
          Try again
        </Button>
      </CardFooter>
    </Card>

    <div
      v-else-if="isVerificationFailed"
      class="flex flex-col gap-3"
    >
      <Alert variant="destructive">
        <HugeiconsIcon :icon="AlertCircleIcon" />
        <AlertTitle>Verification could not be completed</AlertTitle>
        <AlertDescription>
          We could not verify your credentials. If you paid, a refund minus the admin fee will return
          to your payment method.
        </AlertDescription>
      </Alert>
      <p class="text-center text-sm text-muted-foreground">
        Questions?
        <a
          href="mailto:support@getalawyer.ng"
          class="font-medium text-primary underline underline-offset-2"
        >
          support@getalawyer.ng
        </a>
      </p>
    </div>

    <template v-else-if="isAwaiting">
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="size-5" aria-hidden="true" />
        </div>
        <div class="flex flex-col gap-2">
          <h1 class="text-balance text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            Application in review
          </h1>
          <p class="max-w-sm text-sm leading-relaxed text-muted-foreground">
            We’re checking your credentials. You’ll get an email when there’s a decision — usually within
            one to two business days.
          </p>
        </div>
        <Badge v-if="submittedLabel" variant="soft">
          Submitted {{ submittedLabel }}
        </Badge>
      </div>

      <Stepper
        :model-value="currentStep"
        class="w-full items-start justify-between gap-1"
      >
        <StepperItem
          v-for="(item, index) in progressSteps"
          :key="item.step"
          :step="item.step"
          class="relative flex flex-1 flex-col items-center"
        >
          <StepperSeparator
            v-if="index < progressSteps.length - 1"
            class="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+0.75rem)] top-4 block h-px shrink-0 bg-border group-data-[state=completed]:bg-primary"
          />
          <StepperTrigger class="pointer-events-none flex flex-col items-center gap-2 rounded-none bg-transparent p-0">
            <StepperIndicator
              class="size-8 border border-border bg-muted text-muted-foreground group-data-[state=active]:border-transparent group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground group-data-[state=completed]:border-transparent group-data-[state=completed]:bg-primary group-data-[state=completed]:text-primary-foreground"
            >
              <HugeiconsIcon
                v-if="currentStep > item.step"
                :icon="Tick01Icon"
              />
              <span
                v-else-if="currentStep === item.step"
                class="size-1.5 rounded-full bg-current"
              />
              <span v-else class="size-1.5 rounded-full bg-current opacity-40" />
            </StepperIndicator>
            <div class="flex flex-col items-center gap-0.5 text-center">
              <StepperTitle class="text-xs font-medium leading-none">
                {{ item.title }}
              </StepperTitle>
              <StepperDescription
                class="leading-none"
                :class="currentStep === item.step ? 'font-medium text-primary' : undefined"
              >
                {{ item.description }}
              </StepperDescription>
            </div>
          </StepperTrigger>
        </StepperItem>
      </Stepper>

      <Card class="gap-0 overflow-hidden py-0">
        <CardHeader class="gap-1.5 px-5 pt-5 pb-4">
          <CardTitle class="text-sm font-medium">
            {{ applicationNotice?.title || 'We’re reviewing your details' }}
          </CardTitle>
          <CardDescription class="text-sm leading-relaxed">
            {{
              applicationNotice?.description
                || 'No further action is needed unless we contact you.'
            }}
          </CardDescription>
        </CardHeader>

        <CardContent
          v-if="!subscriptionStatusPending && hasActiveSubscription"
          class="px-5 pb-5"
        >
          <Alert variant="success">
            <HugeiconsIcon :icon="Tick01Icon" />
            <AlertDescription>
              <span class="font-medium text-foreground">Membership paid.</span>
              You’re covered while we finish review.
            </AlertDescription>
          </Alert>
        </CardContent>

        <Separator />

        <CardFooter class="px-5 py-4">
          <p class="text-xs leading-relaxed text-muted-foreground">
            We’ll email you when approved, or if we need anything else.
            Questions?
            <a
              href="mailto:support@getalawyer.ng"
              class="font-medium text-primary underline underline-offset-2"
            >
              support@getalawyer.ng
            </a>
          </p>
        </CardFooter>
      </Card>

      <Button
        variant="outline"
        class="h-10 w-full cursor-pointer"
        as-child
      >
        <NuxtLink to="/">
          Back to home
        </NuxtLink>
      </Button>
      <Button
        v-if="statusError"
        variant="link"
        class="h-auto cursor-pointer px-0"
        @click="retryStatus"
      >
        Refresh status
      </Button>
    </template>
  </div>
</template>
