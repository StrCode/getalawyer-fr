<script setup lang="ts">
import EmailVerificationDialog from '@/components/dashboard/EmailVerificationDialog.vue'

/**
 * The dashboard shell in the Canopy design: a top bar like the public site, one
 * column of content, and a tab bar along the bottom on phones. Dashboard pages
 * move onto it one at a time as they are rebuilt; the pages still on the older
 * `dashboard` layout keep working beside it.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const { open: emailVerificationOpen } = useEmailVerificationDialog()
const { handleEmailVerificationCallback } = useEmailVerificationCallback()
const { needsVerifyEmail } = useEmailVerificationPrompt()
const { refetchSession } = useAuth()

onMounted(() => {
  void (async () => {
    await handleEmailVerificationCallback()
    // A session cached before the address was confirmed would still ask for it.
    if (needsVerifyEmail.value) await refetchSession()
  })()
})
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background font-text text-foreground">
    <a href="#workspace-main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:font-semibold focus:shadow-pill">Skip to the page</a>
    <WorkspaceTopBar />
    <!-- room at the foot for the phone tab bar -->
    <main id="workspace-main" class="mx-auto w-full max-w-[76rem] flex-1 pt-[clamp(0.75rem,2vw,1.5rem)] pb-[7rem] safe-x tab:pb-16">
      <ClientOnly><WorkspaceReadOnlyNotice class="mb-[clamp(1rem,2vw,1.5rem)]" /></ClientOnly>
      <slot />
    </main>
    <WorkspaceTabBar class="tab:hidden" />
    <EmailVerificationDialog v-model:open="emailVerificationOpen" />
  </div>
</template>
