<script setup lang="ts">
</script>

<template>
    <AppLayout>
        <AppHeader />
        <slot />
        <ClientOnly>
            <AuthModal />
        </ClientOnly>
    </AppLayout>
</template>
