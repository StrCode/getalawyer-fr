<script setup lang="ts">
interface Props { isScrolled?: boolean }
withDefaults(defineProps<Props>(), { isScrolled: false })
const emit = defineEmits<{ openModal: [] }>()

const links = [
  { label: 'How it works',   href: '/#how'      },
  { label: 'Practice areas', href: '/#practice' },
  { label: 'For lawyers',    href: '/for-lawyers'  },
  { label: 'Contact',        href: '#contact'  },
]
</script>

<template>
  <nav class="sticky top-0 z-[100] bg-brand-cream/85 backdrop-blur-md border-b border-brand-line/50">
    <div class="flex items-center justify-between max-w-[1280px] mx-auto px-8 py-[18px]">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 no-underline text-brand-green-700">
        <svg class="w-7 h-7 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,20 38,42 38,82 0,60" fill="#1F4D2C"/>
          <polygon points="62,42 100,20 100,60 62,82" fill="#1F4D2C" opacity="0.55"/>
        </svg>
        <span class="font-sans font-bold text-[19px] tracking-[-0.5px] lowercase text-brand-green-700">getalawyer</span>
      </NuxtLink>

      <!-- Nav links — hidden on mobile -->
      <ul class="hidden lg:flex gap-9 list-none m-0 p-0">
        <li v-for="link in links" :key="link.href">
          <NuxtLink
            :to="link.href"
            class="text-brand-ink text-[15px] font-medium hover:text-brand-green-700 transition-colors duration-200 bg-transparent border-none cursor-pointer font-sans no-underline"
          >{{ link.label }}</NuxtLink>
        </li>
      </ul>

      <!-- CTAs -->
      <div class="flex items-center gap-3">
        <button
          @click="emit('openModal')"
          class="hidden sm:inline-flex items-center gap-2 px-[22px] py-[11px] rounded-full text-brand-ink text-[15px] font-medium border border-brand-line hover:bg-white hover:border-brand-ink transition-all duration-200 bg-transparent cursor-pointer font-sans"
        >Sign in</button>
        <button
          @click="emit('openModal')"
          class="inline-flex items-center gap-2 px-[22px] py-[11px] rounded-full bg-brand-green-700 text-brand-cream text-[15px] font-medium hover:bg-brand-green-900 hover:-translate-y-px transition-all duration-200 border-none cursor-pointer font-sans"
        >Find a lawyer →</button>
      </div>
    </div>
  </nav>
</template>
