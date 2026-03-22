<script setup lang="ts">
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white border-b">
      <div class="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
        <NuxtLink to="/" class="font-bold text-primary text-xl">
          GetaLawyer
        </NuxtLink>
        <div class="flex items-center gap-4">
          <span class="text-gray-600 text-sm">Lawyer Registration</span>
          <button
            @click="handleSignOut"
            class="text-gray-600 hover:text-gray-900 text-sm transition-colors"
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
