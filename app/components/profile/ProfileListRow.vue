<script setup lang="ts">
import { Delete01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
defineProps<{
  primary: string
  secondary?: string | null
  tertiary?: string | null
  badge?: string | null
  disabled?: boolean
}>()

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div
    class="flex items-start justify-between gap-3 rounded-[1.1rem] border border-border bg-background/60 px-[1rem] py-[0.8rem]"
  >
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-display text-[1.05rem] font-[650] tracking-[-0.02em]">
          {{ primary }}
        </p>
        <Badge
          v-if="badge"
          variant="secondary"
          class="text-2xs"
        >
          {{ badge }}
        </Badge>
      </div>
      <p
        v-if="secondary"
        class="mt-0.5 text-[0.95rem] text-muted-foreground"
      >
        {{ secondary }}
      </p>
      <p
        v-if="tertiary"
        class="mt-1 line-clamp-2 text-[0.88rem] text-muted-foreground"
      >
        {{ tertiary }}
      </p>
    </div>
    <div class="flex shrink-0 gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :disabled="disabled"
        aria-label="Edit"
        @click="$emit('edit')"
      >
        <HugeiconsIcon :icon="PencilEdit01Icon" class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :disabled="disabled"
        aria-label="Remove"
        @click="$emit('delete')"
      >
        <HugeiconsIcon :icon="Delete01Icon" class="size-4 text-destructive" />
      </Button>
    </div>
  </div>
</template>
