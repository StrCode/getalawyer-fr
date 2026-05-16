<script setup lang="ts">
const emit = defineEmits<{ openModal: [] }>()

const features = [
  {
    title: 'Bar-verified credentials',
    desc: 'NIN and SCN verified. Build instant trust with clients.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Smart booking',
    desc: 'Calendar that syncs with yours. Reduce no-shows.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>`,
  },
  {
    title: 'Direct messaging',
    desc: 'Talk to clients before and after consultations.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    title: 'Zero commission',
    desc: 'Keep 100% of what you charge. Flat subscription only.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]
</script>

<template>
  <section id="lawyers" class="bg-brand-green-900 text-brand-cream py-[100px] relative overflow-hidden">
    <!-- Radial glow -->
    <div class="absolute pointer-events-none" style="top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(134,194,142,0.08) 0%,transparent 70%);" />

    <div class="max-w-[1280px] mx-auto px-8 relative">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-[60px] lg:gap-[80px] items-center">

        <!-- Left: copy -->
        <div>
          <p class="text-[13px] font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-4">For legal professionals</p>
          <h2 class="font-heading font-medium text-brand-cream leading-[1.05] tracking-[-0.02em] max-w-[720px]" style="font-size:clamp(36px,4.5vw,56px);">
            Grow your practice. <em class="italic font-normal">Keep every naira you earn.</em>
          </h2>
          <p class="text-[18px] leading-normal mt-6 mb-9" style="color:rgba(244,241,232,0.7);max-width:560px;">
            Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat monthly subscription. Your bar-verified credentials, displayed prominently.
          </p>

          <div class="flex items-center gap-3">
            <button
              @click="emit('openModal')"
              class="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-brand-cream text-brand-green-900 font-medium text-[16px] hover:bg-white hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans"
            >Register as a lawyer</button>
            <NuxtLink
              to="/for-lawyers"
              class="inline-flex items-center gap-2 px-7 py-4 rounded-full font-medium text-[16px] border transition-all duration-200 cursor-pointer font-sans bg-transparent text-brand-cream hover:bg-white/5 no-underline"
              style="border-color:rgba(244,241,232,0.3);"
              @mouseenter="(e) => { (e.currentTarget as HTMLElement).style.borderColor='rgba(244,241,232,1)' }"
              @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.borderColor='rgba(244,241,232,0.3)' }"
            >Learn more</NuxtLink>
          </div>
        </div>

        <!-- Right: 2×2 feature grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-7">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="group p-6 rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(134,194,142,0.15);"
          >
            <div
              class="w-9 h-9 rounded-[10px] flex items-center justify-center text-brand-green-300 mb-4 transition-transform duration-300 group-hover:scale-110"
              style="background:rgba(134,194,142,0.15);"
              v-html="feat.icon"
            />
            <h4 class="text-[16px] font-semibold text-brand-cream mb-1.5">{{ feat.title }}</h4>
            <p class="text-[14px] leading-normal" style="color:rgba(244,241,232,0.65);">{{ feat.desc }}</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
