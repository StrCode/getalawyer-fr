<template>
  <header
    class="flex h-14 shrink-0 items-center border-b border-border/60 bg-card md:h-16"
  >
    <div class="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 items-center gap-2 px-6 sm:px-8 md:gap-3 lg:px-10">
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

const { items } = useDashboardBreadcrumb()

const currentLabel = computed(() => items.value.at(-1)?.label ?? 'Dashboard')
</script>
