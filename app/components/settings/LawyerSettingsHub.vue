<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
const links = [
  {
    title: 'Public profile',
    description: 'Photo, about, experience, and everything clients see.',
    href: '/dashboard/profile',
    icon: appIcons.userCircle,
  },
  {
    title: 'Consultation types',
    description: 'Pricing, duration, and meeting formats you offer.',
    href: '/dashboard/consultation-types',
    icon: appIcons.creditCard,
  },
  {
    title: 'Availability',
    description: 'Weekly schedule and date exceptions.',
    href: '/dashboard/availability',
    icon: appIcons.calendarBlank,
  },
  {
    title: 'Subscription',
    description: 'Membership billing and payment method.',
    href: '/dashboard/subscription',
    icon: appIcons.creditCard,
  },
  {
    title: 'Public profile preview',
    description: 'Open your live client-facing page in a new tab.',
    href: '/dashboard/profile',
    icon: appIcons.globeHemisphereWest,
    hint: 'Use “View public profile” on the profile editor.',
  },
] as const
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <NuxtLink
      v-for="item in links"
      :key="item.title"
      :to="item.href"
      class="group block rounded-xl focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring"
    >
      <Card class="h-full transition-colors group-hover:border-primary/30 group-hover:bg-muted/30">
        <CardHeader class="pb-2">
          <div class="flex items-start gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background"
            >
              <AppIcon :icon="item.icon"
                class="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div class="min-w-0">
              <CardTitle class="text-base">
                {{ item.title }}
              </CardTitle>
              <CardDescription class="mt-1">
                {{ item.description }}
              </CardDescription>
              <p
                v-if="'hint' in item && item.hint"
                class="mt-2 text-xs text-muted-foreground"
              >
                {{ item.hint }}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-0">
          <span class="text-xs font-medium text-primary underline-offset-4 group-hover:underline">
            Open
          </span>
        </CardContent>
      </Card>
    </NuxtLink>
  </div>
</template>
