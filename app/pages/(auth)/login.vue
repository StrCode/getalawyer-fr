<template>
  <div class="w-full">

    <AuthLogo class="mb-8 lg:hidden" />

    <header class="mb-8">
      <h1 class="mb-1.5 font-heading font-semibold text-3xl text-foreground tracking-tight">
        Welcome back
      </h1>
      <p class="text-muted-foreground text-base leading-relaxed">
        Sign in to your GetaLawyer account
      </p>
    </header>

    <div class="mb-6 flex items-stretch gap-3">
      <AuthSocialButton
        provider="google"
        icon-only
        :disabled="isSubmitting"
        :loading="socialProvider === 'google'"
        @click="handleSocialLogin('google')"
      />
      <AuthSocialButton
        provider="facebook"
        icon-only
        :disabled="isSubmitting"
        :loading="socialProvider === 'facebook'"
        @click="handleSocialLogin('facebook')"
      />
    </div>

    <AuthDivider class="mb-6" />

    <form @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-5">
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
              @update:model-value="(v) => field.handleChange(v as any)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="password">
          <Field :data-invalid="isInvalid(field)">
            <div class="flex w-full items-center justify-between gap-3">
              <FieldLabel :for="field.name" class="w-auto">Password</FieldLabel>
              <NuxtLink
                to="/forgot-password"
                class="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </NuxtLink>
            </div>
            <AuthPasswordInput
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              placeholder="••••••••"
              autocomplete="current-password"
              :aria-invalid="isInvalid(field)"
              :disabled="isSubmitting"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(v as any)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <AuthFormError :message="apiError" />

        <Button
          type="submit"
          class="inline-flex h-12 w-full items-center justify-center gap-2"
          size="lg"
          :disabled="isSubmitting"
        >
          <PhCircleNotch v-if="isSubmitting" class="h-4 w-4 shrink-0 animate-spin" />
          <span>{{ isSubmitting ? 'Signing in…' : 'Sign in' }}</span>
        </Button>
      </FieldGroup>
    </form>

    <p class="mt-8 text-sm text-muted-foreground leading-relaxed">
      By continuing, you agree to our
      <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
        Terms of Service
      </NuxtLink>
      and
      <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
        Privacy Policy
      </NuxtLink>.
    </p>

    <p class="mt-6 text-center text-base text-muted-foreground">
      Don&apos;t have an account?
      <NuxtLink
        to="/register"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign up
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PhCircleNotch } from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  authTitle: 'Welcome back to GetaLawyer.',
  authDescription: 'Log in to access your dashboard, manage your cases, and connect with top legal professionals.',
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
    .email({ error: 'Please enter a valid email address.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, { error: 'Password must be at least 8 characters.' }),
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
    onSubmit: loginSchema,
    onBlur: loginSchema,
  },
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

const { isInvalid } = useAuthFieldInvalid()

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
