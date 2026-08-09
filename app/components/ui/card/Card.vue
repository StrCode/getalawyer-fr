<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/15 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
