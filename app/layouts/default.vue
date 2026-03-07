<script setup lang="ts">
</script>

<template>
    <AppLayout>
        <NavigationBar />
        <slot />
        <ClientOnly>
            <AuthModal />
        </ClientOnly>
    </AppLayout>
</template>
