<script setup lang="ts">
import EmailVerificationDialog from '@/components/dashboard/EmailVerificationDialog.vue'

/**
 * The dashboard shell in the Canopy design: a top bar like the public site, one
 * column of content, and a tab bar along the bottom on phones. Dashboard pages
 * move onto it one at a time as they are rebuilt; the pages still on the older
 * `dashboard` layout keep working beside it.
 *
 * Printed, the bars and notices are left out and only the page itself goes to
 * paper (a receipt).
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
  <div class="flex min-h-svh flex-col bg-background font-text text-foreground print:min-h-0 print:bg-white">
    <a href="#workspace-main" class="sr-only print:hidden focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:font-semibold focus:shadow-pill">Skip to the page</a>
    <WorkspaceTopBar class="print:hidden" />
    <!-- room at the foot for the phone tab bar -->
    <main id="workspace-main" class="mx-auto w-full max-w-[76rem] flex-1 pt-[clamp(0.75rem,2vw,1.5rem)] pb-[7rem] safe-x tab:pb-16 print:max-w-none print:p-0">
      <ClientOnly><WorkspaceReadOnlyNotice class="mb-[clamp(1rem,2vw,1.5rem)] print:hidden" /></ClientOnly>
      <slot />
    </main>
    <WorkspaceTabBar class="tab:hidden print:hidden" />
    <EmailVerificationDialog v-model:open="emailVerificationOpen" />
  </div>
</template>
