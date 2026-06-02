<script setup lang="ts">
import { PhCheckCircle, PhCircleNotch, PhWarningCircle } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import { useVerifySubscription } from '~/composables/useSubscription'
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

const reference = computed(() => {
  const r = route.query.reference ?? route.query.trxref
  return typeof r === 'string' ? r : null
})

const missingReference = computed(() => !reference.value)

watch(
  missingReference,
  (missing) => {
    if (missing) {
      void navigateTo('/onboarding/subscription', { replace: true })
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

watch(
  isSuccess,
  (ok) => {
    if (ok) {
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
</script>

<template>
  <div class="mx-auto w-full max-w-xl py-14">
    <Card
      v-if="!missingReference"
      class="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm"
    >
      <div class="space-y-6 px-6 py-8 text-center">
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
              We are confirming your payment. This usually takes a few seconds after Paystack redirects you here.
            </template>
            <template v-else-if="isSuccess">
              Your subscription is active. Return to the subscription page or check your application status.
            </template>
            <template v-else-if="isFailed">
              {{ verifyMessage || 'This payment was not completed. You can try again from the subscription page.' }}
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
            <NuxtLink to="/onboarding/subscription">
              Return to subscription
            </NuxtLink>
          </Button>
        </div>

        <p v-if="verifyError && !verifyPending" class="text-xs text-destructive">
          Could not verify payment right now. Try again in a few moments.
        </p>
      </div>
    </Card>
  </div>
</template>
