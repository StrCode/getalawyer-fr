<script setup lang="ts">
import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const year = new Date().getFullYear()
const email = ref('')
const showComingSoon = ref(false)

// No newsletter endpoint yet — say so instead of silently discarding the email.
function onSubscribe() {
  showComingSoon.value = true
}

const cols = {
  Product: [
    { label: 'Find a lawyer', to: '/find-lawyers' },
    { label: 'Practice areas', to: '/practice-areas' },
    { label: 'How it works', to: '/#how-it-works' },
  ],
  'For lawyers': [
    { label: 'Why join', to: '/for-lawyers' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Register', to: '/register' },
  ],
  Company: [
    { label: 'Contact', to: '/contact' },
    { label: 'Sign in', to: '/login' },
  ],
  Legal: [
    { label: 'Privacy policy', to: '/privacy' },
    { label: 'Terms of service', to: '/terms' },
    { label: 'NDPA compliance', to: '/ndpa' },
  ],
}
</script>

<template>
  <footer class="overflow-hidden bg-foreground text-background">
    <div class="mx-auto max-w-7xl px-6 pt-16 md:px-8 md:pt-20">
      <!-- Top: blurb + newsletter | link columns -->
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
        <!-- Brand + newsletter -->
        <div class="max-w-sm">
          <div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="size-3.5" aria-hidden="true" />
            Every lawyer NIN &amp; SCN verified
          </div>
          <p class="mt-6 max-w-xs text-base leading-relaxed text-background/70">
            Connecting Nigerians with verified legal professionals. Built for clarity, trust, and speed.
          </p>

          <!-- Newsletter -->
          <form class="mt-7" @submit.prevent="onSubscribe">
            <label for="footer-email" class="eyebrow text-background/70">Stay in the loop</label>
            <InputGroup
              class="mt-3 h-auto rounded-full border-background/20 bg-background/5 p-1.5 shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-primary/50 has-[[data-slot=input-group-control]:focus-visible]:ring-0"
            >
              <InputGroupInput
                id="footer-email"
                v-model="email"
                type="email"
                placeholder="Your email address"
                class="px-4 text-background placeholder:text-background/70"
              />
              <InputGroupAddon align="inline-end" class="mr-0 pr-0">
                <Button type="submit" class="rounded-full px-5">
                  Subscribe
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <p v-if="showComingSoon" class="mt-2 text-xs text-background/70" role="status">
              The newsletter isn't live yet — signups open soon.
            </p>
          </form>
        </div>

        <!-- Link columns -->
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div v-for="(links, group) in cols" :key="group">
           <h5 class="eyebrow text-background/70">{{ group }}</h5>
            <ul class="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              <li v-for="link in links" :key="link.label">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-background/65 no-underline transition-colors duration-200 hover:text-background"
                >{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Wordmark -->
      <p
        class="font-heading mt-14 select-none leading-[0.85] tracking-[-0.03em] text-background/90 text-[clamp(2.25rem,8vw,5.5rem)]"
        aria-hidden="true"
      >
        getalawyer
      </p>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-4 border-t border-background/20 py-8 text-sm text-background/55 sm:flex-row sm:gap-0">
        <span>© {{ year }} getalawyer. All rights reserved.</span>
        <span>Lagos, Nigeria</span>
      </div>
    </div>
  </footer>
</template>
