<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

/**
 * A list still loading, drawn like the lists it stands in for: rows inside one
 * bordered card, each with what leads it (a date tile, a picture or an icon)
 * and two lines of text. With `heading`, the section title above the card is
 * drawn too; `bare` leaves the card out for a list inside a card the page
 * draws, and the `end` slot fills the end of each row. Use it inside
 * `LoadingRegion`.
 */
const props = withDefaults(defineProps<{
  rows?: number
  /** date: a booking's day tile · avatar: a person's picture · icon: a round icon · none */
  lead?: 'date' | 'avatar' | 'icon' | 'none'
  heading?: boolean
  /** The first line's size: base for names and titles, sm for notifications. */
  titleSize?: 'sm' | 'base'
  /** Row padding, when the list's own rows use different padding. */
  pad?: string
  /** Rows only, for a list that sits inside a card drawn by the page. */
  bare?: boolean
}>(), {
  rows: 3,
  lead: 'date',
  heading: false,
  titleSize: 'base',
  pad: 'px-4 md:px-4.25 lg:px-5.5 py-4',
  bare: false,
})

/** Widths vary from row to row, the way real names and details do. */
const TITLE = ['w-44', 'w-36', 'w-52', 'w-40', 'w-48', 'w-32']
const META = ['w-72', 'w-60', 'w-80', 'w-64', 'w-56', 'w-68']
const at = (list: string[], n: number) => list[(n - 1) % list.length]
</script>

<template>
  <div>
    <LoadingLine v-if="heading" size="xl" tight class="mb-3.5 w-36" />
    <ul aria-hidden="true" class="divide-y divide-border" :class="bare ? '' : 'overflow-hidden rounded-card border border-border bg-card'">
      <li v-for="n in props.rows" :key="n" class="flex items-start gap-x-4" :class="pad">
        <Skeleton v-if="lead === 'date'" class="h-15.5 w-14 flex-none" />
        <Skeleton v-else-if="lead === 'avatar'" class="size-12 flex-none rounded-lg" />
        <Skeleton v-else-if="lead === 'icon'" class="mt-0.5 size-9 flex-none rounded-full" />
        <div class="min-w-0 grow">
          <LoadingLine :size="titleSize" :class="at(TITLE, n)" />
          <LoadingLine size="sm" class="mt-0.75" :class="at(META, n)" />
        </div>
        <!-- what sits at the row's end (a price, buttons), when the real rows have it -->
        <div v-if="$slots.end" class="flex flex-none items-center gap-1.5 self-center max-sm:hidden"><slot name="end" /></div>
      </li>
    </ul>
  </div>
</template>
