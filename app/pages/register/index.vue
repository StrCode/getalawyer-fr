<template>
  <div class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-8">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Icon name="i-hugeicons-legal-document-02" class="w-5 h-5 text-white" />
          </div>
          <span class="text-2xl font-bold text-gray-900">GetALawyer</span>
        </NuxtLink>
        
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          Join GetALawyer
        </h1>
        <p class="text-lg text-gray-600">
          Choose how you'd like to get started
        </p>
      </div>

      <!-- Role Selection Cards -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Client Card -->
        <UCard 
          class="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary"
          @click="selectRole('client')"
        >
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <Icon name="i-hugeicons-user" class="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              I'm a Client
            </h2>
            
            <p class="text-gray-600 mb-6">
              Looking for legal services and professional lawyers to help with your case
            </p>
            
            <ul class="text-left space-y-3 mb-6">
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Find qualified lawyers in your area</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Book consultations instantly</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Quick 2-step registration</span>
              </li>
            </ul>
            
            <UButton 
              color="primary" 
              size="lg" 
              block
              @click.stop="selectRole('client')"
            >
              Sign Up as Client
              <Icon name="i-hugeicons-arrow-right-01" class="ml-2" />
            </UButton>
          </div>
        </UCard>

        <!-- Lawyer Card -->
        <UCard 
          class="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary"
          @click="selectRole('lawyer')"
        >
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
              <Icon name="i-hugeicons-briefcase-01" class="w-10 h-10 text-purple-600" />
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              I'm a Lawyer
            </h2>
            
            <p class="text-gray-600 mb-6">
              Join our network of legal professionals and grow your practice
            </p>
            
            <ul class="text-left space-y-3 mb-6">
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Expand your client base</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Manage bookings efficiently</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="i-hugeicons-tick-02" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span class="text-sm text-gray-700">Professional verification</span>
              </li>
            </ul>
            
            <UButton 
              color="primary" 
              size="lg" 
              block
              @click.stop="selectRole('lawyer')"
            >
              Sign Up as Lawyer
              <Icon name="i-hugeicons-arrow-right-01" class="ml-2" />
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Already have account -->
      <div class="text-center">
        <p class="text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-semibold hover:underline ml-1">
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['guest']
})

const router = useRouter()

const selectRole = (role: 'client' | 'lawyer') => {
  // Navigate to registration form with role parameter
  router.push({
    path: '/register/create-account',
    query: { role }
  })
}
</script>
