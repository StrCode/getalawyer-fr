<!-- components/auth/AuthSuccess.vue -->
<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
const { identifier } = useAuthModal()
</script>

<template>
  <div class="text-center p-6 flex flex-col items-center">
    <!-- Success Icon -->
    <div class="w-16 h-16 rounded-full bg-[#1d6b44] flex items-center justify-center mx-auto mb-5 animate-[pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
      <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-white scale-0 animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_forwards]" />
    </div>

    <h2 class="text-[22px] font-bold text-gray-900 tracking-tight mb-2">
      You're in!
    </h2>
    <p class="text-gray-500 mb-8 max-w-[280px]">
      Welcome to Getalawyer{{ identifier ? `, ${identifier}` : '' }}.<br />Your account is ready.
    </p>

    <UButton
      block
      size="lg"
      class="bg-gradient-to-r from-[#E31C5F] to-[#FF385C] hover:from-[#d01856] hover:to-[#e8304f] rounded-xl"
      @click="emit('close')"
    >
      Done
    </UButton>
  </div>
</template>

<style scoped>
  @keyframes pop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
</style>
