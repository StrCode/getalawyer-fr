<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PhPencilSimple, PhTrash } from '@phosphor-icons/vue'

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
    class="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-background/80"
  >
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-sm font-semibold text-foreground">
          {{ primary }}
        </p>
        <Badge
          v-if="badge"
          variant="secondary"
          class="text-[10px]"
        >
          {{ badge }}
        </Badge>
      </div>
      <p
        v-if="secondary"
        class="mt-0.5 text-sm text-muted-foreground"
      >
        {{ secondary }}
      </p>
      <p
        v-if="tertiary"
        class="mt-1 line-clamp-2 text-xs text-muted-foreground"
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
        <PhPencilSimple class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :disabled="disabled"
        aria-label="Remove"
        @click="$emit('delete')"
      >
        <PhTrash class="size-4 text-destructive" />
      </Button>
    </div>
  </div>
</template>
