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

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-1.5">
        <Label for="login-email">Email address</Label>
        <Input
          id="login-email"
          v-model="formData.email"
          type="email"
          placeholder="alex@example.com"
          autocomplete="email"
          class="h-12"
          :disabled="isSubmitting"
        />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label for="login-password">Password</Label>
          <NuxtLink
            to="/forgot-password"
            class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <Input
          id="login-password"
          v-model="formData.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          class="h-12"
          :disabled="isSubmitting"
        />
      </div>

      <div
        v-if="error"
        role="alert"
        class="flex gap-2 items-start rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive text-base"
      >
        <PhWarningCircle class="mt-0.5 w-4 h-4 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <Button type="submit" class="w-full h-12" size="lg" :disabled="isSubmitting">
        <span v-if="isSubmitting">Signing in…</span>
        <span v-else>Sign in</span>
      </Button>
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
