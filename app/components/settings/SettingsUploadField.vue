<template>
  <div
    class="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-background p-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium text-foreground">
        {{ label }}
      </p>
      <p
        v-if="fileName"
        class="mt-1 truncate text-sm text-muted-foreground"
      >
        {{ fileName }}
      </p>
      <p
        v-else
        class="mt-1 text-xs text-muted-foreground"
      >
        PDF, JPG, or PNG · max 10 MB
      </p>
    </div>
    <div class="flex shrink-0 gap-2">
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        class="sr-only"
        @change="onSelect"
      >
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="inputRef?.click()"
      >
        <PhUploadSimple class="size-4" />
        Choose file
      </Button>
      <Button
        v-if="fileName"
        type="button"
        variant="ghost"
        size="sm"
        @click="clear"
      >
        Remove
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhUploadSimple } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'

defineProps<{
  label: string
  accept?: string
  fileName?: string
}>()

const emit = defineEmits<{
  select: [string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file)
    emit('select', file.name)
}

function clear() {
  emit('select', '')
  if (inputRef.value)
    inputRef.value.value = ''
}
</script>
