<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'For Lawyers — getalawyer',
  description: 'Grow your practice. Keep every naira you earn. Join verified lawyers across Nigeria reaching clients who are ready to book.',
})

const { openModal } = useLandingModal()

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
</script>

<template>
  <div class="bg-brand-cream">
    
    <!-- Hero Section -->
    <section class="bg-brand-green-900 text-brand-cream py-[120px] relative overflow-hidden">
      <!-- Radial glow -->
      <div class="absolute pointer-events-none" style="top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(134,194,142,0.12) 0%,transparent 70%);" />

      <div class="max-w-[1280px] mx-auto px-8 relative text-center">
        <p class="text-[13px] font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-6">For legal professionals</p>
        <h1 class="font-heading font-medium text-brand-cream leading-[1.05] tracking-[-0.02em] mx-auto max-w-[800px]" style="font-size:clamp(44px,5vw,72px);">
          Grow your practice.<br>
          <em class="italic font-normal">Keep every naira you earn.</em>
        </h1>
        <p class="text-[20px] leading-[1.5] mt-8 mb-10 mx-auto" style="color:rgba(244,241,232,0.7);max-width:640px;">
          Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat subscription.
        </p>

        <button
          @click="openModal('signup')"
          class="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-cream text-brand-green-900 font-medium text-[16px] hover:bg-white hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans"
        >
          Register as a lawyer
        </button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-[100px]">
      <div class="max-w-[1280px] mx-auto px-8">
        <div class="text-center mb-16">
          <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            Everything you need to succeed
          </h2>
          <p class="text-[18px] text-brand-ink-soft max-w-[600px] mx-auto">
            We provide the infrastructure and the clients. You provide the counsel. No hidden fees.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="p-8 rounded-[20px] bg-white border border-brand-line shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              class="w-12 h-12 rounded-[12px] flex items-center justify-center text-brand-green-700 mb-6"
              style="background:rgba(134,194,142,0.2);"
              v-html="feat.icon"
            />
            <h4 class="text-[18px] font-semibold text-brand-green-900 mb-3">{{ feat.title }}</h4>
            <p class="text-[15px] leading-[1.5] text-brand-ink-soft">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-[100px] bg-brand-cream-warm border-t border-brand-line/50">
      <div class="max-w-[1280px] mx-auto px-8">
        
        <div class="text-center max-w-[720px] mx-auto mb-16">
          <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            Simple, transparent pricing.
          </h2>
          <p class="text-[18px] text-brand-ink-soft leading-[1.5]">
            Stop paying 20-30% in platform fees. Reach thousands of clients for a flat annual rate.
          </p>
        </div>

        <!-- Pricing Card -->
        <div class="max-w-[480px] mx-auto bg-white rounded-[24px] border border-brand-line p-10 shadow-[0_12px_40px_-12px_rgba(15,46,26,0.15)] relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-[6px] bg-brand-green-700"></div>
          
          <div class="text-center mb-8 mt-2">
            <h3 class="text-[20px] font-semibold text-brand-green-900 mb-3">Annual Subscription</h3>
            <div class="flex items-end justify-center gap-1.5 mb-2">
              <span class="font-heading font-medium text-brand-green-900 leading-none" style="font-size: 52px;">₦30,000</span>
              <span class="text-[16px] text-brand-ink-soft mb-1.5">/ year</span>
            </div>
            <p class="text-[14px] text-brand-ink-soft">Billed annually. Cancel anytime.</p>
          </div>

          <button 
            @click="openModal('signup')"
            class="w-full bg-brand-green-700 hover:bg-brand-green-900 text-brand-cream border-none py-[16px] rounded-full font-sans text-[16px] font-medium cursor-pointer transition-colors duration-200"
          >
            Start your membership
          </button>
        </div>

      </div>
    </section>

  </div>
</template>
