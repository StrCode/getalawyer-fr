<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  eyebrow?: string
}>()
</script>

<template>
  <div class="w-full font-sans">
    <AuthLogo class="mb-8 lg:hidden" />

    <header class="mb-6 text-center lg:text-left">
      <p
        v-if="eyebrow"
        class="text-xs font-semibold uppercase tracking-widest mb-2 text-primary"
      >
        {{ eyebrow }}
      </p>
      <h1 class="font-heading text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-3xl">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-2 text-base leading-relaxed text-muted-foreground"
      >
        {{ description }}
      </p>
    </header>

    <div class="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7">
      <slot />
    </div>

    <div
      v-if="$slots.after"
      class="mt-6 space-y-5"
    >
      <slot name="after" />
    </div>
  </div>
</template>
