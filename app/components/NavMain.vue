<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  filterNavForRole,
  getDashboardNavForRole,
  getNavBadgeKey,
  isDashboardNavActive,
  type DashboardNavLink,
} from '@/lib/dashboard-nav'
import { getSessionUserType } from '@/lib/session-user'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const route = useRoute()
const { session } = useAuth()
const { isMobile, setOpenMobile } = useSidebar()

const role = computed(() => getSessionUserType(session.value?.user) as 'lawyer' | 'client' | undefined)

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
} = useDashboardNavBadges()

const navLinks = computed(() => {
  if (!role.value)
    return []
  const links = getDashboardNavForRole(role.value)
  if (!links)
    return []
  return filterNavForRole(links, role.value)
})

const badgeMap = computed<Record<string, string | undefined>>(() => ({
  '/dashboard/bookings': clientUpcomingBookingsBadge.value,
  '/dashboard/messages': unreadMessagesBadge.value,
  '/dashboard/cases': activeCasesBadge.value,
  '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  '/dashboard/subscription': lawyerSubscriptionBadge.value,
}))

function onNavClick() {
  if (isMobile.value)
    setOpenMobile(false)
}

function linkActive(link: DashboardNavLink) {
  return isDashboardNavActive(route.path, link)
}

function linkBadge(link: DashboardNavLink) {
  return badgeMap.value[getNavBadgeKey(link.to)]
}

function navTooltip(link: DashboardNavLink) {
  const badge = linkBadge(link)
  if (badge)
    return `${link.title} (${badge})`
  return link.title
}
</script>

<template>
  <SidebarGroup v-if="navLinks.length">
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem
          v-for="link in navLinks"
          :key="link.to"
        >
          <SidebarMenuButton
            as-child
            :tooltip="navTooltip(link)"
            :is-active="linkActive(link)"
          >
            <NuxtLink :to="link.to" @click="onNavClick">
              <HugeiconsIcon v-if="link.icon" :icon="link.icon" />
              <span>{{ link.title }}</span>
              <SidebarMenuBadge
                v-if="linkBadge(link)"
                class="ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary tabular-nums"
              >
                {{ linkBadge(link) }}
              </SidebarMenuBadge>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
