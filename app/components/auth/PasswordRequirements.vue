<template>
  <!-- One list does both jobs: it shows the rules as they are met, and after a
       failed attempt it shows which are still missing. No second list of errors. -->
  <ul v-if="password" class="space-y-1.5 text-sm" role="list">
    <li
      v-for="check in authPasswordChecks"
      :key="check.key"
      class="flex items-center gap-2"
      :class="check.test(password) ? 'text-brand' : invalid ? 'font-semibold text-destructive' : 'text-muted-foreground'"
    >
      <HugeiconsIcon v-if="check.test(password)" :icon="Tick01Icon" class="size-3.5 shrink-0" />
      <HugeiconsIcon v-else-if="invalid" :icon="Cancel01Icon" class="size-3.5 shrink-0" />
      <span v-else class="size-3.5 shrink-0 text-center text-xs leading-none">○</span>
      {{ check.label }}
      <span class="sr-only">{{ check.test(password) ? '(met)' : '(not met yet)' }}</span>
    </li>
  </ul>
  <p v-else class="text-[0.85rem] text-muted-foreground">
    Use at least 8 characters with one uppercase letter and one number.
  </p>
</template>

<script setup lang="ts">
import { Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { authPasswordChecks } from '~/lib/auth-password'

defineProps<{
  password: string
  /** The field was submitted or left with rules unmet: mark the missing ones. */
  invalid?: boolean
}>()
</script>
