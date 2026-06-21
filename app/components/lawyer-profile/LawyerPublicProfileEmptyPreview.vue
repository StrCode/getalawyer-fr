<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { PhPencilSimpleLine } from '@phosphor-icons/vue'
</script>

<template>
  <section
    class="rounded-2xl border border-dashed border-border bg-surface-2 p-8 text-center"
    aria-labelledby="profile-empty-heading"
  >
    <PhPencilSimpleLine class="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
    <h2
      id="profile-empty-heading"
      class="text-base font-semibold text-foreground"
    >
      Your public profile is still empty
    </h2>
    <p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
      Add your about section — clients decide in the first 10 seconds.
    </p>
    <Button
      as-child
      variant="outline"
      size="sm"
      class="mt-4"
    >
      <NuxtLink to="/dashboard/profile#about">
        Complete your profile
      </NuxtLink>
    </Button>
  </section>
</template>
