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
import { useWindowScroll } from '@vueuse/core'

/**
 * The dashboard's top bar, the way working tools draw theirs (fal, Aboard,
 * Workable): across the whole window, in the page's own colour, the links
 * straight after the mark on the left and the account on the right. No line
 * under it while the page is at the top; once the page scrolls, a hairline
 * appears so content passing under the bar has an edge. It holds the few
 * places someone goes every day; left-aligned, the lawyer's and the client's
 * menus start in the same place however long each is. A lawyer's set-up pages sit under
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

/** Whether the page has scrolled, so content is passing under the bar. */
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 0)

const linkClass = `relative inline-flex min-h-10 items-center gap-2 rounded-lg px-3 whitespace-nowrap ${menuText} aria-[current=page]:bg-mint aria-[current=page]:font-medium aria-[current=page]:text-deep`
</script>

<template>
  <!-- across the window; the mark alone stands for the brand, the links follow it on the left -->
  <header
    class="sticky top-[env(safe-area-inset-top,0px)] z-30 border-b bg-background transition-colors duration-200"
    :class="scrolled ? 'border-border' : 'border-transparent'"
  >
    <div class="safe-x lg:px-6">
      <div class="flex h-14 items-center gap-4 lg:gap-6">
        <CanopyBrand to="/dashboard" condensed />

        <nav aria-label="Dashboard" class="flex items-center gap-0.5 max-tab:hidden">
          <NuxtLink
            v-for="link in nav.bar"
            :key="link.to"
            :to="link.to"
            :class="linkClass"
            :aria-current="active(link) ? 'page' : undefined"
          >
            {{ link.label }}
            <span v-if="countFor(link)" class="grid min-w-5.5 place-items-center rounded-full bg-primary px-1.5 text-xs leading-5.5 font-medium text-white">
              {{ countFor(link) }}<span class="sr-only"> waiting</span>
            </span>
          </NuxtLink>

          <ClientOnly v-if="nav.practice.length">
            <DropdownMenu>
              <DropdownMenuTrigger
                :class="[linkClass, 'group/practice cursor-pointer data-[state=open]:text-foreground', practiceActive ? 'bg-mint font-medium !text-deep' : '']"
              >
                Practice
                <CanopyGlyph name="chevron" :size="14" :stroke="2.4" class="transition-transform duration-200 ease-canopy group-data-[state=open]/practice:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" :side-offset="10" class="w-60" :class="menuPanel">
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

        <div class="ml-auto flex items-center gap-1.5">
          <ClientOnly><CanopyThemeToggle class="max-sm:hidden" /></ClientOnly>
          <ClientOnly><NotificationBell /></ClientOnly>
          <CanopyAccountMenu :links="accountLinks" />
        </div>
      </div>
    </div>
  </header>
</template>
