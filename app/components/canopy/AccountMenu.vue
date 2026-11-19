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

const links = computed(() => [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' as const },
  { label: isLawyer.value ? 'Your profile' : 'Profile', to: '/dashboard/profile', icon: 'user' as const },
  { label: 'Settings', to: '/dashboard/settings', icon: 'sliders' as const },
])

const item = 'min-h-11 cursor-pointer gap-3 rounded-[0.9rem] px-3 text-[0.95rem] font-medium text-foreground focus:bg-mint focus:text-deep [&_svg]:size-[1.15rem] [&_svg]:text-muted-foreground focus:[&_svg]:text-deep'

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
        class="group/acct inline-flex h-11 flex-none cursor-pointer items-center gap-[0.55rem] rounded-full border border-border bg-card p-[0.2rem] transition-colors duration-[250ms] hover:border-brand data-[state=open]:border-brand sm:pr-[0.8rem]"
      >
        <Avatar class="size-[2.25rem]">
          <AvatarImage :src="avatarUrl" alt="" />
          <AvatarFallback class="bg-primary font-display text-[0.85rem] font-bold text-white">{{ initials }}</AvatarFallback>
        </Avatar>
        <span class="max-w-[7.5rem] truncate text-[0.95rem] font-semibold max-sm:hidden">{{ firstName }}</span>
        <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="text-muted-foreground transition-transform duration-300 ease-canopy group-data-[state=open]/acct:rotate-180 max-sm:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" :side-offset="10" class="w-[min(19rem,calc(100vw-2rem))] rounded-[1.5rem] border-border bg-card p-2 font-text text-foreground shadow-widget">
        <!-- who is signed in -->
        <div class="flex items-center gap-3 px-2 pt-2 pb-3">
          <Avatar class="size-11 flex-none">
            <AvatarImage :src="avatarUrl" :alt="displayName" />
            <AvatarFallback class="bg-primary font-display text-[0.95rem] font-bold text-white">{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0 leading-[1.3]">
            <b class="block truncate font-display text-[1.05rem] font-[650] tracking-[-0.02em]">{{ displayName }}</b>
            <small v-if="displayEmail && displayEmail !== displayName" class="block truncate text-[0.85rem] text-muted-foreground">{{ displayEmail }}</small>
          </div>
        </div>

        <!-- not set up yet: the dashboard is closed, so show the way forward instead -->
        <template v-if="settingUp">
          <CanopyAccountApplication v-if="isLawyer" />
          <DropdownMenuItem v-else as-child class="block cursor-pointer rounded-[1.1rem] bg-mint p-[0.9rem] text-deep focus:bg-mint focus:text-deep focus:ring-2 focus:ring-brand">
            <NuxtLink :to="WELCOME_HOME">
              <small class="block text-[0.72rem] font-bold tracking-[0.06em] uppercase">Almost there</small>
              <b class="mt-[0.2rem] block font-display text-[1.05rem] font-[650] tracking-[-0.02em]">Finish setting up</b>
              <span class="mt-[0.15rem] block text-[0.88rem]">Two quick questions, then your dashboard opens.</span>
              <span class="mt-[0.6rem] inline-flex items-center gap-[0.35rem] text-[0.9rem] font-semibold">Continue<CanopyGlyph name="arrow" :size="14" :stroke="2.4" class="!text-deep" /></span>
            </NuxtLink>
          </DropdownMenuItem>
        </template>

        <template v-else>
          <DropdownMenuItem v-for="link in links" :key="link.to" as-child :class="item">
            <NuxtLink :to="link.to"><CanopyGlyph :name="link.icon" />{{ link.label }}</NuxtLink>
          </DropdownMenuItem>
        </template>

        <div class="mx-2 my-2 h-px bg-border" role="separator" />
        <DropdownMenuItem :class="item" :disabled="isSigningOut" @select="signOut">
          <CanopyGlyph name="out" />{{ isSigningOut ? 'Signing out…' : 'Sign out' }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </ClientOnly>
</template>
