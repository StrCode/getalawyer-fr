<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Button } from '@/components/ui/button'
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
    class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20"
  >
    <AppIcon :icon="appIcons.circleNotch" class="mx-auto mb-4 size-8 animate-spin text-primary" />
    <p class="text-muted-foreground">
      Loading profile…
    </p>
  </div>

  <div
    v-else
    class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-20"
  >
    <div class="mx-auto max-w-md text-center">
      <AppIcon :icon="appIcons.warningCircle" class="mx-auto mb-4 size-12 text-destructive" />
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
