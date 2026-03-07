<script setup lang="ts">
const isMenuOpen = ref(false)
const activeDropdown = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

// Auth
const { session, signOut } = useAuth()
const { open: openAuthModal } = useAuthModal()

const handleSignOut = async () => {
  await signOut()
  navigateTo('/')
}

const nav = [
  {
    label: 'Listings',
    key: 'listings',
    groups: [
      {
        heading: 'Browse',
        items: [
          { label: 'All Properties', desc: 'Explore every available listing', icon: 'i-heroicons-home', to: '/listings' },
          { label: 'Apartments', desc: 'Modern city apartments', icon: 'i-heroicons-building-office-2', to: '/listings?type=apartment' },
          { label: 'Houses', desc: 'Family homes & villas', icon: 'i-heroicons-home-modern', to: '/listings?type=house' },
          { label: 'Short Stays', desc: 'Flexible short-term rentals', icon: 'i-heroicons-calendar-days', to: '/listings?type=short-stay' },
        ],
      },
    ],
    featured: {
      label: 'New listings this week',
      desc: 'Freshly added properties across Lagos, Abuja, and Port Harcourt.',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
      to: '/listings?sort=newest',
      cta: 'View New Listings',
    },
  },
  {
    label: 'For Landlords',
    key: 'landlords',
    groups: [
      {
        heading: 'Manage',
        items: [
          { label: 'List a Property', desc: 'Publish your rental in minutes', icon: 'i-heroicons-plus-circle', to: '/landlords/list' },
          { label: 'Dashboard', desc: 'Track bookings & revenue', icon: 'i-heroicons-chart-bar', to: '/landlords/dashboard' },
          { label: 'Tenant Management', desc: 'Screen and manage tenants', icon: 'i-heroicons-users', to: '/landlords/tenants' },
          { label: 'Payments', desc: 'Automated rent collection', icon: 'i-heroicons-banknotes', to: '/landlords/payments' },
        ],
      },
    ],
    featured: {
      label: 'Landlord success guide',
      desc: 'Maximize occupancy and rental income with our proven strategies.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
      to: '/landlords/guide',
      cta: 'Read the Guide',
    },
  },
  {
    label: 'Resources',
    key: 'resources',
    groups: [
      {
        heading: 'Tools',
        items: [
          { label: 'Rent Calculator', desc: 'Estimate fair market rent', icon: 'i-heroicons-calculator', to: '/tools/rent-calculator' },
          { label: 'Neighborhood Guide', desc: 'Compare areas & amenities', icon: 'i-heroicons-map', to: '/tools/neighborhoods' },
        ],
      },
      {
        heading: 'Learn',
        items: [
          { label: 'Blog', desc: 'Tips, guides, and market insights', icon: 'i-heroicons-newspaper', to: '/blog' },
          { label: 'FAQ', desc: 'Common questions answered', icon: 'i-heroicons-question-mark-circle', to: '/faq' },
          { label: 'Support', desc: 'Get help from our team', icon: 'i-heroicons-chat-bubble-left-right', to: '/support' },
        ],
      },
    ],
  },
  {
    label: 'Pricing',
    key: null,
    to: '/pricing',
  },
]

function openDropdown(key: string) {
  if (closeTimer) clearTimeout(closeTimer)
  activeDropdown.value = key
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    activeDropdown.value = null
  }, 120)
}

function cancelClose() {
  if (closeTimer) clearTimeout(closeTimer)
}
</script>

<template>
  <header class="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <div class="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
            <UIcon name="i-heroicons-home-solid" class="text-white w-4 h-4" />
          </div>
          <span class="text-[15px] font-semibold tracking-tight text-neutral-900">
            Smart<span class="text-neutral-400 font-normal">Stays</span>
          </span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-1">
          <template v-for="item in nav" :key="item.key ?? item.label">
            <!-- Simple link -->
            <NuxtLink
              v-if="!item.groups"
              :to="item.to"
              class="px-3.5 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- Dropdown trigger -->
            <div
              v-else
              class="relative"
              @mouseenter="openDropdown(item.key!)"
              @mouseleave="scheduleClose"
            >
              <button
                class="flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="activeDropdown === item.key
                  ? 'text-neutral-900 bg-neutral-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'"
              >
                {{ item.label }}
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="activeDropdown === item.key ? 'rotate-180' : ''"
                />
              </button>

              <!-- Mega dropdown -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="activeDropdown === item.key"
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max"
                  @mouseenter="cancelClose"
                  @mouseleave="scheduleClose"
                >
                  <!-- Arrow -->
                  <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-neutral-100 rotate-45 z-10" />

                  <div class="relative bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-neutral-900/5 overflow-hidden flex">
                    <!-- Groups -->
                    <div class="p-5 flex gap-8">
                      <div
                        v-for="group in item.groups"
                        :key="group.heading"
                        class="w-52"
                      >
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 px-2">
                          {{ group.heading }}
                        </p>
                        <ul class="space-y-0.5">
                          <li v-for="link in group.items" :key="link.label">
                            <NuxtLink
                              :to="link.to"
                              class="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group/link"
                              @click="activeDropdown = null"
                            >
                              <div class="mt-0.5 w-7 h-7 rounded-lg bg-neutral-100 group-hover/link:bg-neutral-900 flex items-center justify-center shrink-0 transition-colors">
                                <UIcon :name="link.icon" class="w-3.5 h-3.5 text-neutral-500 group-hover/link:text-white transition-colors" />
                              </div>
                              <div>
                                <p class="text-sm font-medium text-neutral-800 leading-tight">{{ link.label }}</p>
                                <p class="text-xs text-neutral-400 mt-0.5 leading-snug">{{ link.desc }}</p>
                              </div>
                            </NuxtLink>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Featured card -->
                    <div
                      v-if="item.featured"
                      class="w-56 bg-neutral-50 border-l border-neutral-100 p-5 flex flex-col"
                    >
                      <div class="rounded-xl overflow-hidden mb-3 aspect-video bg-neutral-200">
                        <img
                          :src="item.featured.image"
                          :alt="item.featured.label"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <p class="text-sm font-semibold text-neutral-800 leading-snug mb-1">
                        {{ item.featured.label }}
                      </p>
                      <p class="text-xs text-neutral-500 leading-relaxed mb-4">
                        {{ item.featured.desc }}
                      </p>
                      <NuxtLink
                        :to="item.featured.to"
                        class="mt-auto text-xs font-semibold text-neutral-900 flex items-center gap-1 hover:gap-2 transition-all"
                        @click="activeDropdown = null"
                      >
                        {{ item.featured.cta }}
                        <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
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
              to="/listings"
              size="sm"
              color="neutral"
              variant="solid"
              class="rounded-xl font-semibold px-4"
              label="Find a Home"
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
          <template v-for="item in nav" :key="item.key ?? item.label">
            <NuxtLink
              v-if="!item.groups"
              :to="item.to"
              class="block px-3 py-2.5 text-sm font-medium text-neutral-700 rounded-xl hover:bg-neutral-50"
              @click="isMenuOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
            <div v-else>
              <p class="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {{ item.label }}
              </p>
              <template v-for="group in item.groups" :key="group.heading">
                <NuxtLink
                  v-for="link in group.items"
                  :key="link.label"
                  :to="link.to"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                  @click="isMenuOpen = false"
                >
                  <div class="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <UIcon :name="link.icon" class="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <span class="text-sm font-medium text-neutral-800">{{ link.label }}</span>
                </NuxtLink>
              </template>
            </div>
          </template>

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
                to="/listings"
                size="md"
                color="neutral"
                variant="solid"
                block
                label="Find a Home"
                class="rounded-xl font-semibold"
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