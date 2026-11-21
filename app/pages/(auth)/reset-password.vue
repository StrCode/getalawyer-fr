<template>
  <AuthFormShell
    :title="submitted ? 'Password updated' : 'Set a new password'"
    :description="submitted
      ? undefined
      : `Choose a new password for ${identifierLabel}. This signs you out everywhere else.`"
  >
    <Transition name="fade">
      <div v-if="submitted" key="success" role="status">
        <p class="mb-6.75 flex items-start gap-3 text-muted-foreground">
          <span class="grid size-7.5 flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="13" :stroke="3.4" /></span>
          Your password has been reset. You can now sign in with the new one.
        </p>
        <Button as-child variant="canopy" size="pill" class="group/btn w-full justify-between pr-2 pl-5.5">
          <NuxtLink to="/login">Go to sign in<CanopyArrowChip /></NuxtLink>
        </Button>
      </div>
    </Transition>

    <Transition name="fade">
      <form v-if="!submitted" key="form" novalidate @submit.prevent="form.handleSubmit">
        <FieldGroup class="gap-4.5">
          <form.Field v-slot="{ field }" name="password">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" class="text-sm font-medium">New password</FieldLabel>
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
              <!-- only when empty: with something typed, the list below shows what is missing -->
              <FieldError v-if="isInvalid(field) && !field.state.value" :errors="field.state.meta.errors" />
              <AuthPasswordRequirements :password="field.state.value" :invalid="isInvalid(field)" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="confirmPassword">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" class="text-sm font-medium">Confirm password</FieldLabel>
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

          <AuthSubmit :loading="isSubmitting" class="mt-1.25">
            {{ isSubmitting ? 'Resetting…' : 'Reset password' }}
          </AuthSubmit>
        </FieldGroup>
      </form>
    </Transition>

    <template v-if="!submitted" #after>
      Need help? <NuxtLink to="/contact" :class="authLink">Contact us</NuxtLink>
    </template>
  </AuthFormShell>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Recover your account.',
  authDescription: "Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.",
})

useHead({ title: 'Set a new password' })

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
    onChange: resetSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
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

const { isInvalid } = useAuthFieldInvalid(form)

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
