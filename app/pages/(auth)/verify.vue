<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { open } = useAuthModal()

onMounted(() => {
  open('otp')
})
</script>

<template>
  <div>
    <AuthModal />
  </div>
</template>
