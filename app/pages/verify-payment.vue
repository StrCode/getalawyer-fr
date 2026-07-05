<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  SUBSCRIPTION_PAYMENT_REF_KEY,
  useSubscriptionStatus,
  useSyncPendingSubscription,
  useVerifySubscription,
} from '~/composables/useSubscription'
import { queryKeys } from '~/lib/query-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'listing-wizard',
  middleware: ['auth'],
})

useHead({
  title: 'Verify payment - GetaLawyer',
  meta: [{ name: 'description', content: 'Confirm your lawyer subscription payment.' }],
})

const route = useRoute()
const queryClient = useQueryClient()

const reference = computed(() => {
  const fromQuery = route.query.reference ?? route.query.trxref
  if (typeof fromQuery === 'string' && fromQuery.length > 0) {
    return fromQuery
  }
  if (import.meta.client) {
    const stored = sessionStorage.getItem(SUBSCRIPTION_PAYMENT_REF_KEY)
    if (stored) return stored
  }
  return null
})

const resolvingReference = ref(!reference.value)
const missingReference = computed(() => !reference.value && !resolvingReference.value)

const { data: subscriptionStatus, isPending: subscriptionStatusPending } = useSubscriptionStatus({
  enabled: computed(() => import.meta.client && !reference.value),
})

const { mutateAsync: syncPendingSubscription } = useSyncPendingSubscription()
const referenceResolutionAttempted = ref(false)

watch(
  [reference, subscriptionStatus, subscriptionStatusPending],
  async ([ref, status, statusPending]) => {
    if (ref) {
      resolvingReference.value = false
      return
    }
    if (!import.meta.client || referenceResolutionAttempted.value) return
    if (statusPending) return

    referenceResolutionAttempted.value = true

    if (status?.hasActiveSubscription) {
      resolvingReference.value = false
      await navigateTo('/onboarding/pending', { replace: true })
      return
    }

    if (status?.subscription?.status === 'pending') {
      try {
        const result = await syncPendingSubscription()
        if (result?.success && result.status === 'active') {
          resolvingReference.value = false
          toast.success('Payment confirmed', {
            description: 'Taking you to your application status.',
          })
          await navigateTo('/onboarding/pending', { replace: true })
          return
        }
      } catch {
        // Fall through to subscription page below
      }
    }

    resolvingReference.value = false
    await navigateTo('/onboarding/subscription', { replace: true })
  },
  { immediate: true },
)

const {
  data: verifyResult,
  isPending: verifyPending,
  isError: verifyError,
  refetch,
} = useVerifySubscription(reference)

const verifyStatus = computed(() => verifyResult.value?.status ?? 'pending')
const verifyMessage = computed(() => verifyResult.value?.message ?? '')
const isSuccess = computed(
  () => verifyResult.value?.success === true && verifyStatus.value === 'active',
)
const isFailed = computed(() => {
  const s = verifyStatus.value
  return s === 'failed' || s === 'abandoned' || s === 'cancelled'
})

const failureRecorded = ref(false)

watch(isFailed, async (failed) => {
  if (!failed || failureRecorded.value) return
  failureRecorded.value = true
  await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
})

const redirectedAfterSuccess = ref(false)

watch(
  isSuccess,
  async (ok) => {
    if (!ok || redirectedAfterSuccess.value) return
    redirectedAfterSuccess.value = true
    if (import.meta.client) {
      sessionStorage.removeItem(SUBSCRIPTION_PAYMENT_REF_KEY)
    }
    toast.success('Payment confirmed', {
      description: 'Taking you to your application status.',
    })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status }),
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.pricing }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyerOnboarding.status }),
    ])
    await navigateTo('/onboarding/pending', { replace: true })
  },
  { immediate: true },
)

function retryVerify() {
  void refetch()
}
</script>

<template>
  <div class="mx-auto w-full max-w-xl py-14">
    <div
      v-if="resolvingReference || missingReference"
      class="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground"
    >
      <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin text-primary" />
      <p>{{ resolvingReference ? 'Checking your payment status…' : 'Redirecting…' }}</p>
    </div>

    <Card
      v-else-if="!redirectedAfterSuccess"
      class="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm"
    >
      <div class="space-y-6 px-6 py-8 text-center">
        <div
          v-if="verifyPending"
          class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin" />
        </div>
        <div
          v-else-if="isSuccess"
          class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
        >
          <AppIcon :icon="appIcons.checkCircle" class="size-9" />
        </div>
        <div
          v-else
          class="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-700"
        >
          <AppIcon :icon="appIcons.warningCircle" class="size-9" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-semibold text-foreground">
            <template v-if="verifyPending">
              Confirming payment
            </template>
            <template v-else-if="isSuccess">
              Payment verified
            </template>
            <template v-else-if="isFailed">
              Payment not completed
            </template>
            <template v-else>
              Payment pending
            </template>
          </h1>
          <p class="text-sm leading-relaxed text-muted-foreground">
            <template v-if="verifyPending">
              We are confirming your payment. You will be redirected to your application status shortly.
            </template>
            <template v-else-if="isSuccess">
              Redirecting to your application status…
            </template>
            <template v-else-if="isFailed">
              {{ verifyMessage || 'This payment was not completed. You can try again from the subscription page.' }}
            </template>
            <template v-else>
              {{ verifyMessage || 'Your payment is still being processed. Please check again shortly.' }}
            </template>
          </p>
        </div>

        <div v-if="!isSuccess" class="grid gap-2" :class="isFailed ? '' : 'sm:grid-cols-2'">
          <Button
            v-if="!isFailed"
            variant="outline"
            :disabled="verifyPending"
            @click="retryVerify"
          >
            Check again
          </Button>
          <Button as-child :class="isFailed ? 'w-full' : ''">
            <NuxtLink to="/onboarding/subscription">
              {{ isFailed ? 'Try again' : 'Back to subscription' }}
            </NuxtLink>
          </Button>
        </div>

        <p v-if="verifyError && !verifyPending" class="text-xs text-destructive">
          Could not verify payment right now. Try again in a few moments.
        </p>
      </div>
    </Card>

    <div
      v-else-if="redirectedAfterSuccess || (isSuccess && !verifyPending)"
      class="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground"
    >
      <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin text-primary" />
      <p>Opening your application status…</p>
    </div>
  </div>
</template>
