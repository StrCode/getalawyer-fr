<script setup lang="ts">
import { ref } from 'vue'
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
  <div class="bg-brand-cream">
    
    <!-- Hero Section -->
    <section class="bg-brand-green-900 text-brand-cream py-32 relative overflow-hidden">
      <!-- Radial glow -->
      <div class="absolute pointer-events-none" style="top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(134,194,142,0.12) 0%,transparent 70%);" />

      <div class="max-w-7xl mx-auto px-6 md:px-8 relative text-center">
        <p class="text-sm font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-6">For legal professionals</p>
        <h1 class="font-heading font-medium text-brand-cream leading-[1.05] tracking-[-0.02em] mx-auto max-w-3xl" style="font-size:clamp(44px,5vw,72px);">
          Grow your practice.<br>
          <em class="italic font-normal">Keep every naira you earn.</em>
        </h1>
        <p class="text-5 leading-[1.5] mt-8 mb-10 mx-auto" style="color:rgba(244,241,232,0.7);max-width:640px;">
          Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat subscription.
        </p>

        <NuxtLink
          to="/register?role=lawyer"
          class="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-cream text-brand-green-900 font-medium text-4 hover:bg-white hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans no-underline"
        >
          Register as a lawyer
        </NuxtLink>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6 md:px-8">
        <div class="text-center mb-16">
          <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            Everything you need to succeed
          </h2>
          <p class="text-5 text-brand-ink-soft max-w-2xl mx-auto">
            We provide the infrastructure and the clients. You provide the counsel. No hidden fees.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="p-8 rounded-2xl bg-white border border-brand-line shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-brand-green-700 mb-6"
              style="background:rgba(134,194,142,0.2);"
              v-html="feat.icon"
            />
            <h4 class="text-5 font-semibold text-brand-green-900 mb-3">{{ feat.title }}</h4>
            <p class="text-4 leading-[1.5] text-brand-ink-soft">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works for lawyers -->
    <section class="py-24 bg-brand-green-900 text-brand-cream border-t border-brand-green-700/30">
      <div class="max-w-7xl mx-auto px-6 md:px-8">
        <div class="mb-16">
          <p class="text-sm font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-4">Onboarding</p>
          <h2 class="font-heading font-medium text-brand-cream tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            How to get started
          </h2>
          <p class="text-5 text-brand-cream/70 max-w-2xl">
            Four simple steps to start growing your digital practice.
          </p>
        </div>
        
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="step in lawyerSteps" :key="step.num" class="relative">
            <div class="font-heading italic font-normal text-brand-green-700 leading-none mb-6" style="font-size:56px;">
              {{ step.num }}
            </div>
            <h3 class="text-5 font-semibold text-brand-cream mb-3 tracking-[-0.01em]">{{ step.title }}</h3>
            <p class="text-4 text-brand-cream/70 leading-[1.55]">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-24 bg-brand-cream-warm border-t border-brand-line/50">
      <div class="max-w-7xl mx-auto px-6 md:px-8">
        
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            Simple, transparent pricing.
          </h2>
          <p class="text-5 text-brand-ink-soft leading-[1.5]">
            Stop paying 20-30% in platform fees. Reach thousands of clients for a flat annual rate.
          </p>
        </div>

        <!-- Pricing Card -->
        <div class="max-w-lg mx-auto bg-white rounded-3xl border border-brand-line p-10 shadow-[0_12px_40px_-12px_rgba(15,46,26,0.15)] relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-[6px] bg-brand-green-700"></div>
          
          <div class="text-center mb-8 mt-2">
            <h3 class="text-5 font-semibold text-brand-green-900 mb-3">Annual Subscription</h3>
            <div class="flex items-end justify-center gap-1.5 mb-2">
              <span class="font-heading font-medium text-brand-green-900 leading-none" style="font-size: 52px;">₦30,000</span>
              <span class="text-4 text-brand-ink-soft mb-1.5">/ year</span>
            </div>
            <p class="text-3.5 text-brand-ink-soft">Billed annually. Cancel anytime.</p>
          </div>

          <NuxtLink
            to="/register?role=lawyer"
            class="flex w-full items-center justify-center bg-brand-green-700 hover:bg-brand-green-900 text-brand-cream border-none py-4 rounded-full font-sans text-4 font-medium cursor-pointer transition-colors duration-200 no-underline"
          >
            Start your membership
          </NuxtLink>
        </div>

      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24">
      <div class="max-w-3xl mx-auto px-8">
        <div class="text-center mb-16">
          <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-4" style="font-size:clamp(32px,4vw,48px);">
            Frequently asked questions
          </h2>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="(faq, idx) in faqs" 
            :key="idx"
            class="border border-brand-line bg-white rounded-2xl overflow-hidden transition-all duration-200"
          >
            <button 
              @click="toggleFaq(idx)"
              class="w-full flex items-center justify-between p-6 text-left bg-transparent border-none cursor-pointer group"
            >
              <span class="text-4 font-semibold text-brand-green-900 pr-8">{{ faq.q }}</span>
              <div 
                class="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 shrink-0 transition-transform duration-300"
                :class="{ 'rotate-180': faq.open }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>
            <div 
              v-show="faq.open"
              class="px-6 pb-6 text-4 text-brand-ink-soft leading-[1.6]"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="py-24 text-center border-t border-brand-line/50">
      <div class="max-w-2xl mx-auto px-8">
        <h2 class="font-heading font-medium text-brand-green-900 tracking-tight mb-6" style="font-size:clamp(36px,4.5vw,56px);">
          Ready to grow your digital practice?
        </h2>
        <p class="text-5 text-brand-ink-soft leading-[1.5] mb-10">
          Join hundreds of verified lawyers securely acquiring clients on our platform today.
        </p>
        <NuxtLink
          to="/register?role=lawyer"
          class="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-brand-green-900 text-brand-cream border-none font-sans text-4 font-medium cursor-pointer hover:bg-brand-green-700 transition-colors duration-200 shadow-md hover:-translate-y-0.5 no-underline"
        >
          Create your lawyer profile
        </NuxtLink>
      </div>
    </section>

  </div>
</template>
