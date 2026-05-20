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

    <header class="relative z-20 flex min-w-0 shrink-0 items-center justify-between gap-2 px-2 py-3 sm:gap-3 sm:px-8 sm:py-6">
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
        <span class="font-sans text-lg font-bold tracking-tight text-brand-green-900 lowercase sm:text-2xl">
          getalawyer
        </span>
      </NuxtLink>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <span class="hidden text-sm font-medium text-brand-ink-soft sm:inline">
          Already have an account?
        </span>
        <NuxtLink
          to="/login"
          class="rounded-full border border-brand-line/50 bg-white/50 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Sign in
        </NuxtLink>
      </div>
    </header>

    <main class="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-start px-2 pt-6 pb-8 sm:justify-start sm:px-8 sm:py-12 lg:py-16">
      <div class="mx-auto w-full min-w-0 sm:max-w-3xl">
        <Transition name="slide-fade" mode="out-in">
          <!-- Step 1: Role selection -->
          <div v-if="step === 'role'" key="role" class="mx-auto flex w-full flex-col items-center gap-6 sm:max-w-none sm:gap-0">
            <div class="w-full text-center sm:mb-10">
              <p class="mb-2 text-xs font-bold uppercase tracking-widest text-brand-green-700 sm:mb-3 sm:text-xs">
                Account type
              </p>
              <h1
                class="text-balance text-2xl font-medium leading-tight tracking-tight text-brand-green-900 sm:text-4xl"
              >
                How would you like to use GetaLawyer?
              </h1>
              <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-brand-ink-soft sm:mt-4 sm:max-w-xl sm:text-base">
                Select the path that matches your needs today.
              </p>
            </div>

            <RadioGroup
              v-model="selectedRole"
              class="grid w-full min-w-0 grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-5"
            >
              <Label
                :for="clientRoleId"
                :class="roleCardClass('client')"
                class="group cursor-pointer"
              >
                <RadioGroupItem
                  :id="clientRoleId"
                  value="client"
                  class="sr-only"
                />
                <div class="relative px-5 py-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6 sm:h-6 sm:w-6"
                    :class="
                      selectedRole === 'client'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-brand-line bg-white/80'
                    "
                  >
                    <PhCheck v-if="selectedRole === 'client'" class="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 transition-transform sm:mx-0 sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl"
                    :class="selectedRole === 'client' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhUser
                      class="h-5 w-5 sm:h-7 sm:w-7"
                      :class="selectedRole === 'client' ? 'text-primary' : 'text-brand-green-700'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-1 text-xl font-semibold leading-tight text-brand-green-900 sm:mb-2 sm:text-2xl">
                    I am a Client
                  </h2>
                  <p class="text-base font-normal leading-relaxed text-brand-ink-soft sm:text-base">
                    Find and book a verified Nigerian lawyer for legal assistance.
                  </p>
                </div>
              </Label>

              <Label
                :for="lawyerRoleId"
                :class="roleCardClass('lawyer')"
                class="group cursor-pointer"
              >
                <RadioGroupItem
                  :id="lawyerRoleId"
                  value="lawyer"
                  class="sr-only"
                />
                <div class="relative px-5 py-6 text-center sm:p-7 sm:text-left">
                  <span
                    class="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all sm:top-6 sm:right-6 sm:h-6 sm:w-6"
                    :class="
                      selectedRole === 'lawyer'
                        ? 'scale-100 border-primary bg-primary shadow-md shadow-primary/25'
                        : 'scale-100 border-brand-line bg-white/80'
                    "
                  >
                    <PhCheck v-if="selectedRole === 'lawyer'" class="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" weight="bold" />
                  </span>
                  <div
                    class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 transition-transform sm:mx-0 sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl"
                    :class="selectedRole === 'lawyer' ? 'sm:group-hover:scale-105' : ''"
                  >
                    <PhBriefcase
                      class="h-5 w-5 sm:h-7 sm:w-7"
                      :class="selectedRole === 'lawyer' ? 'text-primary' : 'text-brand-green-700'"
                      weight="duotone"
                    />
                  </div>
                  <h2 class="mb-1 text-xl font-semibold leading-tight text-brand-green-900 sm:mb-2 sm:text-2xl">
                    I am a Lawyer
                  </h2>
                  <p class="text-base font-normal leading-relaxed text-brand-ink-soft sm:text-base">
                    List your services and grow your client base on our network.
                  </p>
                </div>
              </Label>
            </RadioGroup>

            <div class="flex w-full flex-col items-center gap-4 sm:gap-6">
              <Button
                type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-green-900 text-sm font-semibold shadow-lg shadow-primary/10 hover:bg-brand-green-700 sm:h-11 sm:max-w-xs sm:rounded-2xl sm:text-base"
                size="lg"
                :disabled="!selectedRole"
                @click="step = 'form'"
              >
                Continue
              </Button>
              <p class="text-center text-sm text-brand-ink-soft sm:hidden">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </NuxtLink>
              </p>
            </div>
          </div>

          <!-- Step 2: Registration form -->
          <div v-else key="form" class="mx-auto flex w-full min-w-0 flex-col items-center gap-6 sm:items-stretch sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="inline-flex gap-1.5 rounded-full border border-brand-line/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-brand-ink-soft backdrop-blur-sm hover:bg-white hover:text-brand-green-900 sm:mb-6 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:self-start"
              @click="step = 'role'"
            >
              <PhArrowLeft class="h-4 w-4" />
              Change selection
            </Button>

            <div class="w-full text-center sm:mb-10">
              <p class="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-brand-green-700 sm:mb-3 sm:text-xs">
                Registration
              </p>
              <h1 class="font-heading text-2xl font-normal leading-tight text-brand-green-900 sm:text-4xl">
                {{ selectedRole === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="mt-2 text-sm leading-relaxed text-brand-ink-soft sm:mt-3 sm:text-base">
                {{
                  selectedRole === 'lawyer'
                    ? 'Join Nigeria\'s most trusted legal network.'
                    : 'Get started with GetaLawyer today.'
                }}
              </p>
            </div>

            <Card
              class="relative w-full gap-0 overflow-hidden rounded-2xl border border-brand-line/50 bg-white/70 px-5 py-5 shadow-lg shadow-primary/5 backdrop-blur-xl sm:rounded-3xl sm:px-10 sm:py-10 sm:shadow-xl lg:px-12 lg:py-12"
            >
              <div
                class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-green-100/50 blur-3xl"
                aria-hidden="true"
              />

              <form class="relative z-10" @submit.prevent="form.handleSubmit">
                <FieldGroup class="gap-4 sm:gap-6">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
                    </Field>
                  </form.Field>

                  <AuthFormError :message="apiError" />

                  <Button
                    type="submit"
                    class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-900 text-sm font-semibold shadow-lg shadow-primary/10 hover:bg-brand-green-700 sm:h-11 sm:rounded-2xl sm:text-base"
                    size="lg"
                    :disabled="isSubmitting"
                  >
                    <PhCircleNotch v-if="isSubmitting" class="h-4 w-4 shrink-0 animate-spin" />
                    <span>
                      {{
                        isSubmitting
                          ? 'Creating account…'
                          : selectedRole === 'lawyer'
                            ? 'Apply as Lawyer'
                            : 'Create account'
                      }}
                    </span>
                  </Button>
                </FieldGroup>
              </form>
            </Card>

            <p class="mx-auto w-full text-center text-xs leading-relaxed text-brand-ink-soft sm:mt-6 sm:max-w-xl sm:text-sm">
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

const clientRoleId = useId()
const lawyerRoleId = useId()

const roleFromQuery = route.query.role as string
const selectedRole = ref<'client' | 'lawyer' | undefined>(
  roleFromQuery === 'lawyer'
    ? 'lawyer'
    : roleFromQuery === 'client'
      ? 'client'
      : undefined,
)
const step = ref<'role' | 'form'>('role')

function roleCardClass(value: 'client' | 'lawyer') {
  return cn(
    'group w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border bg-white/50 backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:rounded-3xl',
    selectedRole.value === value
      ? 'border-primary/50 bg-white/80 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
      : 'border-brand-line/60 hover:border-primary/30 hover:bg-white/70 sm:hover:-translate-y-0.5 sm:hover:shadow-lg',
  )
}

const registerSchema = z.object({
  firstName: z
    .string('First name is required.')
    .min(2, 'First name must be at least 2 characters.'),
  lastName: z
    .string('Last name is required.')
    .min(2, 'Last name must be at least 2 characters.'),
  email: z
    .email('Please enter a valid email address.'),
  password: authPasswordSchema,
})

const isSubmitting = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
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
        userType: selectedRole.value || 'client',
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
  if (selectedRole.value) {
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
