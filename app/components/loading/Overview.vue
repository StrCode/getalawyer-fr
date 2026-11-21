<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

/**
 * The overview while it loads, drawn like the overview itself: the greeting
 * panel (eyebrow, headline, a line of detail, buttons) and, for a lawyer, the
 * week strip and the day beside it, then the three tiles below; for a client,
 * the bookings card beside the greeting. Without `role` (a session still
 * arriving) only the greeting panel is drawn.
 */
defineProps<{ role?: 'lawyer' | 'client' }>()

const panel = 'rounded-panel border border-border bg-card p-4.75 md:p-5 lg:p-6.75 xl:p-8 max-sm:rounded-2xl'
const tile = 'flex min-w-0 flex-col rounded-card p-4.75 lg:p-5.75 xl:p-6'
</script>

<template>
  <LoadingRegion label="Loading your overview" class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <!-- the greeting (a client's has the bookings card beside it) -->
    <div :class="[panel, role === 'client' ? 'flex flex-wrap items-center gap-x-5 md:gap-x-5.75 lg:gap-x-7.75 xl:gap-x-9 gap-y-5' : '']">
      <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4" :class="role === 'client' ? 'min-w-0 grow-999 basis-96' : ''">
        <div class="min-w-0 grow basis-104">
          <LoadingLine size="xs" class="w-56" />
          <LoadingLine size="3xl" tight class="mt-2 w-80 max-md:h-6" />
          <LoadingLine class="mt-1.75 w-104" />
          <div v-if="role === 'client'" class="mt-4 flex gap-2">
            <Skeleton class="h-11 w-44 rounded-full" />
            <Skeleton class="h-11 w-36 rounded-full" />
          </div>
        </div>
        <div v-if="role !== 'client'" class="flex flex-none gap-2">
          <Skeleton class="h-11 w-40 rounded-full" />
        </div>
      </div>

      <div v-if="role === 'client'" class="min-w-0 grow basis-84 rounded-card bg-mint p-4">
        <LoadingLine class="w-28" />
        <div class="mt-2.75 grid gap-1.75">
          <Skeleton v-for="n in 2" :key="n" class="h-15 rounded-lg bg-card/70" />
        </div>
      </div>

      <!-- a lawyer's week and the chosen day -->
      <div v-if="role === 'lawyer'" class="mt-4 md:mt-4.25 lg:mt-5.75 xl:mt-6 grid grid-cols-1 items-start gap-4 lg:gap-5 xl:gap-6 border-t border-border pt-4 md:pt-4.25 lg:pt-5.5 tab:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <div class="min-w-0">
          <div class="flex justify-between gap-x-4">
            <LoadingLine class="w-24" />
            <LoadingLine size="sm" class="w-52 max-sm:hidden" />
          </div>
          <div class="mt-2.75 grid grid-cols-7 gap-1.25 sm:gap-1.5">
            <Skeleton v-for="n in 7" :key="n" class="min-h-18.5 rounded-lg sm:min-h-22.5" />
          </div>
        </div>
        <div class="min-w-0 rounded-card bg-mint p-4">
          <LoadingLine class="w-16" />
          <LoadingLine class="mt-2 w-56" />
          <LoadingLine class="w-40" />
        </div>
      </div>
    </div>

    <!-- a lawyer's three tiles: cases, profile, membership -->
    <div v-if="role === 'lawyer'" class="grid grid-cols-1 gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <div v-for="(surface, n) in ['bg-stone', 'border border-border bg-card', 'bg-sand sm:max-tab:col-span-2']" :key="n" :class="[tile, surface]">
        <LoadingLine size="lg" class="w-24" />
        <LoadingLine class="mt-2 w-full" />
        <LoadingLine class="w-3/5" />
        <LoadingLine class="mt-4 w-28" />
      </div>
    </div>
  </LoadingRegion>
</template>
