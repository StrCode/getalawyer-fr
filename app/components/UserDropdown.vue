<template>
  <DropdownMenu v-if="userData">
    <DropdownMenuTrigger as-child>
      <Button
        v-if="variant === 'sidebar'"
        variant="ghost"
        class="h-auto w-full justify-start gap-3 py-2 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-800"
      >
        <Avatar class="size-10 shrink-0">
          <AvatarImage :src="userData.avatar" :alt="userData.name" />
          <AvatarFallback>{{ userInitials }}</AvatarFallback>
        </Avatar>
        <div class="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <div
            class="font-medium text-[#1C1C1E] text-sm"
            style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; font-size: 14px; line-height: 20px; letter-spacing: -0.006em;"
          >
            {{ userData.name }}
          </div>
          <div
            class="text-[#525866] text-xs"
            style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 400; font-size: 12px; line-height: 16px;"
          >
            {{ userData.role }}
          </div>
        </div>
        <PhCaretRight class="ms-auto size-4 shrink-0 text-muted-foreground" />
      </Button>
      <Button
        v-else
        variant="ghost"
        size="icon"
        aria-label="Open account menu"
        class="size-11 shrink-0 rounded-full hover:bg-black/4 dark:hover:bg-white/8"
      >
        <Avatar class="size-9 shrink-0">
          <AvatarImage :src="userData.avatar" :alt="userData.name" />
          <AvatarFallback class="size-9 text-xs">{{ userInitials }}</AvatarFallback>
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
  }>(),
  { variant: 'sidebar' },
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
