<script setup lang="ts">
const isMenuOpen = ref(false)

// Auth
const { session, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  navigateTo('/')
}

// Navigation links matching NavigationBar
const navLinks = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Find Lawyers', to: '/lawyers' },
  { label: 'Practice Areas', to: '/practice-areas' },
  { label: 'For Lawyers', to: '/for-lawyers' }
]
</script>

<template>
  <header class="top-0 z-50 fixed inset-x-0 bg-white/95 backdrop-blur-md border-neutral-100 border-b">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <img src="/getalawyer-logo.svg" alt="GetALawyer" class="w-auto h-8" />
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="hover:bg-neutral-50 px-3.5 py-2 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right CTAs -->
        <div class="hidden lg:flex items-center gap-2">
          <template v-if="session">
            <NuxtLink
              to="/dashboard"
              class="hover:bg-neutral-50 px-3.5 py-2 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
            >
              Dashboard
            </NuxtLink>
            <button
              class="hover:bg-neutral-50 px-3.5 py-2 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
              @click="handleSignOut"
            >
              Sign out
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="hover:bg-neutral-50 px-3.5 py-2 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
            >
              Sign in
            </NuxtLink>
            <UButton
              to="/lawyers"
              size="sm"
              color="neutral"
              variant="solid"
              class="bg-[#e8f3ec] hover:bg-[#d1e8dc] px-4 rounded-xl font-semibold text-[#1d6b44]"
              label="Find a Lawyer"
              trailing-icon="i-heroicons-arrow-right"
            />
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button
          class="lg:hidden hover:bg-neutral-50 p-2 rounded-lg transition-colors"
          @click="isMenuOpen = !isMenuOpen"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle menu"
        >
          <UIcon
            :name="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
            class="w-5 h-5 text-neutral-700"
          />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="lg:hidden bg-white border-neutral-100 border-t max-h-[80vh] overflow-y-auto"
      >
        <div class="space-y-1 mx-auto px-4 py-4 max-w-7xl">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block hover:bg-neutral-50 px-3 py-2.5 rounded-xl font-medium text-neutral-700 text-sm"
            @click="isMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="flex flex-col gap-2 mt-2 pt-4 pb-2 border-neutral-100 border-t">
            <template v-if="session">
              <UButton
                to="/dashboard"
                size="md"
                color="neutral"
                variant="outline"
                block
                label="Dashboard"
                class="rounded-xl font-semibold"
                @click="isMenuOpen = false"
              />
              <button
                class="block hover:bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-700 text-sm text-center"
                @click="handleSignOut(); isMenuOpen = false"
              >
                Sign out
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="block hover:bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-700 text-sm text-center"
                @click="isMenuOpen = false"
              >
                Sign in
              </NuxtLink>
              <UButton
                to="/lawyers"
                size="md"
                color="neutral"
                variant="solid"
                block
                label="Find a Lawyer"
                class="bg-[#e8f3ec] hover:bg-[#d1e8dc] rounded-xl font-semibold text-[#1d6b44]"
                @click="isMenuOpen = false"
              />
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Spacer -->
  <div class="h-16" />
</template>