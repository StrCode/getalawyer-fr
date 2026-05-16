<template>
  <AuthPageLayout>
    <template #illustration>
      <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
        Join the future of legal practice.
      </h2>
      <p class="text-brand-cream-warm/80 text-lg">
        Whether you're seeking expert counsel or looking to grow your legal practice, GetaLawyer is your trusted partner.
      </p>
    </template>

    <AuthLogo class="mb-10 lg:hidden" />

    <!-- STEP 1: Role Selection -->
    <div v-if="step === 'role'" key="role">
      <h1 class="mb-2 font-heading font-semibold text-3xl text-foreground tracking-tight">
        Create your account
      </h1>
      <p class="mb-8 text-muted-foreground text-sm">I am joining as a…</p>

      <div class="gap-4 grid grid-cols-1 sm:grid-cols-2 mb-8">
        <Card
          role="button"
          tabindex="0"
          :class="
            cn(
              'gap-0 py-0 overflow-hidden cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring',
              role === 'client'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/40',
            )
          "
          @click="role = 'client'"
          @keydown.enter.prevent="role = 'client'"
          @keydown.space.prevent="role = 'client'"
        >
          <div
            class="relative flex justify-center items-center w-full h-[120px] transition-colors"
            :class="role === 'client' ? 'bg-primary/10' : 'bg-muted/50'"
          >
            <div
              class="relative flex justify-center items-center shadow-sm border border-border rounded-full w-16 h-16 transition-all"
              :class="role === 'client' ? 'ring-2 ring-primary ring-offset-2 bg-background' : 'bg-background'"
            >
              <PhUser
                class="transition-all"
                :class="role === 'client' ? 'w-8 h-8 text-primary' : 'w-7 h-7 text-muted-foreground'"
              />
            </div>
          </div>
          <CardContent class="px-4 py-4">
            <CardTitle class="text-base">Client</CardTitle>
            <p class="mt-1 text-muted-foreground text-sm leading-relaxed">
              Find and connect with verified lawyers for your legal needs
            </p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabindex="0"
          :class="
            cn(
              'gap-0 py-0 overflow-hidden cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring',
              role === 'lawyer'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/40',
            )
          "
          @click="role = 'lawyer'"
          @keydown.enter.prevent="role = 'lawyer'"
          @keydown.space.prevent="role = 'lawyer'"
        >
          <div
            class="relative flex justify-center items-center w-full h-[120px] transition-colors"
            :class="role === 'lawyer' ? 'bg-primary/10' : 'bg-muted/50'"
          >
            <div
              class="relative flex justify-center items-center shadow-sm border border-border rounded-full w-16 h-16 transition-all"
              :class="role === 'lawyer' ? 'ring-2 ring-primary ring-offset-2 bg-background' : 'bg-background'"
            >
              <PhBriefcase
                class="transition-all"
                :class="role === 'lawyer' ? 'w-8 h-8 text-primary' : 'w-7 h-7 text-muted-foreground'"
              />
            </div>
          </div>
          <CardContent class="px-4 py-4">
            <CardTitle class="text-base">Lawyer</CardTitle>
            <p class="mt-1 text-muted-foreground text-sm leading-relaxed">
              Join our platform and offer your legal expertise to clients
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        type="button"
        class="w-full h-11"
        size="lg"
        :disabled="!role"
        @click="step = 'form'"
      >
        {{
          role
            ? `Continue as ${role === 'lawyer' ? 'Lawyer' : 'Client'}`
            : 'Select a role to continue'
        }}
      </Button>

      <p class="mt-6 text-muted-foreground text-sm text-center">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </NuxtLink>
      </p>
    </div>

    <!-- STEP 2: Registration Form -->
    <div v-else key="form">
      <div class="flex items-center gap-3 mb-8">
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="shrink-0"
          aria-label="Back to role selection"
          @click="step = 'role'"
        >
          <PhArrowLeft class="w-4 h-4" />
        </Button>
        <div
          class="inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 border border-primary/20 rounded-md"
        >
          <PhBriefcase v-if="role === 'lawyer'" class="w-3.5 h-3.5 text-primary" />
          <PhUser v-else class="w-3.5 h-3.5 text-primary" />
          <span class="font-medium text-primary text-xs capitalize">{{ role }}</span>
        </div>
      </div>

      <h1 class="mb-2 font-heading font-semibold text-3xl text-foreground tracking-tight">
        {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
      </h1>
      <p class="mb-8 text-muted-foreground text-sm">
        {{ role === 'lawyer' ? 'Fill in your details to get verified.' : 'Join in seconds.' }}
      </p>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="gap-3 grid grid-cols-2">
          <div class="space-y-2">
            <Label for="reg-first">First name</Label>
            <Input
              id="reg-first"
              v-model="formData.firstName"
              placeholder="Alex"
              autocomplete="given-name"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>
          <div class="space-y-2">
            <Label for="reg-last">Last name</Label>
            <Input
              id="reg-last"
              v-model="formData.lastName"
              placeholder="Smith"
              autocomplete="family-name"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="reg-email">Email address</Label>
          <Input
            id="reg-email"
            v-model="formData.email"
            type="email"
            placeholder="alex@example.com"
            autocomplete="email"
            class="h-11"
            :disabled="isSubmitting"
          />
        </div>

        <div class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="reg-password">Password</Label>
            <Input
              id="reg-password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>
          <div class="space-y-2">
            <Label for="reg-confirm">Confirm password</Label>
            <Input
              id="reg-confirm"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-11"
              :disabled="isSubmitting"
            />
          </div>
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
          {{ role === 'lawyer' ? 'Apply as Lawyer' : 'Create account' }}
        </Button>
      </form>

      <p class="mt-6 text-muted-foreground text-sm text-center">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </NuxtLink>
      </p>

      <p class="mt-5 text-muted-foreground text-xs text-center leading-relaxed">
        By continuing, you agree to our
        <NuxtLink to="/terms" class="text-foreground underline underline-offset-4 hover:text-primary">
          Terms of Service
        </NuxtLink>
        and
        <NuxtLink to="/privacy" class="text-foreground underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </NuxtLink>.
      </p>
    </div>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhBriefcase,
  PhUser,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

const route = useRoute()

const roleFromQuery = route.query.role as string
const role = ref<'client' | 'lawyer' | null>(
  roleFromQuery === 'lawyer'
    ? 'lawyer'
    : roleFromQuery === 'client'
      ? 'client'
      : 'client',
)
const step = ref<'role' | 'form'>('role')

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (
    !formData.firstName
    || !formData.lastName
    || !formData.email
    || !formData.password
    || !formData.confirmPassword
  ) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (formData.password !== formData.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  if (formData.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  isSubmitting.value = true

  try {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    const { error: signUpError } = await authClient.signUp.email({
      name: fullName,
      email: formData.email,
      password: formData.password,
      userType: role.value || 'client',
      onboarding_completed: false,
      callbackURL: '/onboarding',
    })

    if (signUpError) {
      error.value = signUpError.message || 'Failed to create account. Please try again.'
      return
    }

    await navigateTo(
      '/onboarding',
    )
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
