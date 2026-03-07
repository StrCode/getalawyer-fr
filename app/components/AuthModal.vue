<script setup>
import { motion, AnimatePresence } from 'motion-v'

const viewport = useViewport()
const { isOpen, currentView, direction, canGoBack, push, pop, close, otpType } = useAuthModal()

// Check if viewport is desktop (md breakpoint = 768px in Tailwind)
const isDesktop = computed(() => viewport.isGreaterOrEquals('md'))

const viewTitles = {
  startup:     'Choose your starting point',
  entry:       'Log in or sign up',
  otp:         computed(() => {
    switch (otpType.value) {
      case 'phone':
        return 'Confirm your number'
      case 'password-reset':
        return 'Enter reset code'
      case 'email':
      default:
        return 'Verify your email'
    }
  }),
  email:       'Continue with email',
  password:    'Log in',
  signup:      'Sign up',
  forgot:      'Reset password',
  newpassword: 'Create new password',
  success:     'Success',
}

const title = computed(() => {
  const titleValue = viewTitles[currentView.value]
  return typeof titleValue === 'object' && 'value' in titleValue ? titleValue.value : titleValue ?? ''
})

const description = computed(() => {
  const descriptions = {
    startup: 'Select whether you are a tenant or property owner',
    entry: 'Enter your phone number or email to continue',
    otp: 'Enter the verification code sent to you',
    email: 'Enter your email address',
    password: 'Enter your password to log in',
    signup: 'Create your Smart Stay Rentals account',
    forgot: 'Enter your email to reset your password',
    newpassword: 'Create a new password for your account',
    success: 'Your action was completed successfully',
  }
  return descriptions[currentView.value] ?? 'Authentication dialog'
})

// Track if this is the initial open (stack has only 1 item)
const isInitialView = computed(() => !canGoBack.value)

// Compute initial animation based on whether it's first open or navigation
const initialAnimation = computed(() => {
  if (isInitialView.value) {
    // First open: fade in from bottom
    return { opacity: 0, y: 12 }
  } else {
    // Navigation: slide horizontally
    return { opacity: 0, x: direction.value * 24 }
  }
})
</script>

<template>
  <!-- Desktop: UModal -->
  <UModal
    v-if="isDesktop"
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :transition="false"
    :ui="{
      content: 'sm:max-w-[480px] overflow-hidden rounded-2xl',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <AuthShell :title="title" :can-go-back="canGoBack" @pop="pop" @close="close">
        <motion.div
          layout
          :transition="{ duration: 0.2, ease: 'easeOut' }"
          class="overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              :key="currentView"
              :initial="initialAnimation"
              :animate="{ opacity: 1, x: 0, y: 0 }"
              :exit="{ opacity: 0, x: direction * -24 }"
              :transition="{ duration: 0.2, ease: 'easeOut' }"
            >
              <AuthStartup     v-if="currentView === 'startup'"     @push="push" />
              <AuthEntry       v-else-if="currentView === 'entry'"       @push="push" />
              <AuthOtp         v-else-if="currentView === 'otp'"         :type="otpType" @push="push" />
              <AuthEmail       v-else-if="currentView === 'email'"       @push="push" />
              <AuthPassword    v-else-if="currentView === 'password'"    @push="push" />
              <AuthSignup      v-else-if="currentView === 'signup'"      @push="push" />
              <AuthForgot      v-else-if="currentView === 'forgot'"      @push="push" />
              <AuthNewPassword v-else-if="currentView === 'newpassword'" @push="push" />
              <AuthSuccess     v-else-if="currentView === 'success'"     @close="close" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </AuthShell>
    </template>
  </UModal>

  <!-- Mobile: USlideover bottom sheet -->
  <USlideover
    v-else
    v-model:open="isOpen"
    side="bottom"
    :title="title"
    :description="description"
    :transition="false"
    :ui="{
      content: 'rounded-t-2xl overflow-hidden h-auto max-h-[92dvh]',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #content>
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="bg-gray-300 rounded-full w-10 h-1" />
      </div>
      <AuthShell :title="title" :can-go-back="canGoBack" @pop="pop" @close="close">
        <motion.div
          layout
          :transition="{ duration: 0.2, ease: 'easeOut' }"
          class="overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              :key="currentView"
              :initial="initialAnimation"
              :animate="{ opacity: 1, x: 0, y: 0 }"
              :exit="{ opacity: 0, x: direction * -24 }"
              :transition="{ duration: 0.2, ease: 'easeOut' }"
            >
              <AuthStartup     v-if="currentView === 'startup'"     @push="push" />
              <AuthEntry       v-else-if="currentView === 'entry'"       @push="push" />
              <AuthOtp         v-else-if="currentView === 'otp'"         :type="otpType" @push="push" />
              <AuthEmail       v-else-if="currentView === 'email'"       @push="push" />
              <AuthPassword    v-else-if="currentView === 'password'"    @push="push" />
              <AuthSignup      v-else-if="currentView === 'signup'"      @push="push" />
              <AuthForgot      v-else-if="currentView === 'forgot'"      @push="push" />
              <AuthNewPassword v-else-if="currentView === 'newpassword'" @push="push" />
              <AuthSuccess     v-else-if="currentView === 'success'"     @close="close" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </AuthShell>
    </template>
  </USlideover>
</template>
