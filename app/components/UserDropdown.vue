<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

interface Props {
  collapsed?: boolean
}

const props = defineProps<Props>()

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

const menuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-heroicons-user-circle',
      to: '/dashboard/profile',
      shortcuts: ['P']
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/dashboard/settings',
      shortcuts: ['S']
    }
  ],
  [
    {
      label: 'Help Center',
      icon: 'i-heroicons-question-mark-circle',
      to: '/help'
    },
    {
      label: 'Documentation',
      icon: 'i-heroicons-book-open',
      to: '/docs'
    }
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: handleSignOut
    }
  ]
])
</script>

<template>
  <UDropdown 
    :items="menuItems" 
    :popper="{ placement: 'top', offsetDistance: 8 }"
    :ui="{
      width: 'w-64',
      item: {
        base: 'group flex items-center gap-3 w-full',
        padding: 'px-3 py-2',
        size: 'text-sm',
        active: 'bg-neutral-100',
        inactive: 'text-neutral-700',
        icon: {
          base: 'flex-shrink-0 w-5 h-5',
          active: 'text-neutral-900',
          inactive: 'text-neutral-500'
        }
      }
    }"
  >
    <button class="user-dropdown-trigger" :class="{ 'user-dropdown-collapsed': collapsed }">
      <!-- Avatar -->
      <div class="user-avatar">
        <img 
          v-if="user?.avatar" 
          :src="user.avatar" 
          :alt="user.name"
          class="w-full h-full object-cover"
        />
        <span v-else class="user-avatar-initials">
          {{ userInitials }}
        </span>
      </div>

      <!-- User Info (when not collapsed) -->
      <div v-if="!collapsed" class="user-info">
        <div class="user-name">{{ user?.name || 'User' }}</div>
        <div class="user-role">{{ roleLabel }}</div>
      </div>

      <!-- Chevron (when not collapsed) -->
      <UIcon 
        v-if="!collapsed" 
        name="i-heroicons-chevron-up-down" 
        class="user-chevron" 
      />
    </button>

    <!-- Custom dropdown header -->
    <template #account>
      <div class="dropdown-header">
        <div class="flex items-center gap-3 mb-3">
          <div class="user-avatar-large">
            <img 
              v-if="user?.avatar" 
              :src="user.avatar" 
              :alt="user.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="user-avatar-initials">
              {{ userInitials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="dropdown-user-name">{{ user?.name }}</div>
            <div class="dropdown-user-email">{{ user?.email }}</div>
          </div>
        </div>
        <UBadge 
          :color="user?.role === 'lawyer' ? 'primary' : 'info'" 
          variant="soft" 
          size="sm"
        >
          {{ roleLabel }}
        </UBadge>
      </div>
    </template>
  </UDropdown>
</template>

<style scoped>
/* User Dropdown Trigger */
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-lg);
  background-color: transparent;
  border: 1px solid transparent;
  transition: all var(--transition-base);
  cursor: pointer;
  text-align: left;
}

.user-dropdown-trigger:hover {
  background-color: var(--color-neutral-100);
  border-color: var(--color-neutral-200);
}

.user-dropdown-trigger:active {
  background-color: var(--color-neutral-200);
}

.user-dropdown-collapsed {
  justify-content: center;
  padding: 0.625rem;
}

/* Avatar */
.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar-initials {
  font-size: 0.875rem;
  font-weight: var(--font-bold);
  color: white;
  line-height: 1;
}

.user-avatar-large {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid var(--color-neutral-100);
}

.user-avatar-large .user-avatar-initials {
  font-size: 1.125rem;
}

/* User Info */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.user-chevron {
  width: 1rem;
  height: 1rem;
  color: var(--color-neutral-400);
  flex-shrink: 0;
  transition: transform var(--transition-base);
}

.user-dropdown-trigger:hover .user-chevron {
  color: var(--color-neutral-600);
}

/* Dropdown Header */
.dropdown-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
}

.dropdown-user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-email {
  font-size: var(--text-xs);
  color: var(--color-neutral-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 640px) {
  .user-dropdown-trigger {
    padding: 0.5rem;
  }
  
  .user-avatar {
    width: 2rem;
    height: 2rem;
  }
}
</style>
