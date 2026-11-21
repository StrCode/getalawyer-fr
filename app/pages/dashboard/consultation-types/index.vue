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
useSeoMeta({ description: 'The consultations clients can book with you.', robots: 'noindex, nofollow' })

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

const sectionTitle = 'font-display text-[1.15rem] font-[650] tracking-[-0.02em]'
const panel = 'overflow-hidden rounded-card border border-border bg-card'
const pad = 'px-[clamp(1.1rem,2.2vw,1.5rem)]'
const pill = 'rounded-full px-[0.65rem] py-[0.12rem] text-[0.78rem] font-bold whitespace-nowrap'
const dialog = 'gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]'
const dialogTitle = 'font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]'
const menuItem = 'min-h-11 cursor-pointer rounded-[0.9rem] px-3 text-[0.95rem] font-medium text-foreground focus:bg-mint focus:text-deep'
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Consultation types"
      description="What clients can book with you: how long each consultation runs, what it costs and how you meet."
    >
      <template #actions>
        <span
          v-if="!isPending && !isError"
          class="rounded-full px-[0.85rem] py-[0.3rem] text-[0.88rem] font-bold"
          :class="types.some(type => type.isActive) ? 'bg-mint text-deep' : 'bg-muted text-foreground'"
        >{{ offeredSummary(types) }}</span>
        <Button variant="canopy" size="pill-sm" @click="add">Add a type</Button>
      </template>
    </DashboardPageHeader>

    <div v-if="isPending" role="status" aria-label="Loading your consultation types" class="grid gap-2">
      <div v-for="n in 3" :key="n" class="h-[5rem] animate-pulse rounded-[1.25rem] bg-muted" />
    </div>

    <section v-else-if="isError" :class="[panel, 'p-[clamp(1.5rem,4vw,3rem)] text-center']">
      <h2 :class="sectionTitle">We could not load your consultation types.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" :disabled="isFetching" :aria-busy="isFetching" @click="() => refetch()">{{ isFetching ? 'Trying…' : 'Try again' }}</Button>
    </section>

    <section v-else :class="panel" aria-labelledby="types-title">
      <header :class="[pad, 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-[0.9rem]']">
        <h2 id="types-title" :class="sectionTitle">Your types<span v-if="types.length > 0" class="ml-[0.5rem] text-muted-foreground">{{ types.length }}</span></h2>
        <label class="flex min-h-[2.75rem] cursor-pointer items-center gap-[0.7rem] text-[0.95rem] text-muted-foreground">
          <Switch :model-value="showPaused" @update:model-value="showPaused = $event" />
          Show paused types too
        </label>
      </header>

      <div v-if="types.length === 0" :class="[pad, 'py-[clamp(1.8rem,4vw,3rem)] text-center']">
        <h3 :class="sectionTitle">{{ showPaused ? 'No consultation types yet.' : 'Nothing is offered to clients.' }}</h3>
        <p class="mx-auto mt-2 max-w-[32rem] text-muted-foreground">Clients can only book you once you offer at least one consultation type, for example a 30 minute first consultation.</p>
        <Button variant="canopy" size="pill-sm" class="mt-[1rem]" @click="add">Add a type</Button>
      </div>

      <ul v-else class="divide-y divide-border">
        <li
          v-for="type in types"
          :key="type.id"
          :class="[pad, 'flex flex-wrap items-center gap-x-[1.2rem] gap-y-[0.6rem] py-[1rem]']"
        >
          <div class="min-w-0 flex-[1_1_16rem]">
            <p class="flex flex-wrap items-center gap-x-[0.6rem] gap-y-1">
              <b class="font-display text-[1.12rem] font-[650] tracking-[-0.02em]">{{ type.name }}</b>
              <span :class="[pill, type.isActive ? 'bg-mint text-deep' : 'bg-muted text-foreground']">{{ type.isActive ? 'Offered' : 'Paused' }}</span>
            </p>
            <p class="mt-[0.2rem] flex flex-wrap items-center gap-x-[0.45rem] text-[0.92rem] text-muted-foreground">
              <template v-for="(fact, index) in typeFacts(type)" :key="fact">
                <span v-if="index > 0" aria-hidden="true">·</span><span>{{ fact }}</span>
              </template>
            </p>
            <p v-if="type.description" class="mt-[0.25rem] line-clamp-2 max-w-[44rem] text-[0.92rem] text-muted-foreground">{{ type.description }}</p>
          </div>

          <b class="flex-none font-display text-[1.25rem] font-[650] tracking-[-0.02em] tabular-nums">{{ priceLabel(type.price, type.currency) }}</b>

          <div class="flex flex-none items-center gap-[0.4rem]">
            <Button variant="line" size="pill-sm" class="h-[2.5rem] px-[0.95rem] text-[0.95rem]" :aria-label="`Edit ${type.name}`" @click="edit(type)">Edit</Button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="line" size="pill-sm" class="group/more h-[2.5rem] gap-[0.3rem] px-[0.85rem] text-[0.95rem]" :aria-label="`More for ${type.name}`">
                  More
                  <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="transition-[rotate] duration-200 ease-canopy group-data-[state=open]/more:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" :side-offset="8" class="w-[13rem] rounded-[1.25rem] border-border bg-card p-2 font-text text-foreground shadow-widget">
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
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Delete this type?</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">
            Clients will no longer be able to book "{{ pendingDelete?.name }}". This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" :disabled="deleting" @click="pendingDelete = null">Keep it</Button>
          <Button variant="destructive" size="pill" class="rounded-full" :disabled="deleting" :aria-busy="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Delete the type' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ───────── it has bookings: pause it instead ───────── -->
    <Dialog :open="pendingPause !== null" @update:open="(open: boolean) => { if (!open) pendingPause = null }">
      <DialogContent :class="dialog">
        <DialogHeader class="gap-[0.5rem] text-left">
          <DialogTitle :class="dialogTitle">Pause it instead?</DialogTitle>
          <DialogDescription class="text-[1rem] text-muted-foreground">
            "{{ pendingPause?.name }}" has bookings, so it cannot be deleted. Pausing hides it from new bookings and leaves the existing ones as they are.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
          <Button variant="line" size="pill" @click="pendingPause = null">Leave it offered</Button>
          <Button variant="canopy" size="pill" @click="confirmPause">Pause the type</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
