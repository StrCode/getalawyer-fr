<script setup lang="ts">
import { ArrowReloadHorizontalIcon, FilterIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
defineProps<{
  activeFilterCount: number
  /** Current keyword for contextual copy (optional). */
  keyword?: string
}>()

const emit = defineEmits<{
  reset: []
}>()

const tips = [
  'Remove one filter at a time to see what changes.',
  'Try a shorter or broader keyword.',
  'Expand states or practice areas if they’re too narrow.',
] as const
</script>

<template>
  <div
    class="relative mx-auto w-full max-w-lg overflow-hidden px-4 text-center sm:px-6"
    aria-live="polite"
    aria-labelledby="lawyer-directory-empty-title"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -right-14 -top-14 size-40 rounded-full bg-primary/[0.07] blur-2xl dark:bg-primary/10"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-16 -left-10 size-36 rounded-full bg-muted/40 blur-2xl"
    />

    <div class="relative">
      <div
        class="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/15 dark:bg-primary/12 dark:text-primary dark:ring-primary/25"
      >
        <HugeiconsIcon :icon="Search01Icon" class="size-8" aria-hidden="true" />
      </div>

      <p
        class="font-mono text-muted-foreground text-2xs uppercase tracking-[0.2em]"
      >
        No matches
      </p>
     <h3 id="lawyer-directory-empty-title" class="mt-2 text-balance text-xl font-semibold text-foreground sm:text-2xl">
        We couldn’t find lawyers for this search
      </h3>
      <p class="mx-auto mt-3 max-w-sm text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
        <template v-if="keyword?.trim()">
          Nothing lined up with
          <span class="font-medium text-foreground">“{{ keyword.trim() }}”</span>.
        </template>
        <template v-else-if="activeFilterCount > 0">
          Your filters may be too strict—loosen them a bit or start fresh.
        </template>
        <template v-else>
          Adjust your query or browse with fewer constraints.
        </template>
      </p>

      <ul
        v-if="activeFilterCount > 0"
        class="mx-auto mt-6 max-w-sm space-y-2.5 text-left text-muted-foreground text-sm"
      >
        <li v-for="(line, idx) in tips" :key="idx" class="flex gap-2.5 leading-snug">
          <HugeiconsIcon :icon="FilterIcon" class="mt-0.5 size-4 shrink-0 text-primary/70 opacity-90" aria-hidden="true" />
          <span>{{ line }}</span>
        </li>
      </ul>

      <div class="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" class="min-w-[10.5rem] gap-2 font-semibold shadow-sm" @click="emit('reset')">
          <HugeiconsIcon :icon="ArrowReloadHorizontalIcon" class="size-4" aria-hidden="true" />
          Reset filters
        </Button>
      </div>

      <p v-if="activeFilterCount > 0" class="mt-6 text-muted-foreground text-xs">
        {{ activeFilterCount }}
        {{ activeFilterCount === 1 ? 'filter is' : 'filters are' }} active
      </p>
    </div>
  </div>
</template>
