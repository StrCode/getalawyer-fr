<script setup lang="ts">
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
      <slot />
  </div>
</template>