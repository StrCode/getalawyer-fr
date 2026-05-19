<template>
  <DropdownMenu v-if="userData">
    <DropdownMenuTrigger as-child>
      <Button
        v-if="variant === 'sidebar'"
        variant="ghost"
        class="h-auto w-full justify-start gap-2.5 rounded-md px-2 py-2 hover:bg-accent data-[state=open]:bg-accent"
        :class="{ 'size-10 justify-center px-0': collapsed }"
      >
        <Avatar class="size-8 shrink-0" :class="{ 'size-7': collapsed }">
          <AvatarImage :src="userData.avatar" :alt="userData.name" />
          <AvatarFallback class="bg-primary text-xs text-primary-foreground">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
        <template v-if="!collapsed">
          <div class="min-w-0 flex-1 text-left">
            <div class="truncate text-sm font-medium text-foreground">
              {{ userData.name }}
            </div>
            <div class="truncate text-xs text-muted-foreground">
              {{ userData.role }}
            </div>
          </div>
          <PhCaretRight class="ms-auto size-4 shrink-0 text-muted-foreground" />
        </template>
      </Button>
      <Button
        v-else
        variant="ghost"
        size="icon"
        aria-label="Open account menu"
        class="size-[52px] shrink-0 rounded-full border border-neutral-300/95 bg-transparent shadow-md transition-[background-color,border-color,box-shadow] hover:border-primary hover:bg-black/4 hover:shadow-lg focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 data-[state=open]:border-primary data-[state=open]:shadow-lg dark:border-neutral-600 dark:shadow-[0_3px_14px_rgba(0,0,0,0.45)] dark:hover:bg-white/8 dark:hover:shadow-[0_4px_18px_rgba(0,0,0,0.55)] dark:data-[state=open]:shadow-[0_4px_18px_rgba(0,0,0,0.55)] dark:focus-visible:border-primary"
      >
        <Avatar class="size-[42px] shrink-0">
          <AvatarImage :src="userData.avatar" :alt="userData.name" />
          <AvatarFallback class="size-[42px] text-xs">{{ userInitials }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-56"
      :side="variant === 'header' ? 'bottom' : 'top'"
      align="end"
      :side-offset="8"
    >
      <DropdownMenuLabel class="font-normal text-muted-foreground">
        {{ userData.email }}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="variant === 'header'" as-child>
        <NuxtLink to="/dashboard" class="cursor-pointer">
          <PhSquaresFour class="size-4" />
          Dashboard
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="variant === 'header'" />
      <DropdownMenuItem as-child>
        <NuxtLink to="/dashboard/profile" class="cursor-pointer">
          <PhUserCircle class="size-4" />
          Profile
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <NuxtLink to="/dashboard/settings" class="cursor-pointer">
          <PhGearSix class="size-4" />
          Settings
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" @click="handleLogout">
        <PhSignOut class="size-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { PhCaretRight, PhGearSix, PhSignOut, PhSquaresFour, PhUserCircle } from '@phosphor-icons/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

withDefaults(
  defineProps<{
    /** `sidebar` — full-width row + menu opens upward. `header` — avatar chip + menu opens downward. */
    variant?: 'sidebar' | 'header'
    /** Icon-collapsed sidebar rail — hide name/role, center avatar */
    collapsed?: boolean
  }>(),
  { variant: 'sidebar', collapsed: false },
)

const { session, signOut } = useAuth()

const router = useRouter()

const userData = computed(() => {
  if (!session.value?.user)
    return null

  const user = session.value.user
  const roleLabel = user.userType === 'lawyer' ? 'Lawyer' : user.userType === 'client' ? 'Client' : 'Admin'

  return {
    name: user.name || user.email || 'User',
    role: roleLabel,
    email: user.email || 'user@example.com',
    avatar: (user as Record<string, unknown>).image as string || 'https://avatars.githubusercontent.com/u/739984?v=4',
  }
})

const userInitials = computed(() => {
  const n = userData.value?.name
  if (!n)
    return '?'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2)
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return n.slice(0, 2).toUpperCase()
})

async function handleLogout() {
  await signOut()
  await router.push('/login')
}
</script>
