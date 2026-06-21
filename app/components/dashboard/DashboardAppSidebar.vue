<template>
  <Sidebar
    collapsible="icon"
    side="left"
    variant="sidebar"
    class="border-0 bg-sidebar text-sidebar-foreground [&_[data-sidebar=sidebar]]:border-r [&_[data-sidebar=sidebar]]:border-sidebar-border [&_[data-sidebar=sidebar]]:bg-sidebar"
  >
    <SidebarHeader class="border-b border-sidebar-border px-2 py-3 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2.5">
      <div
        class="flex w-full gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5"
        :class="isIconCollapsed ? 'flex-col items-center gap-1.5' : 'flex-row items-center justify-between'"
      >
        <div
          class="flex min-w-0 items-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
          :class="isIconCollapsed ? 'w-full justify-center' : 'flex-1'"
        >
          <LandingBrandLogo
            to="/dashboard"
            :show-wordmark="state === 'expanded'"
          />
        </div>
        <SidebarTrigger
          class="hidden shrink-0 text-sidebar-foreground md:inline-flex"
          aria-label="Toggle sidebar"
        />
      </div>

      <p
        v-if="workspaceLabel && state === 'expanded'"
        class="mt-2 truncate px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase group-data-[collapsible=icon]:hidden"
      >
        {{ workspaceLabel }}
      </p>
    </SidebarHeader>

    <SidebarContent class="gap-0 px-2.5 py-3">
      <div
        class="mb-3 px-0.5 group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
      >
        <Button
          as-child
          class="h-11 w-full cursor-pointer text-[15px] shadow-xs group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0"
        >
          <NuxtLink
            :to="primaryCta.to"
            :title="primaryCta.label"
            class="gap-2.5 font-semibold"
          >
            <component
              :is="primaryCta.icon"
              class="size-[22px] shrink-0"
              weight="bold"
            />
            <span class="group-data-[collapsible=icon]:hidden">{{ primaryCta.label }}</span>
          </NuxtLink>
        </Button>
      </div>

      <DashboardNavMenu
        :label="mainGroupLabel"
        :items="mainLinks"
      />

      <SidebarSeparator class="my-3 bg-sidebar-border/80" />

      <DashboardNavMenu
        label="Account"
        :items="supportLinks"
      />
    </SidebarContent>

    <SidebarFooter class="gap-2 border-t border-sidebar-border p-2 group-data-[collapsible=icon]:px-1.5">
      <NuxtLink
        v-if="showUpgradePrompt"
        to="/dashboard/subscription"
        class="block group-data-[collapsible=icon]:hidden"
      >
        <Card class="gap-0 overflow-hidden border-primary/20 bg-primary/5 py-0 shadow-none transition-colors hover:border-primary/30 hover:bg-primary/10">
          <CardContent class="px-3 py-2.5">
            <p class="font-semibold text-foreground text-xs">
              Activate subscription
            </p>
            <p class="mt-0.5 text-muted-foreground text-[11px] leading-snug">
              Start receiving client bookings
            </p>
          </CardContent>
        </Card>
      </NuxtLink>

      <UserDropdown
        variant="sidebar"
        :collapsed="isIconCollapsed"
      />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import DashboardNavMenu from '@/components/dashboard/DashboardNavMenu.vue'
import type { DashboardNavItem } from '@/types/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

const props = defineProps<{
  mainLinks: DashboardNavItem[]
  supportLinks: DashboardNavItem[]
  mainGroupLabel?: string
}>()

const { session } = useAuth()
const { state, isMobile } = useSidebar()
const { primaryCta, mainGroupLabel: defaultMainGroupLabel } = useDashboardNavItems()

const role = computed(() => session.value?.user.userType)

const { data: subscriptionStatus, isFetched: subscriptionFetched } = useSubscriptionStatus({
  enabled: computed(() => role.value === 'lawyer'),
})

const mainGroupLabel = computed(() => {
  if (props.mainGroupLabel)
    return props.mainGroupLabel
  return defaultMainGroupLabel.value
})

const workspaceLabel = computed(() => {
  if (role.value === 'lawyer')
    return 'Lawyer workspace'
  if (role.value === 'client')
    return 'Client workspace'
  return undefined
})

const isIconCollapsed = computed(() => state.value === 'collapsed' && !isMobile.value)

const showUpgradePrompt = computed(() => {
  return role.value === 'lawyer'
    && subscriptionFetched.value
    && !subscriptionStatus.value?.hasActiveSubscription
})
</script>
