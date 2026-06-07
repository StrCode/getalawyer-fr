<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:gap-10">
    <!-- Secondary nav (Lindy / Perplexity pattern) -->
    <nav
      class="hidden lg:block lg:w-56 lg:shrink-0"
      aria-label="Account settings"
    >
      <div class="sticky top-20 space-y-6 rounded-xl bg-[#F1F3F5] p-3">
        <div class="hidden px-1 lg:block">
          <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Settings
          </p>
          <p class="mt-1 text-sm text-foreground/80">
            Manage your account and legal preferences.
          </p>
        </div>

        <div class="space-y-5">
          <div
            v-for="group in SETTINGS_NAV_GROUPS"
            :key="group.key"
            class="space-y-0.5"
          >
            <p class="mb-1.5 px-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {{ group.label }}
            </p>
            <ul class="space-y-0.5">
              <li
                v-for="item in navByGroup[group.key]"
                :key="item.id"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors"
                  :class="activeSection === item.id
                    ? 'bg-background font-medium text-primary shadow-sm ring-1 ring-border/80'
                    : 'text-foreground/80 hover:bg-background/60 hover:text-foreground'"
                  @click="$emit('update:activeSection', item.id)"
                >
                  <component
                    :is="item.icon"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span class="truncate">{{ item.label }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main panel -->
    <div class="min-w-0 flex-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SETTINGS_NAV, SETTINGS_NAV_GROUPS } from '@/components/settings/settings-nav'
import type { SettingsSectionId } from '~/types/account-settings'

defineProps<{
  activeSection: SettingsSectionId
}>()

defineEmits<{
  'update:activeSection': [SettingsSectionId]
}>()

const navByGroup = computed(() => {
  const map = {
    account: [] as typeof SETTINGS_NAV,
    activity: [] as typeof SETTINGS_NAV,
    preferences: [] as typeof SETTINGS_NAV,
  }
  for (const item of SETTINGS_NAV) {
    map[item.group].push(item)
  }
  return map
})
</script>
