<script setup lang="ts">
const emit = defineEmits<{ openModal: [] }>()
</script>

<template>
  <section class="bg-brand-green-100 py-[100px] text-center">
    <div class="max-w-[1280px] mx-auto px-8">
      <p class="text-[13px] font-semibold text-brand-green-700 tracking-[0.08em] uppercase mb-4">Ready when you are</p>
      <h2
        class="font-heading font-medium text-brand-green-900 leading-[1.05] tracking-[-0.02em] mx-auto mb-6"
        style="font-size:clamp(36px,4.5vw,56px);max-width:720px;"
      >Get the legal help you need, from someone you can trust.</h2>
      <p class="text-[18px] text-brand-ink-soft leading-[1.5] mx-auto mb-9" style="max-width:560px;">
        Verified lawyers. Transparent pricing. Booking in minutes.
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button
          @click="emit('openModal')"
          class="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-brand-green-700 text-brand-cream font-medium text-[16px] hover:bg-brand-green-900 hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans"
        >Find a lawyer →</button>
        <NuxtLink
          to="/for-lawyers"
          class="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-transparent text-brand-ink font-medium text-[16px] border border-brand-line hover:bg-white hover:border-brand-ink transition-all duration-200 cursor-pointer font-sans no-underline"
        >I'm a lawyer</NuxtLink>
      </div>
    </div>
  </section>
</template>
