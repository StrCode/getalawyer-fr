<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { open } = useAuthModal()

onMounted(() => {
  open('signup')
})
</script>

<template>
  <div>
    <AuthModal />
  </div>
</template>
