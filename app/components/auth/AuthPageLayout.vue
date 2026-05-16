<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-background">
    <!-- LEFT PANEL: Rich Green Editorial -->
    <aside
      class="hidden lg:flex flex-col flex-1 min-w-0 justify-between bg-brand-green-900 px-10 py-10 relative overflow-hidden text-brand-cream"
    >
      <!-- Background subtle gradient/texture effect -->
      <div class="absolute inset-0 bg-gradient-to-br from-brand-green-700/30 to-transparent mix-blend-overlay"></div>
      
      <div class="relative z-10">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5">
          <div class="flex flex-shrink-0 justify-center items-center bg-brand-cream rounded-lg w-8 h-8">
            <PhFileText class="w-4 h-4 text-brand-green-900" />
          </div>
          <span class="font-bold text-[18px] tracking-tight text-brand-cream">
            GetaLawyer
          </span>
        </NuxtLink>
      </div>

      <div class="relative z-10 flex flex-col justify-center flex-1 w-full max-w-xl pr-12">
        <slot name="illustration">
          <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
            The most trusted way to find top-tier legal representation.
          </h2>
          <p class="text-brand-cream-warm/80 text-lg">
            Join thousands of businesses and individuals connecting with verified legal professionals every day.
          </p>
        </slot>
      </div>

      <div
        class="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-brand-green-700/50 w-full"
      >
        <div class="min-w-0">
          <p class="mb-1 font-semibold text-brand-cream text-sm">
            Take GetaLawyer with you
          </p>
          <p class="text-brand-cream/70 text-sm leading-relaxed">
            Find verified lawyers on our mobile app for iOS and Android.
          </p>
        </div>
        <div class="shrink-0">
           <AuthQRCode />
        </div>
      </div>
    </aside>

    <!-- RIGHT PANEL: Form Container -->
    <div
      class="flex flex-col w-full overflow-y-auto lg:w-1/2 lg:max-w-[44rem] relative bg-background border-l border-border"
    >
      <div class="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 min-h-dvh sm:min-h-0 sm:py-12">
        <div class="mx-auto w-full max-w-[400px]">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhFileText } from '@phosphor-icons/vue'
</script>
