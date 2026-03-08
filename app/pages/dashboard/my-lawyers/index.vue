<template>
  <div class="p-6">
    <UPageHeader 
      title="My Lawyers"
      description="Lawyers you've worked with or bookmarked."
      :ui="{
        root: 'border-none py-0 mb-8',
        title: 'font-semibold !text-3xl',
        description: 'text-sm text-gray-600 mt-2'
      }"
    />

    <UCard>
      <div class="text-center py-12 text-gray-500">
        <p>You haven't connected with any lawyers yet.</p>
        <UButton 
          to="/dashboard/listings" 
          color="primary" 
          class="mt-4 bg-[#007AFC] hover:bg-blue-600"
        >
          Browse Lawyers
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
