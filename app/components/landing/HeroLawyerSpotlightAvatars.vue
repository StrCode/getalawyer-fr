<script setup lang="ts">
import { HERO_SPOTLIGHT_LAWYERS, heroSpotlightLawyerHref } from '~/lib/hero-spotlight-lawyers'
import { PhSealCheck } from '@phosphor-icons/vue'
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-3 lg:hidden">
    <div class="flex items-center justify-center -space-x-2.5">
      <NuxtLink
        v-for="lawyer in HERO_SPOTLIGHT_LAWYERS"
        :key="lawyer.id"
        :to="heroSpotlightLawyerHref(lawyer)"
        class="relative flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-card shadow-sm transition-transform duration-200 hover:z-10 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        :class="lawyer.avatarClass"
        :title="lawyer.name"
      >
        <span class="text-[10px] font-semibold">{{ lawyer.initials }}</span>
        <span
          class="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-card bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <PhSealCheck class="size-2.5" weight="fill" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
