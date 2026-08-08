<script setup lang="ts">
import { ArrowLeft01Icon, Building01Icon, CalendarCheckIn01Icon, CallIcon, Clock01Icon, Video01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import BookingCalendar from '~/components/booking/BookingCalendar.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { Textarea } from '@/components/ui/textarea'
import { useBookings } from '~/composables/useBookings'
import { useLawyerPublicProfilePage } from '~/composables/useLawyerPublicProfilePage'
import type { ConsultationType } from '~/types/lawyer'

/**
 * Client booking flow: consultation type → date & time → review & confirm.
 * Persistent summary rail on desktop recaps each completed step.
 */
definePageMeta({
  layout: 'landing',
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
  title: computed(() => lawyer.value ? `Book ${lawyer.value.name} · GetaLawyer` : 'Book a consultation · GetaLawyer'),
})

// --- Flow state ---
const step = ref(1)
const selectedType = ref<ConsultationType | null>(null)
const selectedSlot = ref<{ date: string, time: string } | null>(null)
const meetingType = ref<'video' | 'phone' | 'in_person' | null>(null)
const clientNotes = ref('')

const MEETING_TYPE_OPTIONS = [
  { value: 'video', label: 'Video call', icon: Video01Icon },
  { value: 'phone', label: 'Phone call', icon: CallIcon },
  { value: 'in_person', label: 'In person', icon: Building01Icon },
] as const

/** 'any' means the client picks; otherwise the type dictates it. */
const meetingTypeChoices = computed(() => {
  if (!selectedType.value) return []
  if (selectedType.value.meetingType === 'any') return MEETING_TYPE_OPTIONS
  return MEETING_TYPE_OPTIONS.filter(o => o.value === selectedType.value!.meetingType)
})

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

function onSlotSelect(slot: { date: string, time: string }) {
  selectedSlot.value = slot
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
  Boolean(selectedType.value && selectedSlot.value && meetingType.value),
)

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
        if (err?.status === 400 && message.includes('not available')) {
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
  { step: 1, title: 'Consultation' },
  { step: 2, title: 'Date & time' },
  { step: 3, title: 'Review' },
]
</script>

<template>
  <div class="bg-background pb-20 font-sans text-foreground">
    <div class="mx-auto max-w-6xl px-6 pt-8 md:px-8">
      <Button variant="ghost" class="mb-4 gap-2" as-child>
        <NuxtLink :to="`/lawyers/${lawyerId}`">
          <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-5" aria-hidden="true" />
          Back to profile
        </NuxtLink>
      </Button>

      <!-- Loading -->
      <div v-if="pending" class="space-y-4 py-6" aria-busy="true" aria-label="Loading lawyer">
        <Skeleton class="h-10 w-72 rounded-lg" />
        <Skeleton class="h-64 w-full rounded-xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error || !lawyer" class="py-16 text-center">
        <p class="text-lg font-medium text-foreground">We couldn't load this lawyer.</p>
        <p class="mt-1 text-sm text-muted-foreground">The profile may have been removed, or something went wrong.</p>
        <Button class="mt-6" as-child>
          <NuxtLink to="/find-lawyers">Browse lawyers</NuxtLink>
        </Button>
      </div>

      <!-- No bookable consultations -->
      <div v-else-if="consultationTypes.length === 0" class="py-16 text-center">
        <HugeiconsIcon :icon="CalendarCheckIn01Icon" class="mx-auto mb-4 size-12 text-muted-foreground" aria-hidden="true" />
        <p class="text-lg font-medium text-foreground">{{ lawyer.name }} isn't taking bookings yet</p>
        <p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          You can still message them — ask your question and agree next steps in chat.
        </p>
        <Button class="mt-6" as-child>
          <NuxtLink :to="`/lawyers/${lawyerId}`">Back to profile</NuxtLink>
        </Button>
      </div>

      <template v-else>
        <div class="max-w-2xl">
         <h1 class="text-3xl font-medium text-foreground md:text-4xl">
            Book a consultation
          </h1>
          <p class="mt-2 text-base text-muted-foreground">
            with <span class="font-medium text-foreground">{{ lawyer.name }}</span>
          </p>
        </div>

        <!-- Stepper -->
        <Stepper v-model="step" class="mt-8 flex w-full max-w-xl items-start gap-2">
          <StepperItem
            v-for="item in steps"
            :key="item.step"
            :step="item.step"
            class="relative flex w-full flex-col items-center justify-center"
          >
            <StepperSeparator
              v-if="item.step !== steps[steps.length - 1]?.step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-4 block h-0.5 shrink-0 rounded-full bg-border group-data-[state=completed]:bg-primary"
            />
            <StepperTrigger as-child>
              <Button
                :variant="step >= item.step ? 'default' : 'outline'"
                size="icon"
                class="z-10 shrink-0 rounded-full"
                :disabled="item.step === 2 ? !selectedType : item.step === 3 ? !selectedSlot : false"
              >
                <StepperIndicator>{{ item.step }}</StepperIndicator>
              </Button>
            </StepperTrigger>
            <StepperTitle class="mt-2 text-xs font-medium sm:text-sm" :class="step >= item.step ? 'text-foreground' : 'text-muted-foreground'">
              {{ item.title }}
            </StepperTitle>
          </StepperItem>
        </Stepper>

        <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Step content -->
          <div class="lg:col-span-2">
            <!-- 1 · Consultation type -->
            <div v-if="step === 1" class="space-y-3" role="radiogroup" aria-label="Consultation type">
              <button
                v-for="type in consultationTypes"
                :key="type.id"
                type="button"
                role="radio"
                :aria-checked="selectedType?.id === type.id"
                class="w-full cursor-pointer rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                :class="selectedType?.id === type.id ? 'border-primary ring-2 ring-primary/20' : 'border-foreground/15'"
                @click="selectType(type)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="font-medium text-foreground">{{ type.name }}</p>
                    <p v-if="type.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {{ type.description }}
                    </p>
                    <p class="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <span class="inline-flex items-center gap-1.5">
                        <HugeiconsIcon :icon="Clock01Icon" class="size-4" aria-hidden="true" />
                        {{ type.durationMinutes }} min
                      </span>
                      <span v-if="type.meetingType !== 'any'" class="capitalize">
                        {{ type.meetingType.replace('_', ' ') }}
                      </span>
                      <span v-else>Video · phone · in person</span>
                    </p>
                  </div>
                  <p class="shrink-0 text-lg font-semibold text-primary tabular-nums">
                    {{ choosePriceLabel(type) }}
                  </p>
                </div>
              </button>
            </div>

            <!-- 2 · Date & time -->
            <Card v-else-if="step === 2">
              <CardContent class="pt-6">
                <BookingCalendar
                  :lawyer-id="lawyerId"
                  :consultation-type-id="selectedType!.id"
                  @select="onSlotSelect"
                />
                <div class="mt-6 flex justify-between gap-3 border-t border-border pt-4">
                  <Button variant="ghost" @click="step = 1">
                    Back
                  </Button>
                  <Button :disabled="!selectedSlot" @click="toReview">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- 3 · Review & confirm -->
            <Card v-else>
              <CardContent class="space-y-6 pt-6">
                <div v-if="meetingTypeChoices.length > 1">
                  <Label class="mb-3 block">How do you want to meet?</Label>
                  <div class="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Meeting type">
                    <button
                      v-for="option in meetingTypeChoices"
                      :key="option.value"
                      type="button"
                      role="radio"
                      :aria-checked="meetingType === option.value"
                      class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      :class="meetingType === option.value
                        ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                        : 'border-foreground/15 bg-card text-muted-foreground hover:border-primary/40'"
                      @click="meetingType = option.value"
                    >
                      <HugeiconsIcon :icon="option.icon" class="size-4" aria-hidden="true" />
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <div>
                  <Label for="booking-notes" class="mb-2 block">
                    Anything the lawyer should know? <span class="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="booking-notes"
                    v-model="clientNotes"
                    rows="4"
                    placeholder="Briefly describe your matter — e.g. tenancy dispute over unreturned deposit in Lagos."
                  />
                </div>

                <div class="flex justify-between gap-3 border-t border-border pt-4">
                  <Button variant="ghost" @click="step = 2">
                    Back
                  </Button>
                  <ButtonBusy
                    :disabled="!canConfirm"
                    :loading="isBooking"
                    @click="handleConfirm"
                  >
                    Confirm booking
                  </ButtonBusy>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Summary rail -->
          <aside class="lg:col-span-1">
            <Card class="lg:sticky lg:top-24">
              <CardContent class="space-y-4 pt-6 text-sm">
                <p class="eyebrow text-muted-foreground">Your booking</p>
                <div>
                  <p class="text-muted-foreground">Lawyer</p>
                  <p class="font-medium text-foreground">{{ lawyer.name }}</p>
                </div>
                <div v-if="selectedType">
                  <p class="text-muted-foreground">Consultation</p>
                  <p class="font-medium text-foreground">{{ selectedType.name }}</p>
                  <p class="text-muted-foreground">{{ selectedType.durationMinutes }} min · {{ choosePriceLabel(selectedType) }}</p>
                </div>
                <div v-if="slotDateLabel">
                  <p class="text-muted-foreground">When</p>
                  <p class="font-medium text-foreground">{{ slotDateLabel }}</p>
                  <p class="text-muted-foreground">{{ slotTimeLabel }}</p>
                </div>
                <div v-if="meetingType && step === 3">
                  <p class="text-muted-foreground">Meeting</p>
                  <p class="font-medium capitalize text-foreground">{{ meetingType.replace('_', ' ') }}</p>
                </div>
                <p class="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                  Fees are agreed and paid directly between you and the lawyer — GetaLawyer takes no commission.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
