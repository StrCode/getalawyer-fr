<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import { isWorkspaceLinkActive, workspaceNavFor, type WorkspaceLink } from '~/lib/workspace-nav'
import { getSessionUserType } from '~/lib/session-user'

/**
 * The dashboard's top bar: the same floating bar as the public site, holding
 * the few places someone goes every day. A lawyer's set-up pages sit under
 * "Practice"; the account's own pages (membership, settings) are in the account
 * menu. On phones the links move to the tab bar along the bottom.
 */
const route = useRoute()
const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user) as 'lawyer' | 'client' | undefined)
const nav = computed(() => workspaceNavFor(role.value))

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
} = useDashboardNavBadges()

/** The count beside a link, when there is something waiting there. */
function countFor(link: WorkspaceLink): string | undefined {
  const badges: Record<string, { label: string } | undefined> = {
    '/dashboard/bookings': clientUpcomingBookingsBadge.value,
    '/dashboard/messages': unreadMessagesBadge.value,
    '/dashboard/cases': activeCasesBadge.value,
    '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  }
  return badges[link.to]?.label
}

const active = (link: WorkspaceLink) => isWorkspaceLinkActive(route.path, link)
const practiceActive = computed(() => nav.value.practice.some(active))

/** The account menu's pages; membership carries a dot when it needs attention. */
const accountLinks = computed(() =>
  nav.value.account.map(link => ({
    label: link.label,
    to: link.to,
    icon: link.icon as 'user' | 'sliders' | 'card',
    alert: link.to === '/dashboard/subscription' && Boolean(lawyerSubscriptionBadge.value),
  })),
)

const linkClass = 'relative inline-flex min-h-11 items-center gap-2 rounded-full px-[0.95rem] text-[0.95rem] font-medium whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-foreground aria-[current=page]:bg-mint aria-[current=page]:font-semibold aria-[current=page]:text-deep'
const menuItem = 'min-h-11 cursor-pointer gap-3 rounded-[0.9rem] px-3 text-[0.95rem] font-medium text-foreground focus:bg-mint focus:text-deep [&_svg]:size-[1.15rem] [&_svg]:text-muted-foreground focus:[&_svg]:text-deep'
</script>

<template>
  <!-- a bar across the whole window; what is in it lines up with the page's column -->
  <header class="sticky top-0 z-30 border-b border-border bg-glass pt-[env(safe-area-inset-top,0px)] backdrop-blur-[16px] backdrop-saturate-[1.4]">
    <div class="mx-auto max-w-[76rem] safe-x tab:max-w-[81rem]">
      <div class="flex h-[3.75rem] items-center justify-between gap-3">
        <CanopyBrand to="/dashboard" />

        <nav aria-label="Dashboard" class="flex items-center gap-[0.15rem] max-tab:hidden">
          <NuxtLink
            v-for="link in nav.bar"
            :key="link.to"
            :to="link.to"
            :class="linkClass"
            :aria-current="active(link) ? 'page' : undefined"
          >
            {{ link.label }}
            <span v-if="countFor(link)" class="grid min-w-[1.35rem] place-items-center rounded-full bg-primary px-[0.35rem] text-[0.74rem] leading-[1.35rem] font-bold text-white">
              {{ countFor(link) }}<span class="sr-only"> waiting</span>
            </span>
          </NuxtLink>

          <ClientOnly v-if="nav.practice.length">
            <DropdownMenu>
              <DropdownMenuTrigger
                :class="[linkClass, 'group/practice cursor-pointer data-[state=open]:text-foreground', practiceActive ? 'bg-mint font-semibold !text-deep' : '']"
              >
                Practice
                <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="transition-[rotate] duration-200 ease-canopy group-data-[state=open]/practice:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" :side-offset="10" class="w-[15rem] rounded-[1.5rem] border-border bg-card p-2 font-text text-foreground shadow-widget">
                <DropdownMenuItem v-for="link in nav.practice" :key="link.to" as-child :class="menuItem">
                  <NuxtLink :to="link.to" :aria-current="active(link) ? 'page' : undefined">
                    <CanopyGlyph :name="link.icon" />{{ link.label }}
                  </NuxtLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <template #fallback>
              <span :class="linkClass">Practice</span>
            </template>
          </ClientOnly>
        </nav>

        <div class="flex items-center gap-[0.35rem]">
          <ClientOnly><CanopyThemeToggle class="max-sm:hidden" /></ClientOnly>
          <ClientOnly><NotificationBell /></ClientOnly>
          <CanopyAccountMenu :links="accountLinks" />
        </div>
      </div>
    </div>
  </header>
</template>
