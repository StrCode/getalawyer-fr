<template>
  <AuthPageLayout>
    <template #illustration>
      <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
        Recover your account.
      </h2>
      <p class="text-brand-cream-warm/80 text-lg">
        Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.
      </p>
    </template>

    <AuthLogo class="mb-10 lg:hidden" />

    <h1 class="mb-3 font-heading font-semibold text-3xl text-foreground tracking-tight">
      Enter verification code
    </h1>
    <p class="mb-6 text-muted-foreground text-sm leading-relaxed">
      We sent a 6-digit code to <strong class="text-foreground">{{ email }}</strong>.
    </p>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="space-y-3">
        <Label class="sr-only">Verification code</Label>
        <InputOTP
          v-model="formData.otp"
          :maxlength="6"
          :disabled="isSubmitting"
          class="gap-2 justify-center w-full"
        >
          <InputOTPGroup>
            <InputOTPSlot
              v-for="i in 6"
              :key="i"
              :index="i - 1"
              class="h-12 w-10 text-lg"
            />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <p class="text-muted-foreground text-sm text-center leading-relaxed">
        Code expires in a few minutes.
        <Button
          type="button"
          variant="link"
          class="h-auto p-0 font-medium"
          :disabled="isResending"
          @click="handleResend"
        >
          {{ isResending ? 'Sending…' : 'Resend code' }}
        </Button>
      </p>

      <div
        v-if="error"
        role="alert"
        class="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
      >
        <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <Button
        type="submit"
        class="w-full h-11"
        size="lg"
        :disabled="isSubmitting || formData.otp.length !== 6"
      >
        Verify code
      </Button>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-sm">
      <NuxtLink
        to="/forgot-password"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to forgot password
      </NuxtLink>
    </p>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

const route = useRoute()
const router = useRouter()

const email = computed(() => (route.query.email as string) || '')

const formData = reactive({ otp: '' })
const isSubmitting = ref(false)
const isResending = ref(false)
const error = ref('')

onMounted(() => {
  if (!email.value) {
    router.replace('/forgot-password')
  }
})

const handleSubmit = async () => {
  error.value = ''

  if (formData.otp.length !== 6) {
    error.value = 'Please enter the full 6-digit code.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await authClient.emailOtp.checkVerificationOtp({
      email: email.value,
      type: 'forget-password',
      otp: formData.otp,
    })

    if (result.error) {
      throw new Error(result.error.message || 'Invalid verification code')
    }

    router.push({
      path: '/reset-password',
      query: {
        email: email.value,
        otp: formData.otp,
      },
    })
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('TOO_MANY_ATTEMPTS')) {
      error.value = 'Too many attempts. Please request a new code.'
    }
    else if (msg.includes('expired')) {
      error.value = 'This code has expired. Please request a new one.'
    }
    else {
      error.value = msg || 'Invalid verification code. Please try again.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

const handleResend = async () => {
  error.value = ''
  isResending.value = true

  try {
    await authClient.emailOtp.requestPasswordReset({
      email: email.value,
    })
    formData.otp = ''
  }
  catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Failed to resend code. Please try again.'
  }
  finally {
    isResending.value = false
  }
}
</script>
