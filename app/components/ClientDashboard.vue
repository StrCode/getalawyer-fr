<script setup lang="ts">
import { useBookings } from '~/composables/useBookings'

const { session } = useAuth()

// Use bookings composable
const { useClientBookings } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useClientBookings()

// Computed stats
const activeBookings = computed(() => {
  if (!bookings.value) return 0
  return bookings.value.filter(b => b.status === 'confirmed' || b.status === 'pending').length
})

const upcomingBookings = computed(() => {
  if (!bookings.value) return 0
  const now = new Date()
  return bookings.value.filter(b => {
    const bookingDate = new Date(b.startTime)
    return bookingDate > now && (b.status === 'confirmed' || b.status === 'pending')
  }).length
})

</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Client Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome back, {{ session?.user.name || session?.user.email }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Active Bookings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:calendar" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Active Bookings</h3>
          </div>
        </template>
        <div v-if="isLoadingBookings" class="text-center py-2">
          <Icon name="lucide:loader-circle" class="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
        <div v-else>
          <div class="text-3xl font-bold">{{ activeBookings }}</div>
          <p class="text-sm text-gray-600 mt-1">
            {{ activeBookings === 0 ? 'No active bookings' : `${activeBookings} active booking${activeBookings > 1 ? 's' : ''}` }}
          </p>
        </div>
      </UCard>

      <!-- Upcoming -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:clock" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Upcoming</h3>
          </div>
        </template>
        <div v-if="isLoadingBookings" class="text-center py-2">
          <Icon name="lucide:loader-circle" class="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
        <div v-else>
          <div class="text-3xl font-bold">{{ upcomingBookings }}</div>
          <p class="text-sm text-gray-600 mt-1">
            {{ upcomingBookings === 0 ? 'No upcoming bookings' : 'Scheduled' }}
          </p>
        </div>
      </UCard>

      <!-- Documents -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:document-text" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Documents</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No documents</p>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Quick Actions</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <UButton to="/lawyers" color="primary">Find a Lawyer</UButton>
        <UButton to="/dashboard/bookings" variant="outline">View Bookings</UButton>
        <UButton to="/dashboard/profile" variant="outline">My Profile</UButton>
      </div>
    </UCard>
  </div>
</template>
