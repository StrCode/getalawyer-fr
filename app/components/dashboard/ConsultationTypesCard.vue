<script setup lang="ts">
const { useConsultationTypesList } = useConsultationTypes();
const { data: consultationTypes, isPending } = useConsultationTypesList(false);

const activeTypes = computed(() => {
  if (!consultationTypes.value) return 0;
  return consultationTypes.value.filter(t => t.isActive).length;
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Icon name="i-hugeicons-notebook" class="h-5 w-5 text-primary-500" />
          <h3 class="font-semibold">Consultation Types</h3>
        </div>
        <UButton
          to="/dashboard/consultation-types"
          variant="ghost"
          size="xs"
          trailing-icon="i-hugeicons-arrow-right-01"
        >
          View All
        </UButton>
      </div>
    </template>
    
    <div v-if="isPending" class="text-center py-2">
      <Icon name="i-hugeicons-loading-03" class="w-6 h-6 text-primary animate-spin mx-auto" />
    </div>
    <div v-else>
      <div class="text-3xl font-bold">{{ activeTypes }}</div>
      <p class="text-sm text-gray-600 mt-1">
        {{ activeTypes === 0 ? 'No active services' : `${activeTypes} active service${activeTypes > 1 ? 's' : ''}` }}
      </p>
      <div v-if="consultationTypes && consultationTypes.length > 0" class="mt-4 space-y-2">
        <div
          v-for="type in consultationTypes.slice(0, 3)"
          :key="type.id"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-700">{{ type.name }}</span>
          <UBadge :color="type.isActive ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ type.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>
