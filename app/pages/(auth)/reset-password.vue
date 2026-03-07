<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { open } = useAuthModal()

onMounted(() => {
  open('newpassword')
})
</script>

<template>
  <div>
    <AuthModal />
  </div>
</template>
