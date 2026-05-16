<template>
  <div class="relative flex min-h-dvh w-full max-w-full flex-col overflow-x-clip bg-brand-cream font-sans">
    <!-- Background: clipped so blur paint cannot extend scroll width -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        class="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-green-100/60 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        class="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-green-100/40 blur-3xl sm:h-96 sm:w-96"
      />
    </div>

    <header class="relative z-20 flex min-w-0 shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-6">
      <NuxtLink to="/" class="group inline-flex min-w-0 items-center gap-2.5">
        <svg
          class="h-7 w-7 text-primary transition-transform group-hover:scale-105 sm:h-8 sm:w-8"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="0,20 38,42 38,82 0,60" fill="currentColor" />
          <polygon points="62,42 100,20 100,60 62,82" fill="currentColor" opacity="0.55" />
        </svg>
        <span class="font-sans text-xl font-bold tracking-tight text-brand-green-900 lowercase sm:text-2xl">
          getalawyer
        </span>
      </NuxtLink>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <span class="hidden text-sm font-medium text-brand-ink-soft sm:inline">
          Already have an account?
        </span>
        <NuxtLink
          to="/login"
          class="rounded-full border border-brand-line/50 bg-white/50 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:px-5 sm:py-2.5"
        >
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main class="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:justify-start sm:px-8 sm:py-12 lg:py-16">
      <div class="mx-auto w-full min-w-0 max-w-2xl">
        <Transition name="slide-fade" mode="out-in">
          <!-- Step 1: Role selection -->
          <div v-if="step === 'role'" key="role" class="flex w-full flex-col items-center">
            <div class="mb-8 text-center sm:mb-10">
              <p class="mb-3 text-xs font-bold uppercase tracking-widest text-brand-green-700">
                Account type
              </p>
              <h1
                class="font-heading text-balance text-3xl font-normal leading-tight tracking-tight text-brand-green-900 sm:text-4xl"
              >
                How would you like to use GetaLawyer?
              </h1>
              <p class="mx-auto mt-3 max-w-md text-base leading-relaxed text-brand-ink-soft sm:mt-4">
                Select the path that matches your needs today.
              </p>
            </div>

            <div class="mx-auto mb-8 grid w-full min-w-0 max-w-md grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2 sm:gap-5">
              <Card
                role="button"
                tabindex="0"
                :aria-pressed="role === 'client'"
                :class="roleCardClass('client')"
                @click="role = 'client'"
                @keydown.enter.prevent="role = 'client'"
                @keydown.space.prevent="role = 'client'"
              >
                <div class="relative p-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-5 right-5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6"
                    :class="
                      role === 'client'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-brand-line bg-white/80'
                    "
                  >
                    <PhCheck v-if="role === 'client'" class="h-3.5 w-3.5 text-white" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-100 transition-transform sm:mx-0 sm:mb-6 sm:h-14 sm:w-14"
                    :class="role === 'client' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhUser
                      class="h-6 w-6 sm:h-7 sm:w-7"
                      :class="role === 'client' ? 'text-primary' : 'text-brand-green-700'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-2 text-xl font-semibold leading-tight text-brand-green-900 sm:text-2xl">
                    I am a Client
                  </h2>
                  <p class="text-base leading-relaxed text-brand-ink-soft">
                    Find and book a verified Nigerian lawyer for legal assistance.
                  </p>
                </div>
              </Card>

              <Card
                role="button"
                tabindex="0"
                :aria-pressed="role === 'lawyer'"
                :class="roleCardClass('lawyer')"
                @click="role = 'lawyer'"
                @keydown.enter.prevent="role = 'lawyer'"
                @keydown.space.prevent="role = 'lawyer'"
              >
                <div class="relative p-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-5 right-5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6"
                    :class="
                      role === 'lawyer'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-brand-line bg-white/80'
                    "
                  >
                    <PhCheck v-if="role === 'lawyer'" class="h-3.5 w-3.5 text-white" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-100 transition-transform sm:mx-0 sm:mb-6 sm:h-14 sm:w-14"
                    :class="role === 'lawyer' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhBriefcase
                      class="h-6 w-6 sm:h-7 sm:w-7"
                      :class="role === 'lawyer' ? 'text-primary' : 'text-brand-green-700'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-2 text-xl font-semibold leading-tight text-brand-green-900 sm:text-2xl">
                    I am a Lawyer
                  </h2>
                  <p class="text-base leading-relaxed text-brand-ink-soft">
                    List your services and grow your client base on our network.
                  </p>
                </div>
              </Card>
            </div>

            <div class="flex w-full max-w-md flex-col items-center gap-6 sm:max-w-none">
              <Button
                type="button"
                class="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-brand-green-900 text-base font-semibold shadow-lg shadow-primary/10 hover:bg-brand-green-700 sm:max-w-xs"
                size="lg"
                :disabled="!role"
                @click="step = 'form'"
              >
                Continue
              </Button>
              <p class="text-center text-base text-brand-ink-soft sm:hidden">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </NuxtLink>
              </p>
            </div>
          </div>

          <!-- Step 2: Registration form -->
          <div v-else key="form" class="mx-auto flex w-full min-w-0 max-w-lg flex-col items-center sm:items-stretch">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="mb-6 inline-flex gap-2 rounded-full border border-brand-line/50 bg-white/50 px-4 py-2 text-sm font-medium text-brand-ink-soft backdrop-blur-sm hover:bg-white hover:text-brand-green-900 sm:self-start"
              @click="step = 'role'"
            >
              <PhArrowLeft class="h-4 w-4" />
              Change selection
            </Button>

            <div class="mb-8 w-full text-center sm:mb-10">
              <p class="mb-3 text-xs font-bold uppercase tracking-widest text-brand-green-700">
                Registration
              </p>
              <h1 class="font-heading text-3xl font-normal leading-tight text-brand-green-900 sm:text-4xl">
                {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="mt-3 text-base leading-relaxed text-brand-ink-soft">
                {{
                  role === 'lawyer'
                    ? 'Join Nigeria\'s most trusted legal network.'
                    : 'Get started with GetaLawyer today.'
                }}
              </p>
            </div>

            <Card
              class="relative w-full overflow-hidden rounded-3xl border border-brand-line/50 bg-white/70 p-6 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-8 lg:p-10"
            >
              <div
                class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-green-100/50 blur-3xl"
                aria-hidden="true"
              />

              <form class="relative z-10" @submit.prevent="form.handleSubmit">
                <FieldGroup class="gap-5">
                  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <form.Field v-slot="{ field }" name="firstName">
                      <Field :data-invalid="isInvalid(field)">
                        <FieldLabel :for="field.name">First name</FieldLabel>
                        <Input
                          :id="field.name"
                          :name="field.name"
                          :model-value="field.state.value"
                          placeholder="Alex"
                          autocomplete="given-name"
                          class="h-11 rounded-xl border-brand-line/50 bg-white/80 text-base placeholder:text-brand-ink-soft/50 focus:bg-white"
                          :aria-invalid="isInvalid(field)"
                          :disabled="isSubmitting"
                          @blur="field.handleBlur"
                          @update:model-value="(v) => field.handleChange(v as any)"
                        />
                        <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                      </Field>
                    </form.Field>

                    <form.Field v-slot="{ field }" name="lastName">
                      <Field :data-invalid="isInvalid(field)">
                        <FieldLabel :for="field.name">Last name</FieldLabel>
                        <Input
                          :id="field.name"
                          :name="field.name"
                          :model-value="field.state.value"
                          placeholder="Smith"
                          autocomplete="family-name"
                          class="h-11 rounded-xl border-brand-line/50 bg-white/80 text-base placeholder:text-brand-ink-soft/50 focus:bg-white"
                          :aria-invalid="isInvalid(field)"
                          :disabled="isSubmitting"
                          @blur="field.handleBlur"
                          @update:model-value="(v) => field.handleChange(v as any)"
                        />
                        <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                      </Field>
                    </form.Field>
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
                        class="h-11 rounded-xl border-brand-line/50 bg-white/80 text-base placeholder:text-brand-ink-soft/50 focus:bg-white"
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
                      <FieldLabel :for="field.name">Password</FieldLabel>
                      <AuthPasswordInput
                        :id="field.name"
                        :name="field.name"
                        :model-value="field.state.value"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        input-class="h-11 rounded-xl border-brand-line/50 bg-white/80 text-base placeholder:text-brand-ink-soft/50 focus:bg-white"
                        :aria-invalid="isInvalid(field)"
                        :disabled="isSubmitting"
                        @blur="field.handleBlur"
                        @update:model-value="(v) => field.handleChange(v as any)"
                      />
                      <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                      <AuthPasswordRequirements :password="field.state.value" class="mt-2" />
                    </Field>
                  </form.Field>

                  <form.Field v-slot="{ field }" name="confirmPassword">
                    <Field :data-invalid="isInvalid(field)">
                      <FieldLabel :for="field.name">Confirm password</FieldLabel>
                      <AuthPasswordInput
                        :id="field.name"
                        :name="field.name"
                        :model-value="field.state.value"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        input-class="h-11 rounded-xl border-brand-line/50 bg-white/80 text-base placeholder:text-brand-ink-soft/50 focus:bg-white"
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
                    class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-green-900 text-base font-semibold shadow-lg shadow-primary/10 hover:bg-brand-green-700"
                    size="lg"
                    :disabled="isSubmitting"
                  >
                    <PhCircleNotch v-if="isSubmitting" class="h-4 w-4 shrink-0 animate-spin" />
                    <span>
                      {{
                        isSubmitting
                          ? 'Creating account…'
                          : role === 'lawyer'
                            ? 'Apply as Lawyer'
                            : 'Create account'
                      }}
                    </span>
                  </Button>
                </FieldGroup>
              </form>
            </Card>

            <p class="mx-auto mt-6 max-w-sm text-center text-sm leading-relaxed text-brand-ink-soft">
              By continuing, you agree to our
              <NuxtLink to="/terms" class="text-brand-green-900 underline underline-offset-4 hover:text-primary">
                Terms of Service
              </NuxtLink>
              and
              <NuxtLink to="/privacy" class="text-brand-green-900 underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </NuxtLink>.
            </p>
          </div>
        </Transition>
      </div>
    </main>

    <footer class="relative z-20 min-w-0 shrink-0 border-t border-brand-line/10 bg-white/30 px-4 py-6 text-center backdrop-blur-sm sm:px-8 sm:py-8">
      <p class="text-sm text-brand-ink-soft">
        &copy; {{ new Date().getFullYear() }} GetaLawyer &middot; Verified Nigerian Legal Professionals
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhBriefcase,
  PhUser,
  PhCheck,
  PhCircleNotch,
} from '@phosphor-icons/vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

const { refetchSession } = useAuth()
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

function roleCardClass(value: 'client' | 'lawyer') {
  return cn(
    'group w-full min-w-0 cursor-pointer overflow-hidden rounded-3xl border bg-white/50 backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
    role.value === value
      ? 'border-primary/50 bg-white/80 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
      : 'border-brand-line/60 hover:border-primary/30 hover:bg-white/70 sm:hover:-translate-y-0.5 sm:hover:shadow-lg',
  )
}

const registerSchema = z
  .object({
    firstName: z
      .string('First name is required.')
      .min(2, 'First name must be at least 2 characters.'),
    lastName: z
      .string('Last name is required.')
      .min(2, 'Last name must be at least 2 characters.'),
    email: z
      .email('Please enter a valid email address.'),
    password: authPasswordSchema,
    confirmPassword: z
      .string('Please confirm your password.')
  })
  .refine(data => data.password === data.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

const isSubmitting = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  validators: {
    onSubmit: registerSchema,
    onBlur: registerSchema,
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true

    try {
      const fullName = `${value.firstName} ${value.lastName}`.trim()

      const { error: signUpError } = await authClient.signUp.email({
        name: fullName,
        email: value.email,
        password: value.password,
        userType: role.value || 'client',
        onboarding_completed: false,
        callbackURL: '/onboarding',
      })

      if (signUpError) {
        apiError.value = signUpError.message || 'Failed to create account. Please try again.'
        return
      }

      await refetchSession()
      await navigateTo('/onboarding')
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

onMounted(() => {
  if (role.value) {
    step.value = 'form'
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
