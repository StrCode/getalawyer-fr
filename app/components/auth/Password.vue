<!-- components/auth/AuthPassword.vue -->
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier, otpType, close } = useAuthModal()
const { signIn } = useAuth()

const schema = z.object({
  password: z.string().min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

const state = reactive({
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')
const api = useApi()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  loginError.value = ''

  try {
    const isPhone = identifier.value.startsWith('+')
    
    const loginPayload = isPhone
      ? { phone_number: identifier.value, password: event.data.password }
      : { email: identifier.value, password: event.data.password }
    
    await signIn(loginPayload, { redirect: false })

    console.log('Login successful')
    
    emit('push', 'success')
    
    setTimeout(() => {
      close()
      navigateTo('/account')
    }, 1500)
  } catch (error: any) {
    console.error('Login failed:', error)
    
    if (error.status === 422 || error.statusCode === 422) {
      const errorData = error.data || error.response?.data
      
      if (errorData?.status_code === '15' || errorData?.status_code === '20') {
        const isPhone = identifier.value.startsWith('+')
        
        try {
          const payload = isPhone 
            ? { phone_number: identifier.value }
            : { email: identifier.value }
          
          await api.fetchPost('/auth/resend-verification-token', payload, { requiresAuth: false })
          
          otpType.value = isPhone ? 'phone' : 'email'
          console.log(`${isPhone ? 'Phone' : 'Email'} verification code sent`)
          
          emit('push', 'otp')
          return
        } catch (resendError: any) {
          console.error('Failed to send verification code:', resendError)
          loginError.value = resendError.data?.message || 'Failed to send verification code. Please try again.'
          return
        }
      }
    }
    
    loginError.value = error.data?.message || 'Incorrect credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      Welcome back
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      Enter your password for
      <span class="font-medium text-gray-700">{{ identifier }}</span>
    </p>

    <UAlert
      v-if="loginError"
      color="red"
      variant="soft"
      :title="loginError"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
      class="mb-4"
      @close="loginError = ''"
    />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
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

      <UButton
        type="submit"
        :loading="loading"
        block
        size="lg"
        class="bg-[#007AFC] hover:bg-[#0066D6] rounded-xl"
      >
        {{ loading ? 'Logging in...' : 'Log in' }}
      </UButton>
    </UForm>

    <UButton
      variant="ghost"
      color="gray"
      block
      class="mt-1 text-sm"
      @click="emit('push', 'forgot')"
    >
      Forgot password?
    </UButton>
  </div>
</template>
