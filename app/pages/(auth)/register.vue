<template>
  <!-- ─── STEP 1: Role Selection — full-screen centered ─────────────────── -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-[0.98]"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-[0.98]"
    mode="out-in"
  >
    <!-- ── ROLE SELECTION SCREEN ── -->
    <div
      v-if="step === 'role'"
      key="role"
      class="min-h-dvh w-full bg-brand-cream flex flex-col"
    >
      <!-- Top bar -->
      <header class="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5 no-underline text-brand-green-700">
          <svg class="w-6 h-6 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,20 38,42 38,82 0,60" fill="#1F4D2C"/>
            <polygon points="62,42 100,20 100,60 62,82" fill="#1F4D2C" opacity="0.55"/>
          </svg>
          <span class="font-sans font-bold text-lg tracking-[-0.5px] lowercase text-brand-green-700">getalawyer</span>
        </NuxtLink>
        <p class="text-muted-foreground text-base">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-brand-green-700 underline-offset-4 hover:underline ml-1">
            Sign in
          </NuxtLink>
        </p>
      </header>

      <!-- Main content -->
      <main class="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div class="w-full max-w-2xl">
          <!-- Heading -->
          <div class="text-center mb-12">
            <h1 class="font-heading font-semibold text-4xl sm:text-5xl text-foreground tracking-tight mb-3">
              How are you joining?
            </h1>
            <p class="text-muted-foreground text-lg">
              Choose your account type to get started.
            </p>
          </div>

          <!-- Role cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Client card -->
            <button
              type="button"
              :class="[
                'group relative w-full text-left rounded-2xl border-2 p-7 transition-all duration-200 outline-none cursor-pointer',
                role === 'client'
                  ? 'border-brand-green-700 bg-brand-green-700 shadow-lg shadow-brand-green-700/20'
                  : 'border-border bg-background hover:border-brand-green-300 hover:shadow-md'
              ]"
              @click="selectRole('client')"
            >
              <!-- Icon -->
              <div
                :class="[
                  'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 transition-colors duration-200',
                  role === 'client'
                    ? 'bg-white/20'
                    : 'bg-brand-green-100 group-hover:bg-brand-green-100'
                ]"
              >
                <PhUser
                  :class="[
                    'w-7 h-7 transition-colors',
                    role === 'client' ? 'text-white' : 'text-brand-green-700'
                  ]"
                  weight="duotone"
                />
              </div>

              <!-- Text -->
              <h2
                :class="[
                  'font-heading font-semibold text-2xl mb-2 transition-colors',
                  role === 'client' ? 'text-white' : 'text-foreground'
                ]"
              >
                I'm a Client
              </h2>
              <p
                :class="[
                  'text-base leading-relaxed transition-colors',
                  role === 'client' ? 'text-white/75' : 'text-muted-foreground'
                ]"
              >
                Find and connect with verified lawyers for any legal need.
              </p>

              <!-- Bullet points -->
              <ul class="mt-5 space-y-2">
                <li
                  v-for="point in clientPoints"
                  :key="point"
                  :class="[
                    'flex items-center gap-2.5 text-sm',
                    role === 'client' ? 'text-white/80' : 'text-muted-foreground'
                  ]"
                >
                  <PhCheckCircle
                    :class="[
                      'w-4 h-4 shrink-0',
                      role === 'client' ? 'text-white/70' : 'text-brand-green-500'
                    ]"
                    weight="fill"
                  />
                  {{ point }}
                </li>
              </ul>

              <!-- Selected indicator -->
              <div
                v-if="role === 'client'"
                class="absolute top-5 right-5 w-6 h-6 rounded-full bg-white flex items-center justify-center"
              >
                <PhCheck class="w-3.5 h-3.5 text-brand-green-700" weight="bold" />
              </div>
            </button>

            <!-- Lawyer card -->
            <button
              type="button"
              :class="[
                'group relative w-full text-left rounded-2xl border-2 p-7 transition-all duration-200 outline-none cursor-pointer',
                role === 'lawyer'
                  ? 'border-brand-green-700 bg-brand-green-700 shadow-lg shadow-brand-green-700/20'
                  : 'border-border bg-background hover:border-brand-green-300 hover:shadow-md'
              ]"
              @click="selectRole('lawyer')"
            >
              <!-- Icon -->
              <div
                :class="[
                  'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 transition-colors duration-200',
                  role === 'lawyer'
                    ? 'bg-white/20'
                    : 'bg-brand-green-100 group-hover:bg-brand-green-100'
                ]"
              >
                <PhBriefcase
                  :class="[
                    'w-7 h-7 transition-colors',
                    role === 'lawyer' ? 'text-white' : 'text-brand-green-700'
                  ]"
                  weight="duotone"
                />
              </div>

              <!-- Text -->
              <h2
                :class="[
                  'font-heading font-semibold text-2xl mb-2 transition-colors',
                  role === 'lawyer' ? 'text-white' : 'text-foreground'
                ]"
              >
                I'm a Lawyer
              </h2>
              <p
                :class="[
                  'text-base leading-relaxed transition-colors',
                  role === 'lawyer' ? 'text-white/75' : 'text-muted-foreground'
                ]"
              >
                Join our platform and grow your legal practice with new clients.
              </p>

              <!-- Bullet points -->
              <ul class="mt-5 space-y-2">
                <li
                  v-for="point in lawyerPoints"
                  :key="point"
                  :class="[
                    'flex items-center gap-2.5 text-sm',
                    role === 'lawyer' ? 'text-white/80' : 'text-muted-foreground'
                  ]"
                >
                  <PhCheckCircle
                    :class="[
                      'w-4 h-4 shrink-0',
                      role === 'lawyer' ? 'text-white/70' : 'text-brand-green-500'
                    ]"
                    weight="fill"
                  />
                  {{ point }}
                </li>
              </ul>

              <!-- Selected indicator -->
              <div
                v-if="role === 'lawyer'"
                class="absolute top-5 right-5 w-6 h-6 rounded-full bg-white flex items-center justify-center"
              >
                <PhCheck class="w-3.5 h-3.5 text-brand-green-700" weight="bold" />
              </div>
            </button>
          </div>

          <!-- CTA -->
          <div class="mt-8">
            <Button
              type="button"
              size="lg"
              class="w-full h-13 text-base"
              :disabled="!role"
              @click="step = 'form'"
            >
              {{ role ? `Continue as ${role === 'lawyer' ? 'Lawyer' : 'Client'}` : 'Select an account type' }}
              <PhArrowRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="px-6 sm:px-10 py-5 text-center shrink-0">
        <p class="text-muted-foreground/60 text-sm">
          By continuing, you agree to our
          <NuxtLink to="/terms" class="text-foreground/70 underline underline-offset-4 hover:text-foreground">Terms</NuxtLink>
          and
          <NuxtLink to="/privacy" class="text-foreground/70 underline underline-offset-4 hover:text-foreground">Privacy Policy</NuxtLink>.
        </p>
      </footer>
    </div>

    <!-- ── REGISTRATION FORM SCREEN ── -->
    <AuthPageLayout v-else key="form">
      <template #illustration>
        <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
          {{ role === 'lawyer' ? 'Join a network of top legal professionals.' : 'Get expert legal help in minutes.' }}
        </h2>
        <p class="text-brand-cream-warm/80 text-lg">
          {{ role === 'lawyer'
            ? 'Grow your practice by connecting with clients who need your expertise.'
            : 'Thousands of verified lawyers are ready to help you navigate any legal challenge.' }}
        </p>
      </template>

      <AuthLogo class="mb-10 lg:hidden" />

      <!-- Header with back + role badge -->
      <div class="flex items-center gap-3 mb-8">
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-background hover:bg-accent transition-colors shrink-0"
          aria-label="Back to role selection"
          @click="step = 'role'"
        >
          <PhArrowLeft class="w-4 h-4 text-foreground" />
        </button>
        <div class="inline-flex items-center gap-2 bg-brand-green-100 px-3 py-1.5 rounded-full">
          <PhBriefcase v-if="role === 'lawyer'" class="w-3.5 h-3.5 text-brand-green-700" />
          <PhUser v-else class="w-3.5 h-3.5 text-brand-green-700" />
          <span class="font-medium text-brand-green-700 text-sm capitalize">{{ role }}</span>
        </div>
      </div>

      <div class="mb-8">
        <h1 class="mb-1.5 font-heading font-semibold text-3xl text-foreground tracking-tight">
          {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
        </h1>
        <p class="text-muted-foreground text-base">
          {{ role === 'lawyer' ? 'Fill in your details to get verified.' : 'Join in seconds.' }}
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="gap-3 grid grid-cols-2">
          <div class="space-y-1.5">
            <Label for="reg-first">First name</Label>
            <Input
              id="reg-first"
              v-model="formData.firstName"
              placeholder="Alex"
              autocomplete="given-name"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>
          <div class="space-y-1.5">
            <Label for="reg-last">Last name</Label>
            <Input
              id="reg-last"
              v-model="formData.lastName"
              placeholder="Smith"
              autocomplete="family-name"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="reg-email">Email address</Label>
          <Input
            id="reg-email"
            v-model="formData.email"
            type="email"
            placeholder="alex@example.com"
            autocomplete="email"
            class="h-12"
            :disabled="isSubmitting"
          />
        </div>

        <div class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="reg-password">Password</Label>
            <Input
              id="reg-password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>
          <div class="space-y-1.5">
            <Label for="reg-confirm">Confirm password</Label>
            <Input
              id="reg-confirm"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>
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
          {{ isSubmitting ? 'Creating account…' : (role === 'lawyer' ? 'Apply as Lawyer' : 'Create account') }}
        </Button>
      </form>

      <p class="mt-6 text-muted-foreground text-base text-center">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </NuxtLink>
      </p>

      <p class="mt-5 text-muted-foreground/70 text-sm text-center leading-relaxed">
        By continuing, you agree to our
        <NuxtLink to="/terms" class="text-foreground/70 underline underline-offset-4 hover:text-foreground">Terms of Service</NuxtLink>
        and
        <NuxtLink to="/privacy" class="text-foreground/70 underline underline-offset-4 hover:text-foreground">Privacy Policy</NuxtLink>.
      </p>
    </AuthPageLayout>
  </Transition>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhArrowRight,
  PhBriefcase,
  PhCheck,
  PhCheckCircle,
  PhUser,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      : null,
)
const step = ref<'role' | 'form'>('role')

const clientPoints = [
  'Browse verified, rated lawyers',
  'Book consultations instantly',
  'Secure messaging & documents',
]

const lawyerPoints = [
  'Get matched with ideal clients',
  'Manage cases & billing in one place',
  'Build your verified reputation',
]

function selectRole(r: 'client' | 'lawyer') {
  role.value = r
}

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

    await navigateTo('/onboarding')
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
