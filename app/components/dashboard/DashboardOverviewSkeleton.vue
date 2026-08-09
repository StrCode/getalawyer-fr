<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div
    class="space-y-6 md:space-y-8"
    aria-busy="true"
    aria-label="Loading dashboard"
  >
    <div class="space-y-3">
      <Skeleton class="h-3 w-40 rounded-full" />
      <Skeleton class="h-10 w-72 max-w-full rounded-lg" />
      <Skeleton class="h-4 w-96 max-w-full rounded-lg" />
    </div>
    <Skeleton class="h-36 w-full rounded-xl" />
    <div class="flex flex-wrap gap-2">
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-9 w-28 rounded-full"
      />
    </div>
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div class="space-y-6 lg:col-span-7">
        <Skeleton class="h-28 w-full rounded-xl" />
        <Skeleton class="h-56 w-full rounded-xl" />
        <Skeleton class="h-48 w-full rounded-xl" />
      </div>
      <div class="space-y-6 lg:col-span-5">
        <Skeleton class="h-64 w-full rounded-xl" />
        <Skeleton class="h-56 w-full rounded-xl" />
      </div>
    </div>
  </div>
</template>
