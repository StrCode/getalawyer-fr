<!-- components/auth/AuthForgot.vue -->
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier, otpType } = useAuthModal()

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required')
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: identifier.value || ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  identifier.value = event.data.email

  try {
    const api = useApi()

    type SendResetTokenResponse = {
      status: string
      status_code: string
      message: string
      timestamp: string
    }

    const response = await api.fetchPost<SendResetTokenResponse>(
      '/auth/resend-password-reset-token',
      { email: event.data.email },
      { requiresAuth: false }
    )

    if (response.status === 'success') {
      console.log('Password reset token sent:', response.message)
      successMessage.value = 'Reset link sent! Check your email for instructions.'
      
      otpType.value = 'password-reset'
      
      setTimeout(() => {
        emit('push', 'otp')
      }, 2000)
    }
  } catch (error: any) {
    console.error('Password reset failed:', error)
    errorMessage.value = error.data?.message || 'Failed to send reset link. Please check your email and try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      Forgot password?
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      We'll send a reset link to your email address.
    </p>

    <UAlert
      v-if="successMessage"
      color="blue"
      variant="soft"
      :title="successMessage"
      class="mb-4"
    />

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
      <UFormField label="Email address" name="email">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="Email address"
          size="lg"
          autofocus
        />
      </UFormField>

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="bg-[#1d6b44] hover:bg-[#154a2f] rounded-xl"
      >
        {{ loading ? 'Sending...' : 'Send reset link' }}
      </UButton>
    </UForm>
  </div>
</template>
