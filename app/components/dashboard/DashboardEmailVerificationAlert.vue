<template>
  <div
    v-if="needsEmailAction"
    class="flex flex-col gap-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 items-start gap-3">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <HugeiconsIcon
          :icon="Mail01Icon"
          class="size-5"
        />
      </div>
      <div class="min-w-0">
        <p class="font-medium text-foreground">
          {{ needsLinkEmail ? 'Link your email address' : 'Verify your email address' }}
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          <template v-if="needsLinkEmail">
            Add a real email for notifications and account recovery.
          </template>
          <template v-else>
            Confirm your email to receive booking updates and security alerts.
          </template>
        </p>
        <p
          v-if="user?.email && !needsLinkEmail"
          class="mt-2 truncate text-sm font-medium text-foreground"
        >
          {{ user.email }}
        </p>
      </div>
    </div>

    <Button
      type="button"
      size="sm"
      class="w-full shrink-0 cursor-pointer sm:w-auto"
      @click="openDialog"
    >
      {{ needsLinkEmail ? 'Link email' : 'Verify email' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'

const { user, needsLinkEmail, needsEmailAction } = useEmailVerificationPrompt()
const { openDialog } = useEmailVerificationDialog()
</script>
