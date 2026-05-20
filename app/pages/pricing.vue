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
  <section class="bg-background py-24 min-h-[80vh] flex flex-col items-center justify-center">
    <div class="max-w-7xl mx-auto px-6 md:px-8 w-full">
      
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p class="text-sm font-semibold text-primary tracking-[0.08em] uppercase mb-4">Pricing for Lawyers</p>
        <h1 class="font-heading font-medium text-sidebar leading-[1.05] tracking-[-0.02em] mb-6" style="font-size:clamp(36px,4.5vw,56px);">
          Simple, transparent pricing.
        </h1>
        <p class="text-5 text-muted-foreground leading-[1.5]">
          Zero commission. Keep 100% of what you charge. Just a flat yearly subscription to reach thousands of ready-to-book clients.
        </p>
      </div>

      <!-- Pricing Card -->
      <div class="max-w-lg mx-auto bg-white rounded-3xl border border-border p-10 shadow-[0_12px_40px_-12px_rgba(15,46,26,0.15)] relative overflow-hidden">
        <!-- Accent bar -->
        <div class="absolute top-0 left-0 right-0 h-[6px] bg-primary"></div>
        
        <div class="text-center mb-8 mt-2">
          <h2 class="text-5 font-semibold text-sidebar mb-3">Annual Subscription</h2>
          <div class="flex items-end justify-center gap-1.5 mb-2">
            <span class="font-heading font-medium text-sidebar leading-none" style="font-size: 52px;">₦30,000</span>
            <span class="text-4 text-muted-foreground mb-1.5">/ year</span>
          </div>
          <p class="text-3.5 text-muted-foreground">Billed annually. Cancel anytime.</p>
        </div>

        <NuxtLink
          to="/register?role=lawyer"
          class="flex w-full items-center justify-center bg-primary hover:bg-sidebar text-sidebar-foreground border-none py-4 rounded-full font-sans text-4 font-medium cursor-pointer transition-colors duration-200 mb-9 no-underline"
        >
          Register as a lawyer
        </NuxtLink>

        <!-- Features list -->
        <div>
          <p class="text-3 font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-4">Everything included:</p>
          <ul class="list-none p-0 m-0 space-y-3.5">
            <li v-for="feat in features" :key="feat" class="flex items-start gap-3 text-4 text-foreground font-medium">
              <div class="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-primary shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              {{ feat }}
            </li>
          </ul>
        </div>

      </div>
      
    </div>
  </section>
</template>
