<script setup lang="ts">
import { useBookings } from '~/composables/useBookings'

const { session } = useAuth()
const router = useRouter()

// Check application status and redirect if rejected
const applicationStatus = computed(() => (session.value?.user as any)?.applicationStatus)

// Redirect to rejection page if application is rejected
watch(applicationStatus, (status) => {
  if (status === 'rejected') {
    router.push('/onboarding/lawyer/rejected')
  }
}, { immediate: true })

// Use bookings composable
const { useLawyerBookings } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useLawyerBookings()

// Computed stats
const stats = computed(() => {
  if (!bookings.value) return {
    active: 0,
    pending: 0,
    completed: 0,
    revenue: 0
  }
  
  return {
    active: bookings.value.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    completed: bookings.value.filter(b => b.status === 'completed').length,
    revenue: 0 // TODO: Calculate from completed bookings
  }
})

const recentBookings = computed(() => {
  if (!bookings.value) return []
  return bookings.value.slice(0, 3)
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
    no_show: 'error'
  }
  return colors[status] || 'neutral'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  })
}

const getMeetingIcon = (type: string) => {
  const icons: Record<string, string> = {
    video: 'i-heroicons-video-camera',
    phone: 'i-heroicons-phone',
    in_person: 'i-heroicons-building-office'
  }
  return icons[type] || 'i-heroicons-calendar'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="mb-2 heading-2">Welcome back, {{ session?.user.name?.split(' ')[0] || 'there' }}!</h1>
        <p class="text-neutral-600 body-base">Manage your consultations and grow your practice</p>
      </div>
      <UButton 
        to="/dashboard/profile" 
        variant="outline" 
        size="lg"
        icon="i-heroicons-user-circle"
      >
        View Profile
      </UButton>
    </div>

    <!-- Stats Grid -->
    <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        label="Active Bookings"
        :value="isLoadingBookings ? '...' : stats.active.toString()"
        icon="i-heroicons-calendar-days"
        color="#1d6b44"
        :subtitle="stats.active === 0 ? 'No active bookings' : 'In progress'"
      />
      <DashboardStatCard
        label="Pending Requests"
        :value="isLoadingBookings ? '...' : stats.pending.toString()"
        icon="i-heroicons-clock"
        color="#f59e0b"
        :subtitle="stats.pending === 0 ? 'No pending requests' : 'Awaiting response'"
      />
      <DashboardStatCard
        label="Completed"
        :value="isLoadingBookings ? '...' : stats.completed.toString()"
        icon="i-heroicons-check-circle"
        color="#10b981"
        :subtitle="'This month'"
      />
      <DashboardStatCard
        label="Revenue"
        :value="'₦0'"
        icon="i-heroicons-banknotes"
        color="#3b82f6"
        :subtitle="'This month'"
      />
    </div>

    <!-- Empty State or Recent Bookings -->
    <div v-if="!isLoadingBookings && bookings && bookings.length === 0">
      <DashboardEmptyState
        icon="i-heroicons-calendar-days"
        title="No consultations yet"
        description="Your consultation requests will appear here. Make sure your profile is complete and your availability is set to start receiving bookings."
        color="#1d6b44"
      >
        <template #actions>
          <UButton to="/dashboard/profile" color="primary" size="lg" icon="i-heroicons-user-circle">
            Complete Profile
          </UButton>
          <UButton to="/dashboard/availability" variant="outline" size="lg" icon="i-heroicons-clock">
            Set Availability
          </UButton>
        </template>
      </DashboardEmptyState>
    </div>

    <!-- Recent Bookings -->
    <div v-else-if="recentBookings.length > 0" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="heading-3">Recent Consultations</h2>
        <UButton to="/dashboard/appointments" variant="ghost" trailing-icon="i-heroicons-arrow-right">
          View All
        </UButton>
      </div>
      
      <div class="gap-4 grid grid-cols-1">
        <div 
          v-for="booking in recentBookings" 
          :key="booking.id"
          class="hover:shadow-lg p-6 transition-all card"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <UBadge :color="getStatusColor(booking.status)" variant="soft">
                  {{ booking.status }}
                </UBadge>
                <span class="text-neutral-500 text-sm">{{ booking.bookingReference }}</span>
              </div>
              
              <h3 class="mb-2 heading-4">{{ booking.client?.name || 'Client' }}</h3>
              <p class="mb-4 body-small">{{ booking.consultationType?.name || 'Consultation' }}</p>
              
              <div class="flex flex-wrap items-center gap-4 text-neutral-600 text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                  <span>{{ formatDate(booking.scheduledDate) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                  <span>{{ booking.scheduledStartTime }} - {{ booking.scheduledEndTime }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-4 h-4" />
                  <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
                </div>
              </div>
              
              <div v-if="booking.clientNotes" class="bg-neutral-50 mt-4 p-3 rounded-lg">
                <p class="text-neutral-700 text-sm">
                  <span class="font-medium">Client Notes:</span> {{ booking.clientNotes }}
                </p>
              </div>
            </div>
            
            <div v-if="booking.status === 'pending'" class="flex flex-col gap-2 shrink-0">
              <UButton color="primary" size="sm">
                Confirm
              </UButton>
              <UButton variant="ghost" size="sm">
                Decline
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
      <!-- Consultation Types Card -->
      <div class="p-8 card-elevated">
        <div class="flex justify-between items-center mb-6">
          <h2 class="heading-3">Consultation Types</h2>
          <UButton to="/dashboard/consultation-types" variant="ghost" size="sm" trailing-icon="i-heroicons-arrow-right">
            Manage
          </UButton>
        </div>
        <DashboardConsultationTypesCard />
      </div>

      <!-- Availability Card -->
      <div class="p-8 card-elevated">
        <div class="flex justify-between items-center mb-6">
          <h2 class="heading-3">Availability</h2>
          <UButton to="/dashboard/availability" variant="ghost" size="sm" trailing-icon="i-heroicons-arrow-right">
            Update
          </UButton>
        </div>
        <DashboardAvailabilityCard />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="p-8 card-elevated">
      <h2 class="mb-6 heading-3">Quick Actions</h2>
      <div class="gap-4 grid grid-cols-1 md:grid-cols-4">
        <button 
          class="flex flex-col items-center gap-3 hover:bg-primary-50 p-6 border border-neutral-200 hover:border-primary-500 rounded-lg transition-all"
          @click="navigateTo('/dashboard/appointments')"
        >
          <div class="flex justify-center items-center bg-primary-100 rounded-lg w-12 h-12">
            <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-primary-600" />
          </div>
          <div class="text-center">
            <div class="font-semibold text-neutral-900 text-sm">Appointments</div>
          </div>
        </button>
        
        <button 
          class="flex flex-col items-center gap-3 hover:bg-primary-50 p-6 border border-neutral-200 hover:border-primary-500 rounded-lg transition-all"
          @click="navigateTo('/dashboard/consultation-types')"
        >
          <div class="flex justify-center items-center bg-blue-100 rounded-lg w-12 h-12">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="text-center">
            <div class="font-semibold text-neutral-900 text-sm">Consultation Types</div>
          </div>
        </button>
        
        <button 
          class="flex flex-col items-center gap-3 hover:bg-primary-50 p-6 border border-neutral-200 hover:border-primary-500 rounded-lg transition-all"
          @click="navigateTo('/dashboard/availability')"
        >
          <div class="flex justify-center items-center bg-purple-100 rounded-lg w-12 h-12">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="text-center">
            <div class="font-semibold text-neutral-900 text-sm">Availability</div>
          </div>
        </button>
        
        <button 
          class="flex flex-col items-center gap-3 hover:bg-primary-50 p-6 border border-neutral-200 hover:border-primary-500 rounded-lg transition-all"
          @click="navigateTo('/dashboard/profile')"
        >
          <div class="flex justify-center items-center bg-green-100 rounded-lg w-12 h-12">
            <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-green-600" />
          </div>
          <div class="text-center">
            <div class="font-semibold text-neutral-900 text-sm">Profile</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
