<!-- components/auth/AuthEmail.vue -->
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{ push: [view: string] }>()
const { identifier } = useAuthModal()

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required')
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: identifier.value || ''
})

const loading = ref(false)
const errorMessage = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMessage.value = ''
  identifier.value = event.data.email

  try {
    const api = useApi()

    type AccountExistenceResponse = {
      status: string
      status_code: string
      message: string
      data: {
        exists: boolean
        name?: string
        email?: string
        phone?: string | null
      }
      timestamp: string
    }

    const response = await api.fetchPost<AccountExistenceResponse>(
      '/auth/check-account-existence',
      { email: event.data.email },
      { requiresAuth: false }
    )

    console.log('Email check result:', response.data.exists)
    
    if (response.data.exists) {
      emit('push', 'password')
    } else {
      emit('push', 'signup')
    }
  } catch (error: any) {
    console.error('Email check failed:', error)
    errorMessage.value = error.data?.message || 'Failed to check email. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2">
    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
      Continue with email
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      We'll check if you have an account, and help create one if you don't.
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
        {{ loading ? 'Checking...' : 'Continue' }}
      </UButton>
    </UForm>
  </div>
</template>
