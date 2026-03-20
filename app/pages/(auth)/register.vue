<template>
  <div class="flex bg-white w-full h-screen overflow-hidden">

    <!-- Left Column: Form -->
    <div class="flex flex-col bg-white w-full lg:w-[52%] overflow-y-auto">
      <div class="flex flex-col justify-center px-10 sm:px-16 py-12 min-h-full">
        <div class="mx-auto w-full max-w-md">

          <!-- Logo -->
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 mb-10">
            <div class="flex flex-shrink-0 justify-center items-center bg-[#1d6b44] rounded-lg w-8 h-8">
              <Icon name="i-hugeicons-legal-document-02" class="w-4 h-4 text-white" />
            </div>
            <span class="font-bold text-[18px] text-gray-900 tracking-tight">
              Lex<span class="text-[#1d6b44]">Connect</span>
            </span>
          </NuxtLink>

          <!-- STEP 1: Role Selection -->
          <Transition name="fade">
            <div v-if="step === 'role'" key="role">
              <h1 class="mb-1 font-bold text-[26px] text-gray-900 tracking-tight">
                Create your account
              </h1>
              <p class="mb-6 text-gray-400 text-sm">I am joining as a...</p>

              <!-- Role Cards -->
              <div class="gap-4 grid grid-cols-2 mb-6">

                <!-- Client Card -->
                <button
                  type="button"
                  class="group border-[1.5px] rounded-2xl overflow-hidden text-left transition-all duration-150 cursor-pointer"
                  :class="role === 'client'
                    ? 'border-[#1d6b44] shadow-[0_0_0_3px_rgba(29,107,68,0.08)]'
                    : 'border-gray-200 hover:border-gray-300'"
                  @click="role = 'client'"
                >
                  <!-- Illustrated top -->
                  <div
                    class="relative flex justify-center items-center w-full h-[130px] transition-colors duration-150"
                    :class="role === 'client' ? 'bg-[#edf7f2]' : 'bg-[#fdf2ee]'"
                  >
                    <!-- Sparkle star -->
                    <svg class="top-3.5 left-4 absolute opacity-70 w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v4M8 11v4M1 8h4M11 8h4" stroke="#f87171" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <div class="top-4 left-5 absolute bg-red-300 opacity-60 rounded-full w-3 h-3" />
                    <div class="top-7 right-6 absolute bg-amber-300 opacity-50 rounded-full w-2 h-2" />

                    <!-- Circle + illustration -->
                    <div
                      class="flex justify-center items-center rounded-full w-[72px] h-[72px] transition-colors duration-150"
                      :class="role === 'client' ? 'bg-[#b8e2cc]' : 'bg-[#f9d9cc]'"
                    >
                      <svg viewBox="0 0 40 40" fill="none" class="w-10 h-10">
                        <circle cx="20" cy="13" r="7" fill="#fff" stroke="#1d6b44" stroke-width="1.5"/>
                        <circle cx="18" cy="13" r="0.9" fill="#1d6b44"/>
                        <circle cx="22" cy="13" r="0.9" fill="#1d6b44"/>
                        <path d="M17.5 15c.6 1.2 2.4 1.5 3 .5" stroke="#1d6b44" stroke-width="1" stroke-linecap="round"/>
                        <path d="M10 34c0-5.5 4.5-9 10-9s10 3.5 10 9" fill="#d1fae5" stroke="#1d6b44" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Card body -->
                  <div
                    class="px-3.5 py-3 border-t-[1.5px] transition-colors duration-150"
                    :class="role === 'client' ? 'border-[#1d6b44]' : 'border-gray-200'"
                  >
                    <p class="mb-1 font-bold text-[13px] text-gray-900">Client</p>
                    <p class="mb-2.5 text-[11px] text-gray-500 leading-snug">I'm looking for expert legal help.</p>
                    <div class="flex items-center gap-1.5" :class="role === 'client' ? 'text-[#1d6b44]' : 'text-gray-400'">
                      <Icon name="i-hugeicons-clock-01" class="w-3 h-3" />
                      <span class="font-medium text-[11px]">Book a consultation</span>
                    </div>
                  </div>
                </button>

                <!-- Lawyer Card -->
                <button
                  type="button"
                  class="group border-[1.5px] rounded-2xl overflow-hidden text-left transition-all duration-150 cursor-pointer"
                  :class="role === 'lawyer'
                    ? 'border-[#1d6b44] shadow-[0_0_0_3px_rgba(29,107,68,0.08)]'
                    : 'border-gray-200 hover:border-gray-300'"
                  @click="role = 'lawyer'"
                >
                  <!-- Illustrated top -->
                  <div
                    class="relative flex justify-center items-center w-full h-[130px] transition-colors duration-150"
                    :class="role === 'lawyer' ? 'bg-[#edf7f2]' : 'bg-[#fdf2ee]'"
                  >
                    <svg class="top-3.5 left-4 absolute opacity-70 w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v4M8 11v4M1 8h4M11 8h4" stroke="#f87171" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <div class="top-4 left-5 absolute bg-red-300 opacity-60 rounded-full w-3 h-3" />
                    <div class="top-7 right-6 absolute bg-amber-300 opacity-50 rounded-full w-2 h-2" />

                    <div
                      class="flex justify-center items-center rounded-full w-[72px] h-[72px] transition-colors duration-150"
                      :class="role === 'lawyer' ? 'bg-[#b8e2cc]' : 'bg-[#f9d9cc]'"
                    >
                      <svg viewBox="0 0 40 40" fill="none" class="w-10 h-10">
                        <!-- Scale of justice -->
                        <line x1="20" y1="9" x2="20" y2="28" stroke="#1d6b44" stroke-width="1.5"/>
                        <line x1="11" y1="15" x2="29" y2="15" stroke="#1d6b44" stroke-width="1.5"/>
                        <path d="M11 15 Q9 20 14 22 Q19 20 17 15" fill="#d1fae5" stroke="#1d6b44" stroke-width="1.2"/>
                        <path d="M23 15 Q21 21 26 23 Q31 21 29 15" fill="#d1fae5" stroke="#1d6b44" stroke-width="1.2"/>
                        <rect x="16.5" y="28" width="7" height="2.5" rx="1.25" fill="#1d6b44"/>
                        <rect x="13.5" y="30" width="13" height="2" rx="1" fill="#1d6b44" opacity="0.5"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Card body -->
                  <div
                    class="px-3.5 py-3 border-t-[1.5px] transition-colors duration-150"
                    :class="role === 'lawyer' ? 'border-[#1d6b44]' : 'border-gray-200'"
                  >
                    <p class="mb-1 font-bold text-[13px] text-gray-900">Lawyer</p>
                    <p class="mb-2.5 text-[11px] text-gray-500 leading-snug">I offer professional legal services.</p>
                    <div class="flex items-center gap-1.5" :class="role === 'lawyer' ? 'text-[#1d6b44]' : 'text-gray-400'">
                      <Icon name="i-hugeicons-briefcase-01" class="w-3 h-3" />
                      <span class="font-medium text-[11px]">Register practice</span>
                    </div>
                  </div>
                </button>

              </div>

              <button
                type="button"
                :disabled="!role"
                class="py-3 rounded-xl w-full font-semibold text-sm transition-all duration-150"
                :class="role
                  ? 'bg-[#1d6b44] text-white hover:bg-[#175537] cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                @click="step = 'form'"
              >
                {{ role ? `Continue as ${role === 'lawyer' ? 'Lawyer' : 'Client'}` : 'Select a role to continue' }}
              </button>

              <p class="mt-5 text-gray-400 text-sm text-center">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-[#1d6b44] hover:underline">Log in</NuxtLink>
              </p>
            </div>
          </Transition>

          <!-- STEP 2: Registration Form -->
          <Transition name="fade">
            <div v-if="step === 'form'" key="form">

              <!-- Back + role badge -->
              <div class="flex items-center gap-3 mb-8">
                <button
                  type="button"
                  class="flex justify-center items-center hover:bg-gray-50 border border-gray-200 rounded-lg w-8 h-8 transition-colors cursor-pointer"
                  @click="step = 'role'"
                >
                  <Icon name="i-hugeicons-arrow-left-01" class="w-4 h-4 text-gray-500" />
                </button>
                <div class="flex items-center gap-1.5 bg-[#f0faf4] px-3 py-1.5 border border-[#1d6b44]/20 rounded-lg">
                  <Icon
                    :name="role === 'lawyer' ? 'i-hugeicons-briefcase-01' : 'i-hugeicons-user'"
                    class="w-3.5 h-3.5 text-[#1d6b44]"
                  />
                  <span class="font-semibold text-[#1d6b44] text-xs capitalize">{{ role }}</span>
                </div>
              </div>

              <h1 class="mb-1 font-bold text-[26px] text-gray-900 tracking-tight">
                {{ role === 'lawyer' ? 'Apply as a Lawyer' : 'Create your account' }}
              </h1>
              <p class="mb-6 text-gray-400 text-sm">
                {{ role === 'lawyer' ? 'Fill in your details to get verified.' : 'Join in seconds.' }}
              </p>

              <UForm :state="formData" class="space-y-4" @submit="handleSubmit">

                <UFormField label="Full name" name="name">
                  <UInput
                    v-model="formData.name"
                    placeholder="Alex Smith"
                    size="lg"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Email address" name="email">
                  <UInput
                    v-model="formData.email"
                    type="email"
                    placeholder="alex@example.com"
                    size="lg"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>

                <div class="gap-3 grid grid-cols-2">
                  <UFormField label="Password" name="password">
                    <UInput
                      v-model="formData.password"
                      type="password"
                      placeholder="••••••••"
                      size="lg"
                      :disabled="isSubmitting"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Confirm password" name="confirmPassword">
                    <UInput
                      v-model="formData.confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      size="lg"
                      :disabled="isSubmitting"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <!-- Error -->
                <div
                  v-if="error"
                  class="flex items-start gap-2 bg-red-50 p-3 border border-red-100 rounded-lg text-red-600 text-sm"
                >
                  <Icon name="i-hugeicons-alert-circle" class="mt-0.5 w-4 h-4 shrink-0" />
                  <span>{{ error }}</span>
                </div>

                <UButton
                  type="submit"
                  size="lg"
                  block
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  class="!bg-[#1d6b44] hover:!bg-[#175537] mt-2 font-semibold !text-white"
                >
                  {{ role === 'lawyer' ? 'Apply as Lawyer' : 'Create Account' }}
                </UButton>

              </UForm>

              <p class="mt-5 text-gray-400 text-sm text-center">
                Already have an account?
                <NuxtLink to="/login" class="font-semibold text-[#1d6b44] hover:underline">Log in</NuxtLink>
              </p>

              <p class="mt-4 text-gray-400 text-xs text-center leading-relaxed">
                By continuing, you agree to our
                <NuxtLink to="/terms" class="text-gray-500 underline">Terms of Service</NuxtLink>
                and
                <NuxtLink to="/privacy" class="text-gray-500 underline">Privacy Policy</NuxtLink>.
              </p>

            </div>
          </Transition>

        </div>
      </div>
    </div>

    <!-- Right Column: Decorative (same as login) -->
    <div class="hidden lg:flex flex-col justify-between items-center bg-[#f5f0e8] px-10 py-10 lg:w-[48%]">

      <div class="flex flex-1 justify-center items-center w-full">
        <svg viewBox="0 0 320 280" width="300" height="260" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="232" rx="130" ry="16" fill="#e0d9ce" opacity="0.5"/>
          <rect x="58" y="188" width="62" height="10" rx="2" fill="#c8b89a"/>
          <rect x="61" y="178" width="58" height="11" rx="2" fill="#b8a88a"/>
          <rect x="64" y="168" width="54" height="11" rx="2" fill="#d4c4a8"/>
          <rect x="108" y="118" width="104" height="112" rx="6" fill="#ffffff" stroke="#e0d9ce" stroke-width="1"/>
          <rect x="118" y="132" width="64" height="5" rx="2" fill="#ddd"/>
          <rect x="118" y="142" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="149" width="78" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="156" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="163" width="68" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="173" width="84" height="3" rx="1.5" fill="#ece7de"/>
          <rect x="118" y="180" width="72" height="3" rx="1.5" fill="#ece7de"/>
          <circle cx="153" cy="208" r="13" fill="#e8f5ee" stroke="#1d6b44" stroke-width="1.2"/>
          <text x="153" y="212" text-anchor="middle" font-size="8" fill="#1d6b44" font-family="sans-serif" font-weight="700">NBA</text>
          <rect x="196" y="144" width="40" height="15" rx="4" fill="#8B6914" transform="rotate(-35 212 151)"/>
          <rect x="202" y="160" width="7" height="44" rx="3" fill="#a07820" transform="rotate(-35 205 182)"/>
          <line x1="80" y1="98" x2="80" y2="165" stroke="#aaa" stroke-width="1.5"/>
          <line x1="54" y1="116" x2="106" y2="116" stroke="#aaa" stroke-width="1.5"/>
          <line x1="54" y1="116" x2="54" y2="130" stroke="#bbb" stroke-width="1"/>
          <line x1="66" y1="116" x2="66" y2="130" stroke="#bbb" stroke-width="1"/>
          <path d="M50 130 Q50 140 60 142 Q70 140 70 130 Z" fill="#ccc" opacity="0.8"/>
          <line x1="94" y1="116" x2="94" y2="125" stroke="#bbb" stroke-width="1"/>
          <line x1="106" y1="116" x2="106" y2="125" stroke="#bbb" stroke-width="1"/>
          <path d="M90 125 Q90 136 100 138 Q110 136 110 125 Z" fill="#ccc" opacity="0.8"/>
          <rect x="73" y="164" width="14" height="4" rx="2" fill="#aaa"/>
          <rect x="67" y="167" width="26" height="4" rx="2" fill="#bbb"/>
          <circle cx="248" cy="93" r="19" fill="#d4c4a8"/>
          <path d="M226 148 Q226 120 248 118 Q270 120 270 148" fill="#2d4a3e"/>
          <path d="M241 118 L248 130 L255 118" fill="#1d6b44" opacity="0.85"/>
          <rect x="258" y="136" width="24" height="17" rx="3" fill="#8B6914"/>
          <rect x="263" y="133" width="14" height="5" rx="2" fill="none" stroke="#8B6914" stroke-width="1.5"/>
          <line x1="258" y1="144" x2="282" y2="144" stroke="#a07820" stroke-width="1"/>
          <path d="M292 58 L294 52 L296 58 L302 60 L296 62 L294 68 L292 62 L286 60 Z" fill="#f0c040" opacity="0.65"/>
          <path d="M42 72 L43.5 67 L45 72 L50 73.5 L45 75 L43.5 80 L42 75 L37 73.5 Z" fill="#f0c040" opacity="0.5"/>
          <circle cx="296" cy="100" r="3" fill="#f0c040" opacity="0.35"/>
          <circle cx="38" cy="115" r="2" fill="#f0c040" opacity="0.35"/>
          <circle cx="292" cy="148" r="11" fill="#e8f5ee"/>
          <path d="M287 148 L291 152 L297 143" stroke="#1d6b44" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="40" cy="158" r="9" fill="#e8f5ee"/>
          <path d="M36 158 L39 161 L44 154" stroke="#1d6b44" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="flex justify-between items-center gap-4 pt-5 border-black/10 border-t w-full">
        <div>
          <p class="mb-0.5 font-semibold text-gray-800 text-sm">Take LexConnect with you</p>
          <p class="text-gray-500 text-xs leading-relaxed">
            Find verified lawyers on our mobile app<br>for iOS and Android.
          </p>
        </div>
        <div class="flex flex-shrink-0 justify-center items-center bg-white p-1.5 rounded-lg w-[52px] h-[52px]">
          <svg viewBox="0 0 44 44" width="40" height="40">
            <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="6" y="6" width="8" height="8" fill="#222"/>
            <rect x="26" y="2" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="30" y="6" width="8" height="8" fill="#222"/>
            <rect x="2" y="26" width="16" height="16" rx="2" fill="none" stroke="#222" stroke-width="2"/>
            <rect x="6" y="30" width="8" height="8" fill="#222"/>
            <rect x="26" y="26" width="4" height="4" fill="#222"/>
            <rect x="32" y="26" width="4" height="4" fill="#222"/>
            <rect x="38" y="26" width="4" height="4" fill="#222"/>
            <rect x="26" y="32" width="4" height="4" fill="#222"/>
            <rect x="32" y="38" width="4" height="4" fill="#222"/>
            <rect x="38" y="32" width="4" height="4" fill="#222"/>
            <rect x="38" y="38" width="4" height="4" fill="#222"/>
          </svg>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

const route = useRoute()

const roleFromQuery = route.query.role as string
const role = ref<'client' | 'lawyer' | null>(
  roleFromQuery === 'lawyer' ? 'lawyer' : roleFromQuery === 'client' ? 'client' : null
)
const step = ref<'role' | 'form'>('role')

const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
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
    const { data, error: signUpError } = await authClient.signUp.email({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: role.value,
      onboarding_completed: false,
      callbackURL: role.value === 'lawyer' ? '/onboarding/lawyer' : '/onboarding/client/location',
    })

    if (signUpError) {
      error.value = signUpError.message || 'Failed to create account. Please try again.'
      return
    }

    await navigateTo(role.value === 'lawyer' ? '/onboarding/lawyer' : '/onboarding/client/location')
  } catch (err: any) {
    error.value = err?.message || 'An unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>