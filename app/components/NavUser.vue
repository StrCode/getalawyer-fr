<script setup lang="ts">
import { Logout01Icon, MoreVerticalIcon, Settings01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
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

const { session } = useAuth()
const { isMobile } = useSidebar()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })

const user = computed(() => session.value?.user ?? null)

const displayName = computed(() => user.value?.name || user.value?.email || 'User')
const displayEmail = computed(() => user.value?.email || '')
const avatarUrl = computed(() => (user.value as { image?: string } | null)?.image ?? '')

const initials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean)
  if (parts.length >= 2)
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return displayName.value.slice(0, 2).toUpperCase() || '?'
})

async function handleLogout() {
  await handleSignOut()
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
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                  {{ displayEmail }}
                </span>
              </div>
              <HugeiconsIcon :icon="MoreVerticalIcon" class="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :side-offset="4"
            align="end"
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
                  <HugeiconsIcon :icon="UserCircleIcon" />
                  Profile
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/dashboard/settings"
                  class="flex cursor-pointer items-center gap-2"
                >
                  <HugeiconsIcon :icon="Settings01Icon" />
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
              <HugeiconsIcon :icon="Logout01Icon" />
              {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </ClientOnly>
</template>
