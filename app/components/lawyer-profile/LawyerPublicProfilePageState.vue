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
  <div
    v-if="pending"
    class="mx-auto w-full max-w-5xl space-y-6 px-4 py-10"
    aria-busy="true"
    aria-label="Loading profile"
  >
    <Skeleton class="h-56 w-full rounded-xl" />
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <Skeleton class="h-40 w-full rounded-xl" />
        <Skeleton class="h-48 w-full rounded-xl" />
      </div>
      <Skeleton class="h-64 w-full rounded-xl" />
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
