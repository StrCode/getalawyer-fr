<template>
  <div class="space-y-6">
    <SettingsSectionCard
      title="Help & support"
      description="Get answers or reach our team."
    >
      <ul class="divide-y divide-border/80">
        <li class="flex items-center justify-between gap-4 py-4 first:pt-0">
          <div>
            <p class="text-sm font-medium text-foreground">
              Contact us
            </p>
            <p class="text-xs text-muted-foreground">
              Questions about bookings, your account, or using GetALawyer
            </p>
          </div>
          <Button
            as-child
            variant="outline"
            size="sm"
          >
            <NuxtLink to="/contact">
              Open form
            </NuxtLink>
          </Button>
        </li>
        <li class="flex items-center justify-between gap-4 py-4 last:pb-0">
          <div>
            <p class="text-sm font-medium text-foreground">
              Email support
            </p>
            <p class="text-xs text-muted-foreground">
              support@getalawyer.ng
            </p>
          </div>
          <Button
            as-child
            variant="outline"
            size="sm"
          >
            <a href="mailto:support@getalawyer.ng">
              Email
            </a>
          </Button>
        </li>
      </ul>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
</script>
