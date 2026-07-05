<script setup lang="ts">
import type { Component } from 'vue'
import { toast } from 'vue-sonner'
import {
  PhArrowRight,
  PhBuildings,
  PhCheck,
  PhCircleNotch,
  PhClock,
  PhLink,
  PhMapPin,
  PhPhone,
  PhShieldCheck,
  PhVideoCamera,
} from '@phosphor-icons/vue'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useBookings } from '~/composables/useBookings'
import type { LawyerProfile } from '~/types/lawyer'

const props = defineProps<{
  initialLawyerId?: string
  lawyerInfo?: LawyerProfile | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const viewport = useViewport()
const isDesktop = computed(() => {
  if (import.meta.server) return true
  return viewport.isGreaterOrEquals('md')
})

const router = useRouter()
const { useCreateBooking } = useBookings()
const { mutate: createBooking, isPending } = useCreateBooking()

const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { number: 1, title: 'Consultation' },
  { number: 2, title: 'Date & time' },
  { number: 3, title: 'Meeting' },
  { number: 4, title: 'Review' },
]

const todayStr = new Date().toISOString().split('T')[0]

const consultationTypes = computed(() => {
  if (!props.lawyerInfo?.consultationTypes) return []
  return props.lawyerInfo.consultationTypes
    .filter(ct => ct.isActive)
    .map(ct => ({
      id: ct.id,
      name: ct.name,
      description: ct.description,
      durationMinutes: ct.durationMinutes,
      price: ct.price,
      currency: ct.currency,
      meetingType: ct.meetingType,
    }))
})

const state = reactive({
  consultationTypeId: '',
  scheduledDate: '',
  scheduledStartTime: '',
  meetingType: 'video' as 'video' | 'phone' | 'in_person',
  meetingUrl: '',
  meetingLocation: '',
  meetingPhone: '',
  timezone: 'Africa/Lagos',
  clientNotes: '',
})

const selectedConsultationType = computed(() => {
  if (!state.consultationTypeId) return null
  return consultationTypes.value.find(ct => ct.id === state.consultationTypeId)
})

watch(() => state.consultationTypeId, (newTypeId) => {
  const consultType = consultationTypes.value.find(ct => ct.id === newTypeId)
  if (consultType && consultType.meetingType !== 'any') {
    state.meetingType = consultType.meetingType
  }
})

type MeetingOption = { value: 'video' | 'phone' | 'in_person', label: string, icon: Component }

const meetingTypeOptions = computed<MeetingOption[]>(() => {
  const all: MeetingOption[] = [
    { value: 'video', label: 'Video call', icon: PhVideoCamera },
    { value: 'phone', label: 'Phone call', icon: PhPhone },
    { value: 'in_person', label: 'In person', icon: PhBuildings },
  ]
  const meetingType = selectedConsultationType.value?.meetingType
  if (!meetingType || meetingType === 'any') return all
  return all.filter(option => option.value === meetingType)
})

const meetingLocked = computed(() =>
  !!selectedConsultationType.value && selectedConsultationType.value.meetingType !== 'any')

function formatPrice(price: string | undefined): string {
  if (!price) return 'Free'
  return parseFloat(price) === 0 ? 'Free' : `₦${parseFloat(price).toLocaleString()}`
}

const canProceedToStep2 = computed(() => !!state.consultationTypeId)
const canProceedToStep3 = computed(() => !!state.scheduledDate && !!state.scheduledStartTime)
const canProceedToStep4 = computed(() => {
  if (state.meetingType === 'in_person') return !!state.meetingLocation
  if (state.meetingType === 'phone') return !!state.meetingPhone
  return true
})

const canContinue = computed(() => {
  if (currentStep.value === 1) return canProceedToStep2.value
  if (currentStep.value === 2) return canProceedToStep3.value
  if (currentStep.value === 3) return canProceedToStep4.value
  return true
})

function goToStep(step: number) {
  if (step === 1) {
    currentStep.value = 1
  }
  else if (step === 2 && canProceedToStep2.value) {
    currentStep.value = 2
  }
  else if (step === 3 && canProceedToStep2.value && canProceedToStep3.value) {
    currentStep.value = 3
  }
  else if (step === 4 && canProceedToStep2.value && canProceedToStep3.value && canProceedToStep4.value) {
    currentStep.value = 4
  }
}

function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function submitBooking() {
  if (!props.initialLawyerId) {
    toast.error('Error', { description: 'Lawyer information is missing' })
    return
  }

  if (!props.lawyerInfo) {
    toast.error('Error', { description: 'Lawyer information is missing' })
    return
  }

  const bookingData = {
    ...state,
    lawyerId: props.initialLawyerId,
  }

  createBooking(bookingData as any, {
    onSuccess: () => {
      toast.success('Success', { description: 'Booking created successfully' })
      isOpen.value = false
      router.push('/dashboard/bookings')
    },
    onError: (error) => {
      toast.error('Error', { description: error.message || 'Failed to create booking' })
    },
  })
}

function close() {
  isOpen.value = false
  currentStep.value = 1
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      :side="isDesktop ? 'right' : 'bottom'"
      class="gap-0 p-0"
      :class="isDesktop
        ? 'w-full sm:max-w-xl'
        : 'h-auto max-h-[92dvh] rounded-t-2xl'"
    >
      <!-- Header -->
      <div class="shrink-0 border-b border-border px-6 pb-5 pt-6 md:px-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Step {{ currentStep }} of {{ totalSteps }}
        </p>
        <h2 class="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Book a consultation
        </h2>

        <!-- Step rail -->
        <ol class="mt-5 flex items-center gap-2">
          <li
            v-for="(step, index) in steps"
            :key="step.number"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <button
              type="button"
              class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors"
              :class="currentStep === step.number
                ? 'bg-primary text-primary-foreground ring-4 ring-primary/15'
                : currentStep > step.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground'"
              :aria-current="currentStep === step.number ? 'step' : undefined"
              @click="goToStep(step.number)"
            >
              <PhCheck v-if="currentStep > step.number" class="size-3.5" weight="bold" />
              <span v-else>{{ step.number }}</span>
            </button>
            <span
              class="ml-2 hidden text-xs font-medium md:block"
              :class="currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ step.title }}
            </span>
            <span
              v-if="index < steps.length - 1"
              class="mx-2 h-px flex-1 transition-colors md:mx-3"
              :class="currentStep > step.number ? 'bg-primary' : 'bg-border'"
            />
          </li>
        </ol>
      </div>

      <!-- Content -->
      <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
        <!-- Step 1: Consultation type -->
        <div v-if="currentStep === 1" class="space-y-5">
          <div>
            <h3 class="text-lg font-semibold tracking-tight text-foreground">
              Choose a consultation type
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Select the type of legal consultation you need.
            </p>
          </div>

          <div v-if="consultationTypes.length" class="space-y-3">
            <button
              v-for="type in consultationTypes"
              :key="type.id"
              type="button"
              class="w-full rounded-2xl border bg-card p-4 text-left transition-colors"
              :class="state.consultationTypeId === type.id
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-border hover:border-foreground/20'"
              @click="state.consultationTypeId = type.id"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <h4 class="font-semibold tracking-tight text-foreground">
                    {{ type.name }}
                  </h4>
                  <p v-if="type.description" class="mt-1 text-sm text-muted-foreground">
                    {{ type.description }}
                  </p>
                  <div class="mt-2 flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                    <span class="inline-flex items-center gap-1">
                      <PhClock class="size-3.5" />
                      {{ type.durationMinutes }} min
                    </span>
                    <span class="inline-flex items-center gap-1 capitalize">
                      <PhVideoCamera v-if="type.meetingType === 'video'" class="size-3.5" />
                      <PhPhone v-else-if="type.meetingType === 'phone'" class="size-3.5" />
                      <PhBuildings v-else-if="type.meetingType === 'in_person'" class="size-3.5" />
                      <PhCheck v-else class="size-3.5" />
                      {{ type.meetingType === 'any' ? 'Any type' : type.meetingType.replace('_', ' ') }}
                    </span>
                  </div>
                </div>
                <div class="shrink-0 text-right text-lg font-semibold tabular-nums text-foreground">
                  {{ formatPrice(type.price) }}
                </div>
              </div>
            </button>
          </div>
          <div
            v-else
            class="rounded-2xl border border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground"
          >
            This lawyer has no consultation types available right now.
          </div>
        </div>

        <!-- Step 2: Date & time -->
        <div v-else-if="currentStep === 2" class="space-y-5">
          <div>
            <h3 class="text-lg font-semibold tracking-tight text-foreground">
              Pick a date & time
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Choose your preferred consultation schedule.
            </p>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <Label for="booking-date">Date</Label>
              <Input
                id="booking-date"
                v-model="state.scheduledDate"
                type="date"
                :min="todayStr"
                class="h-11"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="booking-time">Start time</Label>
              <Input
                id="booking-time"
                v-model="state.scheduledStartTime"
                type="time"
                class="h-11"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="booking-tz">Timezone</Label>
              <NativeSelect id="booking-tz" v-model="state.timezone" class="h-11 w-full">
                <NativeSelectOption value="Africa/Lagos">West Africa Time (Lagos)</NativeSelectOption>
                <NativeSelectOption value="Europe/Paris">Central European Time (Paris)</NativeSelectOption>
                <NativeSelectOption value="America/New_York">Eastern Time (New York)</NativeSelectOption>
                <NativeSelectOption value="UTC">UTC</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </div>

        <!-- Step 3: Meeting details -->
        <div v-else-if="currentStep === 3" class="space-y-5">
          <div>
            <h3 class="text-lg font-semibold tracking-tight text-foreground">
              Meeting preferences
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ meetingLocked ? 'This consultation has a fixed meeting type.' : 'How would you like to meet?' }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              v-for="option in meetingTypeOptions"
              :key="option.value"
              type="button"
              :disabled="meetingLocked"
              class="flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-colors disabled:cursor-not-allowed"
              :class="state.meetingType === option.value
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                : 'border-border hover:border-foreground/20'"
              @click="state.meetingType = option.value"
            >
              <component
                :is="option.icon"
                class="size-6"
                :class="state.meetingType === option.value ? 'text-primary' : 'text-muted-foreground'"
              />
              <span
                class="text-sm font-medium"
                :class="state.meetingType === option.value ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ option.label }}
              </span>
            </button>
          </div>

          <div v-if="state.meetingType === 'video'" class="space-y-1.5">
            <Label for="booking-url">Video call link</Label>
            <div class="relative">
              <PhLink class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="booking-url"
                v-model="state.meetingUrl"
                class="h-11 pl-10"
                placeholder="Leave blank for an auto-generated link"
              />
            </div>
            <p class="text-xs text-muted-foreground">Optional — we’ll generate one if left blank.</p>
          </div>

          <div v-if="state.meetingType === 'in_person'" class="space-y-1.5">
            <Label for="booking-location">Meeting location</Label>
            <div class="relative">
              <PhMapPin class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="booking-location"
                v-model="state.meetingLocation"
                class="h-11 pl-10"
                placeholder="Enter the meeting address"
              />
            </div>
          </div>

          <div v-if="state.meetingType === 'phone'" class="space-y-1.5">
            <Label for="booking-phone">Phone number</Label>
            <div class="relative">
              <PhPhone class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="booking-phone"
                v-model="state.meetingPhone"
                class="h-11 pl-10"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label for="booking-notes">Notes for the lawyer</Label>
            <Textarea
              id="booking-notes"
              v-model="state.clientNotes"
              :rows="4"
              placeholder="Provide any details relevant to your case…"
            />
            <p class="text-xs text-muted-foreground">Optional — share context about your legal matter.</p>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-else-if="currentStep === 4" class="space-y-5">
          <div>
            <h3 class="text-lg font-semibold tracking-tight text-foreground">
              Review your booking
            </h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Please confirm all details are correct.
            </p>
          </div>

          <div v-if="lawyerInfo" class="flex items-center gap-3 rounded-2xl border border-border bg-muted p-4">
            <div class="size-12 shrink-0 overflow-hidden rounded-xl bg-primary/10">
              <img
                v-if="lawyerInfo.image"
                :src="lawyerInfo.image"
                class="size-full object-cover"
                :alt="lawyerInfo.name"
              >
              <div v-else class="flex size-full items-center justify-center text-lg font-semibold text-primary">
                {{ lawyerInfo.name.charAt(0) }}
              </div>
            </div>
            <div class="min-w-0">
              <h4 class="font-semibold tracking-tight text-foreground">
                {{ lawyerInfo.name }}
              </h4>
              <p v-if="lawyerInfo.specializations?.length" class="text-sm text-muted-foreground">
                {{ lawyerInfo.specializations[0].name }}
              </p>
            </div>
          </div>

          <dl class="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div class="flex items-start justify-between gap-4 p-4">
              <div class="min-w-0">
                <dt class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Consultation</dt>
                <dd class="mt-1 font-medium text-foreground">{{ selectedConsultationType?.name }}</dd>
              </div>
              <Button variant="link" size="sm" class="h-auto p-0" @click="goToStep(1)">Edit</Button>
            </div>
            <div class="flex items-start justify-between gap-4 p-4">
              <div class="min-w-0">
                <dt class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date & time</dt>
                <dd class="mt-1 font-medium tabular-nums text-foreground">
                  {{ state.scheduledDate }} at {{ state.scheduledStartTime }}
                </dd>
                <dd class="text-sm text-muted-foreground">{{ state.timezone }}</dd>
              </div>
              <Button variant="link" size="sm" class="h-auto p-0" @click="goToStep(2)">Edit</Button>
            </div>
            <div class="flex items-start justify-between gap-4 p-4">
              <div class="min-w-0">
                <dt class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Meeting</dt>
                <dd class="mt-1 font-medium capitalize text-foreground">
                  {{ state.meetingType.replace('_', ' ') }}
                </dd>
                <dd v-if="state.meetingUrl" class="truncate text-sm text-muted-foreground">{{ state.meetingUrl }}</dd>
                <dd v-if="state.meetingLocation" class="text-sm text-muted-foreground">{{ state.meetingLocation }}</dd>
                <dd v-if="state.meetingPhone" class="text-sm text-muted-foreground">{{ state.meetingPhone }}</dd>
              </div>
              <Button variant="link" size="sm" class="h-auto p-0" @click="goToStep(3)">Edit</Button>
            </div>
            <div v-if="state.clientNotes" class="p-4">
              <dt class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</dt>
              <dd class="mt-1 whitespace-pre-line text-sm text-muted-foreground">{{ state.clientNotes }}</dd>
            </div>
          </dl>

          <div class="flex items-center justify-between rounded-2xl bg-foreground px-5 py-4 text-background">
            <span class="text-sm font-medium">Total</span>
            <span class="text-2xl font-semibold tabular-nums">
              {{ formatPrice(selectedConsultationType?.price) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-6 py-4 md:px-8">
        <div class="flex gap-3">
          <Button
            v-if="currentStep > 1"
            variant="outline"
            size="lg"
            class="flex-1"
            @click="prevStep"
          >
            Back
          </Button>
          <Button
            v-else
            variant="outline"
            size="lg"
            class="flex-1"
            @click="close"
          >
            Cancel
          </Button>

          <Button
            v-if="currentStep < totalSteps"
            size="lg"
            class="flex-1"
            :disabled="!canContinue"
            @click="nextStep"
          >
            Continue
            <PhArrowRight class="size-4" />
          </Button>
          <Button
            v-else
            size="lg"
            class="flex-1"
            :disabled="isPending"
            @click="submitBooking"
          >
            <PhCircleNotch v-if="isPending" class="size-4 animate-spin" />
            <PhShieldCheck v-else class="size-4" weight="fill" />
            Confirm booking
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
