<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

defineProps<{
  pending: boolean
  error: unknown
  message: string
  errorStatusCode?: number
  errorBackTo: string
  errorBackLabel: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
<!-- Mirrors the loaded page's geometry (max-w-7xl, 2:1 columns) so the
       layout doesn't jump when content arrives. -->
  <div
    v-if="pending"
    class="mx-auto w-full max-w-7xl space-y-10 px-6 py-10 md:px-8"
    aria-busy="true"
    aria-label="Loading profile"
  >
    <Skeleton class="h-56 w-full rounded-xl" />
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
      <div class="space-y-6 lg:col-span-2">
        <Skeleton class="h-40 w-full rounded-xl" />
        <Skeleton class="h-48 w-full rounded-xl" />
      </div>
      <Skeleton class="h-72 w-full rounded-xl lg:col-span-1" />
    </div>
  </div>

  <div
    v-else
    class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20"
  >
    <div class="mx-auto max-w-md text-center">
      <HugeiconsIcon :icon="AlertCircleIcon" class="mx-auto mb-4 size-12 text-destructive" />
     <h2 class="mb-2 text-xl font-bold text-foreground">
        {{ errorStatusCode === 403 ? 'Profile unavailable' : 'Profile not found' }}
      </h2>
      <p class="mb-6 text-sm text-muted-foreground">
        {{ message }}
      </p>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="emit('retry')"
        >
          Retry
        </Button>
        <Button
          as-child
          size="sm"
        >
          <NuxtLink :to="errorBackTo">
            {{ errorBackLabel }}
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
