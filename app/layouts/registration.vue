<script setup lang="ts">
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold text-primary">
          GetALawyer
        </NuxtLink>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">Lawyer Registration</span>
          <button
            @click="handleSignOut"
            class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>
