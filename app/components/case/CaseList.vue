<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-8">
      <PhCircleNotch class="w-6 h-6 animate-spin" />
    </div>

    <div v-else-if="error" class="py-8 text-red-500 text-center">
      <p>{{ error.message || 'Failed to load cases' }}</p>
      <UButton variant="outline" @click="$emit('retry')" class="mt-4">
        Try Again
      </UButton>
    </div>

    <div v-else-if="cases.length === 0" class="py-12 text-gray-500 text-center">
      <PhBriefcase class="mx-auto mb-4 w-12 h-12 text-gray-300" />
      <p class="mb-2 font-medium text-lg">No cases found</p>
      <p class="text-sm">
        {{ emptyMessage }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <CaseCard
        v-for="caseItem in cases"
        :key="caseItem.id"
        :case="caseItem"
        @click="$emit('case-click', caseItem.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhBriefcase, PhCircleNotch } from '@phosphor-icons/vue'
import type { Case } from '~/types'

interface Props {
  cases: Case[]
  loading?: boolean
  error?: Error | null
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  emptyMessage: 'Your cases will appear here once you start working with lawyers.'
})

defineEmits<{
  'case-click': [caseId: string]
  'retry': []
}>()
</script>
