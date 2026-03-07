<script setup lang="ts">
const { session } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Lawyer Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome back, {{ session?.user.name || session?.user.email }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <!-- Active Clients -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:users" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Active Clients</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No active clients</p>
      </UCard>

      <!-- Cases -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:briefcase" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Cases</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">0</div>
        <p class="text-sm text-gray-600 mt-1">No cases</p>
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

      <!-- Revenue -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="heroicons:banknotes" class="h-5 w-5 text-primary-500" />
            <h3 class="font-semibold">Revenue</h3>
          </div>
        </template>
        <div class="text-3xl font-bold">€0</div>
        <p class="text-sm text-gray-600 mt-1">This month</p>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Quick Actions</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <UButton to="/dashboard/cases" color="primary">Manage Cases</UButton>
        <UButton to="/dashboard/messages" variant="outline">Messages</UButton>
        <UButton to="/dashboard/profile" variant="outline">Edit Profile</UButton>
      </div>
    </UCard>
  </div>
</template>
