<script setup lang="ts">
import { dashboardPageTitle } from '@/lib/dashboard-nav'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const route = useRoute()

const pageTitle = computed(() => dashboardPageTitle(route.path))
</script>

<template>
  <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear">
    <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <SidebarTrigger class="-ml-1 cursor-pointer" />
      <Separator
        orientation="vertical"
        class="mx-2 data-[orientation=vertical]:h-4"
      />
      <h1 class="font-heading text-base font-medium tracking-tight">
        {{ pageTitle }}
      </h1>
    </div>
  </header>
</template>
