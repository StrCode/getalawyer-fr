<template>
  <AuthFormShell
    eyebrow="Account recovery"
    :title="submitted ? 'Check your inbox' : 'Forgot your password?'"
    :description="submitted
      ? undefined
      : authMethod === 'phone'
        ? 'Enter your phone number and we\'ll send you a reset code.'
        : 'Enter your email and we\'ll send you a reset code.'"
  >
    <div
      v-if="submitted"
      role="status"
      class="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <PhCheckCircle class="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <p class="mb-0.5 text-base font-medium text-foreground">
          {{ authMethod === 'phone' ? 'Check your phone' : 'Check your email' }}
        </p>
        <p class="text-base leading-relaxed text-muted-foreground">
          We&apos;ve sent a verification code to
          <strong class="text-foreground">{{ submittedIdentifier }}</strong>.
        </p>
      </div>
    </div>

    <div v-if="submitted">
      <Button class="h-12 w-full cursor-pointer" size="lg" @click="goToVerifyOTP">
        Enter verification code
      </Button>
    </div>

    <form v-else @submit.prevent="form.handleSubmit">
      <FieldGroup class="space-y-5">
        <AuthMethodTabs v-model="authMethod" :disabled="isSubmitting || submitted">
          <TabsContent value="email" class="mt-0 space-y-5">
            <div
              v-if="tempEmailWarning"
              class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-100"
            >
              This account uses phone sign-in. Switch to the <strong>Phone</strong> tab to reset your password.
            </div>

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
                  @update:model-value="(v) => { field.handleChange(v as any); checkTempEmail(v as string) }"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </TabsContent>

          <TabsContent value="phone" class="mt-0">
            <form.Field v-slot="{ field }" name="phone">
              <Field :data-invalid="isInvalid(field)">
                <AuthPhoneInput
                  :model-value="field.state.value"
                  :invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(v as any)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </TabsContent>
        </AuthMethodTabs>

        <AuthFormError :message="apiError" />

        <Button type="submit" class="h-12 w-full cursor-pointer gap-2" size="lg" :disabled="isSubmitting || tempEmailWarning">
          <PhCircleNotch v-if="isSubmitting" class="size-4 shrink-0 animate-spin" />
          <span>{{ isSubmitting ? 'Sending…' : 'Send reset code' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <template #after>
      <p class="text-center text-base">
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Back to login
        </NuxtLink>
      </p>
    </template>
  </AuthFormShell>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhCircleNotch } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import type { AuthMethod } from '@/components/auth/MethodTabs.vue'
import { authClient } from '~/lib/auth-client'
import { isTempPhoneEmail } from '~/lib/auth-constants'
import { isValidNgPhone } from '~/lib/phone'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
  authTitle: 'Recover your account.',
  authDescription: "Don't worry, it happens to the best of us. We'll help you get back to your legal dashboard securely.",
})

const route = useRoute()
const router = useRouter()
const { requestPhonePasswordReset } = usePhoneAuth()

const authMethod = ref<AuthMethod>(
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
    onSubmit: forgotSchema,
    onBlur: forgotSchema,
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

const { isInvalid } = useAuthFieldInvalid()

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
