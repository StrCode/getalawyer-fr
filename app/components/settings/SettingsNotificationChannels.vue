<template>
  <div class="rounded-lg border border-border bg-background p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <p class="text-sm font-medium text-foreground">
        {{ title }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <div class="grid gap-3 sm:grid-cols-3">
      <label
        v-for="channel in channels"
        :key="channel.key"
        class="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border/40 bg-background px-3 py-2.5 text-sm"
      >
        <span class="text-muted-foreground">{{ channel.label }}</span>
        <Switch
          :model-value="modelValue[channel.key]"
          @update:model-value="onChannel(channel.key, $event)"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

type ChannelKey = 'inApp' | 'email' | 'sms'

const props = defineProps<{
  title: string
  description?: string
  modelValue: Record<ChannelKey, boolean>
}>()

const emit = defineEmits<{
  'update:modelValue': [Record<ChannelKey, boolean>]
}>()

const channels: { key: ChannelKey, label: string }[] = [
  { key: 'inApp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
]

function onChannel(key: ChannelKey, value: boolean) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
