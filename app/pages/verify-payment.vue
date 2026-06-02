<script setup lang="ts">
import { PhCheckCircle, PhCircleNotch, PhWarningCircle } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import {
  useInitializeSubscription,
  useSubscriptionStatus,
  useVerifySubscription,
} from '~/composables/useSubscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'listing-wizard',
  middleware: ['auth'],
})

useHead({
  title: 'Verify payment - GetaLawyer',
  meta: [{ name: 'description', content: 'Complete and verify your lawyer subscription payment.' }],
})

const route = useRoute()

const reference = computed(() => {
  const r = route.query.reference ?? route.query.trxref
  return typeof r === 'string' ? r : null
})

const hasReference = computed(() => !!reference.value)

const { data: subscriptionStatus, isPending: statusPending } = useSubscriptionStatus({
  enabled: computed(() => !hasReference.value),
})

const { mutateAsync: initializeSubscription, isPending: initPending } = useInitializeSubscription()

const redirectingToPaystack = ref(false)
const checkoutStarted = ref(false)
const initError = ref<string | null>(null)

async function startPaystackCheckout() {
  if (checkoutStarted.value && redirectingToPaystack.value) return
  checkoutStarted.value = true
  initError.value = null
  redirectingToPaystack.value = true
  try {
    const data = await initializeSubscription()
    if (data?.redirectUrl) {
      await navigateTo(data.redirectUrl, { external: true })
      return
    }
    initError.value = 'Missing payment redirect URL. Please try again.'
    redirectingToPaystack.value = false
    checkoutStarted.value = false
  } catch (error) {
    console.error('[Verify payment] Failed to initialize', error)
    initError.value =
      error instanceof Error
        ? error.message
        : 'We could not start your payment right now. Please try again.'
    redirectingToPaystack.value = false
    checkoutStarted.value = false
  }
}

watch(
  [hasReference, subscriptionStatus, statusPending],
  async ([withRef, status, statusLoading]) => {
    if (withRef || statusLoading) return
    if (status?.hasActiveSubscription) {
      await navigateTo('/onboarding/pending', { replace: true })
      return
    }
    if (!checkoutStarted.value && !initError.value) {
      await startPaystackCheckout()
    }
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

const preparingPayment = computed(
  () =>
    !hasReference.value
    && (statusPending.value || initPending.value || redirectingToPaystack.value),
)

watch(
  isSuccess,
  (ok) => {
    if (ok && hasReference.value) {
      toast.success('Subscription activated', {
        description: 'Your payment has been confirmed.',
      })
    }
  },
  { immediate: true },
)

function retryVerify() {
  void refetch()
}

function retryCheckout() {
  void startPaystackCheckout()
}
</script>

<template>
  <div class="mx-auto w-full max-w-xl py-14">
    <Card class="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
      <div class="space-y-6 px-6 py-8 text-center">
        <!-- Returning from Paystack: confirm payment -->
        <template v-if="hasReference">
          <div
            v-if="verifyPending"
            class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <PhCircleNotch class="size-8 animate-spin" />
          </div>
          <div
            v-else-if="isSuccess"
            class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
          >
            <PhCheckCircle class="size-9" weight="fill" />
          </div>
          <div
            v-else
            class="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-700"
          >
            <PhWarningCircle class="size-9" weight="fill" />
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
                We are confirming your payment with our server. This usually takes a few seconds.
              </template>
              <template v-else-if="isSuccess">
                Your subscription is active. You can return to onboarding while verification is in progress.
              </template>
              <template v-else-if="isFailed">
                {{ verifyMessage || 'This payment was not completed. You can try again below.' }}
              </template>
              <template v-else>
                {{ verifyMessage || 'Your payment is still being processed. Please check again shortly.' }}
              </template>
            </p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" :disabled="verifyPending" @click="retryVerify">
              Check again
            </Button>
            <Button as-child>
              <NuxtLink to="/onboarding/pending">
                Return to onboarding
              </NuxtLink>
            </Button>
          </div>

          <p v-if="verifyError && !verifyPending" class="text-xs text-destructive">
            Could not verify payment right now. Try again in a few moments.
          </p>
        </template>

        <!-- First visit: redirect to Paystack -->
        <template v-else>
          <div
            class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <PhCircleNotch
              class="size-8"
              :class="{ 'animate-spin': preparingPayment }"
            />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-semibold text-foreground">
              <template v-if="initError">
                Could not start payment
              </template>
              <template v-else>
                Redirecting to payment
              </template>
            </h1>
            <p class="text-sm leading-relaxed text-muted-foreground">
              <template v-if="initError">
                {{ initError }}
              </template>
              <template v-else>
                You will be taken to Paystack to complete your annual subscription securely.
              </template>
            </p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <Button
              v-if="initError"
              class="sm:col-span-2"
              :disabled="initPending || redirectingToPaystack"
              @click="retryCheckout"
            >
              Try again
            </Button>
            <Button variant="outline" as-child :class="initError ? '' : 'sm:col-span-2'">
              <NuxtLink to="/onboarding/pending">
                Back to onboarding
              </NuxtLink>
            </Button>
          </div>
        </template>
      </div>
    </Card>
  </div>
</template>
