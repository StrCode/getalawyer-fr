<script setup lang="ts">
import { CheckmarkCircle01Icon, Loading03Icon, Mail01Icon, SentIcon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { authClient } from '~/lib/auth-client'

const open = defineModel<boolean>('open', { default: false })

const { refetchSession } = useAuth()
const { user, needsLinkEmail, needsVerifyEmail, needsEmailAction } = useEmailVerificationPrompt()

const isSending = ref(false)
const sent = ref(false)
const apiError = ref('')

const title = computed(() => {
  if (needsLinkEmail.value) return 'Link your email'
  if (sent.value || needsVerifyEmail.value) return 'Check your inbox'
  return 'Email verified'
})

const description = computed(() => {
  if (needsLinkEmail.value) {
    return 'Add a real email for notifications and account recovery.'
  }
  if (sent.value) {
    return 'We sent a verification link. Click it to finish confirming your account.'
  }
  if (needsVerifyEmail.value) {
    return 'We’ll send a secure link to confirm this address.'
  }
  return 'Your email address is confirmed.'
})

const inboxUrl = computed(() => {
  const domain = user.value?.email?.split('@')[1]?.toLowerCase()
  if (!domain) return null

  const providers: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'googlemail.com': 'https://mail.google.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'live.com': 'https://outlook.live.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'icloud.com': 'https://www.icloud.com/mail',
  }

  return providers[domain] ?? null
})

watch(open, (isOpen) => {
  if (!isOpen) {
    sent.value = false
    apiError.value = ''
  }
})

watch(needsEmailAction, (needs) => {
  if (!needs && open.value) {
    open.value = false
  }
})

async function sendVerificationLink() {
  const email = user.value?.email
  if (!email) return

  apiError.value = ''
  isSending.value = true
  try {
    const origin = import.meta.client ? window.location.origin : ''
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${origin}/dashboard`,
    })
    if (error) {
      apiError.value = error.message || 'Could not send verification email.'
      return
    }
    sent.value = true
  } catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'Could not send verification email.'
  } finally {
    isSending.value = false
  }
}

async function onLinkCompleted() {
  await refetchSession()
  open.value = false
}

function openInbox() {
  if (!inboxUrl.value || !import.meta.client) return
  window.open(inboxUrl.value, '_blank', 'noopener,noreferrer')
}

function handleOpenChange(value: boolean) {
  open.value = value
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="gap-0 overflow-hidden border-border/60 p-0 sm:max-w-[440px]"
      :show-close-button="true"
    >
      <div class="px-6 pb-6 pt-8 text-center">
        <div
          class="mx-auto mb-5 flex size-16 items-center justify-center rounded-full"
          :class="sent ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'"
        >
          <HugeiconsIcon
            :icon="sent ? CheckmarkCircle01Icon : SentIcon"
            class="size-8"
          />
        </div>

       <h2 class="text-xl font-medium text-foreground">
          {{ title }}
        </h2>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {{ description }}
        </p>

        <div
          v-if="user?.email && !needsLinkEmail"
          class="mx-auto mt-4 inline-flex max-w-full items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1.5"
        >
          <HugeiconsIcon
            :icon="Mail01Icon"
            class="mr-2 size-4 shrink-0 text-muted-foreground"
          />
          <span class="truncate text-sm font-medium text-foreground">
            {{ user.email }}
          </span>
        </div>
      </div>

      <div class="border-t border-border/60 px-6 py-5">
        <div v-if="needsLinkEmail" class="space-y-4">
          <form @submit.prevent="async () => {
            isSending = true
            apiError = ''
            const formElement = $event.target as HTMLFormElement
            const formData = new FormData(formElement)
            const email = formData.get('email') as string
            try {
              const { error } = await authClient.updateUser({ email })
              if (error) throw error
              await onLinkCompleted()
            } catch (err: any) {
              apiError = err.message || 'Failed to update email'
            } finally {
              isSending = false
            }
          }" class="space-y-3">
            <div class="space-y-2 text-left">
              <Label for="link-email">Email address</Label>
              <Input
                id="link-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div v-if="apiError" class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <HugeiconsIcon :icon="AlertCircleIcon" class="h-4 w-4 shrink-0" />
              {{ apiError }}
            </div>

            <Button
              type="submit"
              class="h-11 w-full"
              :disabled="isSending"
            >
              <HugeiconsIcon
                v-if="isSending"
                :icon="Loading03Icon"
                class="mr-2 size-4 animate-spin"
              />
              Update email
            </Button>
          </form>
        </div>

        <div
          v-else-if="needsVerifyEmail"
          class="space-y-4"
        >
          <div
            v-if="sent"
            class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-left text-sm text-muted-foreground"
          >
            <p class="font-medium text-foreground">
              Verification email sent
            </p>
            <p class="mt-1">
              Didn&apos;t get it? Check spam or resend the link below.
            </p>
          </div>

          <div v-if="apiError" class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <HugeiconsIcon :icon="AlertCircleIcon" class="h-4 w-4 shrink-0" />
            {{ apiError }}
          </div>

          <div class="space-y-2">
            <Button
              v-if="inboxUrl && sent"
              type="button"
              variant="outline"
              class="h-11 w-full cursor-pointer"
              @click="openInbox"
            >
              Open inbox
            </Button>

            <Button
              type="button"
              class="h-11 w-full cursor-pointer"
              :disabled="isSending"
              @click="sendVerificationLink"
            >
              <HugeiconsIcon
                v-if="isSending"
                :icon="Loading03Icon"
                class="mr-2 size-4 animate-spin"
              />
              {{ sent ? 'Resend verification link' : 'Send verification link' }}
            </Button>
          </div>

          <p class="text-center text-xs text-muted-foreground">
            Wrong address?
            <NuxtLink
              to="/dashboard/settings"
              class="font-medium text-primary hover:underline"
              @click="open = false"
            >
              Update in settings
            </NuxtLink>
          </p>
        </div>

        <div
          v-else
          class="space-y-4 text-center"
        >
          <p class="text-sm text-muted-foreground">
            You&apos;re all set to receive booking and security updates.
          </p>
          <Button
            type="button"
            class="h-11 w-full cursor-pointer"
            @click="open = false"
          >
            Done
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
