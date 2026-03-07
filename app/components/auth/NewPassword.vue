<!-- components/auth/AuthNewPassword.vue -->
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier, resetToken, close } = useAuthModal()

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive({
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const v = state.password
  if (!v) return 0
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score
})

const strengthConfig = computed(() => {
  const s = passwordStrength.value
  if (!state.password) return { label: 'Use at least 8 characters', color: 'text-gray-400' }
  if (s <= 1) return { label: 'Weak', color: 'text-gray-500' }
  if (s <= 2) return { label: 'Could be stronger', color: 'text-gray-600' }
  if (s <= 3) return { label: 'Strong', color: 'text-[#007AFC]' }
  return { label: 'Very strong', color: 'text-[#007AFC]' }
})

function segColor(index: number) {
  if (index >= passwordStrength.value) return 'bg-gray-200'
  const s = passwordStrength.value
  if (s <= 1) return 'bg-gray-300'
  if (s <= 2) return 'bg-gray-400'
  return 'bg-[#007AFC]'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMessage.value = ''

  try {
    const api = useApi()

    type ResetPasswordResponse = {
      status: string
      status_code: string
      message: string
      timestamp: string
    }

    const response = await api.fetchPost<ResetPasswordResponse>(
      '/auth/reset-password',
      {
        email: identifier.value,
        password: event.data.password,
        password_confirmation: event.data.confirmPassword,
        token: resetToken.value,
      },
      { requiresAuth: false }
    )

    if (response.status === 'success') {
      console.log('Password reset successful:', response.message)
      
      emit('push', 'success')
      
      setTimeout(() => {
        close()
        navigateTo('/')
      }, 2000)
    }
  } catch (error: any) {
    console.error('Password reset failed:', error)
    errorMessage.value = error.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      Create new password
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      Enter a new password for
      <span class="font-medium text-gray-700">{{ identifier }}</span>
    </p>

    <UAlert
      v-if="errorMessage"
      color="red"
      variant="soft"
      :title="errorMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
      class="mb-4"
      @close="errorMessage = ''"
    />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="New password" name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="New password"
          size="lg"
          autofocus
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

      <!-- Strength meter -->
      <div class="flex gap-1">
        <div
          v-for="i in 4"
          :key="i"
          class="flex-1 h-[3px] rounded-full transition-all duration-300"
          :class="segColor(i - 1)"
        />
      </div>
      <p class="text-xs transition-colors" :class="strengthConfig.color">
        {{ strengthConfig.label }}
      </p>

      <UFormField label="Confirm password" name="confirmPassword">
        <UInput
          v-model="state.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm password"
          size="lg"
        >
          <template #trailing>
            <UButton
              :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              color="gray"
              size="xs"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="bg-[#007AFC] hover:bg-[#0066D6] rounded-xl"
      >
        {{ loading ? 'Resetting...' : 'Reset password' }}
      </UButton>
    </UForm>
  </div>
</template>
