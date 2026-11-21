<script setup lang="ts">
import { toast } from 'vue-sonner'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { offeredSummary, priceLabel, typeFacts } from '~/lib/consultation-type-view'
import type { ConsultationType } from '~/types/booking'

/**
 * The consultations a lawyer offers: what each is called, how long it runs,
 * what it costs and how the meeting is held. Clients choose one of these when
 * they book. A type can be paused (hidden from new bookings) instead of
 * deleted; one that already has bookings can only be paused.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'Consultation types' })
useSeoMeta({ description: 'The consultations clients can book with you.' })

// The API refuses these for a lawyer whose membership is not on; stop before any form opens.
const { membershipBlocks } = useMembershipAccess()

const {
  useConsultationTypesList,
  useDeleteConsultationType,
  useActivateConsultationType,
  useDeactivateConsultationType,
} = useConsultationTypes()

const showPaused = ref(false)
const { data: consultationTypes, isPending, isError, isFetching, refetch } = useConsultationTypesList(showPaused)
const types = computed(() => consultationTypes.value ?? [])

const deleteMutation = useDeleteConsultationType()
const activateMutation = useActivateConsultationType()
const deactivateMutation = useDeactivateConsultationType()

const createOpen = ref(false)
const editOpen = ref(false)
const selected = ref<ConsultationType | null>(null)
const pendingDelete = ref<ConsultationType | null>(null)
const pendingPause = ref<ConsultationType | null>(null)
const deleting = computed(() => deleteMutation.isPending.value)

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function add() {
  if (membershipBlocks('change your consultation types')) return
  createOpen.value = true
}

function edit(type: ConsultationType) {
  if (membershipBlocks('change your consultation types')) return
  selected.value = type
  editOpen.value = true
}

async function setOffered(type: ConsultationType, offered: boolean) {
  if (membershipBlocks('change your consultation types')) return
  try {
    if (offered) {
      await activateMutation.mutateAsync(type.id)
      toast.success(`Clients can book "${type.name}" again.`)
    }
    else {
      await deactivateMutation.mutateAsync(type.id)
      toast.success(`"${type.name}" is paused. Clients cannot book it.`)
    }
  }
  catch (error: unknown) {
    toast.error(messageOf(error, 'We could not change that. Nothing has changed.'))
  }
}

function askDelete(type: ConsultationType) {
  if (membershipBlocks('change your consultation types')) return
  pendingDelete.value = type
}

async function confirmDelete() {
  const type = pendingDelete.value
  if (!type || deleting.value) return
  try {
    await deleteMutation.mutateAsync(type.id)
    pendingDelete.value = null
    toast.success(`"${type.name}" deleted.`)
  }
  catch (error: unknown) {
    pendingDelete.value = null
    // A type with bookings cannot be deleted; offer to pause it instead.
    if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 409) {
      pendingPause.value = type
    }
    else {
      toast.error(messageOf(error, 'We could not delete that. Nothing has changed.'))
    }
  }
}

async function confirmPause() {
  const type = pendingPause.value
  pendingPause.value = null
  if (type) await setOffered(type, false)
}

const sectionTitle = 'font-display text-base font-normal tracking-tight'
const panel = 'overflow-hidden rounded-card border border-border bg-card'
const pad = 'px-4.5 lg:px-5.75 xl:px-6'
const pill = 'rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'
const dialog = 'gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120'
const dialogTitle = 'font-display text-xl leading-none font-normal tracking-tight'
const menuItem = 'min-h-11 cursor-pointer rounded-md px-3 text-sm font-medium text-foreground focus:bg-mint focus:text-deep'
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Consultation types"
      description="What clients can book with you: how long each consultation runs, what it costs and how you meet."
    >
      <template #actions>
        <span
          v-if="!isPending && !isError"
          class="rounded-full px-3.5 py-1.25 text-sm font-medium"
          :class="types.some(type => type.isActive) ? 'bg-mint text-deep' : 'bg-muted text-foreground'"
        >{{ offeredSummary(types) }}</span>
        <Button variant="canopy" size="pill-sm" @click="add">Add a type</Button>
      </template>
    </DashboardPageHeader>

    <LoadingRegion v-if="isPending" label="Loading your consultation types">
      <div :class="panel">
        <div :class="[pad, 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-3.5']">
          <LoadingLine class="w-28" />
          <div class="flex min-h-11 items-center gap-2.75">
            <Skeleton class="h-5 w-9 rounded-full" />
            <LoadingLine size="sm" class="w-40" />
          </div>
        </div>
        <LoadingList bare lead="none" :pad="`${pad} py-4`">
          <template #end>
            <LoadingLine size="lg" class="mr-3.25 w-20" />
            <Skeleton class="h-10 w-15 rounded-full" />
            <Skeleton class="h-10 w-22 rounded-full" />
          </template>
        </LoadingList>
      </div>
    </LoadingRegion>

    <section v-else-if="isError" :class="[panel, 'p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center']">
      <h2 :class="sectionTitle">We could not load your consultation types.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <section v-else :class="panel" aria-labelledby="types-title">
      <header :class="[pad, 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-3.5']">
        <h2 id="types-title" :class="sectionTitle">Your types<span v-if="types.length > 0" class="ml-2 text-muted-foreground">{{ types.length }}</span></h2>
        <label class="flex min-h-11 cursor-pointer items-center gap-2.75 text-sm text-muted-foreground">
          <Switch :model-value="showPaused" @update:model-value="showPaused = $event" />
          Show paused types too
        </label>
      </header>

      <div v-if="types.length === 0" :class="[pad, 'py-7.25 md:py-7.75 lg:py-10.25 xl:py-12 text-center']">
        <h3 :class="sectionTitle">{{ showPaused ? 'No consultation types yet.' : 'Nothing is offered to clients.' }}</h3>
        <p class="mx-auto mt-2 max-w-128 text-muted-foreground">Clients can only book you once you offer at least one consultation type, for example a 30 minute first consultation.</p>
        <Button variant="canopy" size="pill-sm" class="mt-4" @click="add">Add a type</Button>
      </div>

      <ul v-else class="divide-y divide-border">
        <li
          v-for="type in types"
          :key="type.id"
          :class="[pad, 'flex flex-wrap items-center gap-x-4.75 gap-y-2.5 py-4']"
        >
          <div class="min-w-0 grow basis-64">
            <p class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <b class="font-display text-base font-normal tracking-tight">{{ type.name }}</b>
              <span :class="[pill, type.isActive ? 'bg-mint text-deep' : 'bg-muted text-foreground']">{{ type.isActive ? 'Offered' : 'Paused' }}</span>
            </p>
            <p class="mt-0.75 flex flex-wrap items-center gap-x-1.75 text-sm text-muted-foreground">
              <template v-for="(fact, index) in typeFacts(type)" :key="fact">
                <span v-if="index > 0" aria-hidden="true">·</span><span>{{ fact }}</span>
              </template>
            </p>
            <p v-if="type.description" class="mt-1 line-clamp-2 max-w-176 text-sm text-muted-foreground">{{ type.description }}</p>
          </div>

          <b class="flex-none font-display text-lg font-normal tracking-tight tabular-nums">{{ priceLabel(type.price, type.currency) }}</b>

          <div class="flex flex-none items-center gap-1.5">
            <Button variant="line" size="pill-sm" class="h-10 px-3.75 text-sm" :aria-label="`Edit ${type.name}`" @click="edit(type)">Edit</Button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="line" size="pill-sm" class="group/more h-10 gap-1.25 px-3.5 text-sm" :aria-label="`More for ${type.name}`">
                  More
                  <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="transition-transform duration-200 ease-canopy group-data-[state=open]/more:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" :side-offset="8" class="w-52 rounded-card border-border bg-card p-2 font-sans text-foreground shadow-widget">
                <DropdownMenuItem :class="menuItem" @click="setOffered(type, !type.isActive)">{{ type.isActive ? 'Pause' : 'Offer again' }}</DropdownMenuItem>
                <DropdownMenuItem :class="[menuItem, 'text-destructive focus:bg-destructive/10 focus:text-destructive']" @click="askDelete(type)">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      </ul>
    </section>

    <ConsultationTypeModal v-model="createOpen" />
    <ConsultationTypeModal v-model="editOpen" :consultation-type="selected" />

    <!-- ───────── deleting ───────── -->
    <Dialog :open="pendingDelete !== null" @update:open="(open: boolean) => { if (!open && !deleting) pendingDelete = null }">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle :class="dialogTitle">Delete this type?</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Clients will no longer be able to book "{{ pendingDelete?.name }}". This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-1.25 gap-2.5">
          <Button variant="line" size="pill" :disabled="deleting" @click="pendingDelete = null">Keep it</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="deleting" :aria-busy="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Delete the type' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── it has bookings: pause it instead ───────── -->
    <Dialog :open="pendingPause !== null" @update:open="(open: boolean) => { if (!open) pendingPause = null }">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-2 text-left">
          <DialogTitle :class="dialogTitle">Pause it instead?</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            "{{ pendingPause?.name }}" has bookings, so it cannot be deleted. Pausing hides it from new bookings and leaves the existing ones as they are.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-1.25 gap-2.5">
          <Button variant="line" size="pill" @click="pendingPause = null">Leave it offered</Button>
          <Button variant="canopy" size="pill" @click="confirmPause">Pause the type</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
