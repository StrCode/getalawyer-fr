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
const { requestLinkEmail, verifyLinkEmail } = useAccountLinking()

const isSending = ref(false)
const isVerifyingOtp = ref(false)
const sent = ref(false)
const apiError = ref('')
const otpError = ref('')

/** Phone-signup link-email flow */
const linkEmail = ref('')
const linkOtpSent = ref(false)
const linkOtp = ref('')

const title = computed(() => {
  if (needsLinkEmail.value) {
    return linkOtpSent.value ? 'Enter verification code' : 'Link your email'
  }
  if (sent.value || needsVerifyEmail.value) return 'Check your inbox'
  return 'Email verified'
})

const description = computed(() => {
  if (needsLinkEmail.value) {
    if (linkOtpSent.value) {
      return `We sent a 6-digit code to ${linkEmail.value}. Enter it to finish linking.`
    }
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
  const email = needsLinkEmail.value ? linkEmail.value : user.value?.email
  const domain = email?.split('@')[1]?.toLowerCase()
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

function resetDialogState() {
  sent.value = false
  apiError.value = ''
  otpError.value = ''
  linkEmail.value = ''
  linkOtpSent.value = false
  linkOtp.value = ''
  isSending.value = false
  isVerifyingOtp.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetDialogState()
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
      callbackURL: `${origin}/dashboard?emailVerified=1`,
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

async function sendLinkEmailCode() {
  const email = linkEmail.value.trim()
  if (!email) {
    apiError.value = 'Enter an email address.'
    return
  }

  apiError.value = ''
  otpError.value = ''
  isSending.value = true
  try {
    await requestLinkEmail(email)
    linkOtpSent.value = true
    linkOtp.value = ''
  } catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'Could not send verification code.'
  } finally {
    isSending.value = false
  }
}

async function confirmLinkEmailOtp() {
  if (linkOtp.value.length < 6) {
    otpError.value = 'Please enter the full 6-digit code.'
    return
  }

  otpError.value = ''
  apiError.value = ''
  isVerifyingOtp.value = true
  try {
    await verifyLinkEmail(linkEmail.value.trim(), linkOtp.value)
    await refetchSession()
    open.value = false
  } catch (err: unknown) {
    otpError.value = err instanceof Error ? err.message : 'Invalid or expired verification code.'
  } finally {
    isVerifyingOtp.value = false
  }
}

watch(linkOtp, (value) => {
  if (value.length === 6 && linkOtpSent.value && needsLinkEmail.value && !isVerifyingOtp.value) {
    void confirmLinkEmailOtp()
  }
})

function changeLinkEmail() {
  linkOtpSent.value = false
  linkOtp.value = ''
  otpError.value = ''
  apiError.value = ''
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
      class="gap-0 overflow-hidden border-foreground/15 p-0 sm:max-w-[440px]"
      :show-close-button="true"
    >
      <div class="px-6 pb-6 pt-8 text-center">
        <div
          class="mx-auto mb-5 flex size-16 items-center justify-center rounded-full"
          :class="(sent || linkOtpSent) ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'"
        >
          <HugeiconsIcon
            :icon="(sent || linkOtpSent) ? CheckmarkCircle01Icon : SentIcon"
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
          class="mx-auto mt-4 inline-flex max-w-full items-center rounded-full border border-foreground/15 bg-muted/40 px-3 py-1.5"
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

      <div class="border-t border-foreground/15 px-6 py-5">
        <div
          v-if="needsLinkEmail"
          class="space-y-4"
        >
          <form
            v-if="!linkOtpSent"
            class="space-y-3"
            @submit.prevent="sendLinkEmailCode"
          >
            <div class="space-y-2 text-left">
              <Label for="link-email">Email address</Label>
              <Input
                id="link-email"
                v-model="linkEmail"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

            <div
              v-if="apiError"
              class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <HugeiconsIcon
                :icon="AlertCircleIcon"
                class="h-4 w-4 shrink-0"
              />
              {{ apiError }}
            </div>

            <Button
              type="submit"
              class="h-11 w-full cursor-pointer"
              :disabled="isSending"
            >
              <HugeiconsIcon
                v-if="isSending"
                :icon="Loading03Icon"
                class="mr-2 size-4 animate-spin"
              />
              Send verification code
            </Button>
          </form>

          <div
            v-else
            class="space-y-4"
          >
            <AuthOtpStep
              v-model="linkOtp"
              :error="otpError"
              :is-submitting="isVerifyingOtp"
              :is-resending="isSending"
              @resend="sendLinkEmailCode"
              @request-new-code="sendLinkEmailCode"
            />
            <AuthDevOtpHint />

            <div
              v-if="apiError"
              class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <HugeiconsIcon
                :icon="AlertCircleIcon"
                class="h-4 w-4 shrink-0"
              />
              {{ apiError }}
            </div>

            <Button
              type="button"
              class="h-11 w-full cursor-pointer"
              :disabled="isVerifyingOtp || linkOtp.length < 6"
              @click="confirmLinkEmailOtp"
            >
              <HugeiconsIcon
                v-if="isVerifyingOtp"
                :icon="Loading03Icon"
                class="mr-2 size-4 animate-spin"
              />
              Verify and link email
            </Button>

            <div class="flex flex-col gap-2">
              <Button
                v-if="inboxUrl"
                type="button"
                variant="outline"
                class="h-11 w-full cursor-pointer"
                @click="openInbox"
              >
                Open inbox
              </Button>
              <button
                type="button"
                class="cursor-pointer text-center text-xs font-medium text-primary hover:underline"
                @click="changeLinkEmail"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="needsVerifyEmail"
          class="space-y-4"
        >
          <div
            v-if="sent"
            class="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-left text-sm text-muted-foreground"
          >
            <p class="font-medium text-foreground">
              Verification email sent
            </p>
            <p class="mt-1">
              Didn&apos;t get it? Check spam or resend the link below.
            </p>
          </div>

          <div
            v-if="apiError"
            class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <HugeiconsIcon
              :icon="AlertCircleIcon"
              class="h-4 w-4 shrink-0"
            />
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
