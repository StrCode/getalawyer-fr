<template>
  <AuthPageLayout>
    <AuthLogo class="mb-10" />

    <h1 class="mb-6 font-semibold text-2xl text-foreground tracking-tight">
      Welcome back
    </h1>

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

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="login-email">Email</Label>
        <Input
          id="login-email"
          v-model="formData.email"
          type="email"
          placeholder="alex@example.com"
          autocomplete="email"
          class="h-11"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-2">
        <Label for="login-password">Password</Label>
        <Input
          id="login-password"
          v-model="formData.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          class="h-11"
          :disabled="isSubmitting"
        />
      </div>

      <div
        v-if="error"
        role="alert"
        class="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
      >
        <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <Button type="submit" class="w-full h-11" size="lg" :disabled="isSubmitting">
        <span v-if="isSubmitting">Signing in…</span>
        <span v-else>Log in</span>
      </Button>
    </form>

    <NuxtLink
      to="/forgot-password"
      class="block mt-4 text-primary text-sm underline-offset-4 hover:underline"
    >
      Forgot your password?
    </NuxtLink>

    <p class="mt-6 text-muted-foreground text-sm leading-relaxed">
      By continuing with Google, Facebook, or email, you agree to GetaLawyer&apos;s
      <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
        Terms of Service
      </NuxtLink>
      and
      <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
        Privacy Policy
      </NuxtLink>.
    </p>

    <p class="mt-6 text-muted-foreground text-sm text-center">
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const formData = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const socialProvider = ref<'google' | 'facebook' | null>(null)
const error = ref('')

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  socialProvider.value = provider
  isSubmitting.value = true
  error.value = ''

  try {
    await authClient.signIn.social({
      provider,
      callbackURL: redirectAfterLogin.value,
    })
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : `Failed to sign in with ${provider}.`
  } finally {
    isSubmitting.value = false
    socialProvider.value = null
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!formData.email || !formData.password) {
    error.value = 'Please fill in all fields.'
    return
  }

  isSubmitting.value = true

  try {
    const { error: signInError } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    })

    if (signInError) {
      error.value =
        signInError.message ||
        'The email or password is incorrect. Please try again.'
      isSubmitting.value = false
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 100))

    await navigateTo(redirectAfterLogin.value)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
