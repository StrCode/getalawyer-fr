<template>
  <AuthPageLayout>
    <AuthLogo class="mb-10" />

    <Transition name="fade">
      <div v-if="submitted" key="success" class="flex flex-col items-center py-4 text-center">
        <div
          class="flex justify-center items-center bg-primary/10 mb-5 border border-primary/15 rounded-full w-16 h-16"
        >
          <PhCheckCircle class="w-8 h-8 text-primary" />
        </div>
        <h1 class="mb-2 font-semibold text-xl text-foreground">Password updated</h1>
        <p class="mb-8 max-w-sm text-muted-foreground text-sm leading-relaxed">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button class="w-full max-w-sm h-11" size="lg" as-child>
          <NuxtLink to="/login" class="inline-flex justify-center items-center w-full">
            Go to login
          </NuxtLink>
        </Button>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="!submitted" key="form">
        <h1 class="mb-3 font-semibold text-2xl text-foreground tracking-tight">
          Set a new password
        </h1>
        <p class="mb-1 text-muted-foreground text-sm leading-relaxed">
          Choose a new password for your GetaLawyer account.
        </p>
        <p class="mb-6 text-muted-foreground text-sm leading-relaxed">
          This will end all active sessions for your account.
        </p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="reset-password">New password</Label>
            <Input
              id="reset-password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>

          <div class="space-y-2">
            <Label for="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>

          <p class="text-muted-foreground text-xs leading-relaxed">
            Use at least 8 characters. Avoid common words or patterns.
          </p>

          <div
            v-if="error"
            role="alert"
            class="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
          >
            <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
            <span>{{ error }}</span>
          </div>

          <Button type="submit" class="w-full h-11" size="lg" :disabled="isSubmitting || !canSubmit">
            Reset password
          </Button>
        </form>

        <Separator class="my-6" />

        <p class="text-muted-foreground text-sm text-center">
          Need help?
          <NuxtLink to="/contact" class="font-medium text-primary underline-offset-4 hover:underline">
            Contact us
          </NuxtLink>
        </p>
      </div>
    </Transition>
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

const route = useRoute()
const router = useRouter()

const email = computed(() => (route.query.email as string) || '')
const otp = computed(() => (route.query.otp as string) || '')

const formData = reactive({
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const submitted = ref(false)
const error = ref('')

const canSubmit = computed(
  () => !!(email.value && otp.value && formData.password && formData.confirmPassword),
)

onMounted(() => {
  if (!email.value || !otp.value) {
    router.replace('/forgot-password')
  }
})

const handleSubmit = async () => {
  error.value = ''

  if (!formData.password || !formData.confirmPassword) {
    error.value = 'Please fill in all fields.'
    return
  }

  if (formData.password !== formData.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  if (formData.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  isSubmitting.value = true

  try {
    await authClient.emailOtp.resetPassword({
      email: email.value,
      otp: otp.value,
      password: formData.password,
    })
    submitted.value = true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Invalid') || msg.includes('expired')) {
      error.value = 'Invalid or expired verification code. Please request a new one.'
    }
    else {
      error.value = msg || 'Something went wrong. Please try again.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
