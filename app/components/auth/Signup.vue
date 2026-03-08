<!-- components/auth/AuthSignup.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier, otpType, intent } = useAuthModal()

const firstName = ref('')
const lastName = ref('')
const dob = ref('')
const email = ref(identifier.value || '')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const isPhoneRegistration = computed(() => identifier.value.startsWith('+'))

const hasUpper = computed(() => /[A-Z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const hasLength = computed(() => password.value.length >= 8)
const score = computed(() => Number(hasUpper.value) + Number(hasNumber.value) + Number(hasLength.value))

const passwordStrength = computed(() => {
  if (!password.value) return { label: 'Use at least 8 characters', color: 'text-gray-400' }
  if (score.value < 3) return { label: 'Weak password', color: 'text-red-500' }
  return { label: 'Strong password', color: 'text-teal-600' }
})

const api = useApi()

async function onSubmit() {
  errorMessage.value = ''

  // Validation
  if (!firstName.value || firstName.value.length < 2) {
    errorMessage.value = 'First name must be at least 2 characters'
    return
  }
  if (!lastName.value || lastName.value.length < 2) {
    errorMessage.value = 'Last name must be at least 2 characters'
    return
  }
  if (!dob.value) {
    errorMessage.value = 'Date of birth is required'
    return
  }
  if (!password.value || password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true

  try {
    type SignupResponse = {
      status: string
      status_code: string
      message: string
      auth_token?: string
      data?: any
      timestamp: string
    }

    const isPhoneRegistration = identifier.value.startsWith('+')
    
    const payload: Record<string, any> = {
      first_name: firstName.value,
      last_name: lastName.value,
      dob: dob.value,
      password: password.value,
      user_type: intent.value || 'tenant',
    }

    if (isPhoneRegistration) {
      payload.phone_number = identifier.value
      payload.password_confirmation = password.value
    } else {
      payload.email = email.value
    }

    const response = await api.fetchPost<SignupResponse>(
      '/auth/register',
      payload,
      { requiresAuth: false }
    )

    if (response.status === 'success' || response.status === 'created') {
      console.log('Registration successful:', response.message)
      
      if (isPhoneRegistration) {
        otpType.value = 'phone'
      } else {
        identifier.value = email.value
        otpType.value = 'email'
      }
      
      emit('push', 'otp')
    }
  } catch (error: any) {
    console.error('Registration failed:', error)
    errorMessage.value = error.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      Finish signing up
    </h2>
    <p class="text-sm text-gray-500 mb-5">
      Create your Smart Stay Rentals account
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <UAlert
        v-if="errorMessage"
        color="red"
        variant="soft"
        :title="errorMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
        @close="errorMessage = ''"
      />

      <!-- Legal name -->
      <div>
        <label class="text-sm font-medium text-gray-900 mb-2 block">
          Legal name <span class="text-red-500">*</span>
        </label>
        <div class="space-y-2">
          <UInput
            v-model="firstName"
            placeholder="First name"
            size="lg"
          />
          <UInput
            v-model="lastName"
            placeholder="Last name"
            size="lg"
          />
          <div class="flex items-start gap-1 text-xs text-gray-500">
            <UIcon name="i-lucide-info" class="w-3 h-3 mt-0.5 shrink-0" />
            <span>Make sure this matches the name on your government ID.</span>
          </div>
        </div>
      </div>

      <!-- Date of birth -->
      <UFormField label="Date of birth">
        <UInput
          v-model="dob"
          type="date"
          size="lg"
          :max="new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]"
        />
        <template #help>
          <div class="flex items-start gap-1 text-xs">
            <UIcon name="i-lucide-info" class="w-3 h-3 mt-0.5 shrink-0" />
            <span>To sign up, you need to be at least 18.</span>
          </div>
        </template>
      </UFormField>

      <!-- Email or Phone (read-only) -->
      <UFormField :label="isPhoneRegistration ? 'Phone Number' : 'Email'">
        <UInput
          v-model="email"
          :type="isPhoneRegistration ? 'tel' : 'email'"
          size="lg"
          readonly
          class="bg-gray-50"
        />
      </UFormField>

      <!-- Password -->
      <UFormField label="Password">
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          size="lg"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              color="gray"
              size="xs"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <!-- Password strength -->
      <div v-if="password && password.length > 0" class="space-y-2">
        <div class="flex gap-2">
          <div
            class="flex-1 h-2 rounded-full border transition-colors"
            :class="hasUpper ? 'bg-[#007AFC] border-[#007AFC]' : 'bg-gray-300 border-gray-300'"
          />
          <div
            class="flex-1 h-2 rounded-full border transition-colors"
            :class="hasNumber ? 'bg-[#007AFC] border-[#007AFC]' : 'bg-gray-300 border-gray-300'"
          />
          <div
            class="flex-1 h-2 rounded-full border transition-colors"
            :class="hasLength ? 'bg-[#007AFC] border-[#007AFC]' : 'bg-gray-300 border-gray-300'"
          />
        </div>

        <div v-if="score < 3" class="text-sm space-y-1">
          <p class="text-gray-600 font-medium">{{ passwordStrength.label }}. Must contain:</p>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="hasUpper" class="text-[#007AFC]">✓</span>
            <span v-else class="text-gray-400">○</span>
            <span class="text-gray-600">At least 1 uppercase</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="hasNumber" class="text-[#007AFC]">✓</span>
            <span v-else class="text-gray-400">○</span>
            <span class="text-gray-600">At least 1 number</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="hasLength" class="text-[#007AFC]">✓</span>
            <span v-else class="text-gray-400">○</span>
            <span class="text-gray-600">At least 8 characters</span>
          </div>
        </div>
        <p v-else class="text-sm font-medium text-[#007AFC]">{{ passwordStrength.label }}</p>
      </div>

      <!-- Terms -->
      <p class="text-xs text-gray-500 leading-relaxed pt-2">
        By clicking <strong class="text-gray-700">Agree and continue</strong>, you agree to accept Smart Stay Rental's
        <a href="/terms-and-conditions" class="underline text-gray-700">Terms and Conditions</a>
      </p>

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="bg-[#007AFC] hover:bg-[#0066D6] rounded-xl"
      >
        {{ loading ? 'Creating account...' : 'Agree and continue' }}
      </UButton>
    </form>
  </div>
</template>
