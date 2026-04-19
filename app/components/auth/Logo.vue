<script setup lang="ts">
import { PhFileText } from '@phosphor-icons/vue'
</script>

<template>
  <NuxtLink to="/" class="inline-flex items-center gap-2.5">
    <div
      class="flex flex-shrink-0 justify-center items-center bg-primary rounded-lg w-8 h-8"
    >
      <PhFileText class="w-4 h-4 text-primary-foreground" />
    </div>
    <span class="font-bold text-[18px] text-foreground tracking-tight">
      Geta<span class="text-primary">Lawyer</span>
    </span>
  </NuxtLink>
</template>
