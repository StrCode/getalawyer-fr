<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  collapsed?: boolean
}

defineProps<Props>()

const { session, signOut } = useAuth()
const router = useRouter()

const user = computed(() => {
  if (!session.value?.user) return null
  
  return {
    name: session.value.user.name || session.value.user.email || 'User',
    email: session.value.user.email,
    role: session.value.user.userType,
    avatar: (session.value.user as any).image || null
  }
})

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const roleLabel = computed(() => {
  if (user.value?.role === 'lawyer') return 'Lawyer'
  if (user.value?.role === 'client') return 'Client'
  return 'User'
})

const handleSignOut = async () => {
  try {
    await signOut()
    await router.push('/login')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: user.value?.name || 'User',
  avatar: user.value?.avatar ? {
    src: user.value.avatar,
    alt: user.value.name || 'User'
  } : undefined
}], [{
  label: 'Profile',
  icon: 'i-heroicons-user-circle',
  to: '/dashboard/profile'
}, {
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/dashboard/settings'
}], [{
  label: 'Help Center',
  icon: 'i-heroicons-question-mark-circle',
  to: '/help'
}, {
  label: 'Documentation',
  icon: 'i-heroicons-book-open',
  to: '/docs'
}], [{
  label: 'Sign out',
  icon: 'i-heroicons-arrow-right-on-rectangle',
  onSelect: handleSignOut
}]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="collapsed ? undefined : user?.name"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    >
      <template #leading>
        <UAvatar
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name || 'User'"
          size="xs"
        />
        <UAvatar
          v-else
          :alt="user?.name || 'User'"
          size="xs"
        >
          {{ userInitials }}
        </UAvatar>
      </template>
    </UButton>
  </UDropdownMenu>
</template>
