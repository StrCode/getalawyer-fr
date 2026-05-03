<script setup lang="ts">
import type { Component } from 'vue'
import { motion } from 'motion-v'
import { formatMembershipNgn, useLawyerMembershipPricing } from '~/composables/useLawyerMembershipPricing'
import {
  PhCalendarDots,
  PhChatsCircle,
  PhCheckCircle,
  PhCurrencyDollar,
  PhIdentificationCard,
  PhInfo,
  PhSealCheck,
  PhShieldCheck,
} from '@phosphor-icons/vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Benefit {
  title: string
  description: string
  icon: Component
  features: string[]
}

interface JoinStep {
  step: number
  title: string
  description: string
  icon: Component
}

interface Testimonial {
  name: string
  title: string
  location: string
  quote: string
}

definePageMeta({
  layout: 'home',
})

useHead({
  title: 'For lawyers — Join GetaLawyer',
  meta: [
    {
      name: 'description',
      content:
        'Bar-verified presence, bookings, messaging, and a flat subscription—keep your consultation revenue. Learn how lawyers join GetaLawyer.',
    },
  ],
})

/** Deep links from the header mega menu. */
const registerLawyerTo = '/register?role=lawyer'

const dashboardTo = '/dashboard'

const { session } = useAuth()

const isSignedIn = computed(() => Boolean(session.value?.user?.id))

const dashboardCtaLabel = computed(() => {
  const t = session.value?.user?.userType
  if (t === 'lawyer')
    return 'Go to your lawyer dashboard'
  if (t === 'client')
    return 'Go to your client dashboard'
  return 'Go to your dashboard'
})

const signedInSupportingLine = computed(() => {
  const t = session.value?.user?.userType
  if (t === 'lawyer')
    return 'Use your dashboard to manage your profile, bookings, availability, and messages.'
  if (t === 'client')
    return 'You\'re browsing as a signed-in client. Open your dashboard to manage bookings and lawyers you work with.'
  return 'You\'re signed in—open your dashboard to continue.'
})

const joinSteps: JoinStep[] = [
  {
    step: 1,
    title: 'Create your lawyer account',
    description:
      'Sign up with your professional details and choose the lawyer path. You will set up profile basics before verification.',
    icon: PhIdentificationCard,
  },
  {
    step: 2,
    title: 'Complete bar verification',
    description:
      'Submit the information we need to confirm you are in good standing. Your profile can show a verified badge once approved.',
    icon: PhSealCheck,
  },
  {
    step: 3,
    title: 'Go live with bookings',
    description:
      'Publish availability, clarify how clients meet you, and respond through secure messaging—all under one subscription.',
    icon: PhCalendarDots,
  },
]

const benefits: Benefit[] = [
  {
    title: 'Bar-verified credibility',
    description: 'Differentiate from generic listings with verification clients can rely on.',
    icon: PhShieldCheck,
    features: [
      'Structured bar verification workflow',
      'Verified badge surfaced on profile',
      'Signals trust before the first message',
    ],
  },
  {
    title: 'Booking on your calendar',
    description: 'Offer slots that reflect how you actually work—without a separate scheduler stack.',
    icon: PhCalendarDots,
    features: [
      'Configurable availability windows',
      'Reminders and confirmations for bookings',
      'Less back-and-forth to find a time',
    ],
  },
  {
    title: 'Conversation in one place',
    description: 'Keep inquiries and consultation context together instead of scattering across inbox apps.',
    icon: PhChatsCircle,
    features: [
      'Secure messaging with clients',
      'Video-ready consultations where offered',
      'Room to attach and refer to documents',
    ],
  },
  {
    title: 'Keep what you bill',
    description: 'Consultation economics stay between you and the client; the platform stays out of commission.',
    icon: PhCurrencyDollar,
    features: [
      'No percentage taken from consultation fees',
      'Straightforward payouts per your arrangement',
      'Predictable infra cost via subscription',
    ],
  },
]

const pricingFeatures = [
  'Included client-facing consultations tracked on the platform',
  'Bar verification and verified-badge eligibility',
  'Booking flow tied to your published availability',
  'Secure messaging and video sessions where configured',
  'No commission line item on consultation fees',
  'Profile controls and essentials for presenting your practice',
  'Higher-touch support tier for practitioner accounts',
] as const

const testimonials: Testimonial[] = [
  {
    name: 'Sarah M.',
    title: 'Family law',
    location: 'New York',
    quote:
      'Verification is visible up front—that shortens the trust conversation. The flat subscription is simpler than commission math on every consultation.',
  },
  {
    name: 'Michael C.',
    title: 'Corporate',
    location: 'San Francisco',
    quote:
      'Having booking and messaging in one place replaced a messy mix of calendar invites and scattered email threads.',
  },
  {
    name: 'Jennifer R.',
    title: 'Criminal defense',
    location: 'Chicago',
    quote:
      'Clients already expect to compare lawyers online; this ties profile, credibility, and scheduling together without reinventing ops.',
  },
]

function initials(name: string) {
  const parts = name.replace(/\.$/, '').split(/[\s.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')
}

const { data: membershipPricing, status: pricingStatus } = useLawyerMembershipPricing()

const displayMonthlyNgn = computed(() => {
  const n = membershipPricing.value?.monthlyAmountNgn
  return typeof n === 'number' && n > 0 ? n : 20_000
})

const formattedMonthlyPrice = computed(() => formatMembershipNgn(displayMonthlyNgn.value))

const pricingLoading = computed(() => pricingStatus.value === 'idle' || pricingStatus.value === 'pending')
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Hero -->
    <section class="relative scroll-mt-24 overflow-hidden border-border border-b bg-linear-to-b from-muted/50 to-background pt-24 pb-20 md:pt-28 md:pb-28 dark:from-muted/15">
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-brand/8 to-transparent opacity-70 dark:from-brand/12"
        aria-hidden="true"
      />
      <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            class="mb-6 border border-border bg-muted/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-none"
          >
            For legal professionals
          </Badge>

          <h1 class="text-balance font-bold text-4xl text-foreground tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            A verified presence, bookings, and messaging—without giving up consultation revenue
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            GetaLawyer is built for practitioners who want a credible directory profile, clearer scheduling, and client
            conversations in one workflow. You subscribe once; consultation fees remain between you and the client.
          </p>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
            <HomeStackLink
              v-if="!isSignedIn"
              :to="registerLawyerTo"
              variant="primary"
              inner-class="min-h-[52px] px-8 text-sm"
            >
              Register as a lawyer
            </HomeStackLink>
            <HomeStackLink
              v-else
              :to="dashboardTo"
              variant="primary"
              inner-class="min-h-[52px] px-8 text-sm"
            >
              {{ dashboardCtaLabel }}
            </HomeStackLink>
            <HomeStackLink
              to="/for-lawyers#how-you-join"
              variant="muted"
              inner-class="min-h-[52px] px-8 text-sm"
            >
              How joining works
            </HomeStackLink>
          </div>
        </div>
      </div>
    </section>

    <!-- How joining works -->
    <section id="how-you-join" class="scroll-mt-24 border-border border-b bg-background py-20 md:py-24 dark:bg-background">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            How joining works
          </h2>
          <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
            Three milestones from signup to a live practitioner profile—the same anchors your dashboard checklist will track.
          </p>
        </div>

        <ol class="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          <motion.li
            v-for="(item, i) in joinSteps"
            :key="item.title"
            :initial="{ opacity: 0, y: 16 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.45, delay: 0.08 * i }"
            class="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <span
              class="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
            >
              {{ item.step }}
            </span>
            <div class="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand" aria-hidden="true">
              <component :is="item.icon" class="size-6" weight="duotone" />
            </div>
            <h3 class="font-semibold text-lg text-foreground tracking-tight">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
              {{ item.description }}
            </p>
          </motion.li>
        </ol>
      </div>
    </section>

    <!-- Platform value / benefits (header deep link) -->
    <section id="benefits" class="scroll-mt-24 bg-muted/25 py-20 md:py-24 dark:bg-muted/10">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Lawyer membership · what&apos;s included
          </h2>
          <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
            These capabilities map directly to the subscription—so what you read here is what you are paying to operate on the platform.
          </p>
        </div>

        <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard v-for="benefit in benefits" :key="benefit.title" :benefit="benefit" />
        </div>
      </div>
    </section>

    <!-- Pricing (header deep link) -->
    <section id="pricing" class="scroll-mt-24 border-border border-b bg-background py-20 md:py-24">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            One transparent subscription
          </h2>
          <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
            Monthly membership is billed in <span class="font-medium text-foreground">Nigerian naira (NGN)</span>.
            Replace commission surprises with a flat recurring fee—consultation revenue stays with your practice.
          </p>
        </div>

        <Card class="mx-auto mt-12 max-w-lg border-border shadow-md">
          <CardHeader class="flex flex-col gap-1 border-border border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle class="text-xl">
                Professional
              </CardTitle>
              <CardDescription class="text-base">
                Full practitioner toolkit on GetaLawyer
              </CardDescription>
            </div>
            <div class="flex min-h-13 items-baseline gap-1 pt-2 tabular-nums sm:min-h-0 sm:justify-end sm:pt-0">
              <template v-if="pricingLoading">
                <span class="inline-block h-10 w-24 animate-pulse rounded-md bg-muted" aria-hidden="true" />
              </template>
              <template v-else>
                <span class="font-bold text-4xl text-foreground tracking-tight">{{ formattedMonthlyPrice }}</span>
                <span class="text-muted-foreground">/month</span>
              </template>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 pt-6">
            <ul class="flex flex-col gap-3">
              <li
                v-for="feature in pricingFeatures"
                :key="feature"
                class="flex gap-3 text-sm text-foreground"
              >
                <PhCheckCircle class="mt-0.5 size-4 shrink-0 text-brand" weight="fill" aria-hidden="true" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <div class="flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 dark:bg-brand/10">
              <PhInfo class="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <p class="text-sm text-foreground leading-relaxed">
                We do not take a percentage of what you charge for consultations. Your subscription covers platform access;
                fees you negotiate with clients are yours to keep.
              </p>
            </div>

            <p class="text-center text-muted-foreground text-xs leading-relaxed">
              The amount shown is loaded from configuration or—when wired—your public billing endpoint. What you pay when
              you subscribe or renew is whatever checkout or invoicing renders.
              <template v-if="membershipPricing?.source === 'remote'">
                <span class="text-foreground">&nbsp;(served from billing API)</span>
              </template>
            </p>

            <HomeStackLink
              v-if="!isSignedIn"
              :to="registerLawyerTo"
              variant="primary"
              outer-class="w-full"
              inner-class="min-h-[52px] w-full justify-center text-sm"
            >
              Start registration
            </HomeStackLink>
            <HomeStackLink
              v-else
              :to="dashboardTo"
              variant="primary"
              outer-class="w-full"
              inner-class="min-h-[52px] w-full justify-center text-sm"
            >
              {{ dashboardCtaLabel }}
            </HomeStackLink>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Social proof -->
    <section class="bg-muted/25 py-20 md:py-24 dark:bg-muted/10">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            What lawyers focus on first
          </h2>
          <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
            Examples of what practitioners say matters when they move intake and discovery online—quoted here for tone, not as live endorsements.
          </p>
        </div>

        <div class="mt-14 grid gap-6 md:grid-cols-3">
          <Card
            v-for="t in testimonials"
            :key="t.name"
            class="h-full border-border bg-card shadow-sm"
          >
            <CardContent class="flex h-full flex-col gap-6 pt-6">
              <blockquote class="flex-1 border-brand/25 border-l-2 pl-4 text-foreground/90 text-sm leading-relaxed">
                “{{ t.quote }}”
              </blockquote>
              <div class="flex items-center gap-3 border-border border-t pt-4">
                <Avatar class="size-11 border border-border">
                  <AvatarFallback class="bg-muted text-muted-foreground text-xs font-semibold">
                    {{ initials(t.name) }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-semibold text-foreground text-sm">
                    {{ t.name }}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    {{ t.title }} · {{ t.location }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="relative overflow-hidden bg-marketing-band py-20 text-white md:py-24">
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-br from-brand/25 via-transparent to-transparent opacity-80"
        aria-hidden="true"
      />
      <div class="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h2 class="text-balance font-bold text-3xl tracking-tight md:text-4xl">
          Ready to put verification, scheduling, and messaging in one stack?
        </h2>
        <p class="mx-auto mt-5 max-w-xl text-base text-white/85 leading-relaxed md:text-lg">
          <template v-if="!isSignedIn">
            Create your lawyer account, complete verification, and publish the profile clients see when they compare practitioners.
          </template>
          <template v-else>
            {{ signedInSupportingLine }}
          </template>
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-3">
          <HomeStackLink
            v-if="!isSignedIn"
            :to="registerLawyerTo"
            variant="primary"
            inner-class="min-h-[52px] px-8 text-sm"
          >
            Register as a lawyer
          </HomeStackLink>
          <HomeStackLink
            v-else
            :to="dashboardTo"
            variant="primary"
            inner-class="min-h-[52px] px-8 text-sm"
          >
            {{ dashboardCtaLabel }}
          </HomeStackLink>
        </div>
      </div>
    </section>

    <FooterSection />
  </div>
</template>
