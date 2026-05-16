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

    <div class="mb-8">
      <h1 class="mb-1.5 font-heading font-semibold text-3xl text-foreground tracking-tight">
        Forgot your password?
      </h1>
      <p class="text-muted-foreground text-base">
        Enter your email and we&apos;ll send you a reset code.
      </p>
    </div>

    <div
      v-if="submitted"
      role="status"
      class="flex gap-3 items-start rounded-lg border border-primary/20 bg-primary/5 mb-6 p-4"
    >
      <PhCheckCircle class="mt-0.5 w-5 h-5 text-primary shrink-0" />
      <div>
        <p class="mb-0.5 font-medium text-foreground text-base">Check your email</p>
        <p class="text-muted-foreground text-base leading-relaxed">
          We&apos;ve sent a verification code to <strong class="text-foreground">{{ formData.email }}</strong>.
          It may take a few minutes to arrive.
        </p>
      </div>
    </div>

    <div v-if="submitted" class="space-y-4">
      <Button class="w-full h-12" size="lg" @click="goToVerifyOTP">
        Enter verification code
      </Button>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-1.5">
        <Label for="forgot-email">Email address</Label>
        <Input
          id="forgot-email"
          v-model="formData.email"
          type="email"
          placeholder="alex@example.com"
          autocomplete="email"
          class="h-12"
          :disabled="isSubmitting"
        />
      </div>

      <div
        v-if="error"
        role="alert"
        class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-base"
      >
        <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <Button type="submit" class="w-full h-12" size="lg" :disabled="isSubmitting">
        Send reset code
      </Button>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-base">
      <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
        Back to login
      </NuxtLink>
    </p>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

const formData = reactive({ email: '' })
const isSubmitting = ref(false)
const submitted = ref(false)
const error = ref('')

const router = useRouter()

const handleSubmit = async () => {
  error.value = ''

  if (!formData.email) {
    error.value = 'Please enter your email address.'
    return
  }

  isSubmitting.value = true

  try {
    await authClient.emailOtp.requestPasswordReset({
      email: formData.email,
    })
    submitted.value = true
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const goToVerifyOTP = () => {
  router.push({
    path: '/verify-otp',
    query: { email: formData.email, type: 'password-reset' },
  })
}
</script>
