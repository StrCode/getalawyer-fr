<script setup lang="ts">
const { intent } = useAuthModal()

const emit = defineEmits<{
    push: [view: string]
}>()

type StartOption = 'tenant' | 'property_owner'

const selected = ref<StartOption>('tenant')

const options = [
    {
        value: 'tenant' as StartOption,
        title: 'Book or rent a property',
        description: 'Find your next short or long-term stay.',
    },
    {
        value: 'property_owner' as StartOption,
        title: 'I own a property',
        description: 'Join our network to connect with clients seeking legal advice.',
    },
]

function next() {
    // Store the user's intent (tenant or property_owner)
    intent.value = selected.value
    
    emit('push', 'entry')
}

function goToLogin() {
    // Skip to email entry for existing users
    emit('push', 'entry')
}
</script>

<template>
  <div class="px-6 py-6">
    <h2 class="mb-1 font-semibold text-gray-900 text-xl text-center tracking-tight">
      Welcome to LexConnect
    </h2>
    <p class="mb-6 text-gray-500 text-sm text-center">
      Let's get started. What brings you here?
    </p>

    <UDivider class="mb-6" />

    <URadioGroup v-model="selected" class="flex flex-col gap-3 mb-6">
      <URadio
        v-for="option in options"
        :key="option.value"
        v-model="selected"
        :value="option.value"
        :ui="{
          wrapper: 'flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all',
          base: 'mt-0.5 shrink-0',
        }"
        :class="
          selected === option.value
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        "
      >
        <template #label>
          <div class="flex-1">
            <div class="mb-0.5 font-medium text-[#1C1C1C]">
              {{ option.title }}
            </div>
            <div class="text-gray-500 text-sm">
              {{ option.description }}
            </div>
          </div>
        </template>
      </URadio>
    </URadioGroup>

    <UButton
      block
      size="lg"
      class="bg-gradient-to-r from-[#E31C5F] to-[#FF385C] hover:from-[#d01856] hover:to-[#e8304f] rounded-xl mb-4"
      @click="next"
    >
      Continue
    </UButton>

    <p class="mt-4 text-gray-600 text-sm text-center">
      Already have an account?
      <button
        class="font-semibold text-gray-900 hover:text-gray-700 underline underline-offset-2 transition-colors"
        @click="goToLogin"
      >
        Log in
      </button>
    </p>
  </div>
</template>
