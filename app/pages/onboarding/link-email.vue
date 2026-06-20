<script setup lang="ts">
import { isTempPhoneEmail } from '~/lib/auth-constants'

definePageMeta({
  layout: 'onboarding-draft',
  middleware: ['auth'],
})

const { session } = useAuth()
const { firstStep } = useOnboardingNavigation()

const needsEmail = computed(() => isTempPhoneEmail(session.value?.user?.email))

onMounted(async () => {
  if (!needsEmail.value) {
    await navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
  }
})

async function onCompleted() {
  await navigateTo(firstStep.value?.path || '/onboarding', { replace: true })
}
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100dvh-5.75rem)] max-w-lg flex-col justify-center px-4 py-12">
    <AuthLinkEmailCard @completed="onCompleted" />
  </div>
</template>
