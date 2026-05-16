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
        <h1 class="mb-2 font-heading font-semibold text-3xl text-foreground tracking-tight">Password updated</h1>
        <p class="mb-8 max-w-sm text-muted-foreground text-base leading-relaxed">
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
        <h1 class="mb-3 font-heading font-semibold text-3xl text-foreground tracking-tight">
          Set a new password
        </h1>
        <p class="mb-1 text-muted-foreground text-base leading-relaxed">
          Choose a new password for your GetaLawyer account.
        </p>
        <p class="mb-6 text-muted-foreground text-base leading-relaxed">
          This will end all active sessions for your account.
        </p>

        <form @submit.prevent="form.handleSubmit">
          <FieldGroup class="space-y-4">
            <form.Field v-slot="{ field }" name="password">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">New password</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="h-12"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="confirmPassword">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Confirm new password</FieldLabel>
                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="h-12"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="field.handleChange"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <p class="text-muted-foreground text-xs leading-relaxed">
              Use at least 8 characters. Avoid common words or patterns.
            </p>

            <div
              v-if="apiError"
              role="alert"
              class="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-base"
            >
              <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
              <span>{{ apiError }}</span>
            </div>

            <Button type="submit" class="w-full h-12" size="lg" :disabled="isSubmitting">
              Reset password
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
import { PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Recover your account.',
  authDescription: "Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.",
})

const route = useRoute()
const router = useRouter()

const emailParam = computed(() => (route.query.email as string) || '')
const otpParam = computed(() => (route.query.otp as string) || '')

const resetSchema = z
  .object({
    password: z
      .string('New password is required.')
      .min(1, 'New password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z
      .string('Please confirm your new password.')
      .min(1, 'Please confirm your new password.'),
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
    if (!emailParam.value || !otpParam.value) {
      apiError.value = 'Invalid reset link. Please request a new one.'
      return
    }

    apiError.value = ''
    isSubmitting.value = true

    try {
      await authClient.emailOtp.resetPassword({
        email: emailParam.value,
        otp: otpParam.value,
        password: value.password,
      })
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

function isInvalid(field: any) {
  return field.state.meta.isTouched && !field.state.meta.isValid
}

onMounted(() => {
  if (!emailParam.value || !otpParam.value) {
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
