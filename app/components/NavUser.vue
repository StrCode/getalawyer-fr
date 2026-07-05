<script setup lang="ts">
import { PhDotsThreeVertical, PhGearSix, PhSignOut, PhUserCircle } from '@phosphor-icons/vue'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { getSessionUserType } from '@/lib/session-user'

const { session, signOut } = useAuth()
const { isMobile } = useSidebar()
const router = useRouter()

const user = computed(() => session.value?.user ?? null)

const displayName = computed(() => user.value?.name || user.value?.email || 'User')
const displayEmail = computed(() => user.value?.email || '')
const avatarUrl = computed(() => (user.value as { image?: string } | null)?.image ?? '')

const roleLabel = computed(() => {
  const role = getSessionUserType(user.value)
  if (role === 'lawyer')
    return 'Lawyer'
  if (role === 'client')
    return 'Client'
  return 'User'
})

const initials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean)
  if (parts.length >= 2)
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return displayName.value.slice(0, 2).toUpperCase() || '?'
})

const isSigningOut = ref(false)

async function handleLogout() {
  if (isSigningOut.value)
    return

  isSigningOut.value = true
  try {
    const { error } = await signOut()
    if (error) {
      console.error('[NavUser] signOut failed:', error)
      return
    }
    await router.push('/login')
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <ClientOnly>
    <SidebarMenu v-if="user">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton
              size="lg"
              class="cursor-pointer data-[state=open]:bg-muted data-[state=open]:text-foreground"
            >
              <Avatar class="size-8 rounded-lg">
                <AvatarImage
                  :src="avatarUrl"
                  :alt="displayName"
                />
                <AvatarFallback class="rounded-lg text-xs">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ displayName }}</span>
                <span class="truncate text-xs text-muted-foreground">
                  {{ roleLabel }}
                </span>
              </div>
              <PhDotsThreeVertical class="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            :side="isMobile ? 'bottom' : 'top'"
            :side-offset="8"
            align="end"
            :collision-padding="12"
          >
            <DropdownMenuLabel class="p-0 font-normal">
              <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar class="size-8 rounded-lg">
                  <AvatarImage
                    :src="avatarUrl"
                    :alt="displayName"
                  />
                  <AvatarFallback class="rounded-lg text-xs">
                    {{ initials }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ displayName }}</span>
                  <span class="truncate text-xs text-muted-foreground">
                    {{ displayEmail }}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/dashboard/profile"
                  class="flex cursor-pointer items-center gap-2"
                >
                  <PhUserCircle class="size-4" />
                  Profile
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/dashboard/settings"
                  class="flex cursor-pointer items-center gap-2"
                >
                  <PhGearSix class="size-4" />
                  Settings
                </NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="cursor-pointer"
              :disabled="isSigningOut"
              @select="handleLogout"
            >
              <PhSignOut class="size-4" />
              {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </ClientOnly>
</template>
