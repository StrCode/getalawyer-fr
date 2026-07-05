<template>
  <div class="mx-auto w-full max-w-lg space-y-6">
    <AppPageHeader
      title="Email verification"
      description="Link or verify your email from your dashboard — not required to complete onboarding."
    />

    <AuthLinkEmailCard
      v-if="needsLinkEmail"
      @completed="onCompleted"
    />

    <Card
      v-else-if="needsVerifyEmail"
      class="gap-0 overflow-hidden rounded-2xl border border-border/50 p-6 shadow-sm sm:p-8"
    >
      <header class="mb-6">
        <h2 class="text-xl font-semibold text-foreground">Verify your email</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          We&apos;ll send a link to <strong class="text-foreground">{{ user?.email }}</strong>.
        </p>
      </header>

      <AuthFormError :message="apiError" />

      <p
        v-if="sent"
        class="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
      >
        Verification link sent. Check your inbox and spam folder.
      </p>

      <Button
        type="button"
        class="h-11 w-full cursor-pointer"
        :disabled="isSending"
        @click="sendVerificationLink"
      >
        <AppIcon :icon="appIcons.circleNotch" v-if="isSending" class="mr-2 size-4 animate-spin" />
        {{ sent ? 'Resend verification link' : 'Send verification link' }}
      </Button>
    </Card>

    <Card
      v-else
      class="gap-0 p-6 text-center sm:p-8"
    >
      <AppIcon :icon="appIcons.checkCircle" class="mx-auto mb-4 size-12 text-primary" />
      <p class="text-base text-muted-foreground">Your email is verified.</p>
      <Button as-child class="mt-6 cursor-pointer">
        <NuxtLink to="/dashboard">Back to dashboard</NuxtLink>
      </Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Verify email - GetALawyer',
})

const { refetchSession } = useAuth()
const { user, needsLinkEmail, needsVerifyEmail } = useEmailVerificationPrompt()

const isSending = ref(false)
const sent = ref(false)
const apiError = ref('')

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

async function onCompleted() {
  await refetchSession()
  await navigateTo('/dashboard', { replace: true })
}
</script>
