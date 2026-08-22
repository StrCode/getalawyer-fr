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
import { cn } from '@/lib/utils'
import type { DashboardNavBadge } from '@/composables/useDashboardNavBadges'
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

const DEFAULT_BADGE_CLASS =
  'ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary tabular-nums'

const route = useRoute()
const { session } = useAuth()
const { isMobile, setOpenMobile } = useSidebar()

const role = computed(() => getSessionUserType(session.value?.user) as 'lawyer' | 'client' | undefined)

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  unreadNotificationsBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
  lawyerListingBadge,
  lawyerConsultationTypesBadge,
  lawyerAvailabilityBadge,
} = useDashboardNavBadges()

const navLinks = computed(() => {
  if (!role.value)
    return []
  const links = getDashboardNavForRole(role.value)
  if (!links)
    return []
  return filterNavForRole(links, role.value)
})

// Consecutive links sharing a group render as one labeled section;
// ungrouped links (Overview) form their own label-less section on top.
const navSections = computed(() => {
  const sections: { label: string | null, links: DashboardNavLink[] }[] = []
  for (const link of navLinks.value) {
    const label = link.group ?? null
    const last = sections[sections.length - 1]
    if (last && last.label === label)
      last.links.push(link)
    else
      sections.push({ label, links: [link] })
  }
  return sections
})

const badgeMap = computed<Record<string, DashboardNavBadge | undefined>>(() => ({
  '/dashboard/bookings': clientUpcomingBookingsBadge.value,
  '/dashboard/messages': unreadMessagesBadge.value,
  '/dashboard/notifications': unreadNotificationsBadge.value,
  '/dashboard/cases': activeCasesBadge.value,
  '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  '/dashboard/subscription': lawyerSubscriptionBadge.value,
  '/dashboard/profile': lawyerListingBadge.value,
  '/dashboard/consultation-types': lawyerConsultationTypesBadge.value,
  '/dashboard/availability': lawyerAvailabilityBadge.value,
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

function badgesFor(link: DashboardNavLink): DashboardNavBadge[] {
  const badge = linkBadge(link)
  return badge ? [badge] : []
}

function badgeClass(badge: DashboardNavBadge) {
  return cn(DEFAULT_BADGE_CLASS, badge.className)
}

function navTooltip(link: DashboardNavLink) {
  const badge = linkBadge(link)
  if (badge)
    return `${link.title} (${badge.label})`
  return link.title
}
</script>

<template>
  <SidebarGroup
    v-for="(section, index) in navSections"
    :key="section.label ?? `section-${index}`"
  >
    <SidebarGroupLabel
      v-if="section.label"
      class="text-[0.65rem] uppercase tracking-[0.22em]"
    >
      {{ section.label }}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <!-- gap-0: dense flush 32px rhythm instead of shadcn's default gap-1. -->
      <SidebarMenu class="gap-0">
        <SidebarMenuItem
          v-for="link in section.links"
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
                v-for="badge in badgesFor(link)"
                :key="`${link.to}-badge`"
                :class="badgeClass(badge)"
              >
                {{ badge.label }}
              </SidebarMenuBadge>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
