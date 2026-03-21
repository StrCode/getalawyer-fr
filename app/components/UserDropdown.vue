<template>
  <ClientOnly>
    <UDropdownMenu
      v-if="userData"
      :items="items"
      :content="{ align: 'end', side: 'top', sideOffset: 8 }"
      :ui="{ content: 'w-56' }"
    >
      <!-- Dropdown Trigger Button -->
      <template #default="{ open }">
        <UButton 
          color="neutral" 
          variant="ghost" 
          class="justify-start gap-3 py-2 w-full h-auto" 
          :class="[open && 'bg-gray-50 dark:bg-gray-800']"
        >
          <template #leading>
            <UAvatar 
              :src="userData.avatar" 
              size="lg" 
              class="w-10 h-10" 
            />
          </template>

          <div class="flex flex-col flex-1 gap-1 text-left">
            <div 
              class="font-medium text-[#1C1C1E] text-sm" 
              style="font-family: 'Plus Jakarta Sans'; font-weight: 500; font-size: 14px; line-height: 20px; letter-spacing: -0.6%;"
            >
              {{ userData.name }}
            </div>
            <div 
              class="text-[#525866]" 
              style="font-family: 'Plus Jakarta Sans'; font-weight: 400; font-size: 12px; line-height: 16px; letter-spacing: 0%;"
            >
              {{ userData.role }}
            </div>
          </div>

          <UIcon 
            name="i-heroicons-chevron-right" 
            class="ms-auto w-4 h-4 shrink-0" 
          />
        </UButton>
      </template>

      <!-- Dropdown Menu Items -->
      <template #item="{ item }">
        <span class="truncate">{{ item.label }}</span>
        <UIcon 
          v-if="item.icon" 
          :name="item.icon" 
          class="ms-auto w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" 
        />
      </template>
    </UDropdownMenu>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { session, signOut } = useAuth()

// Computed user data for display
const userData = computed(() => {
  if (!session.value?.user) return null
  
  const user = session.value.user
  const roleLabel = user.userType === 'lawyer' ? 'Lawyer' : user.userType === 'client' ? 'Client' : 'Admin'
  
  return {
    name: user.name || user.email || 'User',
    role: roleLabel,
    email: user.email || 'user@example.com',
    avatar: (user as Record<string, unknown>).image as string || 'https://avatars.githubusercontent.com/u/739984?v=4'
  }
})

// Handle logout
const router = useRouter()
const handleLogout = async () => {
  await signOut()
  await router.push('/login')
}

// Dropdown menu items
const items = computed<DropdownMenuItem[][]>(() => {
  if (!userData.value) return []
  
  return [
    // User email (disabled)
    [{
      label: userData.value.email,
      disabled: true
    }],
    // Profile and Settings
    [{
      label: 'Profile',
      icon: 'i-heroicons-user-circle',
      to: '/dashboard/profile'
    }, {
      label: 'Settings',
      icon: 'i-heroicons-cog-8-tooth',
      to: '/dashboard/settings'
    }],
    // Sign out
    [{
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: handleLogout
    }]
  ]
})
</script>
