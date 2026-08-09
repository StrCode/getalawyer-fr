<script setup lang="ts">
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'

const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background font-sans">
    <header class="z-40 shrink-0 border-b border-border/40 bg-background">
      <div class="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <LandingBrandLogo :show-wordmark="false" :to="'/'" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="cursor-pointer text-muted-foreground"
          :disabled="isSigningOut"
          @click="handleSignOut()"
        >
          <HugeiconsIcon :icon="Logout01Icon" data-icon="inline-start" />
          <span class="hidden sm:inline">
            {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
          </span>
        </Button>
      </div>
    </header>

    <main class="flex flex-1 flex-col">
      <div class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <slot />
      </div>
    </main>
  </div>
</template>
