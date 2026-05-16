<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ openModal: [] }>()
const whatInput = ref('')
const whereInput = ref('')
</script>

<template>
  <section class="bg-brand-cream py-[80px] pb-[100px] relative overflow-hidden">
    <div class="max-w-[1280px] mx-auto px-8">
      <div class="grid items-center gap-[60px] lg:gap-[80px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

        <!-- Left: copy -->
        <div>
          <!-- Eyebrow pill -->
          <div class="inline-flex items-center gap-2 bg-brand-green-100 text-brand-green-700 px-[14px] py-[7px] rounded-full text-[13px] font-medium tracking-[0.02em] mb-7">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-green-500 animate-pulse" />
            Every lawyer NIN &amp; SCN verified
          </div>

          <!-- Headline -->
          <h1 class="text-green-950 font-medium leading-none tracking-[-0.03em] mb-6" style="font-size:clamp(44px,6vw,80px);">
            Find a verified Nigerian lawyer.<br>
            <em class="italic font-medium text-green-900 tracking-[-0.02em]">Booked in minutes.</em>
          </h1>

          <!-- Sub -->
          <p class="text-[19px] leading-[1.55] text-brand-ink-soft mb-10 max-w-[520px]">
            Compare practice areas, upfront fees, and availability across hundreds of verified lawyers. Book instantly—no phone tag, no hidden costs.
          </p>

          <!-- Search card -->
          <div class="bg-white rounded-[24px] p-2 border border-brand-line shadow-[0_1px_2px_rgba(15,46,26,0.04),0_12px_32px_-12px_rgba(15,46,26,0.08)] max-w-[580px] transition-all duration-300 focus-within:ring-4 focus-within:ring-brand-green-700/5 focus-within:border-brand-green-700/30">
            <div class="grid gap-px bg-brand-line rounded-[14px] overflow-hidden grid-cols-1 sm:grid-cols-[1fr_1fr_auto]">
              <!-- What field -->
              <div class="bg-white px-[18px] py-[14px] flex flex-col gap-0.5">
                <label class="text-[11px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase">What do you need?</label>
                <input
                  v-model="whatInput"
                  type="text"
                  placeholder="e.g. tenancy dispute, divorce"
                  class="border-none outline-none font-sans text-[15px] text-brand-ink bg-transparent w-full p-0 placeholder:text-brand-ink-soft placeholder:opacity-60"
                />
              </div>
              <!-- Where field -->
              <div class="bg-white px-[18px] py-[14px] flex flex-col gap-0.5">
                <label class="text-[11px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase">Where?</label>
                <input
                  v-model="whereInput"
                  type="text"
                  placeholder="State or city..."
                  class="border-none outline-none font-sans text-[15px] text-brand-ink bg-transparent w-full p-0 placeholder:text-brand-ink-soft placeholder:opacity-60"
                />
              </div>
              <!-- Search button -->
              <button
                @click="emit('openModal')"
                class="bg-brand-green-700 hover:bg-brand-green-900 active:scale-[0.98] text-brand-cream border-none px-8 rounded-r-[12px] sm:rounded-r-[12px] font-sans text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_2px_10px_-2px_rgba(15,46,26,0.2)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </button>
            </div>
          </div>

          <!-- Secondary link -->
          <p class="mt-5 text-[14px] text-brand-ink-soft">
            Not sure where to start?
            <a href="#practice" class="text-brand-green-700 underline decoration-1 underline-offset-[3px] cursor-pointer">Browse by practice area →</a>
          </p>
        </div>

        <!-- Right: hero image -->
        <div class="relative h-[460px] max-w-[600px] mx-auto lg:max-w-none lg:mx-0 lg:h-[560px] rounded-[24px] overflow-hidden shadow-[0_12px_40px_-12px_rgba(15,46,26,0.25)] w-full">
          <NuxtImg
            src="/hero-handshake.png"
            alt="Two professionals shaking hands, representing the trusted connection between client and lawyer"
            class="w-full h-full object-cover block"
            sizes="sm:100vw md:600px lg:700px"
            format="webp"
            preload
          />
          <!-- Gradient overlay -->
          <div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(135deg,rgba(15,46,26,0) 40%,rgba(15,46,26,0.25) 100%);" />

          <!-- Floating stat -->
          <div class="absolute bottom-7 left-7 bg-white/95 backdrop-blur-md border border-white/50 rounded-[14px] px-5 py-4 flex items-center gap-3.5 z-10 shadow-[0_8px_24px_-8px_rgba(15,46,26,0.2)]">
            <div class="w-9 h-9 bg-brand-green-700 rounded-[10px] flex items-center justify-center text-brand-cream shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <strong class="block text-[16px] text-brand-green-900 font-semibold tracking-[-0.01em]">100% Bar-Verified Professionals</strong>
              <span class="text-[12px] text-brand-ink-soft">NIN &amp; SCN Checked</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
