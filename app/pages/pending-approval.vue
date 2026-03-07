<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { signOut } = useAuth()
const applicationId = ref('')

const config = useRuntimeConfig()

// Fetch application details
const { data } = await useFetch<{ application_id: string }>(`${config.public.apiUrl}/api/register/status`, {
  credentials: 'include',
})

if (data.value?.application_id) {
  applicationId.value = data.value.application_id
}

const handleSignOut = async () => {
  await signOut()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <Icon name="heroicons:check-circle" class="w-10 h-10 text-green-600" />
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Application Submitted!
      </h1>

      <!-- Message -->
      <p class="text-gray-600 mb-6">
        Thank you for submitting your lawyer registration application. 
        Our team will review your information and get back to you within 3-5 business days.
      </p>

      <!-- Application ID -->
      <div v-if="applicationId" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-600 mb-1">Application ID</p>
        <p class="font-mono font-semibold text-blue-900">{{ applicationId }}</p>
      </div>

      <!-- What's Next -->
      <div class="text-left bg-gray-50 rounded-lg p-4 mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">What happens next?</h2>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Our team will verify your credentials</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>You'll receive an email notification once approved</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon name="heroicons:check" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>You can then access your lawyer dashboard</span>
          </li>
        </ul>
      </div>

      <!-- Contact Info -->
      <p class="text-sm text-gray-600 mb-4">
        Questions? Contact us at 
        <a href="mailto:support@getalawyer.com" class="text-primary hover:underline">
          support@getalawyer.com
        </a>
      </p>

      <!-- Sign Out Button -->
      <button
        @click="handleSignOut"
        class="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  </div>
</template>
