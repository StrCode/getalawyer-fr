<script setup lang="ts">
import { ref } from 'vue'
import { PhCaretDown } from '@phosphor-icons/vue'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'For Lawyers — getalawyer',
  description: 'Grow your practice. Keep every naira you earn. Join verified lawyers across Nigeria reaching clients who are ready to book.',
})

const features = [
  {
    title: 'Bar-verified credentials',
    desc: 'NIN and SCN verified. Build instant trust with clients before they even message you.',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Smart booking',
    desc: 'Calendar that syncs with yours. Clients book directly into your available slots.',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>`,
  },
  {
    title: 'Direct messaging',
    desc: 'Built-in secure messaging. Talk to clients, exchange files, and manage your pipeline.',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    title: 'Zero commission',
    desc: 'We do not take a cut of your consultation fees. You keep 100% of what you earn.',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  }
]

const lawyerSteps = [
  { num: '01', title: 'Create your profile', desc: 'Sign up and submit your NIN and SCN for verification. Our team reviews applications within 24 hours.' },
  { num: '02', title: 'Set your schedule', desc: 'Sync your calendar and set your availability. You have full control over when you take consultations.' },
  { num: '03', title: 'Receive bookings', desc: 'Clients find you in our directory, book an available slot, and pay upfront. No chasing invoices.' },
  { num: '04', title: 'Consult & get paid', desc: 'Meet with the client via our built-in tools or in person. You keep 100% of your fee.' },
]

const faqs = ref([
  { q: 'How long does verification take?', a: 'We typically verify your NIN and Supreme Court Number within 24-48 hours. Once approved, your profile goes live immediately.', open: false },
  { q: 'Do you take a percentage of my fees?', a: 'No. Unlike other platforms, we charge a flat ₦30,000 annual subscription. You keep 100% of the consultation fees you charge your clients.', open: false },
  { q: 'How do I receive payments from clients?', a: 'Clients pay securely through our platform when they book a slot. The funds are routed directly to your connected bank account.', open: false },
  { q: 'What happens if a client cancels?', a: 'You have full control over your cancellation policy. You can choose to refund them, or keep a percentage if they cancel within 24 hours of the meeting.', open: false },
])

const toggleFaq = (index: number) => {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <div class="bg-canvas">

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-ink py-24 text-ink-foreground md:py-32">
      <div class="pointer-events-none absolute -top-48 left-1/2 size-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-6 text-center md:px-8">
        <p class="text-eyebrow mb-6 text-brass">For legal professionals</p>
        <h1 class="display-2xl mx-auto max-w-3xl text-ink-foreground">
          Grow your practice.<br>
          <em class="font-normal italic">Keep every naira you earn.</em>
        </h1>
        <p class="mx-auto mt-8 mb-10 max-w-xl text-lg leading-relaxed text-ink-muted">
          Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat subscription.
        </p>

        <Button size="lg" class="cursor-pointer bg-paper text-foreground hover:bg-paper/90" as-child>
          <NuxtLink to="/register?role=lawyer">
            Register as a lawyer
          </NuxtLink>
        </Button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="bg-canvas py-24">
      <div class="mx-auto max-w-7xl px-6 md:px-8">
        <div class="mb-16 text-center">
          <h2 class="display-xl mb-4 text-foreground">
            Everything you need to succeed
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-muted-foreground">
            We provide the infrastructure and the clients. You provide the counsel. No hidden fees.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              class="mb-6 flex size-12 items-center justify-center rounded-xl bg-surface-2 text-primary"
              v-html="feat.icon"
            />
            <h4 class="mb-3 text-base font-semibold text-foreground">{{ feat.title }}</h4>
            <p class="text-sm leading-relaxed text-muted-foreground">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works for lawyers -->
    <section class="border-t border-ink-border bg-ink py-24 text-ink-foreground">
      <div class="mx-auto max-w-7xl px-6 md:px-8">
        <div class="mb-16">
          <p class="text-eyebrow mb-4 text-brass">Onboarding</p>
          <h2 class="display-xl mb-4 text-ink-foreground">
            How to get started
          </h2>
          <p class="max-w-2xl text-lg text-ink-muted">
            Four simple steps to start growing your digital practice.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="step in lawyerSteps"
            :key="step.num"
            class="rounded-2xl border border-ink-border bg-ink-foreground/5 p-8"
          >
            <div class="font-display mb-6 text-5xl leading-none text-brass italic">
              {{ step.num }}
            </div>
            <h3 class="mb-3 text-base font-semibold tracking-tight text-ink-foreground">{{ step.title }}</h3>
            <p class="text-sm leading-relaxed text-ink-muted">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="border-t border-border bg-surface-2 py-24">
      <div class="mx-auto max-w-7xl px-6 md:px-8">

        <div class="mx-auto mb-16 max-w-2xl text-center">
          <h2 class="display-xl mb-4 text-foreground">
            Simple, transparent pricing.
          </h2>
          <p class="text-lg leading-relaxed text-muted-foreground">
            Stop paying 20-30% in platform fees. Reach thousands of clients for a flat annual rate.
          </p>
        </div>

        <!-- Pricing Card -->
        <div class="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-10 shadow-sm ring-2 ring-brass/30">
          <p class="text-eyebrow mb-6 text-center text-brass">Annual membership</p>

          <div class="mb-8 mt-2 text-center">
            <h3 class="mb-3 text-base font-semibold text-foreground">Annual Subscription</h3>
            <div class="mb-2 flex items-end justify-center gap-1.5">
              <span class="font-display text-5xl leading-none tabular-nums text-foreground">₦30,000</span>
              <span class="mb-1.5 text-sm text-muted-foreground">/ year</span>
            </div>
            <p class="text-sm text-muted-foreground">Billed annually. Cancel anytime.</p>
          </div>

          <Button size="lg" class="w-full cursor-pointer" as-child>
            <NuxtLink to="/register?role=lawyer">
              Start your membership
            </NuxtLink>
          </Button>
        </div>

      </div>
    </section>

    <!-- FAQ Section -->
    <section class="bg-canvas py-24">
      <div class="mx-auto max-w-3xl px-6 md:px-8">
        <div class="mb-16 text-center">
          <h2 class="display-xl text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div class="space-y-4">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200"
          >
            <button
              @click="toggleFaq(idx)"
              class="group flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-6 text-left"
            >
              <span class="pr-8 text-base font-semibold text-foreground">{{ faq.q }}</span>
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-primary transition-transform duration-300"
                :class="{ 'rotate-180': faq.open }"
              >
                <PhCaretDown class="size-4" weight="bold" />
              </div>
            </button>
            <div
              v-show="faq.open"
              class="px-6 pb-6 text-sm leading-relaxed text-muted-foreground"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="border-t border-ink-border bg-ink py-24 text-center text-ink-foreground">
      <div class="mx-auto max-w-2xl px-6 md:px-8">
        <h2 class="display-xl mb-6 text-ink-foreground">
          Ready to grow your digital practice?
        </h2>
        <p class="mb-10 text-lg leading-relaxed text-ink-muted">
          Join hundreds of verified lawyers securely acquiring clients on our platform today.
        </p>
        <Button size="lg" class="cursor-pointer" as-child>
          <NuxtLink to="/register?role=lawyer">
            Create your lawyer profile
          </NuxtLink>
        </Button>
      </div>
    </section>

  </div>
</template>
