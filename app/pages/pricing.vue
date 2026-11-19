<script setup lang="ts">
import type { MembershipPlan } from '~/composables/useMembershipPlans'
import { Button } from '@/components/ui/button'

/**
 * Pricing for lawyers. Everything about the offer is read from the plan
 * catalog (`useMembershipPlans`): how many plans there are, their names, terms,
 * prices, savings, which one is the default, and the one-off verification fee.
 * The page works for one plan or several, and says so plainly when prices
 * cannot be loaded; it never falls back to a typed-in figure. The copy avoids
 * naming plans or counting them for the same reason.
 */
definePageMeta({ layout: 'site' })

const { data, refresh, status } = await useMembershipPlans()

const plans = computed<MembershipPlan[]>(() => data.value?.plans ?? [])
const fee = computed(() => data.value?.verificationAdminFeeNaira ?? 0)
const several = computed(() => plans.value.length > 1)
const retrying = computed(() => status.value === 'pending')

const selectedKey = ref<string | null>(null)
const selected = computed(() =>
  plans.value.find(plan => plan.key === selectedKey.value)
  ?? plans.value.find(plan => plan.isDefault)
  ?? plans.value[plans.value.length - 1]
  ?? null,
)

const cheapest = computed(() => [...plans.value].sort((a, b) => a.priceNaira - b.priceNaira)[0] ?? null)
/** "₦5,000 a month" / "₦15,000 for a year" */
function priceFor(plan: MembershipPlan) {
  return `${formatNairaAmount(plan.priceNaira)} ${plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}`}`
}

useHead({ title: 'Pricing for lawyers' })
useSeoMeta({
  description: computed(() => cheapest.value
    ? `Lawyer membership on getalawyer from ${priceFor(cheapest.value)}. A verified listing, client messages and bookings, with no commission on your fees.`
    : 'Lawyer membership on getalawyer: a verified listing, client messages and bookings, with no commission on your fees.'),
})

const inclusions = [
  { title: 'A verified profile in the directory', detail: 'Shown to clients once your identity and enrolment checks pass.' },
  { title: 'Direct messages from clients', detail: 'Clients write to you first; you can exchange files in the thread.' },
  { title: 'Bookings and calendar sync', detail: 'Set your consultation types, fees and hours; sync your calendar.' },
  { title: 'Your lawyer dashboard', detail: 'Enquiries, bookings and cases in one place.' },
  { title: '0% commission', detail: 'Clients pay you directly. We never take a cut of your fees.' },
]

const billingFacts = computed(() => [
  { title: 'Auto-renew is yours to control', body: 'It is on by default so your listing never lapses. Turn it off from your dashboard whenever you like.' },
  several.value && { title: 'Change plan at renewal', body: 'Move to any other plan on sale. The new plan starts when your current term ends.' },
  { title: 'If your membership lapses', body: 'Your profile is hidden from the directory until you renew. Your account and history stay as they are.' },
].filter(Boolean) as Array<{ title: string, body: string }>)

const steps = computed(() => [
  { title: 'Create your profile', body: 'Add your practice areas, experience and enrolment details.' },
  {
    title: several.value ? 'Choose a plan and pay' : 'Pay for your membership',
    body: fee.value > 0 ? 'Your first payment includes the one-off verification fee.' : 'You pay for the term up front; nothing else is added.',
  },
  { title: 'We verify you', body: 'Identity and Supreme Court enrolment are checked before you are listed.' },
  { title: 'Receive enquiries', body: 'Clients message you free and book the consultations you offer.' },
])

const questions = computed(() => [
  { q: 'Do you take a percentage of my fees?', a: 'No. Membership is the only payment to getalawyer. There is no commission on consultations or on any work that follows.' },
  { q: 'Do clients pay through getalawyer?', a: 'No. Fees are agreed and paid directly between you and the client.' },
  fee.value > 0 && { q: 'What is the verification fee?', a: 'A one-off fee added to your first payment that covers checking your identity and enrolment. It is charged once, not on renewals.' },
  several.value && { q: 'Can I switch plans later?', a: 'Yes. Pick a different plan from your dashboard and it takes effect at your next renewal. Nothing is charged in between.' },
  {
    q: 'What happens if my verification fails?',
    a: fee.value > 0
      ? 'Your membership payment is refunded. The verification fee is kept because the checks were carried out.'
      : 'Your membership payment is refunded.',
  },
  { q: 'Can I cancel?', a: 'Turn off auto-renew at any time. Your listing stays live until the end of the term you have paid for.' },
].filter(Boolean) as Array<{ q: string, a: string }>)

// Checkout comes after registration and the application; the chosen plan is
// remembered on this device so checkout can start on it (see utils/preferred-plan).
const REGISTER = '/register?role=lawyer'
const sectionTitle = 'text-[clamp(2rem,3.7vw,3.35rem)] leading-[1.02] font-[650] tracking-[-0.035em] text-balance'
const kicker = 'text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase'
</script>

<template>
  <div>
    <section class="max-w-[54rem] pt-[clamp(1.5rem,4vw,3.25rem)] pb-[clamp(1.5rem,3vw,2.5rem)]">
      <div :class="kicker">Pricing for lawyers</div>
      <h1 class="mt-[0.9rem] text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
        One membership. <em class="text-brand not-italic">{{ several ? 'Pay for the term that suits you.' : 'No commission on your fees.' }}</em>
      </h1>
      <p class="mt-[1.2rem] max-w-[40rem] text-[1.15rem] text-muted-foreground">
        <template v-if="several">Every plan gives you the same listing, messages and bookings. The only difference is how long you pay for at a time. We take no commission on your fees.</template>
        <template v-else>Membership gives you a verified listing, messages from clients and bookings. Clients pay you directly, and we never take a cut.</template>
      </p>
    </section>

    <!-- prices could not be loaded: say so, never show a made-up figure -->
    <div v-if="!selected" role="alert" class="grid justify-items-center gap-[0.8rem] rounded-card border border-dashed border-border px-6 py-[clamp(2rem,5vw,3.5rem)] text-center">
      <h2 class="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.02] font-[650] tracking-[-0.035em]">Prices are not loading right now.</h2>
      <p class="max-w-[32rem] text-muted-foreground">We could not fetch the current membership prices. Nothing is wrong with your account. Try again in a moment.</p>
      <Button variant="line" size="pill" :disabled="retrying" @click="refresh()">{{ retrying ? 'Trying…' : 'Try again' }}</Button>
    </div>

    <template v-else>
      <section
        id="plans"
        role="group"
        :aria-label="several ? 'Choose a plan' : 'Membership'"
        class="grid grid-cols-[repeat(auto-fit,minmax(15.5rem,1fr))] gap-[1.1rem]"
      >
        <!-- a lone plan is a statement, not a choice: no button, nothing to press -->
        <component
          :is="several ? 'button' : 'div'"
          v-for="plan in plans"
          :key="plan.key"
          :type="several ? 'button' : undefined"
          :aria-pressed="several ? plan.key === selected.key : undefined"
          :data-on="plan.key === selected.key ? '' : undefined"
          :data-surface="plan.key === selected.key ? 'forest' : undefined"
          :class="several ? 'cursor-pointer hover:-translate-y-[3px] hover:border-brand' : ''"
          class="group/plan grid grid-rows-[auto_auto_auto_1fr] content-start gap-[0.55rem] rounded-card border border-border bg-card p-6 text-left [transition:background-color_0.2s,color_0.2s,border-color_0.2s,box-shadow_0.2s_var(--ease-canopy),translate_0.2s_var(--ease-canopy)] data-on:border-forest data-on:bg-forest data-on:text-white data-on:shadow-[0_26px_54px_rgba(11,51,39,0.28)]"
          @click="selectedKey = plan.key"
        >
          <span class="flex min-h-[1.8rem] items-center justify-between gap-2 font-display text-[1.2rem] font-[650] tracking-[-0.02em]">
            {{ plan.name }}
            <span v-if="plan.savingsPercent > 0" class="rounded-full bg-lime px-[0.65rem] py-1 font-text text-[0.78rem] font-bold tracking-normal whitespace-nowrap text-night">Save {{ plan.savingsPercent }}%</span>
          </span>
          <span class="mt-[0.6rem] flex flex-wrap items-baseline gap-x-[0.6rem] gap-y-[0.15rem]">
            <b class="font-display text-[clamp(2.4rem,4vw,3.3rem)] leading-none font-bold tracking-[-0.04em] tabular-nums">{{ formatNairaAmount(plan.priceNaira) }}</b>
            <small class="text-[1rem] text-muted-foreground group-data-on/plan:text-on-forest">{{ plan.termMonths === 1 ? 'a month' : `for ${termPhrase(plan.termMonths)}` }}</small>
          </span>
          <span class="text-[0.95rem] font-semibold text-brand group-data-on/plan:text-lime">
            {{ plan.termMonths === 1 ? 'Pay month to month' : `Works out at ${formatNairaAmount(plan.perMonthNaira)} a month` }}
          </span>
          <span class="text-[0.9rem] text-muted-foreground group-data-on/plan:text-on-forest">{{ plan.description }}</span>
          <span
            v-if="several"
            class="mt-[0.9rem] flex min-h-12 items-center justify-center self-end rounded-full border border-border font-semibold group-data-on/plan:border-lime group-data-on/plan:bg-lime group-data-on/plan:text-night"
          >
            {{ plan.key === selected.key ? 'Selected' : `Choose ${plan.name.toLowerCase()}` }}
          </span>
        </component>
      </section>

      <section id="pay" class="mt-[1.1rem] grid grid-cols-[minmax(0,1fr)_24rem] items-start gap-[1.1rem] max-tab:grid-cols-1">
        <div class="rounded-card bg-stone p-[clamp(1.4rem,3vw,2.25rem)]">
          <h2 class="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-[650] tracking-[-0.035em]">{{ several ? 'Every plan includes' : 'Membership includes' }}</h2>
          <ul class="mt-[1.2rem] grid grid-cols-2 gap-x-8 gap-y-[1.1rem] max-sm:grid-cols-1">
            <li v-for="item in inclusions" :key="item.title" class="flex items-start gap-[0.8rem]">
              <span class="grid size-[1.7rem] flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="13" :stroke="3.4" /></span>
              <div>
                <b class="block">{{ item.title }}</b>
                <small class="mt-[0.15rem] block text-[0.9rem] text-muted-foreground">{{ item.detail }}</small>
              </div>
            </li>
          </ul>
        </div>

        <aside aria-live="polite" class="rounded-card border border-border bg-card p-[1.4rem]">
          <h2 class="text-[1.3rem] font-[650] tracking-[-0.02em]">Your first payment</h2>
          <dl class="mt-4 grid">
            <div class="flex justify-between gap-4 border-b border-dashed border-border py-[0.6rem] text-muted-foreground">
              <dt>{{ selected.name }} membership</dt>
              <dd class="font-semibold text-foreground tabular-nums">{{ formatNairaAmount(selected.priceNaira) }}</dd>
            </div>
            <div v-if="fee > 0" class="flex justify-between gap-4 border-b border-dashed border-border py-[0.6rem] text-muted-foreground">
              <dt>One-off verification fee</dt>
              <dd class="font-semibold text-foreground tabular-nums">{{ formatNairaAmount(fee) }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 pt-[0.85rem] pb-[0.6rem] font-bold">
              <dt>Due today</dt>
              <dd class="font-display text-[1.6rem] font-bold tracking-[-0.03em] tabular-nums">{{ formatNairaAmount(selected.firstPaymentTotalNaira) }}</dd>
            </div>
          </dl>
          <p class="mt-[0.4rem] text-[0.9rem] text-muted-foreground">
            Then {{ formatNairaAmount(selected.priceNaira) }} every {{ termNoun(selected.termMonths) }}. We remind you 3 days before each renewal.
          </p>
          <Button as-child variant="canopy" size="pill" class="group/btn mt-[1.1rem] h-[3.25rem] w-full justify-between pr-2 pl-[1.4rem]">
            <NuxtLink :to="REGISTER" @click="rememberPreferredPlan(selected.key)">Register as a lawyer<CanopyArrowChip /></NuxtLink>
          </Button>
          <p class="mt-[0.8rem] text-[0.8rem] text-muted-foreground">
            If your verification does not pass, the membership is refunded.<template v-if="fee > 0"> The verification fee is not.</template>
          </p>
        </aside>
      </section>
    </template>

    <section class="pt-[clamp(3.5rem,7vw,6.5rem)]">
      <CanopySectionHead kicker="Billing" title="No lock-in, no surprises." />
      <div class="grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-[1.1rem]">
        <div v-for="fact in billingFacts" :key="fact.title" data-rise class="rounded-card border border-border bg-card p-6">
          <h3 class="text-[1.3rem] font-[650] tracking-[-0.02em]">{{ fact.title }}</h3>
          <p class="mt-2 text-muted-foreground">{{ fact.body }}</p>
        </div>
      </div>
    </section>

    <section class="pt-[clamp(3.5rem,7vw,6.5rem)]">
      <CanopySectionHead kicker="Getting started" title="From sign-up to your first enquiry." />
      <ol class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-[1.1rem]">
        <li v-for="(step, index) in steps" :key="step.title" data-rise class="rounded-card border border-border bg-card p-[1.4rem]">
          <div class="flex items-center gap-3">
            <span class="grid size-10 flex-none place-items-center rounded-full bg-mint font-display text-[1.15rem] font-bold text-deep">{{ index + 1 }}</span>
            <i class="h-px flex-1 bg-border" />
          </div>
          <h3 class="mt-[1.2rem] text-[1.35rem] font-[650] tracking-[-0.02em]">{{ step.title }}</h3>
          <p class="mt-[0.4rem] text-muted-foreground">{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <section class="py-[clamp(3.5rem,7vw,6.5rem)]">
      <CanopySectionHead kicker="Questions" title="Asked before joining." />
      <div class="max-w-[52rem] border-t border-border">
        <details v-for="(item, index) in questions" :key="item.q" :open="index === 0" class="reveal group/faq border-b border-border">
          <summary class="flex min-h-[3.6rem] cursor-pointer list-none items-center justify-between gap-4 py-[0.4rem] font-display text-[1.2rem] font-[650] tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
            {{ item.q }}
            <span aria-hidden="true" class="grid size-8 flex-none place-items-center rounded-full bg-mint font-text font-semibold text-deep transition-[rotate] duration-200 ease-canopy group-open/faq:rotate-45">+</span>
          </summary>
          <p class="max-w-[44rem] pr-12 pb-[1.2rem] text-muted-foreground max-sm:pr-0">{{ item.a }}</p>
        </details>
      </div>
    </section>

    <section data-rise data-surface="forest" class="rounded-panel bg-forest px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2rem,6vw,4.5rem)] text-center text-white max-sm:rounded-[1.75rem]">
      <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-lime uppercase">Ready when you are</div>
      <h2 class="mx-auto mt-4 max-w-[44rem]" :class="sectionTitle">
        Grow your practice. <em class="text-lime not-italic">Keep every naira you earn.</em>
      </h2>
      <div class="mt-[1.7rem] flex flex-wrap justify-center gap-[0.7rem]">
        <Button as-child variant="lime" size="pill">
          <NuxtLink :to="REGISTER" @click="rememberPreferredPlan(selected?.key)">Register as a lawyer</NuxtLink>
        </Button>
        <Button as-child variant="on-forest" size="pill">
          <NuxtLink to="/contact">Talk to us first</NuxtLink>
        </Button>
      </div>
    </section>
  </div>
</template>
