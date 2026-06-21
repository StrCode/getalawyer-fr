<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Pricing — getalawyer',
  description: 'Simple, transparent pricing for legal professionals. Keep 100% of your earnings for just ₦30,000 a year.',
  ogTitle: 'Pricing — getalawyer',
  ogDescription: 'Zero commission. Keep 100% of what you charge. Flat yearly subscription.',
})

const features = [
  'Bar-verified credentials (NIN & SCN)',
  'Smart booking & calendar sync',
  'Direct messaging with clients',
  'Zero commission on your fees',
  'Priority listing in search results',
  'Dedicated lawyer dashboard'
]
</script>

<template>
  <section class="flex min-h-[80vh] flex-col items-center justify-center bg-canvas py-24">
    <div class="mx-auto w-full max-w-7xl px-6 md:px-8">

      <!-- Header -->
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <p class="text-eyebrow mb-4 text-brass">Pricing for Lawyers</p>
        <h1 class="display-xl mb-6 text-foreground">
          Simple, transparent pricing.
        </h1>
        <p class="text-lg leading-relaxed text-muted-foreground">
          Zero commission. Keep 100% of what you charge. Just a flat yearly subscription to reach thousands of ready-to-book clients.
        </p>
      </div>

      <!-- Pricing Card -->
      <div class="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-10 shadow-sm ring-2 ring-brass/35 md:p-12">
        <Badge variant="verified" class="absolute top-6 right-6">
          All-inclusive
        </Badge>

        <div class="mb-8 mt-2 text-center">
          <p class="text-eyebrow mb-4 text-brass">Annual membership</p>
          <h2 class="mb-3 text-base font-semibold text-foreground">Annual Subscription</h2>
          <div class="mb-2 flex items-end justify-center gap-1.5">
            <span class="font-display text-6xl leading-none tabular-nums text-foreground">₦30,000</span>
            <span class="mb-2 text-base text-muted-foreground">/ year</span>
          </div>
          <p class="text-sm text-muted-foreground">Billed annually. Cancel anytime.</p>
        </div>

        <Button size="lg" class="mb-10 w-full cursor-pointer" as-child>
          <NuxtLink to="/register?role=lawyer">
            Register as a lawyer
          </NuxtLink>
        </Button>

        <!-- Features list -->
        <div class="border-t border-border pt-8">
          <p class="text-eyebrow mb-5 text-muted-foreground">Everything included</p>
          <ul class="m-0 list-none space-y-4 p-0">
            <li v-for="feat in features" :key="feat" class="flex items-start gap-3 text-base text-foreground">
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-primary">
                <PhCheck class="size-3" weight="bold" />
              </span>
              {{ feat }}
            </li>
          </ul>
        </div>

      </div>

    </div>
  </section>
</template>
