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
const activeBookings = computed(() => {
  if (!bookings.value) return 0
  return bookings.value.filter(b => b.status === 'confirmed' || b.status === 'pending').length
})

const pendingBookings = computed(() => {
  if (!bookings.value) return 0
  return bookings.value.filter(b => b.status === 'pending').length
})

const completedBookings = computed(() => {
  if (!bookings.value) return 0
  return bookings.value.filter(b => b.status === 'completed').length
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Lawyer Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome back, {{ session?.user.name || session?.user.email }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <!-- Active Bookings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <Icon name="i-hugeicons-calendar-01" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Active Bookings</h3>
          </div>
        </template>
        <div v-if="isLoadingBookings" class="text-center py-2">
          <Icon name="i-hugeicons-loading-03" class="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
        <div v-else>
          <div class="text-3xl font-bold">{{ activeBookings }}</div>
          <p class="text-sm text-gray-600 mt-1">
            {{ activeBookings === 0 ? 'No active bookings' : `${activeBookings} active booking${activeBookings > 1 ? 's' : ''}` }}
          </p>
        </div>
      </UCard>

      <!-- Pending Requests -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <Icon name="i-hugeicons-time-02" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Pending Requests</h3>
          </div>
        </template>
        <div v-if="isLoadingBookings" class="text-center py-2">
          <Icon name="i-hugeicons-loading-03" class="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
        <div v-else>
          <div class="text-3xl font-bold">{{ pendingBookings }}</div>
          <p class="text-sm text-gray-600 mt-1">
            {{ pendingBookings === 0 ? 'No pending requests' : 'Awaiting response' }}
          </p>
        </div>
      </UCard>

      <!-- Completed -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <Icon name="i-hugeicons-tick-double-02" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Completed</h3>
          </div>
        </template>
        <div v-if="isLoadingBookings" class="text-center py-2">
          <Icon name="i-hugeicons-loading-03" class="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
        <div v-else>
          <div class="text-3xl font-bold">{{ completedBookings }}</div>
          <p class="text-sm text-gray-600 mt-1">This month</p>
        </div>
      </UCard>

      <!-- Revenue -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <Icon name="i-hugeicons-money-01" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Revenue</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">€0</div>
        <p class="text-sm text-gray-600 mt-1">This month</p>
      </UCard>
    </div>

    <!-- Consultation Types Card -->
    <DashboardConsultationTypesCard />

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Quick Actions</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <UButton to="/dashboard/bookings" color="primary">Manage Bookings</UButton>
        <UButton to="/dashboard/consultation-types" variant="outline">Consultation Types</UButton>
        <UButton to="/dashboard/availability" variant="outline">Set Availability</UButton>
        <UButton to="/dashboard/profile" variant="outline">Edit Profile</UButton>
      </div>
    </UCard>
  </div>
</template>
