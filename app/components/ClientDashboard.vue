<script setup lang="ts">
const { session } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Client Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome back, {{ session?.user.name || session?.user.email }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Active Cases -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:briefcase" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Active Cases</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No active cases</p>
      </UCard>

      <!-- Messages -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:chat-bubble-left-right" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Messages</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No new messages</p>
      </UCard>

      <!-- Documents -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:document-text" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Documents</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No documents</p>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Quick Actions</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <UButton to="/lawyers" color="primary">Find a Lawyer</UButton>
        <UButton to="/dashboard/cases" variant="outline">View Cases</UButton>
        <UButton to="/dashboard/messages" variant="outline">Messages</UButton>
      </div>
    </UCard>
  </div>
</template>
