<script setup lang="ts">
import { getSettingsNavForRole, type SettingsNavItem } from '@/components/settings/settings-nav'
import type { SettingsSectionId } from '~/types/account-settings'

/**
 * The frame for settings: the sections as a row of pills (two or three of
 * them, depending on the role) and the chosen section beneath. On a phone the
 * row scrolls sideways.
 */
const props = defineProps<{
  activeSection: SettingsSectionId
  role?: 'lawyer' | 'client'
}>()

defineEmits<{
  'update:activeSection': [SettingsSectionId]
}>()

const navItems = computed<SettingsNavItem[]>(() => getSettingsNavForRole(props.role))
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <div role="group" aria-label="Settings sections" class="-mx-1 flex max-w-[calc(100%+0.5rem)] min-w-0 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        :aria-pressed="activeSection === item.id"
        class="inline-flex min-h-11 flex-none cursor-pointer items-center rounded-full border px-4 font-medium whitespace-nowrap transition-colors duration-200 ease-canopy"
        :class="activeSection === item.id ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
        @click="$emit('update:activeSection', item.id)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="grid min-w-0 gap-4 lg:gap-5 xl:gap-6">
      <slot />
    </div>
  </div>
</template>
