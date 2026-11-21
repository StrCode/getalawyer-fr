<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'
import { useLawyerPublicProfilePage } from '~/composables/useLawyerPublicProfilePage'
import type { ConsultationType } from '~/types/lawyer'

/**
 * Booking a consultation, in the Canopy design: which consultation, then a day
 * and time, then a check and confirm. A summary of the booking stays beside the
 * steps (under them on a phone) and fills in as choices are made. It follows
 * on from the booking card on the lawyer's profile, which links here with
 * whatever was already picked.
 */
definePageMeta({
  layout: 'site',
  middleware: ['require-login', 'client-directory'],
})

const route = useRoute()
const router = useRouter()
const lawyerId = computed(() => route.params.id as string)

const { lawyer, pending, error } = await useLawyerPublicProfilePage(lawyerId)

const consultationTypes = computed(() =>
  (lawyer.value?.consultationTypes ?? []).filter(t => t.isActive),
)

useHead({
  title: computed(() => lawyer.value ? `Book ${lawyer.value.name}` : 'Book a consultation'),
  meta: [{ name: 'robots', content: 'noindex' }],
})

const initials = computed(() =>
  (lawyer.value?.name ?? '').split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2),
)

// --- Flow state ---
const step = ref(1)
const selectedType = ref<ConsultationType | null>(null)
const selectedSlot = ref<{ date: string, time: string } | null>(null)
const meetingType = ref<'video' | 'phone' | 'in_person' | null>(null)
const clientNotes = ref('')

// A phone consultation needs a number for the lawyer to call. It starts as the
// one on the account, and can be changed for this booking.
const { session } = useAuth()
const phone = ref('')
watch(
  () => (session.value?.user as { phoneNumber?: string | null } | undefined)?.phoneNumber,
  (number) => { if (number && !phone.value) phone.value = number },
  { immediate: true },
)
const phoneOk = computed(() => phone.value.replace(/[^\d+]/g, '').length >= 10)

const MEETING_TYPE_OPTIONS = [
  { value: 'video', label: 'Video call', icon: 'video' },
  { value: 'phone', label: 'Phone call', icon: 'phone' },
  { value: 'in_person', label: 'In person', icon: 'office' },
] as const

const MEETING_LABEL = { video: 'Video call', phone: 'Phone call', in_person: 'In person', any: 'Video, phone or in person' } as const

/** 'any' means the client picks; otherwise the type dictates it. */
const meetingTypeChoices = computed(() => {
  if (!selectedType.value) return []
  if (selectedType.value.meetingType === 'any') return MEETING_TYPE_OPTIONS
  return MEETING_TYPE_OPTIONS.filter(o => o.value === selectedType.value!.meetingType)
})

// The profile's booking card links here with the visitor's picks
// (?type=…&date=YYYY-MM-DD&time=HH:mm), so they land on the step they reached.
// If the time has been taken by the time they confirm, the server says so and they are sent back to step 2.
const preset = route.query
const presetType = consultationTypes.value.find(type => type.id === preset.type)
if (presetType) {
  selectedType.value = presetType
  meetingType.value = presetType.meetingType === 'any' ? null : presetType.meetingType
  step.value = 2
  const date = typeof preset.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(preset.date) ? preset.date : null
  const time = typeof preset.time === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(preset.time) ? preset.time : null
  if (date && time) {
    selectedSlot.value = { date, time }
    step.value = 3
  }
}

function choosePriceLabel(type: ConsultationType): string {
  const price = Number(type.price)
  return price > 0 ? `₦${price.toLocaleString()}` : 'Free'
}

function selectType(type: ConsultationType) {
  if (selectedType.value?.id !== type.id) {
    // Slots depend on the type's duration — a change invalidates the pick.
    selectedSlot.value = null
  }
  selectedType.value = type
  meetingType.value = type.meetingType === 'any' ? null : type.meetingType
  step.value = 2
}

function toReview() {
  if (!selectedSlot.value) return
  step.value = 3
}

const slotDateLabel = computed(() => {
  if (!selectedSlot.value) return null
  try {
    return new Date(`${selectedSlot.value.date}T00:00:00`).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return selectedSlot.value.date }
})

const slotTimeLabel = computed(() => {
  if (!selectedSlot.value) return null
  const [h = '0', m = '00'] = selectedSlot.value.time.split(':')
  const hour = Number.parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
})

const canConfirm = computed(() =>
  Boolean(selectedType.value && selectedSlot.value && meetingType.value)
  && (meetingType.value !== 'phone' || phoneOk.value),
)

/** Why Confirm is not available yet, said under the button. */
const confirmHint = computed(() => {
  if (!meetingType.value) return 'Choose how you want to meet to confirm.'
  if (meetingType.value === 'phone' && !phoneOk.value) return 'Add a phone number the lawyer can call you on.'
  return ''
})

const { useCreateBooking } = useBookings()
const { mutate: createBooking, isPending: isBooking } = useCreateBooking()

function handleConfirm() {
  if (!selectedType.value || !selectedSlot.value || !meetingType.value) return

  createBooking(
    {
      lawyerId: lawyerId.value,
      consultationTypeId: selectedType.value.id,
      scheduledDate: selectedSlot.value.date,
      scheduledStartTime: selectedSlot.value.time,
      meetingType: meetingType.value,
      meetingPhone: meetingType.value === 'phone' ? phone.value.trim() : undefined,
      clientNotes: clientNotes.value.trim() || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      onSuccess: (booking) => {
        toast.success('Booking requested', {
          description: 'The lawyer will confirm your consultation shortly.',
        })
        router.push(`/dashboard/bookings/${booking.id}`)
      },
      onError: (err: any) => {
        const message = err?.message || 'Failed to create the booking'
        // The lawyer's membership is not on: no time will work, so do not send the client back to pick one.
        if (err?.code === 'LAWYER_NOT_TAKING_BOOKINGS') {
          toast.error('Not taking bookings', {
            description: 'This lawyer is not taking new bookings at the moment. You can still message them, or find another lawyer.',
          })
          return
        }
        // 409: someone else took the time between picking it and confirming.
        if (err?.status === 409 || err?.code === 'SLOT_NOT_AVAILABLE' || message.includes('no longer available')) {
          toast.error('Slot unavailable', {
            description: 'That time was just taken. Pick another slot.',
          })
          selectedSlot.value = null
          step.value = 2
        } else {
          toast.error('Booking failed', { description: message })
        }
      },
    },
  )
}

const steps = [
  { step: 1, label: 'Consultation', title: 'Which consultation?' },
  { step: 2, label: 'Day and time', title: 'Pick a day and time' },
  { step: 3, label: 'Confirm', title: 'Check and confirm' },
] as const
const current = computed(() => steps[step.value - 1]!)

/** A step can be opened once the ones before it are answered. */
function canOpen(target: number): boolean {
  if (target === 1) return true
  if (target === 2) return Boolean(selectedType.value)
  return Boolean(selectedType.value && selectedSlot.value)
}

// Class lists used more than once (full strings, so Tailwind sees them).
const row = 'w-full cursor-pointer rounded-card border border-border bg-card px-4.5 py-4 text-left transition-[translate,box-shadow,border-color,background-color] duration-200 ease-canopy hover:border-brand aria-checked:border-brand aria-checked:bg-mint aria-checked:text-deep'
const panel = 'rounded-card border border-border bg-card p-4.5 lg:p-6'
const actions = 'mt-5.25 flex items-center justify-between gap-3 border-t border-border pt-4'
</script>

<template>
  <div class="pb-10 md:pb-11.5 lg:pb-15.25 xl:pb-19.25">
    <NuxtLink :to="`/lawyers/${lawyerId}`" :class="authBack">← Back to profile</NuxtLink>

    <!-- loading -->
    <div v-if="pending" class="mt-4 grid gap-2.75" aria-busy="true" aria-label="Loading the lawyer">
      <Skeleton class="h-12 w-2/3 max-w-128 rounded-full" />
      <Skeleton v-for="n in 3" :key="n" class="h-20.75 max-w-176 rounded-card" />
    </div>

    <!-- could not load -->
    <div v-else-if="error || !lawyer" role="alert" class="mt-6 grid max-w-144 justify-items-start gap-2.75 rounded-card border border-dashed border-border p-6">
      <h1 class="text-2xl leading-none font-normal tracking-tight">We could not load this lawyer.</h1>
      <p class="text-muted-foreground">The profile may have been removed, or something went wrong on our side.</p>
      <Button as-child variant="canopy" size="pill-sm"><NuxtLink to="/find-lawyers">Browse lawyers</NuxtLink></Button>
    </div>

    <!-- nothing to book online -->
    <div v-else-if="consultationTypes.length === 0" class="mt-6 grid max-w-144 justify-items-start gap-2.75 rounded-card border border-border bg-card p-6">
      <span class="grid size-11 place-items-center rounded-md bg-mint text-deep"><CanopyGlyph name="calendar" :size="20" /></span>
      <h1 class="text-2xl leading-none font-normal tracking-tight">{{ lawyer.name }} is not taking bookings online yet.</h1>
      <p class="text-muted-foreground">You can still send a message. It is free, and you can agree a time in the chat.</p>
      <Button as-child variant="canopy" size="pill-sm"><NuxtLink :to="`/lawyers/${lawyerId}`">Back to profile</NuxtLink></Button>
    </div>

    <template v-else>
      <header class="mt-2 max-w-176">
        <p class="text-sm font-medium tracking-widest text-brand uppercase">Book a consultation</p>
        <h1 class="mt-2.5 text-3xl md:text-4xl lg:text-5xl leading-none font-normal tracking-tighter text-balance">Book time with {{ lawyer.name }}</h1>
      </header>

      <div class="mt-5 md:mt-5.75 lg:mt-7.75 xl:mt-8 grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-5 md:gap-5.75 lg:gap-7.75 xl:gap-9.5 max-tab:grid-cols-1">
        <div class="min-w-0">
          <!-- where you are: three steps, each opened once the one before is answered -->
          <ol class="grid grid-cols-3 gap-1.5" aria-label="Booking steps">
            <li v-for="item in steps" :key="item.step">
              <button
                type="button"
                class="group/step block w-full cursor-pointer text-left disabled:cursor-default"
                :disabled="!canOpen(item.step)"
                :aria-current="step === item.step ? 'step' : undefined"
                @click="step = item.step"
              >
                <i class="block h-1.5 rounded-full transition-colors duration-300" :class="step >= item.step ? 'bg-primary' : 'bg-border'" />
                <span class="mt-2 block text-sm" :class="step === item.step ? 'font-medium text-foreground' : 'text-muted-foreground group-enabled/step:group-hover/step:text-brand'">
                  {{ item.step }}. {{ item.label }}
                </span>
              </button>
            </li>
          </ol>

          <h2 class="mt-5.5 font-display text-2xl font-normal tracking-tight">{{ current.title }}</h2>

          <!-- 1 · which consultation -->
          <div v-if="step === 1" class="mt-3.5 grid gap-2.5" role="radiogroup" aria-label="Consultation">
            <button
              v-for="type in consultationTypes"
              :key="type.id"
              type="button"
              role="radio"
              :aria-checked="selectedType?.id === type.id"
              :class="row"
              @click="selectType(type)"
            >
              <span class="flex items-start justify-between gap-4">
                <span class="min-w-0">
                  <b class="block font-display text-lg font-normal tracking-tight">{{ type.name }}</b>
                  <span v-if="type.description" class="mt-0.75 line-clamp-2 block text-base opacity-80">{{ type.description }}</span>
                  <span class="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm opacity-80">
                    <span class="inline-flex items-center gap-1.5"><CanopyGlyph name="clock" :size="15" />{{ type.durationMinutes }} min</span>
                    <span>{{ MEETING_LABEL[type.meetingType] }}</span>
                  </span>
                </span>
                <em class="flex-none font-display text-xl font-normal tracking-tight not-italic">{{ choosePriceLabel(type) }}</em>
              </span>
            </button>
          </div>

          <!-- 2 · day and time -->
          <section v-else-if="step === 2" :class="panel" class="mt-3.5">
            <CanopySlotPicker
              :key="selectedType!.id"
              v-model="selectedSlot"
              :lawyer-id="lawyerId"
              :consultation-type-id="selectedType!.id"
            />
            <div :class="actions">
              <button type="button" :class="authBack" @click="step = 1">← Back</button>
              <Button variant="canopy" size="pill" class="group/btn min-w-44 justify-between pr-2 pl-5.5" :disabled="!selectedSlot" @click="toReview">
                Continue<CanopyArrowChip />
              </Button>
            </div>
          </section>

          <!-- 3 · check and confirm -->
          <section v-else :class="panel" class="mt-3.5">
            <div v-if="meetingTypeChoices.length > 1">
              <p id="meeting-label" class="text-sm font-medium">How do you want to meet?</p>
              <div class="mt-2.5 grid grid-cols-3 gap-1.75 max-sm:grid-cols-1" role="radiogroup" aria-labelledby="meeting-label">
                <button
                  v-for="option in meetingTypeChoices"
                  :key="option.value"
                  type="button"
                  role="radio"
                  :aria-checked="meetingType === option.value"
                  class="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-base font-medium transition-colors duration-200 hover:border-brand aria-checked:border-brand aria-checked:bg-mint aria-checked:text-deep"
                  @click="meetingType = option.value"
                >
                  <CanopyGlyph :name="option.icon" :size="17" />{{ option.label }}
                </button>
              </div>
            </div>

            <div v-if="meetingType === 'phone'" :class="meetingTypeChoices.length > 1 ? 'mt-5.25' : ''">
              <label for="booking-phone" class="text-sm font-medium">Phone number the lawyer should call</label>
              <Input
                id="booking-phone"
                v-model="phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="0803 123 4567"
                :class="authInput"
                class="mt-2 bg-background"
              />
            </div>

            <div :class="meetingTypeChoices.length > 1 || meetingType === 'phone' ? 'mt-5.25' : ''">
              <label for="booking-notes" class="text-sm font-medium">
                Anything the lawyer should know? <span class="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="booking-notes"
                v-model="clientNotes"
                rows="4"
                placeholder="A line or two about your matter, for example: tenancy dispute over a deposit that was not returned, in Lagos."
                class="mt-2 min-h-30 rounded-lg border-border bg-background px-4 py-3 text-base shadow-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-mint"
              />
            </div>

            <p class="mt-4 text-sm text-muted-foreground">
              This sends a request. {{ lawyer.name }} confirms it, and you will see the answer in your bookings.
            </p>

            <div :class="actions">
              <button type="button" :class="authBack" :disabled="isBooking" @click="step = 2">← Back</button>
              <Button variant="canopy" size="pill" class="group/btn min-w-52 justify-between pr-2 pl-5.5" :disabled="!canConfirm || isBooking" :aria-busy="isBooking" @click="handleConfirm">
                {{ isBooking ? 'Sending your request…' : 'Confirm booking' }}<CanopyArrowChip />
              </Button>
            </div>
            <p v-if="confirmHint" role="status" class="mt-2 text-right text-sm text-muted-foreground">{{ confirmHint }}</p>
          </section>
        </div>

        <!-- the booking so far -->
        <aside aria-label="Your booking" class="rounded-2xl border border-border bg-card p-5.25 shadow-pill tab:sticky tab:top-24">
          <div class="flex items-center gap-3.25">
            <span class="grid size-12.75 flex-none place-items-center overflow-hidden rounded-lg bg-mint">
              <NuxtImg v-if="lawyer.image" :src="lawyer.image" width="128" height="128" sizes="64px" alt="" class="size-full object-cover object-[50%_15%]" />
              <span v-else aria-hidden="true" class="font-display text-lg font-normal text-deep">{{ initials }}</span>
            </span>
            <span class="min-w-0">
              <small class="block text-xs font-medium tracking-wider text-brand uppercase">Your booking</small>
              <b class="block truncate font-display text-lg font-normal tracking-tight">{{ lawyer.name }}</b>
            </span>
          </div>

          <dl class="mt-4 grid gap-2.75 border-t border-border pt-4 text-base" aria-live="polite">
            <div class="grid gap-0.5">
              <dt class="text-sm text-muted-foreground">Consultation</dt>
              <dd v-if="selectedType">
                <b class="block font-medium">{{ selectedType.name }}</b>
                <span class="text-muted-foreground">{{ selectedType.durationMinutes }} min · {{ choosePriceLabel(selectedType) }}</span>
              </dd>
              <dd v-else class="text-muted-foreground">Not chosen yet</dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-sm text-muted-foreground">When</dt>
              <dd v-if="slotDateLabel">
                <b class="block font-medium">{{ slotDateLabel }}</b>
                <span class="text-muted-foreground">{{ slotTimeLabel }}, Nigerian time</span>
              </dd>
              <dd v-else class="text-muted-foreground">Not chosen yet</dd>
            </div>
            <div v-if="meetingType" class="grid gap-0.5">
              <dt class="text-sm text-muted-foreground">Meeting</dt>
              <dd class="font-medium">{{ MEETING_LABEL[meetingType] }}</dd>
            </div>
          </dl>

          <p class="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Fees are agreed and paid directly between you and the lawyer; getalawyer takes no commission.
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>
