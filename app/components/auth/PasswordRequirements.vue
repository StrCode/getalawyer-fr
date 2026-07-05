<template>
  <ul v-if="password" class="space-y-1.5 text-sm" role="list">
    <li
      v-for="check in authPasswordChecks"
      :key="check.key"
      class="flex items-center gap-2"
      :class="check.test(password) ? 'text-primary' : 'text-muted-foreground'"
    >
      <AppIcon :icon="appIcons.check" v-if="check.test(password)" class="w-3.5 h-3.5 shrink-0" />
      <span v-else class="w-3.5 h-3.5 shrink-0 text-center text-xs leading-none">○</span>
      {{ check.label }}
    </li>
  </ul>
  <p v-else class="text-muted-foreground text-xs leading-relaxed">
    Use at least 8 characters with one uppercase letter and one number.
  </p>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { authPasswordChecks } from '~/lib/auth-password'

defineProps<{
  password: string
}>()
</script>
