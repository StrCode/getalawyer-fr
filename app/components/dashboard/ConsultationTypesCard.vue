<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg text-gray-900">Consultation Types</h3>
        <UButton
          icon="i-hugeicons-add-01"
          size="sm"
          color="primary"
          class="bg-[#007AFC]"
          to="/dashboard/consultation-types"
        >
          Add New
        </UButton>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-hugeicons-loading-03" class="w-6 h-6 animate-spin text-gray-400" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="text-center py-8 text-red-500">
      <UIcon name="i-hugeicons-alert-circle" class="w-8 h-8 mx-auto mb-2" />
      <p class="text-sm">Failed to load consultation types</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!consultationTypes || consultationTypes.length === 0" class="text-center py-8">
      <UIcon name="i-hugeicons-notebook" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <h4 class="font-semibold text-gray-900 mb-2">No consultation types yet</h4>
      <p class="text-sm text-gray-600 mb-4">Create your first consultation type to start accepting bookings</p>
      <UButton
        label="Create Consultation Type"
        color="primary"
        class="bg-[#007AFC]"
        to="/dashboard/consultation-types"
      />
    </div>

    <!-- Consultation Types List -->
    <div v-else class="space-y-3">
      <div
        v-for="type in displayedTypes"
        :key="type.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h4 class="font-medium text-gray-900">{{ type.name }}</h4>
            <UBadge
              :color="type.isActive ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ type.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
          <div class="flex items-center gap-4 mt-1 text-xs text-gray-600">
            <span class="flex items-center gap-1">
              <UIcon name="i-hugeicons-clock-01" class="w-3 h-3" />
              {{ type.durationMinutes }}min
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-hugeicons-money-01" class="w-3 h-3" />
              {{ formatPrice(type.price, type.currency) }}
            </span>
          </div>
        </div>
        <UButton
          icon="i-hugeicons-arrow-right-01"
          color="neutral"
          variant="ghost"
          size="sm"
          :to="`/dashboard/consultation-types`"
        />
      </div>

      <!-- Show More Link -->
      <div v-if="consultationTypes.length > 3" class="text-center pt-2">
        <UButton
          label="View All Consultation Types"
          color="neutral"
          variant="ghost"
          size="sm"
          to="/dashboard/consultation-types"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsultationTypes } from '~/composables/useConsultationTypes'

const { useConsultationTypesList } = useConsultationTypes()

// Fetch only active consultation types
const showInactive = ref(false)
const { data: consultationTypes, isLoading, isError } = useConsultationTypesList(showInactive)

// Show only first 3 types
const displayedTypes = computed(() => {
  return consultationTypes.value?.slice(0, 3) || []
})

const formatPrice = (price: string, currency: string) => {
  const amount = parseFloat(price)
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
</script>
