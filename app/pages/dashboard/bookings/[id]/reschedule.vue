<template>
  <div class="space-y-6">
    <div>
      <Button
        variant="ghost"
        class="mb-4 gap-2"
        as-child
      >
        <NuxtLink :to="`/dashboard/bookings/${bookingId}`">
          <PhArrowLeft class="size-5" />
          Back to booking
        </NuxtLink>
      </Button>
      <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground">
        Reschedule booking
      </h1>
      <p class="mt-1 text-base text-muted-foreground">
        Select a new date and time for your consultation
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <PhCircleNotch class="size-8 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="isError || !booking"
      class="py-12 text-center"
    >
      <PhWarningCircle class="mx-auto mb-4 size-12 text-destructive" />
      <p class="text-destructive">
        Failed to load booking details
      </p>
    </div>

    <div
      v-else-if="!canReschedule"
      class="py-12 text-center"
    >
      <PhCalendarX class="mx-auto mb-4 size-12 text-muted-foreground" />
      <p class="text-muted-foreground">
        This booking cannot be rescheduled
      </p>
      <Button
        class="mt-4"
        as-child
      >
        <NuxtLink :to="`/dashboard/bookings/${bookingId}`">
          Back to booking
        </NuxtLink>
      </Button>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-8 lg:grid-cols-3"
    >
      <div class="lg:col-span-2">
        <Card class="rounded-xl">
          <CardContent class="pt-6">
            <BookingCalendar
              :lawyer-id="booking.lawyerId"
              :consultation-type-id="booking.consultationTypeId"
              :timezone="booking.timezone"
              @select="handleSlotSelect"
            />
          </CardContent>
          <CardFooter class="flex justify-end gap-3 border-t">
            <Button
              variant="ghost"
              as-child
            >
              <NuxtLink :to="`/dashboard/bookings/${bookingId}`">
                Cancel
              </NuxtLink>
            </Button>
            <ButtonBusy
              :disabled="!selectedSlot"
              :loading="isRescheduling"
              @click="handleReschedule"
            >
              Confirm reschedule
            </ButtonBusy>
          </CardFooter>
        </Card>
      </div>

      <div class="space-y-6">
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="text-base">
              Current booking
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div>
              <p class="text-muted-foreground">
                Lawyer
              </p>
              <p class="font-medium text-foreground">
                {{ booking.lawyer?.name }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground">
                Service
              </p>
              <p class="font-medium text-foreground">
                {{ booking.consultationType?.name }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground">
                Current date & time
              </p>
              <p class="font-medium text-foreground">
                {{ formatBookingDateLong(booking.scheduledDate) }}
              </p>
              <p class="text-muted-foreground">
                {{ booking.scheduledStartTime }} – {{ booking.scheduledEndTime }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          v-if="selectedSlot"
          class="rounded-xl border-primary/30"
        >
          <CardHeader>
            <CardTitle class="text-base text-primary">
              New date & time
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-primary">
              <PhCalendar class="size-5" />
              <p class="font-medium">
                {{ formatBookingDateLong(selectedSlot.date) }}
              </p>
            </div>
            <div class="flex items-center gap-2 text-primary">
              <PhClock class="size-5" />
              <p class="font-medium">
                {{ formatTime(selectedSlot.time) }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  PhArrowLeft,
  PhCalendar,
  PhCalendarX,
  PhCircleNotch,
  PhClock,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import BookingCalendar from '~/components/booking/BookingCalendar.vue'
import { useBookings } from '~/composables/useBookings'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { formatBookingDateLong } = useBookingDisplay()

const bookingId = ref(route.params.id as string)
const { useClientBooking, useRescheduleBooking } = useBookings()
const { data: booking, isLoading, isError } = useClientBooking(bookingId)

const canReschedule = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

const selectedSlot = ref<{ date: string, time: string } | null>(null)

const handleSlotSelect = (slot: { date: string, time: string }) => {
  selectedSlot.value = slot
}

const { mutate: rescheduleBooking, isPending: isRescheduling } = useRescheduleBooking()

const handleReschedule = () => {
  if (!selectedSlot.value) return

  rescheduleBooking(
    {
      id: bookingId.value,
      data: {
        newDate: selectedSlot.value.date,
        newStartTime: selectedSlot.value.time,
      },
    },
    {
      onSuccess: () => {
        toast.success('Success', { description: 'Booking rescheduled successfully' })
        router.push(`/dashboard/bookings/${bookingId.value}`)
      },
      onError: (error: any) => {
        const errorMessage = error.message || 'Failed to reschedule booking'
        if (error.status === 400 && errorMessage.includes('not available')) {
          toast.error('Slot unavailable', {
            description: 'This time slot is no longer available. Please select another time.',
          })
        }
        else {
          toast.error('Error', { description: errorMessage })
        }
      },
    },
  )
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

useHead({
  title: 'Reschedule Booking - GetaLawyer',
  meta: [
    { name: 'description', content: 'Reschedule your consultation booking' },
  ],
})
</script>
