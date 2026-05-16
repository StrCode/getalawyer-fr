<template>
  <div class="min-h-dvh w-full bg-brand-cream overflow-x-hidden relative flex flex-col font-sans">
    <!-- Sophisticated Background Elements (Matching Landing Style) -->
    <div class="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-green-100/60 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green-100/40 rounded-full blur-[120px] pointer-events-none"></div>
    
    <!-- Header: Logo and Sign In -->
    <header class="w-full px-6 py-6 sm:px-10 sm:py-8 flex items-center justify-between relative z-20 shrink-0">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5 group">
        <svg class="w-8 h-8 text-primary transition-transform group-hover:scale-105" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,20 38,42 38,82 0,60" fill="currentColor"/>
          <polygon points="62,42 100,20 100,60 62,82" fill="currentColor" opacity="0.55"/>
        </svg>
        <span class="font-sans font-bold text-2xl tracking-tight lowercase text-brand-green-900">getalawyer</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <span class="hidden sm:inline-block text-sm text-brand-ink-soft font-medium">Already have an account?</span>
        <NuxtLink to="/login" class="text-sm font-bold text-primary hover:bg-white/60 px-5 py-2.5 rounded-full transition-all border border-brand-line/50 bg-white/40 backdrop-blur-sm shadow-sm">
          Sign in
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12 lg:py-20">
      <div class="w-full max-w-2xl">
        <Transition name="slide-fade" mode="out-in">
          
          <!-- STEP 1: Full-screen Role Selection -->
          <div v-if="step === 'role'" key="role" class="w-full">
            <div class="text-center mb-12">
              <p class="text-xs font-bold text-brand-green-700 tracking-[0.2em] uppercase mb-4">Account Type</p>
              <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-normal text-brand-green-900 leading-tight mb-4">
                How would you like to use <br class="hidden sm:block" /> GetaLawyer?
              </h1>
              <p class="text-lg text-brand-ink-soft max-w-lg mx-auto leading-relaxed font-medium">
                Select the path that matches your needs today.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <Card
                role="button"
                tabindex="0"
                :aria-pressed="role === 'client'"
                :class="
                  cn(
                    'group relative overflow-hidden border border-brand-line/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white/40 backdrop-blur-md rounded-[2rem] p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                    role === 'client'
                      ? 'border-primary/40 ring-1 ring-primary/20 shadow-xl shadow-primary/5 bg-white/70'
                      : 'hover:border-primary/30',
                  )
                "
                @click="role = 'client'"
                @keydown.enter.prevent="role = 'client'"
                @keydown.space.prevent="role = 'client'"
              >
                <div class="p-8">
                  <div class="w-16 h-16 rounded-2xl bg-brand-green-100 flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                    <PhUser :class="cn('w-8 h-8 transition-colors', role === 'client' ? 'text-primary' : 'text-brand-green-700')" weight="duotone" />
                  </div>
                  <h3 class="text-2xl font-heading text-brand-green-900 mb-2">I am a Client</h3>
                  <p class="text-brand-ink-soft leading-relaxed font-medium text-sm">
                    I need to find and book a verified Nigerian lawyer for legal assistance.
                  </p>
                  <div 
                    class="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-brand-line flex items-center justify-center transition-all duration-500"
                    :class="role === 'client' ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' : 'bg-white/50 scale-100'"
                  >
                    <PhCheck v-if="role === 'client'" class="w-3.5 h-3.5 text-white" weight="bold" />
                  </div>
                </div>
              </Card>

              <Card
                role="button"
                tabindex="0"
                :aria-pressed="role === 'lawyer'"
                :class="
                  cn(
                    'group relative overflow-hidden border border-brand-line/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white/40 backdrop-blur-md rounded-[2rem] p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                    role === 'lawyer'
                      ? 'border-primary/40 ring-1 ring-primary/20 shadow-xl shadow-primary/5 bg-white/70'
                      : 'hover:border-primary/30',
                  )
                "
                @click="role = 'lawyer'"
                @keydown.enter.prevent="role = 'lawyer'"
                @keydown.space.prevent="role = 'lawyer'"
              >
                <div class="p-8">
                  <div class="w-16 h-16 rounded-2xl bg-brand-green-100 flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-inner">
                    <PhBriefcase :class="cn('w-8 h-8 transition-colors', role === 'lawyer' ? 'text-primary' : 'text-brand-green-700')" weight="duotone" />
                  </div>
                  <h3 class="text-2xl font-heading text-brand-green-900 mb-2">I am a Lawyer</h3>
                  <p class="text-brand-ink-soft leading-relaxed font-medium text-sm">
                    I am a qualified professional looking to list my services and grow my client base.
                  </p>
                  <div 
                    class="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-brand-line flex items-center justify-center transition-all duration-500"
                    :class="role === 'lawyer' ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' : 'bg-white/50 scale-100'"
                  >
                    <PhCheck v-if="role === 'lawyer'" class="w-3.5 h-3.5 text-white" weight="bold" />
                  </div>
                </div>
              </Card>
            </div>

            <div class="flex flex-col items-center">
              <Button
                class="w-full sm:w-64 h-14 text-lg font-bold shadow-2xl shadow-primary/10 transition-all active:scale-95 rounded-[1.25rem] bg-brand-green-900 hover:bg-brand-green-700"
                size="lg"
                :disabled="!role"
                @click="step = 'form'"
              >
                Continue
              </Button>
            </div>
          </div>

          <!-- STEP 2: Full-screen Registration Form -->
          <div v-else key="form" class="w-full max-w-lg mx-auto">
            <div class="text-center mb-10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="mb-8 text-brand-ink-soft hover:text-brand-green-900 transition-colors inline-flex gap-2 font-bold px-4 py-2 bg-white/40 backdrop-blur-sm border border-brand-line/50 rounded-full"
                @click="step = 'role'"
              >
                <PhArrowLeft class="w-4 h-4" />
                Change Selection
              </Button>
              
              <p class="text-xs font-bold text-brand-green-700 tracking-[0.2em] uppercase mb-4">Registration</p>
              <h1 class="font-heading text-4xl sm:text-5xl font-normal text-brand-green-900 mb-3">
                {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="text-brand-ink-soft text-lg font-medium">
                {{ role === 'lawyer' ? 'Join Nigeria\'s most trusted legal network.' : 'Get started with GetaLawyer today.' }}
              </p>
            </div>

            <Card class="p-10 border border-brand-line/50 shadow-2xl shadow-primary/5 bg-white/40 backdrop-blur-xl rounded-[3rem] relative overflow-hidden">
              <!-- Subtle decorative element matching testimonial -->
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-brand-green-100/50 rounded-full blur-3xl pointer-events-none"></div>

              <form @submit.prevent="form.handleSubmit" class="space-y-6 relative z-10">
                <div class="grid grid-cols-2 gap-4">
                  <form.Field v-slot="{ field }" name="firstName">
                    <Field :data-invalid="isInvalid(field)">
                      <FieldLabel :for="field.name" class="text-brand-green-900 font-bold text-xs uppercase tracking-wider ml-1">First name</FieldLabel>
                      <Input
                        :id="field.name"
                        :name="field.name"
                        :model-value="field.state.value"
                        placeholder="Alex"
                        autocomplete="given-name"
                        class="h-12 rounded-2xl bg-white/60 border-brand-line/50 focus:bg-white focus:ring-primary/20 transition-all text-brand-green-900 placeholder:text-brand-ink-soft/40"
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
                      <FieldLabel :for="field.name" class="text-brand-green-900 font-bold text-xs uppercase tracking-wider ml-1">Last name</FieldLabel>
                      <Input
                        :id="field.name"
                        :name="field.name"
                        :model-value="field.state.value"
                        placeholder="Smith"
                        autocomplete="family-name"
                        class="h-12 rounded-2xl bg-white/60 border-brand-line/50 focus:bg-white focus:ring-primary/20 transition-all text-brand-green-900 placeholder:text-brand-ink-soft/40"
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
                    <FieldLabel :for="field.name" class="text-brand-green-900 font-bold text-xs uppercase tracking-wider ml-1">Email address</FieldLabel>
                    <Input
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      type="email"
                      placeholder="alex@example.com"
                      autocomplete="email"
                      class="h-12 rounded-2xl bg-white/60 border-brand-line/50 focus:bg-white focus:ring-primary/20 transition-all text-brand-green-900 placeholder:text-brand-ink-soft/40"
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
                    <FieldLabel :for="field.name" class="text-brand-green-900 font-bold text-xs uppercase tracking-wider ml-1">Password</FieldLabel>
                    <AuthPasswordInput
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      placeholder="••••••••"
                      autocomplete="new-password"
                      input-class="rounded-2xl bg-white/60 border-brand-line/50 focus:bg-white focus:ring-primary/20 transition-all text-brand-green-900 placeholder:text-brand-ink-soft/40"
                      :aria-invalid="isInvalid(field)"
                      :disabled="isSubmitting"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(v as any)"
                    />
                    <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                    <div class="mt-2">
                      <AuthPasswordRequirements :password="field.state.value" />
                    </div>
                  </Field>
                </form.Field>

                <form.Field v-slot="{ field }" name="confirmPassword">
                  <Field :data-invalid="isInvalid(field)">
                    <FieldLabel :for="field.name" class="text-brand-green-900 font-bold text-xs uppercase tracking-wider ml-1">Confirm password</FieldLabel>
                    <AuthPasswordInput
                      :id="field.name"
                      :name="field.name"
                      :model-value="field.state.value"
                      placeholder="••••••••"
                      autocomplete="new-password"
                      input-class="rounded-2xl bg-white/60 border-brand-line/50 focus:bg-white focus:ring-primary/20 transition-all text-brand-green-900 placeholder:text-brand-ink-soft/40"
                      :aria-invalid="isInvalid(field)"
                      :disabled="isSubmitting"
                      @blur="field.handleBlur"
                      @update:model-value="(v) => field.handleChange(v as any)"
                    />
                    <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                  </Field>
                </form.Field>

                <AuthFormError :message="apiError" />

                <Button type="submit" class="w-full h-14 rounded-2xl shadow-2xl shadow-primary/10 text-lg font-bold bg-brand-green-900 hover:bg-brand-green-700" :disabled="isSubmitting">
                  <PhCircleNotch v-if="isSubmitting" class="w-5 h-5 animate-spin mr-2" />
                  <span v-if="isSubmitting">Syncing account...</span>
                  <span v-else>{{ role === 'lawyer' ? 'Apply as Lawyer' : 'Create account' }}</span>
                </Button>
              </form>
            </Card>

            <p class="mt-8 text-center text-[10px] text-brand-ink-soft leading-relaxed max-w-sm mx-auto uppercase tracking-widest font-bold">
              By continuing, you agree to our 
              <NuxtLink to="/terms" class="text-brand-green-900 hover:text-primary underline underline-offset-2 transition-colors">Terms of Use</NuxtLink> 
              and 
              <NuxtLink to="/privacy" class="text-brand-green-900 hover:text-primary underline underline-offset-2 transition-colors">Privacy Policy</NuxtLink>.
            </p>
          </div>
        </Transition>
      </div>
    </main>

    <!-- Footer for legal links -->
    <footer class="w-full px-6 py-10 text-center shrink-0 relative z-20 border-t border-brand-line/10 bg-white/20 backdrop-blur-sm">
      <p class="text-xs text-brand-ink-soft font-bold uppercase tracking-[0.1em]">
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

const registerSchema = z
  .object({
    firstName: z
      .string('First name is required.')
      .min(1, 'First name is required.')
      .min(2, 'First name must be at least 2 characters.'),
    lastName: z
      .string('Last name is required.')
      .min(1, 'Last name is required.')
      .min(2, 'Last name must be at least 2 characters.'),
    email: z
      .email('Please enter a valid email address.')
      .min(1, 'Email address is required.'),
    password: authPasswordSchema,
    confirmPassword: z
      .string('Please confirm your password.')
      .min(1, 'Please confirm your password.'),
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

// Auto-advance if role is provided in query
onMounted(() => {
  if (role.value) {
    step.value = 'form'
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
