<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { Calendar01Icon, Message01Icon, Money01Icon, Shield01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const features: { title: string, desc: string, icon: Hugeicon }[] = [
  {
    title: 'Bar-verified credentials',
    desc: 'NIN and SCN verified. Build instant trust with clients.',
    icon: Shield01Icon,
  },
  {
    title: 'Your schedule, your rules',
    desc: 'Set availability and consultation types you control.',
    icon: Calendar01Icon,
  },
  {
    title: 'Direct messaging',
    desc: 'Talk to clients before and after consultations.',
    icon: Message01Icon,
  },
  {
    title: 'Zero commission',
    desc: 'Keep 100% of what you charge. Flat subscription only.',
    icon: Money01Icon,
  },
]
</script>

<template>
  <section id="lawyers" class="relative overflow-hidden bg-foreground text-background section-y">
    <!-- Subtle accent glow -->
    <div class="pointer-events-none absolute -top-48 -right-48 size-[600px] rounded-full bg-primary/5 blur-3xl" />

    <div class="relative mx-auto max-w-7xl px-6 md:px-8">
      <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">

        <!-- Left: copy -->
        <div>
          <p class="eyebrow mb-4 text-primary">For legal professionals</p>
         <h2 class="text-4xl font-medium md:text-5xl max-w-2xl text-background">
            Grow your practice. <em class="font-heading italic font-normal text-background/70">Keep every naira you earn.</em>
          </h2>
          <p class="mt-6 mb-9 max-w-lg text-xl leading-normal text-background/70">
            Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat monthly subscription. Your bar-verified credentials, displayed prominently.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <Button variant="brass" size="lg" as-child>
              <NuxtLink to="/register?role=lawyer">Register as a lawyer</NuxtLink>
            </Button>
            <Button
              variant="outline"
              size="lg"
              as-child
              class="border-background/20 bg-transparent text-background hover:border-background/60 hover:bg-white/5 hover:text-background"
            >
              <NuxtLink to="/for-lawyers">Learn more</NuxtLink>
            </Button>
          </div>
        </div>

        <!-- Right: 2×2 feature grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="group rounded-2xl border border-background/20 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div
              class="mb-4 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105"
            >
              <HugeiconsIcon :icon="feat.icon" class="size-[18px]" aria-hidden="true" />
            </div>
           <h4 class="mb-1.5 text-base font-medium text-background">{{ feat.title }}</h4>
            <p class="text-sm leading-normal text-background/70">{{ feat.desc }}</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
