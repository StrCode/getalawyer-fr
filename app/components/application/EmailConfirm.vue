<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { authClient } from '~/lib/auth-client'

/**
 * Confirm the lawyer's email address before the application is submitted: a
 * code is sent to the address and typed in here. The decision on an application
 * goes out by email, so the address has to be one the lawyer can read. The
 * server refuses a submit until this is done; this is where it gets done.
 *
 * Shows a short confirmed line once the address is verified.
 */
const { session, refetchSession } = useAuth()

const email = computed(() => session.value?.user?.email ?? '')
const verified = computed(() => (session.value?.user as { emailVerified?: boolean } | undefined)?.emailVerified === true)

const sent = ref(false)
const code = ref('')
const error = ref('')
const sending = ref(false)
const checking = ref(false)
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startCooldown() {
  cooldown.value = 30
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

async function send() {
  if (sending.value || !email.value) return
  sending.value = true
  error.value = ''
  try {
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({ email: email.value, type: 'email-verification' })
    if (sendError) {
      error.value = sendError.message || 'We could not send the code. Try again in a moment.'
      return
    }
    sent.value = true
    code.value = ''
    startCooldown()
  }
  catch {
    error.value = 'We could not send the code. Check your connection and try again.'
  }
  finally {
    sending.value = false
  }
}

async function check() {
  if (checking.value || code.value.length !== 6) return
  checking.value = true
  error.value = ''
  try {
    const { error: verifyError } = await authClient.emailOtp.verifyEmail({ email: email.value, otp: code.value })
    if (verifyError) {
      error.value = verifyError.message || 'That code is not right. Check it and try again.'
      code.value = ''
      return
    }
    // The session caches the user; fetch it again so "verified" shows at once.
    await refetchSession()
  }
  catch {
    error.value = 'We could not check the code. Check your connection and try again.'
  }
  finally {
    checking.value = false
  }
}

// Six digits typed: check without making them press another button.
watch(code, (value) => { if (value.length === 6) void check() })
</script>

<template>
  <div v-if="verified" class="flex items-center gap-3 rounded-[1.1rem] border border-border bg-card px-4 py-[0.85rem]">
    <span class="grid size-[1.6rem] flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="12" :stroke="3.4" /></span>
    <span class="min-w-0"><b class="font-semibold">Email confirmed.</b> <span class="break-all text-muted-foreground">{{ email }}</span></span>
  </div>

  <section v-else aria-labelledby="email-confirm-title" class="rounded-[1.1rem] border border-border bg-card p-4">
    <h3 id="email-confirm-title" class="text-[0.95rem] leading-snug font-semibold">Confirm your email address</h3>
    <p class="mt-[0.2rem] text-[0.85rem] text-muted-foreground">
      We send the decision on your application to <b class="break-all font-semibold text-foreground">{{ email }}</b>. Confirm that it reaches you.
    </p>

    <Button v-if="!sent" type="button" variant="line" size="pill-sm" class="mt-3" :disabled="sending" :aria-busy="sending" @click="send">
      {{ sending ? 'Sending…' : 'Send me a code' }}
    </Button>

    <div v-else class="mt-3 max-w-[22rem]">
      <p class="mb-2 text-[0.9rem]">Enter the 6-digit code we sent.</p>
      <AuthOtpStep
        v-model="code"
        :error="error"
        :is-submitting="checking"
        :is-resending="sending"
        :resend-cooldown="cooldown"
        @resend="send"
      />
    </div>

    <p v-if="error && !sent" role="alert" class="mt-2 text-[0.9rem] font-semibold text-destructive">{{ error }}</p>
  </section>
</template>
