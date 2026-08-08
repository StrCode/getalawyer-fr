<script setup lang="ts">
import { ArrowDown01Icon, Calendar01Icon, Message01Icon, Money01Icon, Shield01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Hugeicon } from '@/lib/icon-types'
import { ref, computed } from 'vue'
import { useLawyerMembershipPricing } from '~/composables/useLawyerMembershipPricing'
import { formatNairaAmount } from '~/composables/useSubscription'

definePageMeta({ layout: 'landing' })

const { data: pricing } = await useLawyerMembershipPricing()

const subscriptionPriceLabel = computed(() =>
  pricing.value ? formatNairaAmount(pricing.value.subscriptionPriceNaira) : '₦30,000',
)

useSeoMeta({
  title: 'For Lawyers — getalawyer',
  description: () =>
    `Grow your practice. Keep every naira you earn. Join verified lawyers across Nigeria for ${subscriptionPriceLabel.value}/year.`,
})

const features: { title: string, desc: string, icon: Hugeicon }[] = [
  {
    title: 'Bar-verified credentials',
    desc: 'NIN and SCN verified. Build instant trust with clients before they even message you.',
    icon: Shield01Icon,
  },
  {
    title: 'Your schedule, your rules',
    desc: 'Set your availability and consultation types. You decide when and how you take consultations.',
    icon: Calendar01Icon,
  },
  {
    title: 'Direct messaging',
    desc: 'Built-in secure messaging. Talk to clients, exchange files, and manage your pipeline.',
    icon: Message01Icon,
  },
  {
    title: 'Zero commission',
    desc: 'We do not take a cut of your consultation fees. You keep 100% of what you earn.',
    icon: Money01Icon,
  }
]

const lawyerSteps = [
  { num: '01', title: 'Create your profile', desc: 'Sign up and submit your NIN and SCN for verification. Our team reviews applications within 24 hours.' },
  { num: '02', title: 'Set your schedule', desc: 'Sync your calendar and set your availability. You have full control over when you take consultations.' },
  { num: '03', title: 'Receive enquiries', desc: 'Clients find you in our directory and message you directly. Answer questions and agree consultation fees in chat.' },
  { num: '04', title: 'Consult & get paid', desc: 'Meet by video, phone, or in person. Clients pay your fees directly to you — GetaLawyer does not process consultation payments.' },
]

const faqItems = computed(() => [
  { q: 'How long does verification take?', a: 'We typically verify your NIN and Supreme Court Number within 24-48 hours. Once approved, your profile goes live immediately.' },
  { q: 'Do you take a percentage of my fees?', a: `No. We charge a flat ${subscriptionPriceLabel.value} annual subscription — the only payment processed on GetaLawyer. You keep 100% of the consultation fees you agree with clients.` },
  { q: 'Do clients pay through GetaLawyer?', a: 'No. Client consultation fees are not processed on our site. You agree fees with clients in messaging or before your session, and they pay you directly on terms you set (for example, bank transfer).' },
  { q: 'What happens if a client cancels?', a: 'You set your own cancellation policy. If a client cancels a booking, handle rescheduling or any refund directly with them — GetaLawyer does not hold or refund consultation fees.' },
])

const openFaqs = ref([false, false, false, false])

const toggleFaq = (index: number) => {
  openFaqs.value[index] = !openFaqs.value[index]
}
</script>

<template>
  <div class="bg-background">

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-foreground text-background section-y-lg">
      <div class="pointer-events-none absolute -top-48 left-1/2 size-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-6 text-center md:px-8">
        <p class="eyebrow mb-6 text-primary">For legal professionals</p>
       <h1 class="text-5xl font-medium md:text-6xl mx-auto max-w-3xl text-background">
          Grow your practice.<br>
          <em class="font-normal italic">Keep every naira you earn.</em>
        </h1>
        <p class="mx-auto mt-8 mb-10 max-w-xl text-lg leading-relaxed text-background/70">
          Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat subscription.
        </p>

        <Button size="lg" class="cursor-pointer" as-child>
          <NuxtLink to="/register?role=lawyer">
            Register as a lawyer
          </NuxtLink>
        </Button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="bg-background section-y">
      <div class="mx-auto max-w-7xl px-6 md:px-8">
        <div class="mb-16 text-center">
         <h2 class="text-4xl font-medium md:text-5xl mb-4 text-foreground">
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
              class="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted text-primary"
            >
              <HugeiconsIcon :icon="feat.icon" class="size-6" aria-hidden="true" />
            </div>
           <h4 class="mb-3 text-base font-semibold text-foreground">{{ feat.title }}</h4>
            <p class="text-sm leading-relaxed text-muted-foreground">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works for lawyers -->
    <section class="border-t border-background/20 bg-foreground text-background section-y">
      <div class="mx-auto max-w-7xl px-6 md:px-8">
        <div class="mb-16">
          <p class="eyebrow mb-4 text-primary">Onboarding</p>
         <h2 class="text-4xl font-medium md:text-5xl mb-4 text-background">
            How to get started
          </h2>
          <p class="max-w-2xl text-lg text-background/70">
            Four simple steps to start growing your digital practice.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="step in lawyerSteps"
            :key="step.num"
            class="rounded-2xl border border-background/20 bg-background/5 p-8"
          >
            <div class="font-heading mb-6 text-5xl leading-none text-primary italic">
              {{ step.num }}
            </div>
           <h3 class="mb-3 text-base font-semibold text-background">{{ step.title }}</h3>
            <p class="text-sm leading-relaxed text-background/70">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="border-t border-border bg-muted section-y">
      <div class="mx-auto max-w-7xl px-6 md:px-8">

        <div class="mx-auto mb-16 max-w-2xl text-center">
         <h2 class="text-4xl font-medium md:text-5xl mb-4 text-foreground">
            Simple, transparent pricing.
          </h2>
          <p class="text-lg leading-relaxed text-muted-foreground">
            Stop paying 20-30% in platform fees. Reach thousands of clients for a flat annual rate.
          </p>
        </div>

        <!-- Pricing Card -->
        <div class="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-10 shadow-sm ring-2 ring-primary/30">
          <p class="eyebrow mb-6 text-center text-primary-strong">Annual membership</p>

          <div class="mb-8 mt-2 text-center">
           <h3 class="mb-3 text-base font-semibold text-foreground">Annual Subscription</h3>
            <div class="mb-2 flex items-end justify-center gap-1.5">
              <span class="font-heading text-5xl leading-none tabular-nums text-foreground">{{ subscriptionPriceLabel }}</span>
              <span class="mb-1.5 text-sm text-muted-foreground">/ year</span>
            </div>
            <p class="text-sm text-muted-foreground">The only payment on GetaLawyer. Consultation fees are paid directly to you.</p>
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
    <section class="bg-background section-y">
      <div class="mx-auto max-w-3xl px-6 md:px-8">
        <div class="mb-16 text-center">
         <h2 class="text-4xl font-medium md:text-5xl text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div class="space-y-4">
          <div
            v-for="(faq, idx) in faqItems"
            :key="idx"
            class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200"
          >
            <button
              @click="toggleFaq(idx)"
              class="group flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-6 text-left"
            >
              <span class="pr-8 text-base font-semibold text-foreground">{{ faq.q }}</span>
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-transform duration-300"
                :class="{ 'rotate-180': openFaqs[idx] }"
              >
                <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4" />
              </div>
            </button>
            <div
              v-show="openFaqs[idx]"
              class="px-6 pb-6 text-sm leading-relaxed text-muted-foreground"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="border-t border-background/20 bg-foreground text-center text-background section-y-lg">
      <div class="mx-auto max-w-2xl px-6 md:px-8">
       <h2 class="text-4xl font-medium md:text-5xl mb-6 text-background">
          Ready to grow your digital practice?
        </h2>
        <p class="mb-10 text-lg leading-relaxed text-background/70">
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
