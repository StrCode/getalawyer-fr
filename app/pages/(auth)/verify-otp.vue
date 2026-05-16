<template>
  <div>

    <AuthLogo class="mb-10 lg:hidden" />

    <div class="mb-8">
      <h1 class="mb-1.5 font-heading font-semibold text-3xl text-foreground tracking-tight">
        Check your email
      </h1>
      <p class="text-muted-foreground text-base">
        We sent a 6-digit code to <strong class="text-foreground font-medium">{{ emailParam }}</strong>.
      </p>
    </div>

    <form @submit.prevent="form.handleSubmit">
      <FieldGroup class="space-y-6">
        <form.Field v-slot="{ field }" name="otp">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel class="sr-only">Verification code</FieldLabel>
            <InputOTP
              :model-value="field.state.value"
              :maxlength="6"
              :disabled="isSubmitting"
              class="gap-2 justify-center w-full"
              @update:model-value="(v) => field.handleChange(v as any)"
            >
              <InputOTPGroup>
                <InputOTPSlot
                  v-for="i in 6"
                  :key="i"
                  :index="i - 1"
                  class="h-12 w-10 text-lg"
                  :class="isInvalid(field) ? 'border-destructive' : ''"
                />
              </InputOTPGroup>
            </InputOTP>
            <p v-if="isInvalid(field)" class="flex items-center justify-center gap-1.5 text-destructive text-sm mt-2">
              <PhWarningCircle class="w-3.5 h-3.5 shrink-0" />
              {{ field.state.meta.errors[0] }}
            </p>
          </Field>
        </form.Field>

        <p class="text-muted-foreground text-base text-center leading-relaxed">
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
          v-if="apiError"
          role="alert"
          class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-base"
        >
          <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
          <span>{{ apiError }}</span>
        </div>

        <Button
          type="submit"
          class="w-full h-12"
          size="lg"
          :disabled="isSubmitting"
        >
          Verify code
        </Button>
      </FieldGroup>
    </form>

    <Separator class="my-6" />

    <p class="text-center text-base">
      <NuxtLink
        to="/forgot-password"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to forgot password
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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

const otpSchema = z.object({
  otp: z
    .string('Verification code is required.')
    .length(6, 'Please enter the full 6-digit code.'),
})

const isSubmitting = ref(false)
const isResending = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    otp: '',
  },
  validators: {
    onSubmit: otpSchema,
    onBlur: otpSchema,
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email: emailParam.value,
        type: 'forget-password',
        otp: value.otp,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Invalid verification code')
      }

      router.push({
        path: '/reset-password',
        query: {
          email: emailParam.value,
          otp: value.otp,
        },
      })
    }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('TOO_MANY_ATTEMPTS')) {
        apiError.value = 'Too many attempts. Please request a new code.'
      }
      else if (msg.includes('expired')) {
        apiError.value = 'This code has expired. Please request a new one.'
      }
      else {
        apiError.value = msg || 'Invalid verification code. Please try again.'
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
  if (!emailParam.value) {
    router.replace('/forgot-password')
  }
})

const handleResend = async () => {
  apiError.value = ''
  isResending.value = true

  try {
    await authClient.emailOtp.requestPasswordReset({
      email: emailParam.value,
    })
    form.setFieldValue('otp', '')
  }
  catch (err: unknown) {
    apiError.value =
      err instanceof Error ? err.message : 'Failed to resend code. Please try again.'
  }
  finally {
    isResending.value = false
  }
}
</script>
