<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSessionUserType, isOnboardingIncomplete } from '~/lib/session-user'
import { WELCOME_HOME } from '~/lib/setup-paths'

/**
 * The signed-in person's menu in the site header, in the Canopy design: a chip
 * with their initials and first name, opening who is signed in and where they
 * can go.
 *
 * What it offers follows what the account can reach. Someone fully set up gets
 * their dashboard, profile and settings. A lawyer whose application is not
 * approved yet cannot open the dashboard, so the menu shows where the
 * application stands and one way into it instead; a client who has not finished
 * the welcome steps gets the way back to them.
 */
const { session } = useAuth()
const { handleSignOut, isSigningOut } = useSignOut()

const user = computed(() => session.value?.user ?? null)
const isLawyer = computed(() => getSessionUserType(user.value) === 'lawyer')
const settingUp = computed(() => isOnboardingIncomplete(user.value))

const displayName = computed(() => user.value?.name || user.value?.email || 'Your account')
const displayEmail = computed(() => user.value?.email || '')
/** The name on the header chip: the first name, or "Account" when only an email is known. */
const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || 'Account')
const avatarUrl = computed(() => (user.value as { image?: string } | null)?.image ?? '')
const initials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return displayName.value.slice(0, 2).toUpperCase() || '?'
})

type MenuIcon = 'grid' | 'user' | 'sliders' | 'card'
interface MenuLink { label: string, to: string, icon: MenuIcon, /** Needs the person's attention: shown as a dot. */ alert?: boolean }

/**
 * `links` replaces the default set. The dashboard passes its own account pages
 * (it is already the dashboard, so "Dashboard" would lead nowhere new).
 */
const props = defineProps<{ links?: MenuLink[] }>()

const links = computed<MenuLink[]>(() => props.links ?? [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: isLawyer.value ? 'Your profile' : 'Profile', to: '/dashboard/profile', icon: 'user' },
  { label: 'Settings', to: '/dashboard/settings', icon: 'sliders' },
])
/** Something in the menu needs attention: the chip carries a dot too. */
const attention = computed(() => links.value.some(link => link.alert))


async function signOut() {
  if (isSigningOut.value) return
  await handleSignOut('stay')
}
</script>

<template>
  <ClientOnly>
    <DropdownMenu v-if="user">
      <!-- a chip, not a bare dot: initials, first name and an arrow; initials alone on phones -->
      <DropdownMenuTrigger
        :aria-label="`Account menu for ${displayName}`"
        class="group/acct inline-flex h-11 max-sm:h-10 flex-none cursor-pointer items-center gap-2.25 rounded-full border border-border bg-card p-0.75 transition-colors duration-250 hover:border-brand data-[state=open]:border-brand sm:pr-3.25"
      >
        <span class="relative flex-none">
          <Avatar class="size-9 max-sm:size-8">
            <AvatarImage :src="avatarUrl" alt="" />
            <AvatarFallback class="bg-primary text-sm font-medium text-white">{{ initials }}</AvatarFallback>
          </Avatar>
          <span v-if="attention" class="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-warning"><span class="sr-only">Something in your account needs attention</span></span>
        </span>
        <span class="max-w-30 truncate max-sm:hidden" :class="menuTriggerText">{{ firstName }}</span>
        <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="text-muted-foreground transition-transform duration-200 ease-canopy group-data-[state=open]/acct:rotate-180 max-sm:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" :side-offset="10" class="w-[min(19rem,calc(100vw-2rem))]" :class="menuPanel">
        <!-- who is signed in -->
        <div class="flex items-center gap-3 px-2 pt-2 pb-3">
          <Avatar class="size-11 flex-none">
            <AvatarImage :src="avatarUrl" :alt="displayName" />
            <AvatarFallback class="bg-primary text-sm font-medium text-white">{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0 leading-tight">
            <b class="block truncate text-sm font-medium">{{ displayName }}</b>
            <small v-if="displayEmail && displayEmail !== displayName" class="block truncate text-sm text-muted-foreground">{{ displayEmail }}</small>
          </div>
        </div>

        <!-- not set up yet: the dashboard is closed, so show the way forward instead -->
        <template v-if="settingUp">
          <CanopyAccountApplication v-if="isLawyer" />
          <DropdownMenuItem v-else as-child class="block cursor-pointer rounded-lg bg-mint p-3.5 text-deep focus:bg-mint focus:text-deep focus:ring-2 focus:ring-brand">
            <NuxtLink :to="WELCOME_HOME">
              <small class="block text-xs font-medium tracking-wider uppercase">Almost there</small>
              <b class="mt-0.75 block font-display text-base font-normal tracking-tight">Finish setting up</b>
              <span class="mt-0.5 block text-sm">Two quick questions, then your dashboard opens.</span>
              <span class="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium">Continue<CanopyGlyph name="arrow" :size="14" :stroke="2.4" class="!text-deep" /></span>
            </NuxtLink>
          </DropdownMenuItem>
        </template>

        <template v-else>
          <DropdownMenuItem v-for="link in links" :key="link.to" as-child :class="menuItem">
            <NuxtLink :to="link.to">
              <CanopyGlyph :name="link.icon" />{{ link.label }}
              <span v-if="link.alert" class="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-warning-subtle-foreground"><i class="size-2 rounded-full bg-warning" />Needs attention</span>
            </NuxtLink>
          </DropdownMenuItem>
        </template>

        <div class="mx-2 my-2 h-px bg-border" role="separator" />
        <DropdownMenuItem :class="menuItem" :disabled="isSigningOut" @select="signOut">
          <CanopyGlyph name="out" />{{ isSigningOut ? 'Signing out…' : 'Sign out' }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </ClientOnly>
</template>
