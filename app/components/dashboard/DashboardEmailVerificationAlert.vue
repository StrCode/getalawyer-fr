<template>
  <Card
    v-if="needsEmailAction"
    class="mb-6 border-amber-500/30 bg-amber-500/5 py-4"
  >
    <CardContent class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
          aria-hidden="true"
        >
          <PhEnvelopeSimple class="size-5" />
        </div>
        <div>
          <p class="font-medium text-foreground">
            {{ needsLinkEmail ? 'Link your email address' : 'Verify your email address' }}
          </p>
          <p class="mt-1 text-sm text-muted-foreground">
            <template v-if="needsLinkEmail">
              Add a real email for notifications and account recovery. You can finish onboarding first.
            </template>
            <template v-else>
              Confirm your email to receive booking updates and security alerts.
            </template>
          </p>
        </div>
      </div>
      <Button
        as-child
        size="sm"
        variant="outline"
        class="shrink-0 cursor-pointer border-amber-500/40 bg-background/80"
      >
        <NuxtLink to="/dashboard/verify-email">
          {{ needsLinkEmail ? 'Link email' : 'Verify email' }}
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { PhEnvelopeSimple } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const { needsLinkEmail, needsEmailAction } = useEmailVerificationPrompt()
</script>
