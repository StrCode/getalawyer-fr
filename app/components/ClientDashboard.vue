<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="mb-2 heading-2">Welcome back, {{ session?.user.name?.split(' ')[0] || 'there' }}!</h1>
        <p class="text-neutral-600 body-base">Here's what's happening with your legal consultations</p>
      </div>
      <UButton 
        to="/lawyers" 
        color="primary" 
        size="lg"
        icon="i-heroicons-magnifying-glass"
      >
        Find a Lawyer
      </UButton>
    </div>

    <!-- Stats Grid -->
    <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        label="Total Bookings"
        :value="stats.totalBookings"
        icon="i-heroicons-calendar-days"
        color="#1d6b44"
        :subtitle="stats.totalBookings === '0' ? 'No bookings yet' : 'All time'"
      />
      <DashboardStatCard
        label="Active Consultations"
        :value="stats.activeCases"
        icon="i-heroicons-clock"
        color="#3b82f6"
        :subtitle="stats.activeCases === '0' ? 'No active cases' : 'In progress'"
      />
      <DashboardStatCard
        label="Upcoming"
        :value="stats.upcoming"
        icon="i-heroicons-calendar"
        color="#f59e0b"
        :subtitle="stats.upcoming === '0' ? 'No upcoming' : 'Scheduled'"
      />
      <DashboardStatCard
        label="Completed"
        :value="stats.completed"
        icon="i-heroicons-check-circle"
        color="#10b981"
        :subtitle="stats.completed === '0' ? 'None yet' : 'Finished'"
      />
    </div>

    <!-- Empty State or Bookings -->
    <div v-if="bookingsData && bookingsData.length === 0">
      <DashboardEmptyState
        icon="i-heroicons-calendar-days"
        title="No consultations yet"
        description="Start by finding a qualified lawyer for your legal needs. Browse our directory of verified legal professionals."
        color="#1d6b44"
      >
        <template #actions>
          <UButton to="/lawyers" color="primary" size="lg" icon="i-heroicons-magnifying-glass">
            Browse Lawyers
          </UButton>
          <UButton to="/practice-areas" variant="outline" size="lg" icon="i-heroicons-scale">
            View Practice Areas
          </UButton>
        </template>
      </DashboardEmptyState>
    </div>

    <!-- Recent Bookings -->
    <div v-else-if="recentBookings.length > 0" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="heading-3">Recent Consultations</h2>
        <UButton to="/dashboard/bookings" variant="ghost" trailing-icon="i-heroicons-arrow-right">
          View All
        </UButton>
      </div>
      
      <div class="gap-4 grid grid-cols-1">
        <div 
          v-for="booking in recentBookings" 
          :key="booking.id"
          class="hover:shadow-lg p-6 transition-all cursor-pointer card"
          @click="navigateTo(`/dashboard/bookings/${booking.id}`)"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <UBadge :color="getStatusColor(booking.status)" variant="soft">
                  {{ booking.status }}
                </UBadge>
                <span class="text-neutral-500 text-sm">{{ booking.bookingReference }}</span>
              </div>
              
              <h3 class="mb-2 heading-4">{{ booking.lawyer?.name || 'Lawyer' }}</h3>
              <p class="mb-4 body-small">{{ booking.consultationType?.name || 'Consultation' }}</p>
              
              <div class="flex flex-wrap items-center gap-4 text-neutral-600 text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                  <span>{{ formatDate(booking.scheduledDate) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                  <span>{{ booking.scheduledStartTime }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon :name="getMeetingIcon(booking.meetingType)" class="w-4 h-4" />
                  <span class="capitalize">{{ booking.meetingType.replace('_', ' ') }}</span>
                </div>
              </div>
            </div>
            
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="p-8 card-elevated">
      <h2 class="mb-6 heading-3">Quick Actions</h2>
      <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
        <button 
          class="flex items-center gap-4 hover:bg-primary-50 p-4 border border-neutral-200 hover:border-primary-500 rounded-lg text-left transition-all"
          @click="navigateTo('/lawyers')"
        >
          <div class="flex justify-center items-center bg-primary-100 rounded-lg w-12 h-12 shrink-0">
            <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div class="mb-1 font-semibold text-neutral-900">Find Lawyers</div>
            <div class="text-neutral-600 text-sm">Browse verified professionals</div>
          </div>
        </button>
        
        <button 
          class="flex items-center gap-4 hover:bg-primary-50 p-4 border border-neutral-200 hover:border-primary-500 rounded-lg text-left transition-all"
          @click="navigateTo('/dashboard/bookings')"
        >
          <div class="flex justify-center items-center bg-blue-100 rounded-lg w-12 h-12 shrink-0">
            <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div class="mb-1 font-semibold text-neutral-900">My Bookings</div>
            <div class="text-neutral-600 text-sm">View all consultations</div>
          </div>
        </button>
        
        <button 
          class="flex items-center gap-4 hover:bg-primary-50 p-4 border border-neutral-200 hover:border-primary-500 rounded-lg text-left transition-all"
          @click="navigateTo('/dashboard/my-lawyers')"
        >
          <div class="flex justify-center items-center bg-purple-100 rounded-lg w-12 h-12 shrink-0">
            <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div class="mb-1 font-semibold text-neutral-900">My Lawyers</div>
            <div class="text-neutral-600 text-sm">Saved professionals</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { session } = useAuth()

// Fetch bookings data
const { useClientBookings } = useBookings()
const { data: bookingsData } = useClientBookings()

const stats = computed(() => {
  const bookings = bookingsData.value || []
  return {
    totalBookings: bookings.length.toString(),
    activeCases: bookings.filter(b => b.status === 'confirmed').length.toString(),
    upcoming: bookings.filter(b => b.status === 'pending').length.toString(),
    completed: bookings.filter(b => b.status === 'completed').length.toString(),
  }
})

const recentBookings = computed(() => {
  const bookings = bookingsData.value || []
  return bookings.slice(0, 3)
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
</script>
