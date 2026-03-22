<template>
  <div v-if="loading" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
  </div>

  <div v-else-if="error" class="py-8 text-center">
    <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-4 w-12 h-12 text-red-500" />
    <h2 class="mb-2 font-semibold text-xl">Case Not Found</h2>
    <p class="mb-4 text-gray-600">{{ error }}</p>
    <UButton @click="navigateTo('/dashboard/cases')">
      Back to Cases
    </UButton>
  </div>

  <div v-else-if="currentCase" class="space-y-6">
    <!-- Case Details Component -->
    <CaseDetails
      :case="currentCase"
      :role="role"
      :document-count="documents.length"
      :total-size="totalSize"
      @back="navigateTo('/dashboard/cases')"
      @create-task="showCreateTaskModal = true"
      @upload-document="showUploadModal = true"
      @status-update="handleStatusUpdate"
      @description-update="handleDescriptionUpdate"
    />

    <!-- Tabs for different sections -->
    <UTabs :items="tabs" class="w-full">
      <template #messages="{ item }">
        <CaseMessaging :case-id="currentCase.id" />
      </template>
      
      <template #tasks="{ item }">
        <CaseTasks :case-id="currentCase.id" />
      </template>
      
      <template #documents="{ item }">
        <CaseDocuments :case-id="currentCase.id" />
      </template>
      
      <template #activity="{ item }">
        <CaseActivity :case-id="currentCase.id" />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import type { CaseStatus } from '~/types'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const toast = useToast()
const { session } = useAuth()
const { useCase, useUpdateCase, useUpdateCaseStatus } = useCases()
const { documents, totalSize } = useDocuments()

// Fetch case data
const caseId = computed(() => route.params.id as string)
const { data: currentCase, isLoading: loading, error } = useCase(caseId)

// Setup real-time updates for this case
useCaseRealTime(caseId)

// Mutations
const { mutateAsync: updateCase } = useUpdateCase()
const { mutateAsync: updateCaseStatus } = useUpdateCaseStatus()

// Reactive data
const showCreateTaskModal = ref(false)
const showUploadModal = ref(false)

// Computed properties
const role = computed(() => session.value?.user.userType)

// Tab configuration
const tabs = [
  {
    label: 'Messages',
    icon: 'i-heroicons-chat-bubble-left',
    slot: 'messages'
  },
  {
    label: 'Tasks',
    icon: 'i-heroicons-clipboard-document-list',
    slot: 'tasks'
  },
  {
    label: 'Documents',
    icon: 'i-heroicons-document',
    slot: 'documents'
  },
  {
    label: 'Activity',
    icon: 'i-heroicons-clock',
    slot: 'activity'
  }
]

// Methods
const handleStatusUpdate = async (status: CaseStatus, reason?: string) => {
  try {
    await updateCaseStatus({
      id: caseId.value,
      status,
      reason
    })
    
    toast.add({
      title: 'Success',
      description: 'Case status updated successfully',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update case status',
      color: 'red'
    })
  }
}

const handleDescriptionUpdate = async (description: string) => {
  try {
    await updateCase({
      id: caseId.value,
      updates: { description }
    })
    
    toast.add({
      title: 'Success',
      description: 'Case description updated successfully',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update case description',
      color: 'red'
    })
  }
}
</script>