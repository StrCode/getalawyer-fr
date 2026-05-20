<template>
  <header
    class="flex h-14 shrink-0 items-center border-border border-b bg-card md:h-16"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2 px-4 md:gap-3">
      <SidebarTrigger
        class="-ml-1 shrink-0"
        aria-label="Toggle sidebar"
      />
      <Separator
        orientation="vertical"
        class="h-4 shrink-0"
      />
      <Breadcrumb class="min-w-0 md:hidden">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage class="truncate">
              {{ currentLabel }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb class="hidden min-w-0 md:block">
        <BreadcrumbList>
          <template
            v-for="(crumb, index) in items"
            :key="`${crumb.label}-${index}`"
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                v-if="crumb.to"
                as-child
              >
                <NuxtLink :to="crumb.to">
                  {{ crumb.label }}
                </NuxtLink>
              </BreadcrumbLink>
              <BreadcrumbPage v-else>
                {{ crumb.label }}
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < items.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const { items } = useDashboardBreadcrumb()

const currentLabel = computed(() => items.value.at(-1)?.label ?? 'Dashboard')
</script>
