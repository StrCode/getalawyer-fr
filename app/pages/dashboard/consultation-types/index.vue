<template>
  <div class="space-y-6">
    <DashboardPageHeader
      title="Consultation types"
      description="Manage the services you offer to clients"
    >
      <template #actions>
        <Button @click="handleCreate">
          <HugeiconsIcon :icon="Add01Icon" class="mr-2 size-4" />
          Create new
        </Button>
      </template>
    </DashboardPageHeader>

    <div class="flex items-center gap-2">
      <Switch
        :model-value="showInactive"
        @update:model-value="showInactive = $event"
      />
      <span class="text-sm text-muted-foreground">Show inactive types</span>
    </div>

    <div
      v-if="isPending"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <Skeleton
        v-for="i in 3"
        :key="i"
        class="h-52 w-full rounded-xl"
      />
    </div>

    <EmptyState
      v-else-if="!consultationTypes?.length"
      :icon="File01Icon"
      title="No consultation types yet"
      description="Create your first consultation type to start accepting bookings"
    >
      <template #actions>
        <Button @click="handleCreate">
          Create consultation type
        </Button>
      </template>
    </EmptyState>

    <div
      v-else
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card
        v-for="type in consultationTypes"
        :key="type.id"
        
      >
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <CardTitle class="text-lg">
                {{ type.name }}
              </CardTitle>
              <CardDescription
                v-if="type.description"
                class="mt-1 line-clamp-2"
              >
                {{ type.description }}
              </CardDescription>
            </div>
            <Badge
              :variant="type.isActive ? 'secondary' : 'outline'"
              :class="type.isActive ? 'border-transparent bg-primary/10 text-primary' : ''"
            >
              {{ type.isActive ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <HugeiconsIcon :icon="Clock01Icon" class="size-4 shrink-0" />
              <span>{{ type.durationMinutes }} minutes</span>
            </div>
            <div class="flex items-center gap-2">
              <HugeiconsIcon :icon="EuroIcon" class="size-4 shrink-0" />
              <span class="font-semibold text-foreground tabular-nums">{{ formatPrice(type.price, type.currency) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <HugeiconsIcon :icon="Video01Icon" class="size-4 shrink-0" />
              <span>{{ getMeetingTypeLabel(type.meetingType) }}</span>
            </div>
            <div
              v-if="type.bufferMinutes > 0"
              class="flex items-center gap-2"
            >
              <HugeiconsIcon :icon="Timer01Icon" class="size-4 shrink-0" />
              <span>{{ type.bufferMinutes }}min buffer</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <Button
              variant="outline"
              size="sm"
              @click="handleEdit(type)"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="handleToggleActive(type)"
            >
              {{ type.isActive ? 'Deactivate' : 'Activate' }}
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="handleDelete(type)"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <ConsultationTypeModal
      v-model="isCreateModalOpen"
      @success="refetch"
    />

    <ConsultationTypeModal
      v-model="isEditModalOpen"
      :consultation-type="selectedType"
      @success="refetch"
    />
  </div>
</template>

<script setup lang="ts">
import { Add01Icon, Clock01Icon, EuroIcon, File01Icon, Timer01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { ConsultationType } from '~/types/booking'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const { useConsultationTypesList, useDeleteConsultationType, useActivateConsultationType, useDeactivateConsultationType } = useConsultationTypes()

const showInactive = ref(false)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedType = ref<ConsultationType | null>(null)

const { data: consultationTypes, isPending, refetch } = useConsultationTypesList(showInactive)
const deleteMutation = useDeleteConsultationType()
const activateMutation = useActivateConsultationType()
const deactivateMutation = useDeactivateConsultationType()

function handleCreate() {
  isCreateModalOpen.value = true
}

function handleEdit(type: ConsultationType) {
  selectedType.value = type
  isEditModalOpen.value = true
}

async function handleToggleActive(type: ConsultationType) {
  try {
    if (type.isActive) {
      await deactivateMutation.mutateAsync(type.id)
      toast.success('Consultation type deactivated')
    }
    else {
      await activateMutation.mutateAsync(type.id)
      toast.success('Consultation type activated')
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
    toast.error(message)
  }
}

async function handleDelete(type: ConsultationType) {
  if (!confirm(`Are you sure you want to delete "${type.name}"?`))
    return

  try {
    await deleteMutation.mutateAsync(type.id)
    toast.success('Consultation type deleted')
  }
  catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 409) {
      const shouldDeactivate = confirm(
        'This consultation type has existing bookings and cannot be deleted. Would you like to deactivate it instead?',
      )
      if (shouldDeactivate)
        await handleToggleActive(type)
    }
    else {
      const message = error instanceof Error ? error.message : 'Failed to delete consultation type'
      toast.error(message)
    }
  }
}

function formatPrice(price: string, currency: string) {
  const amount = Number.parseFloat(price)
  if (amount === 0)
    return 'Free'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount)
}

function getMeetingTypeLabel(type: string) {
  const labels: Record<string, string> = {
    video: 'Video call',
    phone: 'Phone call',
    in_person: 'In person',
    any: 'Any type',
  }
  return labels[type] || type
}
</script>
