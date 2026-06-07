<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ApiError } from '~/lib/api/client'
import {
  formatNairaAmount,
  useInitializeSubscription,
  useSubscriptionPricing,
  useSubscriptionStatus,
} from '~/composables/useSubscription'
import { useLawyerOnboardingStatus } from '~/composables/useLawyerOnboarding'
import {
  getLawyerApplicationStatusNotice,
  onboardingApplicationStatus,
} from '~/lib/lawyerOnboardingStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ButtonBusy from '@/components/ButtonBusy.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Subscription — GetALawyer',
  meta: [{ name: 'description', content: 'Manage your lawyer membership subscription.' }],
})

const { session } = useAuth()
const isLawyer = computed(() => session.value?.user.userType === 'lawyer')

watchEffect(() => {
  if (session.value && !isLawyer.value) {
    void navigateTo('/dashboard', { replace: true })
  }
})

const { data: statusPayload, isPending: statusPending } = useLawyerOnboardingStatus({
  enabled: isLawyer,
})

const { data: pricing, isPending: pricingPending } = useSubscriptionPricing({
  enabled: isLawyer,
})

const {
  data: subscriptionStatus,
  isPending: subscriptionPending,
  refetch: refetchSubscription,
} = useSubscriptionStatus({ enabled: isLawyer })

const { mutateAsync: initializeSubscription, isPending: paymentInitPending } =
  useInitializeSubscription()

const navigatingToPayment = ref(false)

const pageLoading = computed(
  () => !isLawyer.value || statusPending.value || pricingPending.value || subscriptionPending.value
)

const hasActiveSubscription = computed(
  () => subscriptionStatus.value?.hasActiveSubscription === true
)

const subscription = computed(() => subscriptionStatus.value?.subscription ?? null)

const applicationNotice = computed(() =>
  statusPayload.value ? getLawyerApplicationStatusNotice(statusPayload.value) : null
)

const subscriptionEndLabel = computed(() => {
  const end = subscription.value?.subscriptionEndDate
  if (!end) return null
  try {
    return new Date(end).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
})

const statusLabel = computed(() => {
  const status = subscription.value?.status
  if (!status) return 'No subscription'
  return status.replace(/_/g, ' ')
})

const paymentBusy = computed(() => navigatingToPayment.value || paymentInitPending.value)

async function startPayment() {
  navigatingToPayment.value = true
  try {
    const data = await initializeSubscription()
    if (data?.redirectUrl) {
      await navigateTo(data.redirectUrl, { external: true })
      return
    }
    toast.error('Could not start payment', {
      description: 'Missing payment redirect URL. Please try again.',
    })
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'We could not start your payment right now. Please try again.'
    toast.error('Payment could not start', { description: message })
  } finally {
    navigatingToPayment.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <AppPageHeader
      title="Subscription"
      description="Your annual GetALawyer membership — verification, directory listing, bookings, and messaging."
      sticky
    />

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <Skeleton class="h-32 w-full rounded-xl" />
      <Skeleton class="h-48 w-full rounded-xl" />
    </div>

    <template v-else>
      <div
        v-if="applicationNotice && statusPayload && onboardingApplicationStatus(statusPayload) !== 'approved'"
        class="rounded-xl border px-4 py-3 text-sm"
        :class="
          applicationNotice.tone === 'approved'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : applicationNotice.tone === 'failed'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-sky-200 bg-sky-50 text-sky-950'
        "
      >
        <p class="font-semibold">
          {{ applicationNotice.title }}
        </p>
        <p class="mt-1 leading-relaxed opacity-90">
          {{ applicationNotice.description }}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Membership status
          </CardTitle>
          <CardDescription>
            <span class="capitalize">{{ statusLabel }}</span>
            <template v-if="hasActiveSubscription && subscriptionEndLabel">
              · active until {{ subscriptionEndLabel }}
            </template>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <template v-if="hasActiveSubscription">
            <dl class="grid gap-3 text-sm sm:grid-cols-2">
              <div v-if="subscription?.daysRemaining != null">
                <dt class="text-muted-foreground">
                  Days remaining
                </dt>
                <dd class="font-medium">
                  {{ subscription.daysRemaining }}
                </dd>
              </div>
              <div v-if="subscription?.cardLast4">
                <dt class="text-muted-foreground">
                  Payment method
                </dt>
                <dd class="font-medium">
                  {{ subscription.bank ?? 'Card' }} ···· {{ subscription.cardLast4 }}
                </dd>
              </div>
              <div v-if="subscription?.autoRenewEnabled != null">
                <dt class="text-muted-foreground">
                  Auto-renew
                </dt>
                <dd class="font-medium">
                  {{ subscription.autoRenewEnabled ? 'On' : 'Off' }}
                </dd>
              </div>
            </dl>
            <p class="text-sm text-muted-foreground">
              Your membership is active. Renewal and billing changes will be available here in a future update.
            </p>
          </template>

          <template v-else>
            <p class="text-sm text-muted-foreground">
              Pay the annual subscription to activate membership
              <template v-if="pricing">
                ({{ formatNairaAmount(pricing.subscriptionPriceNaira) }})
              </template>.
              If identity or SCN verification fails after payment, your subscription is refunded minus the admin processing fee.
            </p>
            <div class="flex flex-wrap gap-2">
              <ButtonBusy
                :loading="paymentBusy"
                @click="startPayment"
              >
                Pay annual subscription
              </ButtonBusy>
              <Button
                variant="outline"
                size="sm"
                @click="() => refetchSubscription()"
              >
                Refresh status
              </Button>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card v-if="pricing">
        <CardHeader>
          <CardTitle class="text-base">
            Plan details
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <p>
            Annual fee:
            <span class="font-semibold text-foreground">
              {{ formatNairaAmount(pricing.subscriptionPriceNaira) }}
            </span>
          </p>
          <p>Zero commission on consultation fees you charge clients.</p>
          <p>
            Verification admin fee (deducted on failed verification refund):
            {{ formatNairaAmount(pricing.verificationAdminFeeNaira) }}
          </p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
