<template>
  <div class="flex w-full flex-col gap-6 lg:flex-row lg:gap-10">
    <nav
      class="hidden lg:block lg:w-56 lg:shrink-0"
      aria-label="Account settings"
    >
      <div class="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-2">
        <ul class="space-y-0.5">
          <li
            v-for="item in SETTINGS_NAV"
            :key="item.id"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors"
              :class="activeSection === item.id
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
              @click="$emit('update:activeSection', item.id)"
            >
              <HugeiconsIcon :icon="item.icon" class="size-4 shrink-0" aria-hidden="true" />
              <span class="truncate">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="min-w-0 flex-1 space-y-6">
      <Select
        class="lg:hidden"
        :model-value="activeSection"
        @update:model-value="onMobileSectionChange"
      >
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="activeNavItem?.label ?? 'Section'" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="item in SETTINGS_NAV"
            :key="item.id"
            :value="item.id"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { SETTINGS_NAV, isSettingsSectionId } from '@/components/settings/settings-nav'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SettingsSectionId } from '~/types/account-settings'

const props = defineProps<{
  activeSection: SettingsSectionId
}>()

const emit = defineEmits<{
  'update:activeSection': [SettingsSectionId]
}>()

const activeNavItem = computed(() => SETTINGS_NAV.find(n => n.id === props.activeSection))

function onMobileSectionChange(value: unknown) {
  if (typeof value === 'string' && isSettingsSectionId(value)) {
    emit('update:activeSection', value)
  }
}
</script>
