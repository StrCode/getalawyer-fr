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
    day: 'numeric',
    year: 'numeric'
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

const handleConfirm = (bookingId: string) => {
  // TODO: Implement confirm booking
  console.log('Confirm booking:', bookingId)
}

const handleDecline = (bookingId: string) => {
  // TODO: Implement decline booking
  console.log('Decline booking:', bookingId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="mb-1 font-bold text-neutral-900 text-2xl tracking-tight">
          Welcome back, {{ session?.user.name?.split(' ')[0] || 'there' }}!
        </h1>
        <p class="text-neutral-600 text-sm">Manage your consultations and grow your practice</p>
      </div>
      <UButton 
        to="/dashboard/profile" 
        color="neutral"
        variant="outline"
        size="md"
        icon="i-heroicons-user-circle"
        class="shadow-sm"
      >
        View Profile
      </UButton>
    </div>

    <!-- Stats Grid -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <!-- Active Bookings -->
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #f0fdf4;">
          <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" style="color: #16a34a;" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ isLoadingBookings ? '...' : stats.active }}</div>
          <div class="stat-label">Active Bookings</div>
          <div class="stat-subtitle">{{ stats.active === 0 ? 'No active bookings' : 'In progress' }}</div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #fef3c7;">
          <UIcon name="i-heroicons-clock" class="w-5 h-5" style="color: #f59e0b;" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ isLoadingBookings ? '...' : stats.pending }}</div>
          <div class="stat-label">Pending Requests</div>
          <div class="stat-subtitle">{{ stats.pending === 0 ? 'No pending requests' : 'Awaiting response' }}</div>
        </div>
      </div>

      <!-- Completed -->
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #f0fdf4;">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5" style="color: #10b981;" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ isLoadingBookings ? '...' : stats.completed }}</div>
          <div class="stat-label">Completed</div>
          <div class="stat-subtitle">This month</div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #eff6ff;">
          <UIcon name="i-heroicons-banknotes" class="w-5 h-5" style="color: #3b82f6;" />
        </div>
        <div class="stat-content">
          <div class="stat-value">₦0</div>
          <div class="stat-label">Revenue</div>
          <div class="stat-subtitle">This month</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoadingBookings && bookings && bookings.length === 0" class="empty-state">
      <div class="empty-icon">
        <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 text-neutral-400" />
      </div>
      
      <h3 class="empty-title">No consultations yet</h3>
      <p class="empty-description">
        Your consultation requests will appear here.<br>
        Make sure your profile is complete and your availability is set to start receiving bookings.
      </p>

      <div class="empty-actions">
        <UButton 
          to="/dashboard/profile" 
          color="primary" 
          size="md" 
          icon="i-heroicons-user-circle"
          class="shadow-sm"
        >
          Complete Profile
        </UButton>
        <UButton 
          to="/dashboard/availability" 
          color="neutral"
          variant="outline"
          size="md" 
          icon="i-heroicons-clock"
        >
          Set Availability
        </UButton>
      </div>
    </div>

    <!-- Recent Bookings -->
    <div v-else-if="recentBookings.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="font-bold text-neutral-900 text-xl">Recent Consultations</h2>
        <UButton 
          to="/dashboard/appointments" 
          color="neutral"
          variant="ghost" 
          trailing-icon="i-heroicons-arrow-right"
          size="sm"
        >
          View All
        </UButton>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="booking in recentBookings" 
          :key="booking.id"
          class="booking-card"
          @click="navigateTo(`/dashboard/appointments/${booking.id}`)"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <UBadge :color="getStatusColor(booking.status)" variant="soft" size="sm">
                  {{ booking.status }}
                </UBadge>
                <span class="text-neutral-500 text-xs">{{ booking.bookingReference }}</span>
              </div>
              
              <h3 class="mb-1 font-semibold text-neutral-900 text-base">{{ booking.client?.name || 'Client' }}</h3>
              <p class="mb-3 text-neutral-600 text-sm">{{ booking.consultationType?.name || 'Consultation' }}</p>
              
              <div class="flex flex-wrap items-center gap-3 text-neutral-600 text-xs">
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                  <span>{{ formatDate(booking.scheduledDate) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                  <span>{{ booking.scheduledStartTime }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-3.5 h-3.5" />
                  <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
                </div>
              </div>

              <div v-if="booking.clientNotes" class="bg-neutral-50 mt-3 p-3 rounded-lg">
                <p class="text-neutral-700 text-xs">
                  <span class="font-medium">Client Notes:</span> {{ booking.clientNotes }}
                </p>
              </div>
            </div>
            
            <div v-if="booking.status === 'pending'" class="flex flex-col gap-2 shrink-0">
              <UButton 
                color="primary" 
                size="sm"
                @click.stop="handleConfirm(booking.id)"
              >
                Confirm
              </UButton>
              <UButton 
                color="neutral"
                variant="ghost" 
                size="sm"
                @click.stop="handleDecline(booking.id)"
              >
                Decline
              </UButton>
            </div>
            <UIcon v-else name="i-heroicons-chevron-right" class="w-5 h-5 text-neutral-300 shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Consultation Types & Availability -->
    <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
      <!-- Consultation Types -->
      <div class="info-card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold text-neutral-900 text-lg">Consultation Types</h2>
          <UButton 
            to="/dashboard/consultation-types" 
            color="neutral"
            variant="ghost" 
            size="sm" 
            trailing-icon="i-heroicons-arrow-right"
          >
            Manage
          </UButton>
        </div>
        <DashboardConsultationTypesCard />
      </div>

      <!-- Availability -->
      <div class="info-card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold text-neutral-900 text-lg">Availability</h2>
          <UButton 
            to="/dashboard/availability" 
            color="neutral"
            variant="ghost" 
            size="sm" 
            trailing-icon="i-heroicons-arrow-right"
          >
            Update
          </UButton>
        </div>
        <DashboardAvailabilityCard />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2 class="mb-4 font-bold text-neutral-900 text-lg">Quick Actions</h2>
      <div class="gap-3 grid grid-cols-2 md:grid-cols-4">
        <button 
          class="quick-action"
          @click="navigateTo('/dashboard/appointments')"
        >
          <div class="quick-action-icon" style="background-color: #f0fdf4;">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" style="color: #16a34a;" />
          </div>
          <div class="quick-action-content">
            <div class="quick-action-title">Appointments</div>
            <div class="quick-action-desc">Manage bookings</div>
          </div>
        </button>
        
        <button 
          class="quick-action"
          @click="navigateTo('/dashboard/consultation-types')"
        >
          <div class="quick-action-icon" style="background-color: #eff6ff;">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5" style="color: #3b82f6;" />
          </div>
          <div class="quick-action-content">
            <div class="quick-action-title">Consultation Types</div>
            <div class="quick-action-desc">Edit services</div>
          </div>
        </button>
        
        <button 
          class="quick-action"
          @click="navigateTo('/dashboard/availability')"
        >
          <div class="quick-action-icon" style="background-color: #f5f3ff;">
            <UIcon name="i-heroicons-clock" class="w-5 h-5" style="color: #8b5cf6;" />
          </div>
          <div class="quick-action-content">
            <div class="quick-action-title">Availability</div>
            <div class="quick-action-desc">Set schedule</div>
          </div>
        </button>
        
        <button 
          class="quick-action"
          @click="navigateTo('/dashboard/profile')"
        >
          <div class="quick-action-icon" style="background-color: #fef3c7;">
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5" style="color: #f59e0b;" />
          </div>
          <div class="quick-action-content">
            <div class="quick-action-title">Profile</div>
            <div class="quick-action-desc">Edit details</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stat Cards */
.stat-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #d4d4d4;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #171717;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #737373;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 11px;
  color: #a3a3a3;
}

/* Empty State */
.empty-state {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #171717;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #737373;
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto 24px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Booking Cards */
.booking-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.booking-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #16a34a;
}

/* Info Cards */
.info-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 24px;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 24px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.quick-action:hover {
  border-color: #16a34a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.quick-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action-content {
  flex: 1;
  min-width: 0;
}

.quick-action-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 2px;
}

.quick-action-desc {
  font-size: 12px;
  color: #737373;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .empty-state {
    padding: 32px 20px;
  }
  
  .booking-card {
    padding: 16px;
  }
  
  .info-card {
    padding: 20px;
  }
  
  .quick-actions {
    padding: 20px;
  }
}
</style>
