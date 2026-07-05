<template>
  <div
    v-if="loading"
    class="flex justify-center py-8"
  >
    <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin text-muted-foreground" />
  </div>

  <div
    v-else-if="error"
    class="space-y-4 py-8 text-center"
  >
    <AppIcon :icon="appIcons.warning" class="mx-auto size-12 text-destructive" />
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
          <AppIcon
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
        <CaseTasks :case-id="currentCase.id" />
      </TabsContent>

      <TabsContent
        value="activity"
        class="mt-6"
      >
        <CaseActivity :case-id="currentCase.id" />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons, type AppIconData } from '@/lib/app-icons'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CaseStatus } from '~/types'

type CaseTabItem = {
  label: string
  iconComponent: AppIconData
  slot: string
}

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { session } = useAuth()
const { useCase, useUpdateCase, useUpdateCaseStatus } = useCases()

const caseId = computed(() => route.params.id as string)
const { data: currentCase, isLoading: loading, error } = useCase(caseId)

useCaseRealTime(caseId)

const { mutateAsync: updateCase } = useUpdateCase()
const { mutateAsync: updateCaseStatus } = useUpdateCaseStatus()

const showCreateTaskModal = ref(false)

const role = computed(() => session.value?.user.userType)

const tabs: CaseTabItem[] = [
  {
    label: 'Messages',
    iconComponent: appIcons.chatCircle,
    slot: 'messages',
  },
  {
    label: 'Tasks',
    iconComponent: appIcons.clipboardText,
    slot: 'tasks',
  },
  {
    label: 'Activity',
    iconComponent: appIcons.clock,
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
