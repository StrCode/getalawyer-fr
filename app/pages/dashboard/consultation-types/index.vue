<script setup lang="ts">
import { Add01Icon, AlertCircleIcon, Clock01Icon, Delete02Icon, Edit02Icon, File01Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { MICRO, PANEL } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'
import type { ConsultationType } from '~/types/booking'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Consultation types - GetALawyer',
})

const {
  useConsultationTypesList,
  useDeleteConsultationType,
  useActivateConsultationType,
  useDeactivateConsultationType,
} = useConsultationTypes()

const showInactive = ref(false)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedType = ref<ConsultationType | null>(null)
const pendingDelete = ref<ConsultationType | null>(null)
const pendingDeactivate = ref<ConsultationType | null>(null)

const { data: consultationTypes, isPending, isError, refetch } = useConsultationTypesList(showInactive)
const deleteMutation = useDeleteConsultationType()
const activateMutation = useActivateConsultationType()
const deactivateMutation = useDeactivateConsultationType()

const activeCount = computed(
  () => (consultationTypes.value ?? []).filter((type) => type.isActive).length,
)

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

function handleDelete(type: ConsultationType) {
  pendingDelete.value = type
}

async function confirmDelete() {
  const type = pendingDelete.value
  pendingDelete.value = null
  if (!type)
    return

  try {
    await deleteMutation.mutateAsync(type.id)
    toast.success('Consultation type deleted')
  }
  catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 409) {
      pendingDeactivate.value = type
    }
    else {
      const message = error instanceof Error ? error.message : 'Failed to delete consultation type'
      toast.error(message)
    }
  }
}

async function confirmDeactivateInstead() {
  const type = pendingDeactivate.value
  pendingDeactivate.value = null
  if (type)
    await handleToggleActive(type)
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
    video: 'Video',
    phone: 'Phone',
    in_person: 'In person',
    any: 'Any',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Consultation types"
      description="Services clients can book — duration, price, and meeting format."
    >
      <template #actions>
        <Badge
          v-if="!isPending"
          variant="outline"
          class="rounded-full border-foreground/15 px-3 py-1 text-xs font-semibold tabular-nums"
          :class="activeCount > 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground'"
        >
          {{ activeCount }} active
        </Badge>
        <Button
          size="lg"
          class="cursor-pointer"
          @click="handleCreate"
        >
          <HugeiconsIcon
            :icon="Add01Icon"
            class="size-4"
          />
          New type
        </Button>
      </template>
    </DashboardPageHeader>

    <div class="flex items-center justify-between gap-4">
      <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <Switch
          :model-value="showInactive"
          @update:model-value="showInactive = $event"
        />
        Show inactive
      </label>
      <p
        v-if="!isPending && consultationTypes?.length"
        class="text-xs text-muted-foreground tabular-nums"
      >
        {{ consultationTypes.length }} total
      </p>
    </div>

    <div
      v-if="isPending"
      class="space-y-3"
    >
      <Skeleton
        v-for="i in 4"
        :key="i"
        class="h-16 w-full rounded-xl"
      />
    </div>

    <section
      v-else-if="isError"
      :class="cn(PANEL, 'flex flex-col items-center gap-3 px-6 py-14 text-center')"
    >
      <HugeiconsIcon
        :icon="AlertCircleIcon"
        class="size-10 text-muted-foreground"
      />
      <p class="text-sm font-medium text-foreground">
        Failed to load consultation types
      </p>
      <p class="text-sm text-muted-foreground">
        Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        class="cursor-pointer"
        @click="refetch()"
      >
        Retry
      </Button>
    </section>

    <EmptyState
      v-else-if="!consultationTypes?.length"
      :icon="File01Icon"
      title="No consultation types yet"
      description="Add at least one active type so clients can book you from search."
    >
      <template #actions>
        <Button
          class="cursor-pointer"
          @click="handleCreate"
        >
          Create consultation type
        </Button>
      </template>
    </EmptyState>

    <section
      v-else
      :class="cn(PANEL)"
    >
      <div class="hidden border-b border-foreground/15 bg-muted/30 px-6 py-3 md:grid md:grid-cols-[minmax(0,1.4fr)_7rem_7rem_7rem_6rem_2.5rem] md:gap-4">
        <span :class="cn(MICRO, 'text-muted-foreground')">Service</span>
        <span :class="cn(MICRO, 'text-muted-foreground')">Duration</span>
        <span :class="cn(MICRO, 'text-muted-foreground')">Price</span>
        <span :class="cn(MICRO, 'text-muted-foreground')">Meeting</span>
        <span :class="cn(MICRO, 'text-muted-foreground')">Status</span>
        <span class="sr-only">Actions</span>
      </div>

      <ul class="divide-y divide-foreground/15">
        <li
          v-for="type in consultationTypes"
          :key="type.id"
          class="ease-luxe grid gap-3 px-5 py-4 transition-colors duration-220 hover:bg-muted/40 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_7rem_7rem_7rem_6rem_2.5rem] md:items-center md:gap-4"
        >
          <div class="min-w-0">
            <p class="truncate font-medium tracking-tight text-foreground">
              {{ type.name }}
            </p>
            <p
              v-if="type.description"
              class="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
            >
              {{ type.description }}
            </p>
            <p
              v-if="type.bufferMinutes > 0"
              class="mt-1 text-xs text-muted-foreground md:hidden"
            >
              {{ type.bufferMinutes }}min buffer
            </p>
          </div>

          <p class="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <HugeiconsIcon
              :icon="Clock01Icon"
              class="size-3.5 shrink-0 md:hidden"
            />
            {{ type.durationMinutes }} min
          </p>

          <p class="text-sm font-semibold tabular-nums text-foreground">
            {{ formatPrice(type.price, type.currency) }}
          </p>

          <p class="text-sm text-muted-foreground">
            {{ getMeetingTypeLabel(type.meetingType) }}
          </p>

          <div>
            <Badge
              variant="outline"
              class="rounded-full px-2 py-0.5 text-[0.6rem] font-medium tracking-widest uppercase"
              :class="type.isActive
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-foreground/15 text-muted-foreground'"
            >
              {{ type.isActive ? 'Active' : 'Inactive' }}
            </Badge>
          </div>

          <div class="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="cursor-pointer"
                  :aria-label="`Actions for ${type.name}`"
                >
                  <HugeiconsIcon
                    :icon="MoreHorizontalIcon"
                    class="size-4"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  class="cursor-pointer"
                  @click="handleEdit(type)"
                >
                  <HugeiconsIcon
                    :icon="Edit02Icon"
                    class="size-4"
                  />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="cursor-pointer"
                  @click="handleToggleActive(type)"
                >
                  {{ type.isActive ? 'Deactivate' : 'Activate' }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  class="cursor-pointer"
                  @click="handleDelete(type)"
                >
                  <HugeiconsIcon
                    :icon="Delete02Icon"
                    class="size-4"
                  />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      </ul>
    </section>

    <ConsultationTypeModal
      v-model="isCreateModalOpen"
      @success="refetch"
    />

    <ConsultationTypeModal
      v-model="isEditModalOpen"
      :consultation-type="selectedType"
      @success="refetch"
    />

    <AlertDialog
      :open="pendingDelete !== null"
      @update:open="(open) => { if (!open) pendingDelete = null }"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{{ pendingDelete?.name }}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Clients will no longer be able to book this consultation type. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog
      :open="pendingDeactivate !== null"
      @update:open="(open) => { if (!open) pendingDeactivate = null }"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate instead?</AlertDialogTitle>
          <AlertDialogDescription>
            This consultation type has existing bookings and cannot be deleted. Deactivating hides it from new bookings while keeping existing ones intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep active</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeactivateInstead">
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
