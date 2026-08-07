<script setup lang="ts">
import { Calendar01Icon, CreditCardIcon, LegalDocument01Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const links = [
  {
    title: 'Public profile',
    description: 'Photo, about, experience, and everything clients see in search.',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
  },
  {
    title: 'Consultation types',
    description: 'Pricing, duration, and meeting formats you offer.',
    href: '/dashboard/consultation-types',
    icon: LegalDocument01Icon,
  },
  {
    title: 'Availability',
    description: 'Weekly schedule and date exceptions.',
    href: '/dashboard/availability',
    icon: Calendar01Icon,
  },
  {
    title: 'Subscription',
    description: 'Membership billing and payment method.',
    href: '/dashboard/subscription',
    icon: CreditCardIcon,
  },
] as const
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle>
        Practice setup
      </CardTitle>
      <CardDescription>
        Configure how clients find and book you.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="item in links"
        :key="item.title"
        :to="item.href"
        class="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring"
      >
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card"
        >
          <HugeiconsIcon
            :icon="item.icon"
            class="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground group-hover:text-primary">
            {{ item.title }}
          </p>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
      </NuxtLink>
    </CardContent>
  </Card>
</template>
