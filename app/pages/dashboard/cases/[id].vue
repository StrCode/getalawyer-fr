<template>
  <div v-if="loading" class="flex justify-center py-8">
    <PhCircleNotch class="w-8 h-8 animate-spin" />
  </div>

  <div v-else-if="error" class="py-8 text-center">
    <PhWarning class="mx-auto mb-4 w-12 h-12 text-red-500" />
    <h2 class="mb-2 font-semibold text-xl">Case Not Found</h2>
    <p class="mb-4 text-gray-600">{{ error }}</p>
    <Button @click="navigateTo('/dashboard/cases')">
      Back to Cases
    </Button>
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
      <template #leading="{ item }">
        <component
          v-if="item.iconComponent"
          :is="item.iconComponent"
          class="size-4 shrink-0"
          data-slot="leadingIcon"
        />
      </template>
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
import type { Component } from 'vue'
import { toast } from 'vue-sonner'
import {
  PhChatCircle,
  PhCircleNotch,
  PhClipboardText,
  PhClock,
  PhFile,
  PhWarning
} from '@phosphor-icons/vue'
import type { CaseStatus } from '~/types'

type CaseTabItem = {
  label: string
  iconComponent: Component
  slot: string
}

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
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
const tabs: CaseTabItem[] = [
  {
    label: 'Messages',
    iconComponent: PhChatCircle,
    slot: 'messages'
  },
  {
    label: 'Tasks',
    iconComponent: PhClipboardText,
    slot: 'tasks'
  },
  {
    label: 'Documents',
    iconComponent: PhFile,
    slot: 'documents'
  },
  {
    label: 'Activity',
    iconComponent: PhClock,
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
    
    toast.success('Success', {
      description: 'Case status updated successfully'
    })
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to update case status'
    })
  }
}

const handleDescriptionUpdate = async (description: string) => {
  try {
    await updateCase({
      id: caseId.value,
      updates: { description }
    })
    
    toast.success('Success', {
      description: 'Case description updated successfully'
    })
  } catch (error) {
    toast.error('Error', {
      description: 'Failed to update case description'
    })
  }
}
</script>