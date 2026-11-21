<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * For lawyers: what membership gives a practice, how joining works, and the
 * questions lawyers ask first. Prices are never written here: the membership
 * section reads the cheapest plan on sale and points to /pricing for the rest.
 *
 * Layout, top to bottom:
 * - Hero: the pitch on a white panel with two block actions under it (register;
 *   the starting price, linking to /pricing), beside a preview of the lawyer's
 *   own profile as a client sees it.
 * - What you get: an uneven grid of four tiles, each with a small product view
 *   that fills in once as the section arrives (usePlayOnce).
 * - How joining works, a membership panel with the starting price, the
 *   questions, and the slim green band the homepage also ends on.
 */
definePageMeta({ layout: 'site' })

const { data: pricing } = await useMembershipPlans()
const fee = computed(() => pricing.value?.verificationAdminFeeNaira ?? 0)
/** "₦5,000 a month": the cheapest plan on sale, in words. Null while prices are unavailable. */
const fromPrice = computed(() => {
  const plans = pricing.value?.plans ?? []
  if (!plans.length) return null
  const cheapest = [...plans].sort((a, b) => a.priceNaira - b.priceNaira)[0]!
  return `${formatNairaAmount(cheapest.priceNaira)} ${cheapest.termMonths === 1 ? 'a month' : `for ${termPhrase(cheapest.termMonths)}`}`
})

useHead({ title: 'For lawyers' })
useSeoMeta({
  description: 'Join getalawyer as a verified lawyer: a profile in the directory, messages from clients and bookings, with no commission on your fees.',
})

const REGISTER = '/register?role=lawyer'

// "What you get": each benefit has a small product view that fills in once as the
// section arrives (usePlayOnce). The four start half a second apart.
const { target: benefitsEl, piece } = usePlayOnce({ threshold: 0.2 })
const MESSAGES = 0
const VERIFY = 500
const COMMISSION = 1000
const SCHEDULE = 1500

const checks = ['National Identification Number', 'Supreme Court enrolment']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const slots = ['9:00', '10:30', '1:00', '3:30']
const meetings = ['Video', 'Phone', 'In person']
const included = [
  'A verified profile in the directory',
  'Messages and bookings from clients',
  'No commission on the fees you agree',
]

// "How joining works": the rule beside each number draws in turn.
const { target: stepsEl, piece: stepPiece } = usePlayOnce()

// Class lists shared by the benefit tiles (full strings, so Tailwind sees them).
const tile = 'flex flex-col rounded-card border border-border bg-card p-5.5'
const view = 'flex min-h-44 flex-col justify-center gap-2.5 rounded-card bg-background p-4 text-sm'
const tileTitle = 'mt-4.5 text-xl font-normal tracking-tight'
const tileBody = 'mt-1.5 text-muted-foreground'
const bubble = 'max-w-9/10 rounded-lg px-3.5 py-2.5 leading-snug'

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
    <!-- ───────── Hero ───────── -->
    <section class="grid gap-4.5 tab:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div class="grid gap-4.5">
        <div class="rounded-panel border border-border bg-card p-7 md:p-8.75 lg:p-11.5 xl:p-14.5 max-sm:rounded-2xl">
          <div class="text-sm font-medium tracking-widest text-brand uppercase">For lawyers</div>
          <!-- three lines by design: each span is one line -->
          <h1 class="mt-4 animate-rise-in text-4xl md:text-5xl lg:text-6xl leading-none font-normal tracking-tighter max-sm:text-3xl">
            <span class="block">Grow your practice.</span>
            <em class="block text-brand not-italic">Keep every naira</em>
            <em class="block text-brand not-italic">you earn.</em>
          </h1>
          <p class="mt-4.75 max-w-136 animate-rise-in text-lg text-muted-foreground [animation-delay:80ms]">
            Clients across Nigeria search the directory by practice area and state, and message you directly. One membership, paid for the term you choose, and no commission on your fees.
          </p>
        </div>

        <!-- two ways on: register, or look at the price first -->
        <div class="grid gap-4.5 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <NuxtLink
            :to="REGISTER"
            data-surface="forest"
            class="group/btn flex items-center justify-between gap-4 rounded-card bg-forest px-6.5 py-5.5 text-white transition-transform duration-200 ease-canopy"
          >
            <span>
              <b class="block font-display text-xl leading-tight font-normal tracking-tight">Register as a lawyer</b>
              <small class="mt-0.75 block text-sm text-on-forest">Create your profile and apply</small>
            </span>
            <CanopyArrowChip large />
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="group/price flex items-center justify-between gap-4 rounded-card border border-border bg-card px-6.5 py-5.5 transition-[translate,border-color] duration-200 ease-canopy hover:border-primary"
          >
            <span class="min-w-0">
              <small class="block text-sm text-muted-foreground">{{ fromPrice ? 'Pricing starts at' : 'Membership' }}</small>
              <b class="mt-0.75 block font-display text-xl leading-tight font-normal tracking-tight whitespace-nowrap">{{ fromPrice ?? 'See pricing' }}</b>
            </span>
            <span class="grid size-10 flex-none place-items-center rounded-full border border-border text-brand transition-[translate,border-color] duration-200 ease-canopy group-hover/price:translate-x-0.75 group-hover/price:border-primary">
              <CanopyGlyph name="arrow" :stroke="2.4" />
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- your profile as a client sees it; an enquiry and a booking arrive. Plays once on load. -->
      <div aria-hidden="true" class="grid min-h-104 place-items-center rounded-panel bg-mint px-7 md:px-7.75 lg:px-10.25 xl:px-12.75 py-16 xl:py-19.25 max-sm:rounded-2xl">
        <div class="relative w-[min(100%,22rem)]">
          <div class="animate-step-in rounded-card border border-border bg-card p-5.25 shadow-lift [animation-delay:200ms]">
            <div class="flex items-center gap-3.5">
              <span class="grid size-14 flex-none place-items-center rounded-full bg-mint font-display text-lg font-medium text-deep">YN</span>
              <div class="min-w-0">
                <b class="flex items-center gap-2 font-display text-xl font-normal tracking-tight">Your name<CanopyVerifiedTick decorative class="animate-pop-in [animation-delay:900ms]" /></b>
                <small class="text-sm text-muted-foreground">Your state · Years at the Bar</small>
              </div>
            </div>
            <p class="mt-4.5 text-xs font-medium tracking-widest text-brand uppercase">Your practice areas</p>
            <div class="mt-2.25 flex flex-wrap gap-1.5">
              <span v-for="meeting in meetings" :key="meeting" class="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium tracking-wider text-deep uppercase">{{ meeting }}</span>
            </div>
            <div class="mt-4.75 grid h-11 place-items-center rounded-full bg-primary text-base font-medium text-white">Message</div>
          </div>
          <div class="absolute -top-10 -right-5 flex animate-pop-in items-center gap-2.5 rounded-lg border border-border bg-card py-2.5 pr-4 pl-2.75 text-sm shadow-lift [animation-delay:1300ms] max-sm:-right-2">
            <span class="grid size-9 flex-none place-items-center rounded-full bg-mint text-deep"><CanopyGlyph name="chat" :size="17" /></span>
            <div><b class="block leading-tight">New enquiry</b><small class="text-muted-foreground">A client has written to you</small></div>
          </div>
          <div class="absolute -bottom-10 -left-5 flex animate-pop-in items-center gap-2.5 rounded-lg border border-border bg-card py-2.5 pr-4 pl-2.75 text-sm shadow-lift [animation-delay:1800ms] max-sm:-left-2">
            <span class="grid size-9 flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="calendar" :size="17" /></span>
            <div><b class="block leading-tight">Consultation booked</b><small class="text-muted-foreground">Thursday, 10:30 AM</small></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── What you get ───────── -->
    <section class="pt-14 lg:pt-18 xl:pt-22.5">
      <CanopySectionHead kicker="What you get" title="Everything a practice needs to be found." />
      <div ref="benefitsEl" class="grid grid-cols-12 gap-4.5">
        <!-- Messages: a client's question, then your reply -->
        <div data-rise :class="[tile, 'col-span-12 sm:col-span-6 tab:col-span-7']">
          <div aria-hidden="true" :class="view">
            <p :class="[bubble, 'origin-bottom-left self-start rounded-bl-sm border border-border bg-card']" v-bind="piece(MESSAGES + 80, 'pop')">My landlord won’t return my deposit. Where do I stand?</p>
            <p :class="[bubble, 'origin-bottom-right self-end rounded-br-sm bg-primary text-white']" v-bind="piece(MESSAGES + 600, 'pop')">Send me the agreement and I’ll tell you your options.</p>
            <p :class="[bubble, 'origin-bottom-left self-start rounded-bl-sm border border-border bg-card max-sm:hidden']" v-bind="piece(MESSAGES + 1100, 'pop')">Thank you. Can we speak on Thursday?</p>
          </div>
          <h3 :class="tileTitle">Clients write to you directly</h3>
          <p :class="tileBody">Enquiries arrive as messages. Answer, exchange files and agree next steps in one thread.</p>
        </div>

        <!-- Verified credentials: the two checks come back, then the mark -->
        <div data-rise :class="[tile, 'col-span-12 sm:col-span-6 tab:col-span-5']">
          <div aria-hidden="true" :class="view">
            <div class="flex items-center gap-3" v-bind="piece(VERIFY + 80)">
              <span class="grid size-11 flex-none place-items-center rounded-full bg-mint text-sm font-medium text-deep">YN</span>
              <div class="min-w-0">
                <b class="flex items-center gap-2 text-base">Your name<CanopyVerifiedTick decorative v-bind="piece(VERIFY + 950, 'pop')" /></b>
                <small class="text-sm text-muted-foreground">Verified lawyer</small>
              </div>
            </div>
            <ul class="grid gap-1.5">
              <li
                v-for="(check, index) in checks"
                :key="check"
                class="flex items-center gap-2 rounded-md border border-border bg-card px-3.25 py-2 font-medium"
                v-bind="piece(VERIFY + 300 + index * 150)"
              >
                {{ check }}<small class="ml-auto text-sm font-medium text-brand" v-bind="piece(VERIFY + 600 + index * 150, 'pop')">Checked</small>
              </li>
            </ul>
          </div>
          <h3 :class="tileTitle">Verified credentials</h3>
          <p :class="tileBody">Your identity and Supreme Court enrolment are checked once. Clients see the verified mark before they write to you.</p>
        </div>

        <!-- No commission: the whole fee is yours -->
        <div data-rise :class="[tile, 'col-span-12 sm:col-span-6 tab:col-span-5']">
          <div aria-hidden="true" :class="view">
            <div class="flex items-baseline justify-between gap-3" v-bind="piece(COMMISSION + 80)">
              <b class="font-display text-4xl md:text-5xl leading-none font-medium tracking-tighter text-brand">100%</b>
              <span class="text-right text-muted-foreground">of every fee you agree</span>
            </div>
            <div class="h-3.25 overflow-hidden rounded-full bg-border">
              <i class="block h-full origin-left rounded-full bg-primary" v-bind="piece(COMMISSION + 300, 'draw')" />
            </div>
            <div class="flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-sm font-medium" v-bind="piece(COMMISSION + 800)">
              <span>You keep 100%</span><span class="text-muted-foreground">getalawyer takes 0%</span>
            </div>
          </div>
          <h3 :class="tileTitle">No commission</h3>
          <p :class="tileBody">Clients pay you directly, on terms you set. Membership is the only payment to getalawyer.</p>
        </div>

        <!-- Your schedule: the week you offer, a slot taken, and how you meet -->
        <div data-rise :class="[tile, 'col-span-12 sm:col-span-6 tab:col-span-7']">
          <div aria-hidden="true" :class="view">
            <div class="flex items-center justify-between gap-2" v-bind="piece(SCHEDULE + 80)">
              <b class="font-display text-base font-normal tracking-tight whitespace-nowrap">Your week</b>
              <span class="flex flex-wrap justify-end gap-1.25">
                <span v-for="meeting in meetings" :key="meeting" class="rounded-full bg-mint px-2.5 py-0.75 text-xs font-medium text-deep">{{ meeting }}</span>
              </span>
            </div>
            <div class="grid grid-cols-5 gap-1.5">
              <div v-for="(day, dayIndex) in days" :key="day" class="grid content-start gap-1.25" v-bind="piece(SCHEDULE + 250 + dayIndex * 90)">
                <small class="text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">{{ day }}</small>
                <span
                  v-for="(slot, slotIndex) in slots.slice(0, dayIndex % 2 === 0 ? 3 : 2)"
                  :key="slot"
                  class="grid min-h-8 place-items-center rounded-lg border text-xs font-medium"
                  :class="dayIndex === 3 && slotIndex === 1 ? 'border-primary bg-primary text-white' : 'border-border bg-card'"
                >{{ slot }}</span>
              </div>
            </div>
          </div>
          <h3 :class="tileTitle">Your schedule, your terms</h3>
          <p :class="tileBody">Set your consultation types, fees and hours, and sync your calendar. You decide when and how you meet clients.</p>
        </div>
      </div>
    </section>

    <!-- ───────── How joining works ───────── -->
    <section class="pt-14 lg:pt-18 xl:pt-22.5">
      <CanopySectionHead kicker="How joining works" title="From sign-up to your first enquiry.">
        <Button as-child variant="line" size="pill">
          <NuxtLink :to="REGISTER">Register as a lawyer →</NuxtLink>
        </Button>
      </CanopySectionHead>
      <ol ref="stepsEl" class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4.5">
        <li v-for="(step, index) in steps" :key="step.title" data-rise class="rounded-card border border-border bg-card p-5.5">
          <div class="flex items-center gap-3">
            <span class="grid size-10 flex-none place-items-center rounded-full bg-mint font-display text-lg font-medium text-deep">{{ index + 1 }}</span>
            <i class="h-px flex-1 origin-left bg-border" v-bind="stepPiece(index * 350, 'draw')" />
          </div>
          <h3 class="mt-4.75 text-xl font-normal tracking-tight">{{ step.title }}</h3>
          <p class="mt-1.5 text-muted-foreground">{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <!-- ───────── Membership: the starting price and the way to the pricing page ───────── -->
    <section class="pt-14 lg:pt-18 xl:pt-22.5">
      <div data-rise class="grid items-center gap-x-10 gap-y-7 rounded-panel bg-mint p-6 md:p-7.75 lg:p-10.25 xl:p-12.75 tab:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] max-sm:rounded-2xl">
        <div>
          <div class="text-sm font-medium tracking-widest text-deep uppercase">Membership</div>
          <h2 class="mt-3.25 text-3xl md:text-4xl lg:text-5xl leading-none font-normal tracking-tight text-balance">One membership. No commission.</h2>
          <ul class="mt-5.5 grid gap-2.5 font-medium">
            <li v-for="item in included" :key="item" class="flex items-start gap-2.5">
              <CanopyVerifiedTick decorative class="mt-0.75" />{{ item }}
            </li>
          </ul>
        </div>
        <div class="rounded-card border border-border bg-card p-5.25 lg:p-6.25 xl:p-7.5">
          <template v-if="fromPrice">
            <small class="text-sm text-muted-foreground">Starting at</small>
            <b class="mt-0.75 block font-display text-3xl md:text-4xl leading-none font-medium tracking-tighter">{{ fromPrice }}</b>
          </template>
          <b v-else class="block font-display text-2xl leading-none font-normal tracking-tight">Choose the term that suits you</b>
          <p class="mt-2.75 text-base text-muted-foreground">
            Pay for the term you choose and turn auto-renew off whenever you like.<template v-if="fee > 0"> Your first payment includes a one-off {{ formatNairaAmount(fee) }} verification fee.</template>
          </p>
          <Button as-child variant="canopy" size="pill" class="group/btn mt-4.75 h-13 w-full justify-between pr-2 pl-6">
            <NuxtLink to="/pricing">See pricing<CanopyArrowChip /></NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <!-- ───────── Questions ───────── -->
    <section class="grid gap-x-12 gap-y-7 py-14 lg:py-18 xl:py-22.5 tab:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <div class="text-sm font-medium tracking-widest text-brand uppercase">Questions</div>
        <h2 class="mt-3.5 text-3xl md:text-4xl lg:text-5xl leading-none font-normal tracking-tight text-balance">Asked before joining.</h2>
        <p class="mt-4 max-w-96 text-muted-foreground">Something else on your mind? Write to us and a person will answer.</p>
        <Button as-child variant="line" size="pill" class="mt-4.5">
          <NuxtLink to="/contact">Talk to us →</NuxtLink>
        </Button>
      </div>
      <div class="border-t border-border">
        <details v-for="(item, index) in questions" :key="item.q" :open="index === 0" class="reveal group/faq border-b border-border">
          <summary class="flex min-h-14.5 cursor-pointer list-none items-center justify-between gap-4 py-1.5 font-display text-lg font-normal tracking-tight [&::-webkit-details-marker]:hidden">
            {{ item.q }}
            <span aria-hidden="true" class="grid size-8 flex-none place-items-center rounded-full bg-mint font-text font-medium text-deep transition-transform duration-200 ease-canopy group-open/faq:rotate-45">+</span>
          </summary>
          <p class="max-w-176 pr-12 pb-4.75 text-muted-foreground max-sm:pr-0">{{ item.a }}</p>
        </details>
      </div>
    </section>

    <!-- ───────── Closing: the same slim green band the homepage ends on ───────── -->
    <section
      data-rise
      data-surface="forest"
      aria-labelledby="join-title"
      class="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 rounded-panel bg-forest px-6 md:px-8.75 lg:px-11.5 xl:px-14.5 py-7 lg:py-8.25 xl:py-10.25 text-white max-sm:rounded-2xl"
    >
      <div class="min-w-0 grow basis-88">
        <h2 id="join-title" class="text-2xl md:text-3xl lg:text-4xl leading-none font-normal tracking-tight">Put your practice in front of clients.</h2>
        <p class="mt-2.5 text-lg text-on-forest">Create your profile today. We check it, then clients can find you.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2.75">
        <Button as-child variant="lime" size="pill" class="max-sm:w-full"><NuxtLink :to="REGISTER">Register as a lawyer</NuxtLink></Button>
        <Button as-child variant="on-forest" size="pill" class="max-sm:w-full"><NuxtLink to="/pricing">See pricing</NuxtLink></Button>
      </div>
    </section>
  </div>
</template>
