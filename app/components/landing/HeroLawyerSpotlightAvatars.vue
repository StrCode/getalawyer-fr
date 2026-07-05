<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { HERO_SPOTLIGHT_LAWYERS, heroSpotlightLawyerHref } from '~/lib/hero-spotlight-lawyers'
const failedAvatars = ref<Record<string, boolean>>({})

function onAvatarError(id: string) {
  failedAvatars.value = { ...failedAvatars.value, [id]: true }
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-3 lg:hidden">
    <div class="flex items-center justify-center -space-x-2.5">
      <NuxtLink
        v-for="lawyer in HERO_SPOTLIGHT_LAWYERS"
        :key="lawyer.id"
        :to="heroSpotlightLawyerHref(lawyer)"
        class="relative flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm transition-transform duration-200 hover:z-10 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        :title="lawyer.name"
      >
        <img
          v-if="!failedAvatars[lawyer.id]"
          :src="lawyer.avatarUrl"
          :alt="`${lawyer.name} profile`"
          class="size-full object-cover"
          width="44"
          height="44"
          loading="lazy"
          decoding="async"
          @error="onAvatarError(lawyer.id)"
        >
        <span
          v-else
          class="text-[10px] font-semibold"
          :class="lawyer.avatarClass"
        >{{ lawyer.initials }}</span>
        <span
          class="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-card bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <AppIcon :icon="appIcons.sealCheck" class="size-2.5" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
