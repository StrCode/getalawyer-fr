<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import { PANEL } from '~/lib/dashboard-panel'

/**
 * The profile editor while it loads, drawn like the editor. A lawyer's: the
 * "How clients see you" card, then the list of sections beside the open
 * section. A client's: the sections list (on wide screens) beside the form
 * cards. Without `role` (the session still arriving): the form cards alone.
 */
defineProps<{ role?: 'lawyer' | 'client' }>()

/** The lawyer's sections list: three groups, as many rows as the real one. */
const GROUPS = [6, 2, 3]
const pad = 'p-4.5 lg:p-5.75 xl:p-6'
</script>

<template>
  <LoadingRegion label="Loading your profile" class="grid grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
    <template v-if="role === 'lawyer'">
      <div :class="[PANEL, 'grid tab:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]']">
        <div class="flex min-w-0 items-start gap-4" :class="pad">
          <Skeleton class="size-18 flex-none rounded-card" />
          <div class="min-w-0 flex-1">
            <LoadingLine size="xs" class="w-36" />
            <LoadingLine size="xl" class="mt-0.75 w-44" />
            <LoadingLine class="mt-0.5 w-60" />
            <LoadingLine size="sm" class="mt-0.5 w-48" />
            <div class="mt-2.5 flex gap-1.5">
              <Skeleton class="h-5.5 w-24 rounded-full" />
              <Skeleton class="h-5.5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div class="min-w-0 border-t border-border bg-background/60 tab:border-t-0 tab:border-l" :class="pad">
          <div class="flex items-center justify-between gap-4">
            <Skeleton class="h-7 w-32 rounded-full" />
            <LoadingLine class="w-28" />
          </div>
          <Skeleton class="mt-2.75 h-1.75 w-full rounded-full" />
          <LoadingLine size="sm" class="mt-2.75 w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:gap-6 tab:grid-cols-[19rem_minmax(0,1fr)]">
        <div :class="[PANEL, 'min-w-0 p-2']">
          <div v-for="(rows, g) in GROUPS" :key="g" class="pb-1.5">
            <div class="px-3 pt-2.75 pb-1.5"><LoadingLine size="xs" class="w-40" /></div>
            <div v-for="n in rows" :key="n" class="flex min-h-13 items-center gap-2.75 px-3 py-1.5">
              <Skeleton class="size-5.5 flex-none rounded-full" />
              <div class="min-w-0 flex-1">
                <LoadingLine class="w-28" />
                <LoadingLine size="sm" class="w-40" />
              </div>
            </div>
          </div>
        </div>
        <!-- on phones the editor opens on the list of sections, not a section -->
        <div :class="[PANEL, 'max-tab:hidden']">
          <div class="flex items-center justify-between gap-4 border-b border-border" :class="pad">
            <div class="min-w-0">
              <LoadingLine size="lg" class="w-28" />
              <LoadingLine size="sm" class="w-64" />
            </div>
            <Skeleton class="h-11 w-28 flex-none rounded-full" />
          </div>
          <div :class="pad">
            <LoadingLine class="w-full" />
            <LoadingLine class="w-3/4" />
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex w-full flex-col gap-4 lg:gap-5 xl:gap-6 xl:flex-row">
      <div v-if="role === 'client'" class="hidden xl:block xl:w-56 xl:shrink-0">
        <div class="rounded-card border border-border bg-card p-3">
          <div v-for="n in 5" :key="n" class="flex min-h-10 items-center gap-2.5 px-3">
            <Skeleton class="size-4 flex-none rounded-sm" />
            <LoadingLine size="sm" class="w-24" />
          </div>
        </div>
      </div>
      <div class="grid min-w-0 flex-1 grid-cols-1 gap-4 lg:gap-5 xl:gap-6">
        <div v-for="n in 3" :key="n" :class="[PANEL, pad]">
          <LoadingLine size="lg" class="w-36" />
          <LoadingLine size="sm" class="w-64" />
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div v-for="f in 2" :key="f">
              <LoadingLine size="sm" class="w-24" />
              <Skeleton class="mt-2 h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </LoadingRegion>
</template>
