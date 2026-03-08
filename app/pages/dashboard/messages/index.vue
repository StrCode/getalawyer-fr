<template>
  <div class="p-6">
    <UPageHeader 
      title="Messages"
      description="Communicate with your lawyers."
      :ui="{
        root: 'border-none py-0 mb-8',
        title: 'font-semibold !text-3xl',
        description: 'text-sm text-gray-600 mt-2'
      }"
    />

    <UCard>
      <div class="text-center py-12 text-gray-500">
        <p>No messages yet. Start a conversation with your lawyer after booking a consultation.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
