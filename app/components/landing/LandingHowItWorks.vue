<script setup lang="ts">
const steps = [
  {
    num: '01',
    title: 'Search & filter',
    desc: 'Find lawyers by practice area, location, language, and consultation type. Narrow down to a shortlist that fits.',
  },
  {
    num: '02',
    title: 'Compare profiles',
    desc: 'Review verified credentials, real client reviews, and transparent fees. See exactly who you\'re hiring before you commit.',
  },
  {
    num: '03',
    title: 'Book a consultation',
    desc: 'Pick a time that works from the lawyer\'s calendar. Pay securely. Get a confirmation with everything you need.',
  },
  {
    num: '04',
    title: 'Meet & resolve',
    desc: 'Connect by video, phone, or in person. Message your lawyer before and after to keep things moving.',
  },
]
</script>

<template>
  <section id="how" class="bg-brand-cream py-[100px]">
    <div class="max-w-[1280px] mx-auto px-8">
      <!-- Header -->
      <p class="text-[13px] font-semibold text-brand-green-700 tracking-[0.08em] uppercase mb-4">How it works</p>
      <h2 class="font-heading font-medium text-brand-green-900 leading-[1.05] tracking-[-0.02em] max-w-[720px] mb-6" style="font-size:clamp(36px,4.5vw,56px);">
        From your first search to your first consultation.
      </h2>
      <p class="text-[18px] text-brand-ink-soft max-w-[560px] leading-[1.5]">
        Four steps. No calls. No paperwork. Just verified lawyers ready when you need them.
      </p>

      <!-- Steps grid -->
      <div class="grid gap-6 mt-16" style="grid-template-columns:repeat(4,1fr);">
        <div v-for="step in steps" :key="step.num">
          <!-- Italic Fraunces number -->
          <div class="font-heading italic font-normal text-brand-green-300 leading-none mb-6" style="font-size:56px;">
            {{ step.num }}
          </div>
          <h3 class="text-[20px] font-semibold text-brand-green-900 mb-3 tracking-[-0.01em]">{{ step.title }}</h3>
          <p class="text-[15px] text-brand-ink-soft leading-[1.55]">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 1024px) {
  div[style*="repeat(4,1fr)"] { grid-template-columns: repeat(2, 1fr) !important; gap: 40px !important; }
}
</style>
