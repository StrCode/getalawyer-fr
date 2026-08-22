<template>
  <div
    v-if="loading"
    class="space-y-4"
    aria-busy="true"
    aria-label="Loading case"
  >
    <Skeleton class="h-10 w-48 rounded-lg" />
    <Skeleton class="h-64 w-full rounded-xl" />
    <Skeleton class="h-48 w-full rounded-xl" />
  </div>

  <div
    v-else-if="error"
    class="space-y-4 py-8 text-center"
  >
    <HugeiconsIcon :icon="Alert01Icon" class="mx-auto size-12 text-destructive" />
   <h2 class="text-xl font-semibold text-foreground">
      Case not found
    </h2>
    <p class="text-muted-foreground">
      {{ error }}
    </p>
    <Button
      as-child
    >
      <NuxtLink to="/dashboard/cases">
        Back to cases
      </NuxtLink>
    </Button>
  </div>

  <div
    v-else-if="currentCase"
    class="space-y-6"
  >
    <CaseDetails
      :case="currentCase"
      :role="role"
      @back="navigateTo('/dashboard/cases')"
      @create-task="showCreateTaskModal = true"
      @status-update="handleStatusUpdate"
      @description-update="handleDescriptionUpdate"
    />

    <Tabs
      default-value="messages"
      class="w-full"
    >
      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.slot"
          :value="tab.slot"
          class="gap-2"
        >
          <HugeiconsIcon
            :icon="tab.iconComponent"
            class="size-4 shrink-0"
          />
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="messages"
        class="mt-6"
      >
        <CaseMessaging :case-id="currentCase.id" />
      </TabsContent>

      <TabsContent
        value="tasks"
        class="mt-6"
      >
        <CaseTasks
          ref="caseTasksRef"
          :case-id="currentCase.id"
          @add-task="showCreateTaskModal = true"
        />
      </TabsContent>

      <TabsContent
        value="activity"
        class="mt-6"
      >
        <CaseActivity :case-id="currentCase.id" />
      </TabsContent>
    </Tabs>

    <CreateTaskDialog
      v-model:open="showCreateTaskModal"
      :case-id="currentCase.id"
      :assigned-to="currentCase.clientId"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { Alert01Icon, ClipboardIcon, Clock01Icon, Message01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CaseStatus } from '~/types'

type CaseTabItem = {
  label: string
  iconComponent: Hugeicon
  slot: string
}

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { session } = useAuth()
const { useCase, useUpdateCase, useUpdateCaseStatus } = useCases()

const caseId = computed(() => route.params.id as string)
const { data: currentCase, isLoading: loading, error } = useCase(caseId)

useHead({
  title: computed(() => currentCase.value ? `Case ${currentCase.value.caseNumber} - GetALawyer` : 'Case details - GetALawyer'),
})

useCaseRealTime(caseId)

const { mutateAsync: updateCase } = useUpdateCase()
const { mutateAsync: updateCaseStatus } = useUpdateCaseStatus()

const showCreateTaskModal = ref(false)
const caseTasksRef = ref<{ refresh: () => Promise<void> } | null>(null)

const handleTaskCreated = () => {
  caseTasksRef.value?.refresh()
}

const role = computed(() => session.value?.user.userType)

const tabs: CaseTabItem[] = [
  {
    label: 'Messages',
    iconComponent: Message01Icon,
    slot: 'messages',
  },
  {
    label: 'Tasks',
    iconComponent: ClipboardIcon,
    slot: 'tasks',
  },
  {
    label: 'Activity',
    iconComponent: Clock01Icon,
    slot: 'activity',
  },
]

const handleStatusUpdate = async (status: CaseStatus, reason?: string) => {
  try {
    await updateCaseStatus({
      id: caseId.value,
      status,
      reason,
    })

    toast.success('Success', {
      description: 'Case status updated successfully',
    })
  }
  catch {
    toast.error('Error', {
      description: 'Failed to update case status',
    })
  }
}

const handleDescriptionUpdate = async (description: string) => {
  try {
    await updateCase({
      id: caseId.value,
      updates: { description },
    })

    toast.success('Success', {
      description: 'Case description updated successfully',
    })
  }
  catch {
    toast.error('Error', {
      description: 'Failed to update case description',
    })
  }
}
</script>
