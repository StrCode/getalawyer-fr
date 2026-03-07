<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { session } = useAuth()
const router = useRouter()

const form = reactive({
  name: session.value?.user.name || '',
  phone: '',
  barNumber: '',
  specialization: ''
})

const specializations = [
  'Family Law',
  'Criminal Law',
  'Corporate Law',
  'Real Estate Law',
  'Immigration Law',
  'Labor Law',
  'Tax Law',
  'Intellectual Property'
]

const completeOnboarding = async () => {
  // TODO: Update lawyer profile with onboarding data
  // For now, just navigate to dashboard
  await router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Welcome, Lawyer</h1>
        <p class="mt-2 text-gray-600">Let's set up your professional profile</p>
      </div>

      <UCard>
        <form @submit.prevent="completeOnboarding" class="space-y-6">
          <UFormGroup label="Full Name" required>
            <UInput v-model="form.name" placeholder="Enter your full name" />
          </UFormGroup>

          <UFormGroup label="Phone Number" required>
            <UInput v-model="form.phone" type="tel" placeholder="+33 6 12 34 56 78" />
          </UFormGroup>

          <UFormGroup label="Bar Number" required>
            <UInput v-model="form.barNumber" placeholder="Enter your bar number" />
          </UFormGroup>

          <UFormGroup label="Primary Specialization" required>
            <USelect 
              v-model="form.specialization" 
              :options="specializations"
              placeholder="Select your specialization"
            />
          </UFormGroup>

          <div class="flex justify-between items-center pt-4">
            <p class="text-sm text-gray-600">Step 1 of 1</p>
            <UButton type="submit" color="primary">
              Complete Setup
            </UButton>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>
