<script setup lang="ts">
import { CheckmarkCircle01Icon, CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  percent: number
  items: Array<{ label: string; done: boolean; optional?: boolean }>
}>()

const incompleteCount = computed(
  () => props.items.filter(item => !item.optional && !item.done).length,
)
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm font-medium text-foreground">
        Profile completeness
      </p>
      <Badge
        variant="secondary"
        class="font-normal tabular-nums"
      >
        {{ percent }}%
      </Badge>
    </div>

    <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        class="h-full rounded-full bg-primary transition-all duration-500"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
      <template v-if="incompleteCount > 0">
        {{ incompleteCount }} required {{ incompleteCount === 1 ? 'item' : 'items' }} left.
      </template>
      <template v-else>
        Required details are complete.
      </template>
    </p>

    <ul class="mt-3 space-y-1.5">
      <li
        v-for="item in items"
        :key="item.label"
        class="flex items-center gap-2 text-xs"
      >
        <HugeiconsIcon
          :icon="item.done ? CheckmarkCircle01Icon : CircleIcon"
          class="size-3.5 shrink-0"
          :class="item.done ? 'text-primary' : 'text-muted-foreground/50'"
        />
        <span :class="item.done ? 'text-foreground' : 'text-muted-foreground'">
          {{ item.label }}
          <span v-if="item.optional" class="text-muted-foreground">(optional)</span>
        </span>
      </li>
    </ul>
  </div>
</template>
