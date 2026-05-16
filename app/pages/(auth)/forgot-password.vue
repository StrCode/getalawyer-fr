<template>
  <div>

    <AuthLogo class="mb-10 lg:hidden" />

    <header class="mb-8">
      <h1 class="mb-1 text-2xl font-semibold leading-tight tracking-tight text-foreground">
        Forgot your password?
      </h1>
      <p class="text-base leading-relaxed text-muted-foreground">
        Enter your email and we&apos;ll send you a reset code.
      </p>
    </header>

    <div
      v-if="submitted"
      role="status"
      class="flex gap-3 items-start rounded-xl border border-primary/20 bg-primary/5 mb-6 p-4"
    >
      <PhCheckCircle class="mt-0.5 w-5 h-5 text-primary shrink-0" />
      <div>
        <p class="mb-0.5 font-medium text-foreground text-base">Check your email</p>
        <p class="text-muted-foreground text-base leading-relaxed">
          We&apos;ve sent a verification code to <strong class="text-foreground">{{ submittedEmail }}</strong>.
          It may take a few minutes to arrive.
        </p>
      </div>
    </div>

    <div v-if="submitted" class="space-y-4">
      <Button class="w-full h-12" size="lg" @click="goToVerifyOTP">
        Enter verification code
      </Button>
    </div>

    <form v-else @submit.prevent="form.handleSubmit">
      <FieldGroup class="space-y-5">
        <form.Field v-slot="{ field }" name="email">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name">Email address</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              type="email"
              placeholder="alex@example.com"
              autocomplete="email"
              class="h-11 text-base"
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
          <span>{{ isSubmitting ? 'Sending…' : 'Send reset code' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-base">
      <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
        Back to login
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhCircleNotch } from '@phosphor-icons/vue'
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

const forgotSchema = z.object({
  email: z
    .email('Please enter a valid email address.')
})

const isSubmitting = ref(false)
const submitted = ref(false)
const submittedEmail = ref('')
const apiError = ref('')

const router = useRouter()

const form = useForm({
  defaultValues: {
    email: '',
  },
  validators: {
    onSubmit: forgotSchema,
    onBlur: forgotSchema,
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      await authClient.emailOtp.requestPasswordReset({
        email: value.email,
      })
      submittedEmail.value = value.email
      submitted.value = true
    }
    catch (err: unknown) {
      apiError.value =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid()

const goToVerifyOTP = () => {
  router.push({
    path: '/verify-otp',
    query: { email: submittedEmail.value, type: 'password-reset' },
  })
}
</script>
