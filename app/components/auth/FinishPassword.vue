<script setup lang="ts">
import { toast } from 'vue-sonner'
import { httpClient } from '~/lib/api/client'
import { authPasswordSchema } from '~/lib/auth-password'

/**
 * Finish a phone sign-up that never got its password.
 *
 * Phone sign-up verifies the number first (which creates the account and signs
 * the person in) and saves the password in a second request. If that request
 * never lands, the account has no password and the person could not sign in
 * again. This asks the server whether a password exists and, if not, lets them
 * set one while they are still signed in. It renders nothing otherwise.
 */
const { session } = useAuth()
const { setPasswordAfterVerify } = usePhoneAuth()

// Only phone accounts can be in this state; do not ask for anyone else.
const hasPhone = computed(() => Boolean((session.value?.user as { phoneNumber?: string | null } | undefined)?.phoneNumber))
const missing = ref(false)

onMounted(async () => {
  if (!hasPhone.value) return
  try {
    const result = await httpClient.getAuth<{ hasPassword: boolean }>('/api/account/password-status')
    missing.value = result?.hasPassword === false
  }
  catch {
    // Could not ask: say nothing rather than alarm someone whose password is fine.
  }
})

const password = ref('')
const error = ref('')
const saving = ref(false)

async function save() {
  if (saving.value) return
  const parsed = authPasswordSchema.safeParse(password.value)
  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Choose a stronger password.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const { error: saveError } = await setPasswordAfterVerify(password.value)
    if (saveError) {
      error.value = saveError.message || 'We could not save your password. Try again.'
      return
    }
    missing.value = false
    toast.success('Password saved', { description: 'Use it with your phone number the next time you sign in.' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <form v-if="missing" class="mb-[1.4rem] rounded-[1.25rem] border border-warning/30 bg-warning/10 p-4" novalidate @submit.prevent="save">
    <h2 class="font-display text-[1.15rem] font-[650] tracking-[-0.02em] text-warning-subtle-foreground">Set your password</h2>
    <p class="mt-1 text-[0.92rem] text-warning-subtle-foreground">
      Your phone number is confirmed, but your password was not saved. Set one now, or you will not be able to sign in again.
    </p>
    <label for="finish-password" class="mt-3 block text-[0.9rem] font-semibold">Password</label>
    <AuthPasswordInput
      id="finish-password"
      v-model="password"
      name="new-password"
      autocomplete="new-password"
      placeholder="At least 8 characters"
      :aria-invalid="Boolean(error)"
      :disabled="saving"
      class="mt-[0.4rem]"
    />
    <p class="mt-[0.4rem] text-[0.85rem] text-muted-foreground">At least 8 characters, with one uppercase letter and one number.</p>
    <p v-if="error" role="alert" class="mt-2 text-[0.9rem] font-semibold text-destructive">{{ error }}</p>
    <AuthSubmit :loading="saving" class="mt-3">Save password</AuthSubmit>
  </form>
</template>
