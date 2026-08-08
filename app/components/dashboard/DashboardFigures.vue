<script setup lang="ts">
/**
 * Divided KPI row (Soroman pattern): no boxes or icons — hairline-separated
 * figures with micro-caps labels, big tabular numbers, and a hint line.
 */
export interface DashboardFigure {
  label: string
  value: string | number
  hint?: string
}

defineProps<{
  figures: DashboardFigure[]
}>()

function cellClasses(index: number): string {
  return [
    index % 2 === 1 ? 'border-l' : '',
    index >= 2 ? 'border-t lg:border-t-0' : '',
    index > 0 ? 'lg:border-l' : '',
  ].filter(Boolean).join(' ')
}
</script>

<template>
  <dl class="grid grid-cols-2 overflow-hidden rounded-xl border border-foreground/15 bg-card shadow-[0_8px_32px_rgba(0,0,0,0.06)] lg:grid-cols-4">
    <div
      v-for="(figure, index) in figures"
      :key="figure.label"
      class="border-foreground/15 px-5 py-4 lg:px-6 lg:py-5"
      :class="cellClasses(index)"
    >
      <dt class="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
        {{ figure.label }}
      </dt>
      <dd class="mt-2 text-2xl leading-none font-semibold tracking-tight tabular-nums md:text-3xl">
        {{ figure.value }}
      </dd>
      <dd v-if="figure.hint" class="mt-2 text-xs text-muted-foreground">
        {{ figure.hint }}
      </dd>
    </div>
  </dl>
</template>
