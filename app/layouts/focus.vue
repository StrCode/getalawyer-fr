<script setup lang="ts">
/**
 * A page that does one thing and should not be left half-way, such as
 * confirming a payment after Paystack: the mark and the theme switch at the
 * top, the page centred below, no menus to wander off through. Canopy look,
 * so it follows light / dark / system like the rest of the rebuilt site.
 */
useHead({ bodyAttrs: { class: 'canopy' } })
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background font-sans text-foreground">
    <header class="pt-[max(0.6rem,env(safe-area-inset-top,0px))] safe-x lg:px-8">
      <div class="flex h-15 items-center justify-between gap-4">
        <CanopyBrand condensed large />
        <ClientOnly><CanopyThemeToggle /></ClientOnly>
      </div>
    </header>
    <main class="mx-auto flex w-[min(100%,30rem)] flex-1 flex-col justify-center pt-6 pb-[max(4rem,env(safe-area-inset-bottom,0px))] safe-x">
      <slot />
    </main>
  </div>
</template>
