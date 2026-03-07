<template>
  <UDropdownMenu :items="items">
    <UButton
      color="neutral"
      variant="ghost"
      class="w-full justify-start"
      trailing-icon="i-heroicons-chevron-up-down"
    >
      <template #leading>
        <UAvatar
          :alt="user?.name || 'User'"
          size="xs"
        />
      </template>
      
      <div class="flex-1 text-left min-w-0">
        <p class="text-sm font-medium truncate">
          {{ user?.name || 'User' }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          {{ user?.email || '' }}
        </p>
      </div>
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
const user = computed(() => session.data?.user)

const items = computed(() => [[
  {
    label: 'Profile',
    icon: 'i-heroicons-user',
    onSelect: () => navigateTo('/profile')
  }
], [
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    onSelect: () => navigateTo('/settings')
  }
], [
  {
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    onSelect: async () => {
      await authClient.signOut()
      navigateTo('/login')
    }
  }
]])
</script>
