<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { open } = useAuthModal()

onMounted(() => {
  open('forgot')
})
</script>

<template>
  <div>
    <AuthModal />
  </div>
</template>
