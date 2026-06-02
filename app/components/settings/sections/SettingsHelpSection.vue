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
              FAQ / Help centre
            </p>
            <p class="text-xs text-muted-foreground">
              Common questions about bookings and verification
            </p>
          </div>
          <Button
            as-child
            variant="outline"
            size="sm"
          >
            <a
              href="https://getalawyer.ng/help"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
          </Button>
        </li>
        <li class="flex items-center justify-between gap-4 py-4">
          <div>
            <p class="text-sm font-medium text-foreground">
              Contact support
            </p>
            <p class="text-xs text-muted-foreground">
              support@getalawyer.ng
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            Contact
          </Button>
        </li>
        <li class="flex items-center justify-between gap-4 py-4 last:pb-0">
          <div>
            <p class="text-sm font-medium text-foreground">
              Report a lawyer
            </p>
            <p class="text-xs text-muted-foreground">
              Flag misconduct or policy violations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            Report
          </Button>
        </li>
      </ul>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Your data"
      description="Export or remove your account data."
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-foreground">
            Download my data
          </p>
          <p class="text-xs text-muted-foreground">
            Receive a copy of your profile, messages, and documents
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="toast.info('Export requested', { description: 'We\'ll email you when your archive is ready.' })"
        >
          <PhDownloadSimple class="size-4" />
          Request export
        </Button>
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Account status"
      description="Temporarily pause or permanently delete your account."
      content-class="space-y-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/20 p-4">
        <div>
          <p class="text-sm font-medium text-foreground">
            Deactivate account
          </p>
          <p class="text-xs text-muted-foreground">
            Hide your profile and pause bookings. You can reactivate anytime.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
        >
          Deactivate
        </Button>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div>
          <p class="text-sm font-medium text-destructive">
            Delete account
          </p>
          <p class="text-xs text-muted-foreground">
            Permanently remove your data. This cannot be undone.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
        >
          Delete account
        </Button>
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import { PhDownloadSimple } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
</script>
