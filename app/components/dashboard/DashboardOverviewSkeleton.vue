<template>
  <div
    class="space-y-6"
    aria-busy="true"
    aria-label="Loading dashboard"
  >
    <div class="space-y-2">
      <Skeleton class="h-8 w-64 rounded-lg" />
      <Skeleton class="h-4 w-96 rounded-lg" />
    </div>
    <Skeleton class="h-32 w-full rounded-xl" />
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-24 rounded-xl"
      />
    </div>
    <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div class="space-y-4">
        <Skeleton class="h-48 w-full rounded-xl" />
        <Skeleton class="h-56 w-full rounded-xl" />
      </div>
      <Skeleton class="h-80 w-full rounded-xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
