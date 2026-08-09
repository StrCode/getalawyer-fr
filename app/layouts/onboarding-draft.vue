<script setup lang="ts">
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background font-sans">
    <header class="z-40 shrink-0 border-b border-border/50 bg-background">
      <div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <LandingBrandLogo :show-wordmark="false" :to="'/'" />

        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          :disabled="isSigningOut"
          @click="handleSignOut()"
        >
          <HugeiconsIcon :icon="Logout01Icon" class="size-4" />
          <span class="hidden sm:inline">
            {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
          </span>
        </button>
      </div>
    </header>

    <main class="flex flex-1 flex-col">
      <div class="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
        <slot />
      </div>
    </main>
  </div>
</template>
