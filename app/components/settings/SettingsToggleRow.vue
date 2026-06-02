<template>
  <div class="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
    <div class="min-w-0 space-y-0.5">
      <p class="text-sm font-medium text-foreground">
        {{ label }}
      </p>
      <p
        v-if="description"
        class="text-sm text-muted-foreground"
      >
        {{ description }}
      </p>
    </div>
    <Switch
      :model-value="modelValue"
      class="shrink-0"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

defineProps<{
  label: string
  description?: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [boolean]
}>()
</script>
