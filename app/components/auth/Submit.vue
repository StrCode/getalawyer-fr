<script setup lang="ts">
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/ui/button'

/** The main action of a sign-in screen: a full-width green pill with the arrow chip, or a spinner while it works. */
withDefaults(defineProps<{
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button'
}>(), { loading: false, disabled: false, type: 'submit' })
</script>

<template>
  <Button
    :type="type"
    variant="canopy"
    size="pill"
    class="group/btn w-full justify-between pr-2 pl-5.5"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span><slot /></span>
    <span v-if="loading" class="grid size-7.75 flex-none place-items-center">
      <HugeiconsIcon :icon="Loading03Icon" class="size-5 animate-spin" aria-hidden="true" />
    </span>
    <CanopyArrowChip v-else />
  </Button>
</template>
