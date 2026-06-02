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
  title: 'Subscription payment status - GetaLawyer',
  meta: [{ name: 'description', content: 'Verify your lawyer subscription payment status.' }],
})

const route = useRoute()

const reference = computed(() => {
  const r = route.query.reference ?? route.query.trxref
  return typeof r === 'string' ? r : null
})

const {
  data: verifyResult,
  isPending,
  isError,
  refetch,
} = useVerifySubscription(reference)

const verifyStatus = computed(() => verifyResult.value?.status ?? 'pending')
const verifyMessage = computed(() => verifyResult.value?.message ?? '')
const isSuccess = computed(() => verifyResult.value?.success === true && verifyStatus.value === 'active')
const missingReference = computed(() => !reference.value)
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

function retry() {
  void refetch()
}
</script>

<template>
  <div class="mx-auto w-full max-w-xl py-14">
    <Card class="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
      <div class="space-y-6 px-6 py-8 text-center">
        <div
          v-if="isPending"
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
            <template v-if="missingReference">
              Reference missing
            </template>
            <template v-else-if="isPending">
              Confirming payment
            </template>
            <template v-else-if="isSuccess">
              Subscription active
            </template>
            <template v-else-if="isFailed">
              Payment not completed
            </template>
            <template v-else>
              Payment pending
            </template>
          </h1>
          <p class="text-sm leading-relaxed text-muted-foreground">
            <template v-if="missingReference">
              We could not find a transaction reference in the URL. Please retry payment from onboarding.
            </template>
            <template v-else-if="isPending">
              We are checking your transaction with Paystack.
            </template>
            <template v-else-if="isSuccess">
              You can continue onboarding while your verification review is in progress.
            </template>
            <template v-else-if="isFailed">
              {{ verifyMessage || 'This payment was not completed. You can start a new payment from onboarding.' }}
            </template>
            <template v-else>
              {{ verifyMessage || 'Your payment is still being processed. Please check again shortly.' }}
            </template>
          </p>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" :disabled="isPending || missingReference" @click="retry">
            Check again
          </Button>
          <Button as-child>
            <NuxtLink to="/onboarding/pending">
              Return to onboarding status
            </NuxtLink>
          </Button>
        </div>

        <p v-if="isError && !isPending && !missingReference" class="text-xs text-destructive">
          Could not verify payment right now. Try again in a few moments.
        </p>
      </div>
    </Card>
  </div>
</template>
