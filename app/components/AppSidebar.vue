<script setup lang="ts">
import NavMain from '@/components/NavMain.vue'
import UserMenu from '@/components/UserMenu.vue'
import LandingBrandLogo from '@/components/landing/LandingBrandLogo.vue'
import { getSessionUserType } from '@/lib/session-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

withDefaults(
  defineProps<{
    variant?: 'sidebar' | 'floating' | 'inset'
  }>(),
  { variant: 'inset' },
)

const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))

const { state, isMobile } = useSidebar()
// Hide the wordmark when the sidebar is collapsed to the icon rail (but keep it in the mobile sheet).
const showWordmark = computed(() => isMobile.value || state.value !== 'collapsed')

const { data: subscriptionStatus, isFetched: subscriptionFetched } = useSubscriptionStatus({
  enabled: computed(() => role.value === 'lawyer'),
})

const showUpgradePrompt = computed(() => {
  return role.value === 'lawyer'
    && subscriptionFetched.value
    && !subscriptionStatus.value?.hasActiveSubscription
})
</script>

<template>
  <Sidebar
    :variant="variant"
    collapsible="icon"
  >
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            size="lg"
            class="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <LandingBrandLogo
              to="/dashboard"
              :show-wordmark="showWordmark"
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <NavMain />
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border">
      <NuxtLink
        v-if="showUpgradePrompt"
        to="/dashboard/subscription"
        class="group mb-2 block rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
      >
        <p class="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
          Activate subscription
          <span class="text-primary transition-transform duration-200 ease-luxe group-hover:translate-x-0.5" aria-hidden="true">→</span>
        </p>
        <p class="mt-0.5 text-2xs leading-snug text-muted-foreground">
          Start receiving client bookings
        </p>
      </NuxtLink>

      <div class="rounded-lg border border-sidebar-border bg-sidebar p-1">
        <UserMenu variant="sidebar" />
      </div>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
