<template>
  <div class="bg-white min-h-screen font-sans">

    <!-- Transparent Navbar -->
    <header class="top-0 z-50 fixed inset-x-0 flex justify-between items-center px-6 py-4">
      <!-- Cal.com Logo -->
      <div class="flex items-center gap-2">
        <div class="flex justify-center items-center bg-gray-900 rounded-full w-12 h-12">
          <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="14" height="12" rx="2" stroke="white" stroke-width="1.5"/>
            <path d="M2 8h14" stroke="white" stroke-width="1.5"/>
            <path d="M6 2v3M12 2v3" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Sign Out -->
      <button
        @click="handleSignOut"
        class="group flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" class="transition-transform group-hover:translate-x-0.5">
          <path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M9.5 10.5L13 7.5l-3.5-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 7.5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        Sign out
      </button>
    </header>

    <!-- Page slot — each step renders here -->
    <main class="flex justify-center items-center px-4 pt-24 pb-12 min-h-screen">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const { signOut } = useAuth()

async function handleSignOut() {
  await signOut({ callbackUrl: '/auth/login' })
}
</script>