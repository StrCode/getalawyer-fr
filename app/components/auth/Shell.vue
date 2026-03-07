<!-- components/auth/AuthShell.vue -->
<script setup lang="ts">
defineProps<{ title?: string; canGoBack?: boolean }>()
defineEmits<{ pop: []; close: [] }>()
</script>

<template>
  <div class="flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="relative flex justify-between items-center px-6 py-4 border-b border-gray-100 min-h-[64px] shrink-0">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        size="sm"
        square
        class="rounded-full"
        :class="canGoBack ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        @click="$emit('pop')"
      />

      <span class="absolute left-1/2 -translate-x-1/2 font-semibold text-[15px] text-gray-900">
        {{ title }}
      </span>

      <UButton
        icon="i-lucide-x"
        variant="ghost"
        size="sm"
        square
        class="rounded-full"
        @click="$emit('close')"
      />
    </div>

    <!-- Scrollable content -->
    <div class="overflow-y-auto">
      <slot />
    </div>
  </div>
</template>
