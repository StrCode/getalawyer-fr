<template>
  <div class="p-6">
    <UPageHeader 
      title="My Cases"
      description="Track and manage your legal cases."
      :ui="{
        root: 'border-none py-0 mb-8',
        title: 'font-semibold !text-3xl',
        description: 'text-sm text-gray-600 mt-2'
      }"
    />

    <UCard>
      <div class="text-center py-12 text-gray-500">
        <p>No cases yet. Your cases will appear here once you start working with lawyers.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
