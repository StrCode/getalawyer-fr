<template>
  <section class="overflow-hidden rounded-card border border-border bg-card">
    <header class="border-b border-border px-4.5 py-4.5 lg:px-5.75 xl:px-6">
      <h2 class="font-display text-lg font-normal tracking-tight">Help & support</h2>
      <p class="mt-0.75 text-sm text-muted-foreground">Questions about bookings, your account or how getalawyer works.</p>
    </header>

    <div class="divide-y divide-border">
      <SettingsRow label="Write to us" hint="Tell us what it is about on the contact page.">
        <template #action>
          <Button as-child variant="line" size="pill-sm">
            <NuxtLink to="/contact">Open the form</NuxtLink>
          </Button>
        </template>
      </SettingsRow>

      <SettingsRow label="Email support" hint="From your own email app.">
        <a :href="`mailto:${SUPPORT_EMAIL}`" class="min-w-0 truncate font-medium text-brand underline underline-offset-3">{{ SUPPORT_EMAIL }}</a>
        <template #action>
          <Button as-child variant="line" size="pill-sm">
            <a :href="`mailto:${SUPPORT_EMAIL}`">Email us</a>
          </Button>
        </template>
      </SettingsRow>
    </div>
  </section>
</template>

<script setup lang="ts">
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { Button } from '@/components/ui/button'

/** Ways to reach a person, in the same rows as the sign-in details. */
</script>
