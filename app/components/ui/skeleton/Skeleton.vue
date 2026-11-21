<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  class?: HTMLAttributes["class"]
}

const props = defineProps<SkeletonProps>()
</script>

<!--
  A grey shape standing in for content that is still loading. The tint is the
  text colour at 8%, so it reads on the page, on cards and on tinted tiles, in
  light and dark. It only pulses when the visitor allows motion.
-->
<template>
  <div
    data-slot="skeleton"
    aria-hidden="true"
    :class="cn('rounded-md bg-foreground/8 motion-safe:animate-pulse', props.class)"
  />
</template>
