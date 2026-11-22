<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useConfirmVerificationFee, useResubmitCorrection, useWithdrawApplication } from '~/composables/useApplicationCorrection'
import { ApiError } from '~/lib/api/client'
import { type ApplicationCorrection, resubmitLabel } from '~/lib/application-correction'
import { formatOnboardingApiError } from '~/lib/onboarding-api-errors'
import { queryKeys } from '~/lib/query-client'
import { APPLICATION_HOME, APPLICATION_SECTION_PATHS } from '~/lib/setup-paths'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

/**
 * The application home while something has to be corrected: what the review
 * team said, the sections that are open to change (the rest are kept), the fee
 * if checking again costs one, and the way out for someone who would rather stop.
 */
const props = defineProps<{ correction: ApplicationCorrection }>()

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const store = useLawyerOnboardingStore()

// What was submitted comes back as a draft when a correction is asked for, which
// can happen while this page is open: start from what the server has now.
const ready = ref(false)
onMounted(async () => {
  await queryClient.refetchQueries({ queryKey: queryKeys.lawyerOnboarding.draft }).catch(() => {})
  store.reloadFromDraft()
  ready.value = true
  if (route.query.fee === 'check') await confirmPayment(typeof route.query.reference === 'string' ? route.query.reference : null)
})

const justSavedState = useState<string | null>('application-just-saved', () => null)
const justSaved = justSavedState.value
onMounted(() => { justSavedState.value = null })

const sections = computed(() => {
  const done = store.sectionDone
  return [
    { section: 'personal' as const, step: 'personal_info', to: APPLICATION_SECTION_PATHS.personal_info, title: 'About you', done: done.personal },
    { section: 'identity' as const, step: 'nin_verification', to: APPLICATION_SECTION_PATHS.nin_verification, title: 'Identity', done: done.nin },
    { section: 'bar' as const, step: 'professional_info', to: APPLICATION_SECTION_PATHS.professional_info, title: 'Bar credentials', done: done.professional },
    { section: 'practice' as const, step: 'practice_info', to: APPLICATION_SECTION_PATHS.practice_info, title: 'How you practise', done: done.practice },
  ].map(item => ({ ...item, open: props.correction.sections.includes(item.section) }))
})
/** An opened section that is not filled in: it has to be before it can go back. */
const unfinished = computed(() => sections.value.find(item => item.open && !item.done) ?? null)

const { data: membership } = useSubscriptionStatus()
/** Staff have recorded the fee and are confirming it. */
const beingConfirmed = computed(() => membership.value?.offlinePayment ?? null)

const { mutateAsync: resubmit, isPending: resubmitting } = useResubmitCorrection()
const { mutateAsync: confirmFee, isPending: confirming } = useConfirmVerificationFee()
const leaving = ref(false)
const error = ref('')

async function sendBack() {
  if (resubmitting.value || leaving.value) return
  error.value = ''
  try {
    const result = await resubmit()
    if (!result.submitted) {
      leaving.value = true
      await navigateTo(result.payment.redirectUrl, { external: true })
      return
    }
    toast.success('Application sent back', { description: 'It is in review again.' })
  }
  catch (cause) {
    leaving.value = false
    error.value = formatOnboardingApiError(cause, 'Your application could not be sent back. Try again.')
  }
}

async function confirmPayment(reference: string | null) {
  try {
    const result = await confirmFee(reference)
    if (result.status === 'paid') {
      toast.success('Payment received', {
        description: result.resubmitted ? 'Your application is in review again.' : 'Finish your correction and send it back.',
      })
    }
    else if (result.status === 'pending') {
      toast.message('Your payment is still going through', { description: 'This page will move on by itself when it has.' })
    }
    else if (result.status === 'not_paid') {
      toast.error('Payment not completed', { description: result.message })
    }
  }
  catch {
    toast.error('We could not check your payment', { description: 'If you paid, it will show here in a few minutes.' })
  }
  finally {
    // So reloading the page does not ask again.
    await router.replace(APPLICATION_HOME)
  }
}

// ---- stopping instead ----
const withdrawOpen = ref(false)
const note = ref('')
const { mutateAsync: withdraw, isPending: withdrawing } = useWithdrawApplication()
async function confirmWithdraw() {
  if (withdrawing.value) return
  try {
    const result = await withdraw(note.value.trim())
    withdrawOpen.value = false
    toast.success('Application withdrawn', {
      description: result.refundNaira > 0 ? 'Our team will return your membership payment.' : 'You can apply again whenever you like.',
    })
  }
  catch (cause) {
    toast.error('That did not work', { description: cause instanceof ApiError ? cause.message : 'Try again, or write to support.' })
  }
}
</script>

<template>
  <div>
    <ApplicationSkeleton v-if="confirming" shape="home" label="Confirming your payment">
      <p class="mt-3.5 text-base text-muted-foreground">Confirming your payment…</p>
    </ApplicationSkeleton>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div class="min-w-0">
          <p class="text-sm font-medium tracking-widest text-brand uppercase">Application reviewed</p>
          <h1 class="mt-2.5 text-3xl md:text-4xl leading-none font-normal tracking-tight text-balance">
            {{ correction.awaitingFee ? 'One step left: the verification fee' : 'Your application needs a correction' }}
          </h1>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.75 py-1 text-xs font-medium tracking-wider whitespace-nowrap text-warning-subtle-foreground uppercase">
          <i class="size-1.75 rounded-full bg-current" />Correction {{ correction.round }} of {{ correction.limit }}
        </span>
      </div>
      <p class="mt-2.5 max-w-152 text-muted-foreground">
        {{ correction.awaitingFee
          ? 'Your correction is saved and ready to go back. It is sent as soon as the fee is paid.'
          : 'Change what is listed below and send it back. Everything else is kept as you entered it.' }}
      </p>

      <section aria-labelledby="feedback-title" class="mt-5.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3.75 text-warning-subtle-foreground">
        <h2 id="feedback-title" class="font-medium">From the review team</h2>
        <p class="mt-1 whitespace-pre-line">{{ correction.reason }}</p>
      </section>

      <ul class="mt-4.5 grid gap-2">
        <li v-for="item in sections" :key="item.section">
          <NuxtLink
            v-if="item.open"
            :to="item.to"
            class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border border-brand bg-card px-4 py-3.25 transition-[border-color,box-shadow] duration-200 ease-canopy hover:shadow-sm"
          >
            <span class="grid size-8.75 place-items-center rounded-md bg-mint text-deep" :class="justSaved === item.step ? 'animate-tick-in' : ''">
              <CanopyGlyph v-if="justSaved === item.step" name="tick" :size="14" :stroke="3.2" />
              <i v-else class="size-2 rounded-full bg-current" />
            </span>
            <span class="min-w-0">
              <b class="block font-display text-base font-normal tracking-tight">{{ item.title }}</b>
              <small class="block text-sm text-muted-foreground">{{ ready && !item.done ? 'Something is missing here' : 'Open for you to change' }}</small>
            </span>
            <span class="text-sm font-medium whitespace-nowrap text-brand">Edit</span>
          </NuxtLink>
          <div v-else class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-2.75">
            <span class="grid size-8.75 place-items-center rounded-md bg-background text-deep">
              <CanopyGlyph name="tick" :size="14" :stroke="3.2" />
            </span>
            <b class="font-display text-base font-normal tracking-tight">{{ item.title }}</b>
            <span class="text-sm font-medium whitespace-nowrap text-muted-foreground">Kept</span>
          </div>
        </li>
        <li class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-2.75">
          <span class="grid size-8.75 place-items-center rounded-md" :class="correction.membershipPaid ? 'bg-primary text-white' : 'bg-background text-deep font-display font-medium'">
            <CanopyGlyph v-if="correction.membershipPaid" name="tick" :size="14" :stroke="3.2" />
            <template v-else>5</template>
          </span>
          <span class="min-w-0">
            <b class="block font-display text-base font-normal tracking-tight">Membership</b>
            <small class="block text-sm text-muted-foreground">{{ correction.membershipPaid ? 'Your payment is kept. It starts the day you are approved.' : 'Choose a plan and pay once your application is back with us.' }}</small>
          </span>
          <span class="text-sm font-medium whitespace-nowrap text-muted-foreground">{{ correction.membershipPaid ? 'Paid' : 'After you send it' }}</span>
        </li>
      </ul>

      <div class="mt-6.5 grid gap-3.5">
        <section v-if="beingConfirmed && correction.fee.status === 'due'" role="status" class="rounded-card border border-brand bg-mint p-4.5 text-deep">
          <h2 class="text-lg font-normal tracking-tight">We are confirming your payment</h2>
          <p class="mt-1">{{ formatNairaAmount(beingConfirmed.amountNaira) }} has been recorded. There is nothing else to pay{{ correction.awaitingFee ? ', and your application goes back into review once it is confirmed' : '' }}.</p>
        </section>

        <section v-else-if="correction.fee.status === 'due'" aria-labelledby="fee-title" class="rounded-card border border-border bg-card p-4.5">
          <div class="flex items-baseline justify-between gap-4">
            <h2 id="fee-title" class="text-lg font-normal tracking-tight">Verification fee</h2>
            <span class="font-display text-2xl leading-none font-medium tracking-tight">{{ formatNairaAmount(correction.fee.amountNaira) }}</span>
          </div>
          <p class="mt-1.5 text-muted-foreground">Checking again costs the verification fee. You do not pay for your membership again. Secure checkout via Paystack.</p>
        </section>

        <p v-else-if="correction.fee.status === 'paid'" role="status" class="flex items-start gap-3 rounded-lg bg-mint px-4 py-3 text-deep">
          <span class="grid size-6.5 flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="12" :stroke="3.4" /></span>
          <span><b class="font-medium">Verification fee paid.</b> Send your application back when you are ready.</span>
        </p>

        <p v-if="error" role="alert" class="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">{{ error }}</p>

        <!-- With the fee on its way there is nothing more to press once it is ready to go. -->
        <AuthSubmit
          v-if="!(beingConfirmed && correction.awaitingFee)"
          type="button"
          :loading="resubmitting || leaving"
          :disabled="!ready || Boolean(unfinished) || (Boolean(beingConfirmed) && correction.fee.status === 'due')"
          @click="sendBack"
        >
          {{ leaving ? 'Opening Paystack…' : resubmitLabel(correction, formatNairaAmount) }}
        </AuthSubmit>
        <p v-if="ready && unfinished" class="text-sm text-muted-foreground">Finish {{ unfinished.title }} to send it back.</p>

        <p class="text-sm text-muted-foreground">
          Something unclear? Write to <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>.
          Would you rather not continue?
          <button type="button" :class="authLink" class="cursor-pointer" @click="withdrawOpen = true">Withdraw your application</button>.
        </p>
      </div>
    </template>

    <AlertDialog v-model:open="withdrawOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw your application?</AlertDialogTitle>
          <AlertDialogDescription>
            <template v-if="correction.refundNaira > 0">
              Our team will return {{ formatNairaAmount(correction.refundNaira) }} of what you paid. The verification fee is kept, because the check was carried out. You can apply again once the refund has gone through.
            </template>
            <template v-else>
              You have not paid for a membership, so there is nothing to return. You can apply again whenever you like.
            </template>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="grid gap-2">
          <Label for="withdraw-note">Why are you stopping? (optional)</Label>
          <Textarea id="withdraw-note" v-model="note" rows="3" maxlength="500" />
        </div>
        <AlertDialogFooter>
          <Button variant="line" size="pill-sm" :disabled="withdrawing" @click="withdrawOpen = false">Keep my application</Button>
          <Button variant="destructive" size="pill-sm" :disabled="withdrawing" :aria-busy="withdrawing" @click="confirmWithdraw">{{ withdrawing ? 'Withdrawing…' : 'Withdraw' }}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
