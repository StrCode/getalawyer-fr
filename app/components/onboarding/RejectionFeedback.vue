<template>
  <UCard v-if="feedback" class="mb-6 border-l-4 border-orange-500">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <UIcon name="i-hugeicons-alert-circle" class="w-6 h-6 text-orange-600" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-gray-900 mb-2">
          ⚠️ Previous Feedback from Review Team
        </h3>
        <div class="text-sm text-gray-700 whitespace-pre-wrap mb-3">
          {{ feedback }}
        </div>
        <p class="text-xs text-gray-600 italic">
          Please address the issues mentioned above before resubmitting.
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  feedback?: string | null
}>()
</script>
