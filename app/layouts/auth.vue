<script setup lang="ts">
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'

/**
 * Centered auth shell (Soroman pattern): the brand mark over a single column
 * on the plain ground — no split-screen side panel, so it reads the same at
 * every viewport. Pages provide their own panel (login/register inline, the
 * recovery pages via AuthFormShell).
 */
</script>

<template>
  <div class="flex min-h-svh w-full items-start justify-center bg-background px-4 py-12 font-sans sm:py-16">
    <div class="w-full max-w-md">
      <LandingBrandLogo
        to="/"
        :show-wordmark="false"
        class="mx-auto w-fit"
      />

      <div class="mt-6">
        <slot />
      </div>

      <p class="mt-8 text-center text-xs text-muted-foreground">
        getalawyer ·
        <NuxtLink to="/privacy" class="hover:text-foreground">Privacy</NuxtLink> ·
        <NuxtLink to="/terms" class="hover:text-foreground">Terms</NuxtLink> ·
        <NuxtLink to="/contact" class="hover:text-foreground">Contact</NuxtLink>
      </p>
    </div>
  </div>
</template>
