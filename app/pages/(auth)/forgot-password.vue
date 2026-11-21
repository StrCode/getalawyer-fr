<template>
  <AuthFormShell
    :title="submitted ? (authMethod === 'phone' ? 'Check your phone' : 'Check your email') : 'Forgot your password?'"
    :description="submitted
      ? undefined
      : authMethod === 'phone'
        ? 'Enter your phone number and we\'ll send you a reset code.'
        : 'Enter your email and we\'ll send you a reset code.'"
  >
    <template #back>
      <NuxtLink to="/login" :class="authBack">← Back to sign in</NuxtLink>
    </template>
    <template v-if="submitted" #description>
      <span role="status">We sent a 6-digit code to <b class="text-foreground">{{ submittedIdentifier }}</b>.</span>
    </template>

    <AuthSubmit v-if="submitted" type="button" @click="goToVerifyOTP">
      Enter the code
    </AuthSubmit>

    <form v-else novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <!-- Email or phone, switched with a quiet link in the label row as on
             sign in. Both fields stay mounted (v-show) so each mounts once. -->
        <div v-show="authMethod === 'email'" class="grid gap-4.5">
          <div
            v-if="tempEmailWarning"
            class="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning-subtle-foreground"
          >
            This account signs in with a phone number.
            <button type="button" :class="authLink" @click="authMethod = 'phone'">Use phone instead</button>
            to reset your password.
          </div>

          <form.Field v-slot="{ field }" name="email">
            <Field :data-invalid="isInvalid(field)">
              <div class="flex w-full items-baseline justify-between gap-4 text-sm">
                <FieldLabel :for="field.name" class="w-auto font-medium">Email address</FieldLabel>
                <button type="button" :class="authLink" :disabled="isSubmitting" @click="authMethod = 'phone'">
                  Use phone instead
                </button>
              </div>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                type="email"
                inputmode="email"
                placeholder="alex@example.com"
                autocomplete="email"
                :class="authInput"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => { field.handleChange(v as any); checkTempEmail(v as string) }"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>

        <div v-show="authMethod === 'phone'">
          <form.Field v-slot="{ field }" name="phone">
            <Field :data-invalid="isInvalid(field)">
              <div class="flex w-full items-baseline justify-between gap-4 text-sm">
                <span class="font-medium">Phone number</span>
                <button type="button" :class="authLink" :disabled="isSubmitting" @click="authMethod = 'email'">
                  Use email instead
                </button>
              </div>
              <AuthPhoneInput
                label=""
                :model-value="field.state.value"
                :invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(v as any)"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>

        <AuthFormError :message="apiError" />

        <AuthSubmit :loading="isSubmitting" :disabled="tempEmailWarning" class="mt-1.25">
          {{ isSubmitting ? 'Sending…' : 'Send reset code' }}
        </AuthSubmit>
      </FieldGroup>
    </form>
  </AuthFormShell>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'
import { isTempPhoneEmail } from '~/lib/auth-constants'
import { isValidNgPhone } from '~/lib/phone'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Recover your account.',
  authDescription: "Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.",
})

useHead({ title: 'Forgot your password' })

const route = useRoute()
const router = useRouter()
const { requestPhonePasswordReset } = usePhoneAuth()

const authMethod = ref<'email' | 'phone'>(
  route.query.method === 'phone' ? 'phone' : 'email',
)

const forgotSchema = z.object({
  email: z.string(),
  phone: z.string(),
}).superRefine((data, ctx) => {
  if (authMethod.value === 'email') {
    const emailResult = z.email().safeParse(data.email)
    if (!emailResult.success) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid email address.', path: ['email'] })
    }
  } else if (!isValidNgPhone(data.phone)) {
    ctx.addIssue({ code: 'custom', message: 'Please enter a valid Nigerian phone number.', path: ['phone'] })
  }
})

const isSubmitting = ref(false)
const submitted = ref(false)
const submittedIdentifier = ref('')
const tempEmailWarning = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    email: '',
    phone: (route.query.phone as string) || '',
  },
  validators: {
    onChange: forgotSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    if (authMethod.value === 'email' && isTempPhoneEmail(value.email)) {
      tempEmailWarning.value = true
      return
    }

    apiError.value = ''
    isSubmitting.value = true

    try {
      if (authMethod.value === 'email') {
        await authClient.emailOtp.requestPasswordReset({ email: value.email })
        submittedIdentifier.value = value.email
      } else {
        const { error } = await requestPhonePasswordReset(value.phone)
        if (error) throw new Error(error.message)
        submittedIdentifier.value = value.phone
      }
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

const { isInvalid } = useAuthFieldInvalid(form)

function checkTempEmail(email: string) {
  tempEmailWarning.value = isTempPhoneEmail(email)
}

const goToVerifyOTP = () => {
  if (authMethod.value === 'phone') {
    router.push({
      path: '/verify-otp',
      query: { method: 'phone', phone: submittedIdentifier.value },
    })
  } else {
    router.push({
      path: '/verify-otp',
      query: { method: 'email', email: submittedIdentifier.value },
    })
  }
}
</script>
