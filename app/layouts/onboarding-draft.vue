<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background font-sans">
    <header class="shrink-0 border-b border-border/40 bg-background px-4 py-4 sm:px-8 md:px-12">
      <LandingBrandLogo class="min-w-0" />
    </header>
    <main class="flex-1 bg-card">
      <div class="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:px-12">
        <slot />
      </div>
    </main>
  </div>
</template>
