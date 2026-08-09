<script setup lang="ts">
import { LayoutGridIcon, Logout01Icon, MoreVerticalIcon, Settings01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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

const props = withDefaults(
  defineProps<{
    /** `sidebar` — SidebarMenuButton row in the dashboard sidebar footer (collapses natively in the icon rail). `nav` — compact avatar chip for marketing/header navs. */
    variant?: 'sidebar' | 'nav'
    /** Post sign-out navigation. Defaults to `stay` on nav, `login` on sidebar. */
    afterSignOut?: 'login' | 'stay'
  }>(),
  { variant: 'sidebar' },
)

const emit = defineEmits<{
  signedOut: []
}>()

const { session } = useAuth()
const { handleSignOut, isSigningOut } = useSignOut()

// Only the sidebar variant renders inside a SidebarProvider.
const sidebar = props.variant === 'sidebar' ? useSidebar() : null

const afterSignOutBehavior = computed(
  () => props.afterSignOut ?? (props.variant === 'nav' ? 'stay' : 'login'),
)

const user = computed(() => session.value?.user ?? null)
const isLawyer = computed(() => getSessionUserType(user.value) === 'lawyer')
const profileMenuLabel = computed(() => (isLawyer.value ? 'Listing' : 'Profile'))
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
  if (isSigningOut.value)
    return
  emit('signedOut')
  await handleSignOut(afterSignOutBehavior.value)
}
</script>

<template>
  <ClientOnly>
    <component
      :is="variant === 'sidebar' ? SidebarMenu : 'div'"
      v-if="user"
      :class="variant === 'nav' ? 'contents' : undefined"
    >
      <component :is="variant === 'sidebar' ? SidebarMenuItem : 'div'" :class="variant === 'nav' ? 'contents' : undefined">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton
              v-if="variant === 'sidebar'"
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar class="size-8 rounded-lg">
                <AvatarImage :src="avatarUrl" :alt="displayName" />
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
            <Button
              v-else
              variant="ghost"
              size="icon"
              aria-label="Open account menu"
              class="size-10 shrink-0 rounded-full border border-border bg-card p-0 transition-colors hover:border-foreground/30 hover:bg-muted"
            >
              <Avatar class="size-9 shrink-0">
                <AvatarImage :src="avatarUrl" :alt="displayName" />
                <AvatarFallback class="bg-primary text-xs text-primary-foreground">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="min-w-56 rounded-lg"
            :side="variant === 'sidebar' ? (sidebar?.isMobile.value ? 'bottom' : 'right') : 'bottom'"
            :side-offset="variant === 'sidebar' ? 4 : 8"
            align="end"
          >
            <DropdownMenuLabel class="font-normal text-muted-foreground">
              {{ displayEmail }}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem v-if="variant === 'nav'" as-child>
                <NuxtLink to="/dashboard" class="flex cursor-pointer items-center gap-2">
                  <HugeiconsIcon :icon="LayoutGridIcon" />
                  Dashboard
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <NuxtLink to="/dashboard/profile" class="flex cursor-pointer items-center gap-2">
                  <HugeiconsIcon :icon="UserCircleIcon" />
                  {{ profileMenuLabel }}
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <NuxtLink to="/dashboard/settings" class="flex cursor-pointer items-center gap-2">
                  <HugeiconsIcon :icon="Settings01Icon" />
                  Settings
                </NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              class="cursor-pointer"
              :disabled="isSigningOut"
              @select="handleLogout"
            >
              <HugeiconsIcon :icon="Logout01Icon" />
              {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </component>
    </component>
  </ClientOnly>
</template>
