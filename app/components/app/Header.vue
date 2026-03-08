<script setup lang="ts">
const isMenuOpen = ref(false)

// Auth
const { session, signOut } = useAuth()
const { open: openAuthModal } = useAuthModal()

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
  <header class="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <img src="/getalawyer-logo.svg" alt="GetALawyer" class="h-8 w-auto" />
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3.5 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right CTAs -->
        <div class="hidden lg:flex items-center gap-2">
          <template v-if="session">
            <NuxtLink
              to="/dashboard"
              class="px-3.5 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Dashboard
            </NuxtLink>
            <button
              class="px-3.5 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
              @click="handleSignOut"
            >
              Sign out
            </button>
          </template>
          <template v-else>
            <button
              class="px-3.5 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
              @click="openAuthModal('entry')"
            >
              Sign in
            </button>
            <UButton
              to="/lawyers"
              size="sm"
              color="neutral"
              variant="solid"
              class="rounded-xl font-semibold px-4 bg-[#e8f3ec] hover:bg-[#d1e8dc] text-[#1d6b44]"
              label="Find a Lawyer"
              trailing-icon="i-heroicons-arrow-right"
            />
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-neutral-50 transition-colors"
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
        class="lg:hidden border-t border-neutral-100 bg-white max-h-[80vh] overflow-y-auto"
      >
        <div class="max-w-7xl mx-auto px-4 py-4 space-y-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-3 py-2.5 text-sm font-medium text-neutral-700 rounded-xl hover:bg-neutral-50"
            @click="isMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="pt-4 pb-2 flex flex-col gap-2 border-t border-neutral-100 mt-2">
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
                class="block text-center px-4 py-2.5 text-sm font-medium text-neutral-700 rounded-xl border border-neutral-200 hover:bg-neutral-50"
                @click="handleSignOut(); isMenuOpen = false"
              >
                Sign out
              </button>
            </template>
            <template v-else>
              <button
                class="block text-center px-4 py-2.5 text-sm font-medium text-neutral-700 rounded-xl border border-neutral-200 hover:bg-neutral-50"
                @click="openAuthModal('entry'); isMenuOpen = false"
              >
                Sign in
              </button>
              <UButton
                to="/lawyers"
                size="md"
                color="neutral"
                variant="solid"
                block
                label="Find a Lawyer"
                class="rounded-xl font-semibold bg-[#e8f3ec] hover:bg-[#d1e8dc] text-[#1d6b44]"
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