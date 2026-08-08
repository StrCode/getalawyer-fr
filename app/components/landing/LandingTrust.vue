<script setup lang="ts">
import { CheckmarkBadge01Icon, Message01Icon, Money01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

/**
 * Trust section built on claims we can actually stand behind — verification,
 * pricing structure, free first contact. Deliberately no testimonials or star
 * ratings: a review system doesn't exist yet, and invented ones are worse
 * than none on a legal marketplace.
 */
const proofs = [
  {
    icon: Message01Icon,
    title: 'Ask first, free',
    desc: 'Message any lawyer before committing to anything. You only agree a consultation fee if you need more than an answer.',
  },
  {
    icon: Money01Icon,
    title: 'Zero commission',
    desc: 'Your fee goes to your lawyer, agreed directly between you. GetaLawyer takes no cut of consultation fees.',
  },
]
</script>

<template>
  <section class="bg-background section-y">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <!-- Section header -->
      <div class="mb-10 max-w-2xl">
        <p class="eyebrow mb-4 text-primary-strong">Trust, verifiable</p>
       <h2 class="text-3xl font-medium md:text-4xl text-foreground">
          Claims you can check, not reviews we wrote.
        </h2>
      </div>

      <!-- Verification panel -->
      <div class="relative overflow-hidden rounded-2xl border border-background/20 bg-foreground p-10 text-left md:p-14 lg:p-16">
        <p class="relative z-10 max-w-4xl font-heading text-[clamp(1.5rem,3.5vw,2.625rem)] leading-tight tracking-tight text-background">
          Every lawyer here passed
          <em class="font-semibold not-italic text-primary">NIN and SCN verification</em>
          before their profile went live — identity and Supreme Court enrolment, checked against official records.
        </p>

        <div class="relative z-10 mt-10 flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/5 px-3.5 py-1.5 text-sm font-medium text-background">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" class="size-4 text-primary" aria-hidden="true" />
            National Identification Number
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/5 px-3.5 py-1.5 text-sm font-medium text-background">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" class="size-4 text-primary" aria-hidden="true" />
            Supreme Court enrolment
          </span>
        </div>
      </div>

      <!-- Structural guarantees -->
      <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          v-for="p in proofs"
          :key="p.title"
          class="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
        >
          <div class="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon :icon="p.icon" class="size-5" aria-hidden="true" />
          </div>
         <h3 class="mb-2 text-lg font-medium text-foreground">{{ p.title }}</h3>
          <p class="text-base leading-relaxed text-muted-foreground">{{ p.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
