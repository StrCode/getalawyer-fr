<template>
  <div>

    <AuthLogo class="mb-10 lg:hidden" />

    <Transition name="fade">
      <div v-if="submitted" key="success" class="flex flex-col items-center py-4 text-center">
        <div
          class="flex justify-center items-center bg-primary/10 mb-5 border border-primary/15 rounded-full w-16 h-16"
        >
          <PhCheckCircle class="w-8 h-8 text-primary" />
        </div>
        <h1 class="mb-2 text-2xl font-semibold leading-tight tracking-tight text-foreground">Password updated</h1>
        <p class="mb-8 max-w-sm text-base leading-relaxed text-muted-foreground">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button class="w-full max-w-sm h-12" size="lg" as-child>
          <NuxtLink to="/login" class="inline-flex justify-center items-center w-full">
            Go to login
          </NuxtLink>
        </Button>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="!submitted" key="form">
        <header class="mb-6">
          <h1 class="mb-1 text-2xl font-semibold leading-tight tracking-tight text-foreground">
            Set a new password
          </h1>
          <p class="text-base leading-relaxed text-muted-foreground">
            Choose a new password for
            <strong class="font-medium text-foreground">{{ identifierLabel }}</strong>.
            This will end all active sessions for your account.
          </p>
        </header>

        <form @submit.prevent="form.handleSubmit">
          <FieldGroup class="space-y-4">
            <form.Field v-slot="{ field }" name="password">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">New password</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                <AuthPasswordRequirements class="mt-2" :password="field.state.value" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="confirmPassword">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Confirm new password</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <AuthFormError :message="apiError" />

            <Button type="submit" class="w-full h-12 gap-2" size="lg" :disabled="isSubmitting">
              <PhCircleNotch v-if="isSubmitting" class="w-4 h-4 animate-spin shrink-0" />
              <span>{{ isSubmitting ? 'Resetting…' : 'Reset password' }}</span>
            </Button>
          </FieldGroup>
        </form>

        <Separator class="my-6" />

        <p class="text-muted-foreground text-base text-center">
          Need help?
          <NuxtLink to="/contact" class="font-medium text-primary underline-offset-4 hover:underline">
            Contact us
          </NuxtLink>
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhCircleNotch } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Recover your account.',
  authDescription: "Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.",
})

const route = useRoute()
const router = useRouter()
const { resetPhonePassword } = usePhoneAuth()

const isPhoneMethod = computed(() => route.query.method === 'phone')
const emailParam = computed(() => (route.query.email as string) || '')
const phoneParam = computed(() => (route.query.phone as string) || '')
const otpParam = computed(() => (route.query.otp as string) || '')
const identifierLabel = computed(() =>
  isPhoneMethod.value ? phoneParam.value : emailParam.value,
)

const resetSchema = z
  .object({
    password: authPasswordSchema,
    confirmPassword: z.string('Please confirm your new password.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

const isSubmitting = ref(false)
const submitted = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    password: '',
    confirmPassword: '',
  },
  validators: {
    onSubmit: resetSchema,
    onBlur: resetSchema,
  },
  onSubmit: async ({ value }) => {
    if (!otpParam.value) {
      apiError.value = 'Invalid reset link. Please request a new one.'
      return
    }
    if (isPhoneMethod.value && !phoneParam.value) {
      apiError.value = 'Invalid reset link. Please request a new one.'
      return
    }
    if (!isPhoneMethod.value && !emailParam.value) {
      apiError.value = 'Invalid reset link. Please request a new one.'
      return
    }

    apiError.value = ''
    isSubmitting.value = true

    try {
      if (isPhoneMethod.value) {
        const { error } = await resetPhonePassword({
          phone: phoneParam.value,
          otp: otpParam.value,
          newPassword: value.password,
        })
        if (error) throw new Error(error.message)
      } else {
        await authClient.emailOtp.resetPassword({
          email: emailParam.value,
          otp: otpParam.value,
          password: value.password,
        })
      }
      submitted.value = true
    }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid') || msg.includes('expired')) {
        apiError.value = 'Invalid or expired verification code. Please request a new one.'
      }
      else {
        apiError.value = msg || 'Something went wrong. Please try again.'
      }
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid()

onMounted(() => {
  if (!otpParam.value || (!emailParam.value && !phoneParam.value)) {
    router.replace('/forgot-password')
  }
})
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
