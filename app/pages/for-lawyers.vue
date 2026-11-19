<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * For lawyers: what membership gives a practice, how joining works, and the
 * questions lawyers ask first. Prices are never written here: the membership
 * card reads the plans on sale, and the copy points to it and to /pricing.
 */
definePageMeta({ layout: 'site' })

const { data: pricing } = await useMembershipPlans()
const fee = computed(() => pricing.value?.verificationAdminFeeNaira ?? 0)

useHead({ title: 'For lawyers' })
useSeoMeta({
  description: 'Join getalawyer as a verified lawyer: a listing in the directory, messages from clients and bookings, with no commission on your fees.',
})

const REGISTER = '/register?role=lawyer'

const benefits = [
  { icon: 'tick', title: 'Verified credentials', body: 'Your identity and Supreme Court enrolment are checked once. Clients see the verified mark before they write to you.' },
  { icon: 'calendar', title: 'Your schedule, your terms', body: 'Set your consultation types, fees and hours, and sync your calendar. You decide when and how you meet clients.' },
  { icon: 'chat', title: 'Clients write to you directly', body: 'Enquiries arrive as messages. Answer, exchange files and agree next steps in one thread.' },
  { icon: 'office', title: 'No commission', body: 'Clients pay you directly, on terms you set. Membership is the only payment to getalawyer.' },
] as const

const steps = [
  { title: 'Create your profile', body: 'Register, then add your practice areas, experience and enrolment details.' },
  { title: 'Pay and get verified', body: `Choose a membership term. We check your identity and enrolment, usually within ${REVIEW_TIME}.` },
  { title: 'Set your availability', body: 'Add your consultation types, fees and working hours.' },
  { title: 'Receive enquiries', body: 'Clients find you in the directory, message you free and book the consultations you offer.' },
]

const questions = computed(() => [
  { q: 'How long does verification take?', a: `We usually verify your National Identification Number and Supreme Court enrolment within ${REVIEW_TIME}. Your profile goes live once you are approved.` },
  {
    q: 'Do you take a percentage of my fees?',
    a: fee.value > 0
      ? 'No. Membership is the only payment to getalawyer; your first payment also includes a one-off verification fee. You keep the consultation fees you agree with clients.'
      : 'No. Membership is the only payment to getalawyer. You keep the consultation fees you agree with clients.',
  },
  { q: 'Do clients pay through getalawyer?', a: 'No. You agree fees with clients in messages or before the session, and they pay you directly on the terms you set, for example by bank transfer.' },
  { q: 'What happens if a client cancels?', a: 'You set your own cancellation policy. Rescheduling and any refund are handled between you and the client; getalawyer does not hold consultation fees.' },
  { q: 'What if my verification does not pass?', a: fee.value > 0 ? 'Your membership payment is refunded. The verification fee is kept because the checks were carried out.' : 'Your membership payment is refunded.' },
])
</script>

<template>
  <div>
    <section data-surface="forest" class="grid grid-cols-2 overflow-hidden rounded-panel bg-forest text-white max-tab:grid-cols-1 max-sm:rounded-[1.75rem]">
      <div class="self-center p-[clamp(1.75rem,5vw,4.5rem)]">
        <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-lime uppercase">For lawyers</div>
        <h1 class="mt-4 text-[clamp(2.5rem,4.8vw,4.2rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
          Grow your practice. <em class="text-lime not-italic">Keep every naira you earn.</em>
        </h1>
        <p class="mt-[1.2rem] max-w-[34rem] text-[1.1rem] text-on-forest">
          Clients across Nigeria search the directory by practice area and state, and message you directly. One membership, paid for the term you choose, and no commission on your fees.
        </p>
        <div class="mt-[1.7rem] flex flex-wrap gap-[0.7rem]">
          <Button as-child variant="lime" size="pill"><NuxtLink :to="REGISTER">Register as a lawyer</NuxtLink></Button>
          <Button as-child variant="on-forest" size="pill"><NuxtLink to="/pricing">See pricing</NuxtLink></Button>
        </div>
      </div>
      <div class="relative grid min-h-80 place-items-center p-[clamp(1.1rem,3vw,2.5rem)] max-tab:py-6">
        <NuxtImg
          src="/images/canopy/desk.jpg"
          width="1000"
          height="1100"
          sizes="100vw lg:640px"
          alt="A lawyer going through documents with a client at a desk"
          preload
          class="absolute inset-0 size-full object-cover"
        />
        <span aria-hidden="true" class="absolute inset-0 bg-forest/38" />
        <CanopyPlanCard />
      </div>
    </section>

    <section class="pt-[clamp(3.5rem,7vw,6.5rem)]">
      <CanopySectionHead kicker="What you get" title="Everything a practice needs to be found." />
      <div class="grid grid-cols-[repeat(auto-fit,minmax(15.5rem,1fr))] gap-[1.1rem]">
        <div v-for="item in benefits" :key="item.title" data-rise class="rounded-card border border-border bg-card p-6 transition-transform duration-[900ms] ease-canopy">
          <span class="grid size-12 place-items-center rounded-[1rem] bg-mint text-deep"><CanopyGlyph :name="item.icon" :size="22" :stroke="item.icon === 'tick' ? 3 : 2" /></span>
          <h3 class="mt-[1.1rem] text-[1.3rem] font-[650] tracking-[-0.02em]">{{ item.title }}</h3>
          <p class="mt-2 text-muted-foreground">{{ item.body }}</p>
        </div>
      </div>
    </section>

    <section class="pt-[clamp(3.5rem,7vw,6.5rem)]">
      <CanopySectionHead kicker="How joining works" title="From sign-up to your first enquiry." />
      <ol class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-[1.1rem]">
        <li v-for="(step, index) in steps" :key="step.title" data-rise class="rounded-card border border-border bg-card p-[1.4rem] transition-transform duration-[900ms] ease-canopy">
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
        <details v-for="(item, index) in questions" :key="item.q" :open="index === 0" class="group/faq border-b border-border">
          <summary class="flex min-h-[3.6rem] cursor-pointer list-none items-center justify-between gap-4 py-[0.4rem] font-display text-[1.2rem] font-[650] tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
            {{ item.q }}
            <span aria-hidden="true" class="grid size-8 flex-none place-items-center rounded-full bg-mint font-text font-semibold text-deep transition-transform duration-300 ease-canopy group-open/faq:rotate-45">+</span>
          </summary>
          <p class="max-w-[44rem] pr-12 pb-[1.2rem] text-muted-foreground max-sm:pr-0">{{ item.a }}</p>
        </details>
      </div>
    </section>

    <section data-rise data-surface="forest" class="rounded-panel bg-forest px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2rem,6vw,4.5rem)] text-center text-white transition-transform duration-[900ms] ease-canopy max-sm:rounded-[1.75rem]">
      <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-lime uppercase">Ready when you are</div>
      <h2 class="mx-auto mt-4 max-w-[44rem] text-[clamp(2rem,3.7vw,3.35rem)] leading-[1.02] font-[650] tracking-[-0.035em] text-balance">
        Put your practice <em class="text-lime not-italic">in front of clients.</em>
      </h2>
      <div class="mt-[1.7rem] flex flex-wrap justify-center gap-[0.7rem]">
        <Button as-child variant="lime" size="pill"><NuxtLink :to="REGISTER">Register as a lawyer</NuxtLink></Button>
        <Button as-child variant="on-forest" size="pill"><NuxtLink to="/contact">Talk to us first</NuxtLink></Button>
      </div>
    </section>
  </div>
</template>
