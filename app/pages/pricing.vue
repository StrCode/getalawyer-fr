<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Pricing — getalawyer',
  description: 'Simple, transparent pricing for legal professionals. Keep 100% of your earnings for just ₦30,000 a year.',
  ogTitle: 'Pricing — getalawyer',
  ogDescription: 'Zero commission. Keep 100% of what you charge. Flat yearly subscription.',
})

const { openModal } = useLandingModal()

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
  <section class="bg-brand-cream py-[100px] min-h-[80vh] flex flex-col items-center justify-center">
    <div class="max-w-[1280px] mx-auto px-8 w-full">
      
      <!-- Header -->
      <div class="text-center max-w-[720px] mx-auto mb-16">
        <p class="text-[13px] font-semibold text-brand-green-700 tracking-[0.08em] uppercase mb-4">Pricing for Lawyers</p>
        <h1 class="font-heading font-medium text-brand-green-900 leading-[1.05] tracking-[-0.02em] mb-6" style="font-size:clamp(36px,4.5vw,56px);">
          Simple, transparent pricing.
        </h1>
        <p class="text-[18px] text-brand-ink-soft leading-[1.5]">
          Zero commission. Keep 100% of what you charge. Just a flat yearly subscription to reach thousands of ready-to-book clients.
        </p>
      </div>

      <!-- Pricing Card -->
      <div class="max-w-[480px] mx-auto bg-white rounded-[24px] border border-brand-line p-10 shadow-[0_12px_40px_-12px_rgba(15,46,26,0.15)] relative overflow-hidden">
        <!-- Accent bar -->
        <div class="absolute top-0 left-0 right-0 h-[6px] bg-brand-green-700"></div>
        
        <div class="text-center mb-8 mt-2">
          <h2 class="text-[20px] font-semibold text-brand-green-900 mb-3">Annual Subscription</h2>
          <div class="flex items-end justify-center gap-1.5 mb-2">
            <span class="font-heading font-medium text-brand-green-900 leading-none" style="font-size: 52px;">₦30,000</span>
            <span class="text-[16px] text-brand-ink-soft mb-1.5">/ year</span>
          </div>
          <p class="text-[14px] text-brand-ink-soft">Billed annually. Cancel anytime.</p>
        </div>

        <button 
          @click="openModal('signup')"
          class="w-full bg-brand-green-700 hover:bg-brand-green-900 text-brand-cream border-none py-[16px] rounded-full font-sans text-[16px] font-medium cursor-pointer transition-colors duration-200 mb-9"
        >
          Register as a lawyer
        </button>

        <!-- Features list -->
        <div>
          <p class="text-[12px] font-semibold text-brand-ink-soft uppercase tracking-[0.05em] mb-4">Everything included:</p>
          <ul class="list-none p-0 m-0 space-y-3.5">
            <li v-for="feat in features" :key="feat" class="flex items-start gap-3 text-[15px] text-brand-ink font-medium">
              <div class="w-5 h-5 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 shrink-0 mt-0.5">
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
