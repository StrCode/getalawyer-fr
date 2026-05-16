<template>
  <AuthPageLayout>
    <template #illustration>
      <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
        Welcome back to GetaLawyer.
      </h2>
      <p class="text-brand-cream-warm/80 text-lg">
        Log in to access your dashboard, manage your cases, and connect with top legal professionals.
      </p>
    </template>

    <AuthLogo class="mb-10 lg:hidden" />

    <div class="mb-8">
      <h1 class="mb-1.5 font-heading font-semibold text-3xl text-foreground tracking-tight">
        Welcome back
      </h1>
      <p class="text-muted-foreground text-base">Sign in to your GetaLawyer account</p>
    </div>

    <div class="space-y-3 mb-6">
      <AuthSocialButton
        provider="google"
        :disabled="isSubmitting"
        :loading="socialProvider === 'google'"
        @click="handleSocialLogin('google')"
      >
        Continue with Google
      </AuthSocialButton>

      <AuthSocialButton
        provider="facebook"
        :disabled="isSubmitting"
        :loading="socialProvider === 'facebook'"
        @click="handleSocialLogin('facebook')"
      >
        Continue with Facebook
      </AuthSocialButton>
    </div>

    <AuthDivider class="mb-6" />

    <form @submit.prevent="form.handleSubmit">
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
              class="h-12"
              :aria-invalid="isInvalid(field)"
              :disabled="isSubmitting"
              @blur="field.handleBlur"
              @update:model-value="field.handleChange"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="password">
          <Field :data-invalid="isInvalid(field)">
            <div class="flex items-center justify-between mb-1.5">
              <FieldLabel :for="field.name">Password</FieldLabel>
              <NuxtLink
                to="/forgot-password"
                class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </NuxtLink>
            </div>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="h-12"
              :aria-invalid="isInvalid(field)"
              :disabled="isSubmitting"
              @blur="field.handleBlur"
              @update:model-value="field.handleChange"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div
          v-if="apiError"
          role="alert"
          class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-base"
        >
          <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
          <span>{{ apiError }}</span>
        </div>

        <Button type="submit" class="w-full h-12" size="lg" :disabled="isSubmitting">
          <span v-if="isSubmitting">Signing in…</span>
          <span v-else>Sign in</span>
        </Button>
      </FieldGroup>
    </form>

    <p class="mt-6 text-muted-foreground text-base leading-relaxed">
      By continuing, you agree to our
      <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
        Terms of Service
      </NuxtLink>
      and
      <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
        Privacy Policy
      </NuxtLink>.
    </p>

    <p class="mt-6 text-muted-foreground text-base text-center">
      Don&apos;t have an account?
      <NuxtLink
        to="/register"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign up
      </NuxtLink>
    </p>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

/** Internal path after login — ignore open redirects. */
function sanitizeRedirect(raw: unknown): string {
  if (typeof raw !== 'string') return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

const route = useRoute()
const redirectAfterLogin = computed(() => sanitizeRedirect(route.query.redirect))

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required.' })
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
})

const isSubmitting = ref(false)
const socialProvider = ref<'google' | 'facebook' | null>(null)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    email: '',
    password: '',
  },
  validators: {
    onChange: loginSchema,
  },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      if (signInError) {
        apiError.value =
          signInError.message ||
          'The email or password is incorrect. Please try again.'
        return
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      await navigateTo(redirectAfterLogin.value)
    }
    catch (err: unknown) {
      apiError.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

function isInvalid(field: any) {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0
}

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  socialProvider.value = provider
  isSubmitting.value = true
  apiError.value = ''

  try {
    await authClient.signIn.social({
      provider,
      callbackURL: redirectAfterLogin.value,
    })
  }
  catch (err: unknown) {
    apiError.value =
      err instanceof Error ? err.message : `Failed to sign in with ${provider}.`
  }
  finally {
    isSubmitting.value = false
    socialProvider.value = null
  }
}
</script>
