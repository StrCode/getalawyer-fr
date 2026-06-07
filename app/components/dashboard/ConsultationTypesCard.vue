<template>
  <div v-if="isLoading" class="flex justify-center py-8">
    <PhCircleNotch class="size-6 animate-spin text-muted-foreground" />
  </div>

  <div v-else-if="isError" class="py-8 text-center text-sm text-destructive">
    Failed to load consultation types
  </div>

  <div v-else-if="!consultationTypes?.length" class="py-6 text-center">
    <PhFileText class="mx-auto mb-3 size-10 text-muted-foreground/40" />
    <p class="text-sm font-medium text-foreground">
      No consultation types yet
    </p>
    <p class="mt-1 text-sm text-muted-foreground">
      Create your first type to start accepting bookings
    </p>
    <Button as-child class="mt-4" size="sm">
      <NuxtLink to="/dashboard/consultation-types">
        Create consultation type
      </NuxtLink>
    </Button>
  </div>

  <div v-else class="space-y-2">
    <div
      v-for="type in displayedTypes"
      :key="type.id"
      class="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
    >
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="truncate font-medium text-foreground text-sm">
            {{ type.name }}
          </p>
          <Badge
            :variant="type.isActive ? 'secondary' : 'outline'"
            :class="type.isActive ? 'border-transparent bg-primary/10 text-primary' : ''"
            class="text-xs"
          >
            {{ type.isActive ? 'Active' : 'Inactive' }}
          </Badge>
        </div>
        <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1">
            <PhClock class="size-3.5" />
            {{ type.durationMinutes }} min
          </span>
          <span>{{ formatPrice(type.price, type.currency) }}</span>
        </div>
      </div>
      <Button as-child variant="ghost" size="icon-sm">
        <NuxtLink to="/dashboard/consultation-types">
          <PhCaretRight class="size-4" />
        </NuxtLink>
      </Button>
    </div>

    <Button
      v-if="consultationTypes.length > 3"
      as-child
      variant="ghost"
      size="sm"
      class="w-full"
    >
      <NuxtLink to="/dashboard/consultation-types">
        View all consultation types
      </NuxtLink>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PhCaretRight, PhCircleNotch, PhClock, PhFileText } from '@phosphor-icons/vue'
import { useConsultationTypes } from '~/composables/useConsultationTypes'

const { useConsultationTypesList } = useConsultationTypes()

const showInactive = ref(false)
const { data: consultationTypes, isLoading, isError } = useConsultationTypesList(showInactive)

const displayedTypes = computed(() => consultationTypes.value?.slice(0, 3) ?? [])

function formatPrice(price: string, currency: string) {
  const amount = parseFloat(price)
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount)
}
</script>
