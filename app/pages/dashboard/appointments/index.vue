<template>
  <div class="p-6">
    <UPageHeader 
      title="Appointments"
      description="View and manage your scheduled appointments."
      :ui="{
        root: 'border-none py-0 mb-8',
        title: 'font-semibold !text-3xl',
        description: 'text-sm text-gray-600 mt-2'
      }"
    />

    <UCard>
      <div class="text-center py-12 text-gray-500">
        <p>No appointments scheduled. Book a consultation to get started.</p>
        <UButton 
          to="/dashboard/bookings/new" 
          color="primary" 
          class="mt-4 bg-[#007AFC] hover:bg-blue-600"
        >
          Book Consultation
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
