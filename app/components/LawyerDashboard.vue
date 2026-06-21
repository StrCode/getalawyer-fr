<script setup lang="ts">
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardSectionHeader from '@/components/dashboard/DashboardSectionHeader.vue'
import DashboardConsultationTypesCard from '@/components/dashboard/ConsultationTypesCard.vue'
import DashboardAvailabilityCard from '@/components/dashboard/AvailabilityCard.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
import {
  PhCalendarDots,
  PhCheckCircle,
  PhCircleNotch,
  PhClock,
  PhCurrencyEur,
  PhFileText,
  PhUserCircle,
} from '@phosphor-icons/vue'

const { session } = useAuth()
const router = useRouter()

const applicationStatus = computed(() => (session.value?.user as { applicationStatus?: string })?.applicationStatus)

watch(applicationStatus, (status) => {
  if (status === 'rejected') {
    router.push('/onboarding/rejected')
  }
}, { immediate: true })

const { useLawyerBookings, useConfirmBooking, useCancelLawyerBooking } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useLawyerBookings()
const { getNextBooking, sortBookingsByDate } = useBookingDisplay()

const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
const { mutate: cancelBooking, isPending: isDeclining } = useCancelLawyerBooking()

const isCancelModalOpen = ref(false)
const declineReason = ref('')
const bookingToDecline = ref<string | null>(null)
const confirmingBookingId = ref<string | null>(null)

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'there')

const bookingsList = computed(() => bookings.value ?? [])
const nextBooking = computed(() => getNextBooking(bookingsList.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookingsList.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

const stats = computed(() => {
  const list = bookingsList.value
  return {
    active: list.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    pending: list.filter(b => b.status === 'pending').length,
    completed: list.filter(b => b.status === 'completed').length,
  }
})

const quickLinks: DashboardQuickLink[] = [
  {
    label: 'Appointments',
    description: 'Manage bookings',
    to: '/dashboard/appointments',
    icon: PhCalendarDots,
  },
  {
    label: 'Consultation Types',
    description: 'Edit your services',
    to: '/dashboard/consultation-types',
    icon: PhFileText,
  },
  {
    label: 'Availability',
    description: 'Set your schedule',
    to: '/dashboard/availability',
    icon: PhClock,
  },
  {
    label: 'Profile',
    description: 'Update your details',
    to: '/dashboard/profile',
    icon: PhUserCircle,
  },
]

const showFullEmpty = computed(() => !isLoadingBookings.value && bookingsList.value.length === 0)

function handleConfirm(bookingId: string) {
  confirmingBookingId.value = bookingId
  confirmBooking(bookingId, {
    onSuccess: () => {
      toast.success('Appointment confirmed. Client has been notified.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm appointment')
    },
    onSettled: () => {
      confirmingBookingId.value = null
    },
  })
}

function handleDecline(bookingId: string) {
  bookingToDecline.value = bookingId
  declineReason.value = ''
  isCancelModalOpen.value = true
}

function confirmDecline() {
  if (!bookingToDecline.value || !declineReason.value.trim())
    return

  cancelBooking(
    { id: bookingToDecline.value, data: { reason: declineReason.value.trim() } },
    {
      onSuccess: () => {
        toast.success('Appointment declined. Client has been notified.')
        isCancelModalOpen.value = false
        bookingToDecline.value = null
        declineReason.value = ''
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to decline appointment')
      },
    },
  )
}
</script>

<template>
  <div class="space-y-6">
    <DashboardEmailVerificationAlert />

    <AppPageHeader
      :title="`Welcome back, ${firstName}!`"
      description="Manage your consultations and grow your practice"
    >
      <template #actions>
        <Button as-child variant="outline" class="cursor-pointer">
          <NuxtLink to="/dashboard/profile" class="gap-2">
            <PhUserCircle class="size-4" />
            View Profile
          </NuxtLink>
        </Button>
      </template>
    </AppPageHeader>

    <template v-if="!isLoadingBookings">
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.client?.name ?? 'Client'"
        :consultation-name="nextBooking?.consultationType?.name ?? 'Consultation'"
        :detail-path="nextBooking ? `/dashboard/appointments/${nextBooking.id}` : undefined"
        empty-title="No upcoming appointments"
        empty-description="Make sure your profile is complete and your availability is set to start receiving bookings."
        empty-cta-label="Complete Profile"
        empty-cta-to="/dashboard/profile"
      />

      <EmptyState
        v-if="showFullEmpty"
        :icon="PhCalendarDots"
        title="No consultations yet"
        description="Your consultation requests will appear here. Make sure your profile is complete and your availability is set."
      >
        <template #actions>
          <Button as-child class="cursor-pointer">
            <NuxtLink to="/dashboard/profile">Complete Profile</NuxtLink>
          </Button>
          <Button as-child variant="outline" class="cursor-pointer">
            <NuxtLink to="/dashboard/availability">Set Availability</NuxtLink>
          </Button>
        </template>
      </EmptyState>

      <div
        v-else
        class="gap-6 grid grid-cols-1 xl:grid-cols-[1fr_280px]"
      >
        <div class="space-y-6">
          <div class="gap-4 grid grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Bookings"
              :value="stats.active"
              :icon="PhCalendarDots"
              :subtitle="stats.active === 0 ? 'No active bookings' : 'In progress'"
            />
            <StatCard
              label="Pending Requests"
              :value="stats.pending"
              :icon="PhClock"
              :subtitle="stats.pending === 0 ? 'No pending requests' : 'Awaiting response'"
            />
            <StatCard
              label="Completed"
              :value="stats.completed"
              :icon="PhCheckCircle"
              subtitle="This month"
            />
            <StatCard
              label="Revenue"
              value="₦0"
              :icon="PhCurrencyEur"
              subtitle="This month"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <DashboardSectionHeader title="Recent Consultations">
              <template #actions>
                <Button as-child variant="ghost" size="sm" class="cursor-pointer">
                  <NuxtLink to="/dashboard/appointments">View all</NuxtLink>
                </Button>
              </template>
            </DashboardSectionHeader>

            <DashboardBookingRow
              v-for="booking in recentBookings"
              :key="booking.id"
              :booking="booking"
              :person-name="booking.client?.name ?? 'Client'"
              :subtitle="booking.consultationType?.name"
              @click="navigateTo(`/dashboard/appointments/${booking.id}`)"
            >
              <template
                v-if="booking.status === 'pending'"
                #actions
              >
                <Button
                  size="sm"
                  class="cursor-pointer"
                  :disabled="isConfirming && confirmingBookingId === booking.id"
                  @click="handleConfirm(booking.id)"
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  class="cursor-pointer"
                  @click="handleDecline(booking.id)"
                >
                  Decline
                </Button>
              </template>
            </DashboardBookingRow>
          </section>

          <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
            <Card class="py-0 shadow-xs">
              <CardHeader class="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
                <CardTitle class="text-base">
                  Consultation Types
                </CardTitle>
                <Button as-child variant="ghost" size="sm" class="cursor-pointer">
                  <NuxtLink to="/dashboard/consultation-types">Manage</NuxtLink>
                </Button>
              </CardHeader>
              <CardContent class="p-5">
                <DashboardConsultationTypesCard />
              </CardContent>
            </Card>
            <Card class="py-0 shadow-xs">
              <CardHeader class="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
                <CardTitle class="text-base">
                  Availability
                </CardTitle>
                <Button as-child variant="ghost" size="sm" class="cursor-pointer">
                  <NuxtLink to="/dashboard/availability">Update</NuxtLink>
                </Button>
              </CardHeader>
              <CardContent class="p-5">
                <DashboardAvailabilityCard />
              </CardContent>
            </Card>
          </div>

          <DashboardQuickLinks title="Quick actions" :links="quickLinks" />
        </div>

        <DashboardAgendaRail
          :bookings="bookingsList"
          :person-label="(b) => b.client?.name ?? 'Client'"
          list-path="/dashboard/appointments"
          item-path-prefix="/dashboard/appointments"
        />
      </div>
    </template>

    <div v-else class="flex justify-center py-16">
      <PhCircleNotch class="size-8 text-muted-foreground animate-spin" />
    </div>

    <Dialog v-model:open="isCancelModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline appointment</DialogTitle>
          <DialogDescription>
            The client will be notified. Please share a brief reason.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="decline-reason">Reason</Label>
          <Textarea
            id="decline-reason"
            v-model="declineReason"
            placeholder="Let the client know why you're declining..."
            :rows="3"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            class="cursor-pointer"
            @click="isCancelModalOpen = false"
          >
            Nevermind
          </Button>
          <ButtonBusy
            variant="destructive"
            :loading="isDeclining"
            :disabled="!declineReason.trim()"
            @click="confirmDecline"
          >
            Decline appointment
          </ButtonBusy>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
