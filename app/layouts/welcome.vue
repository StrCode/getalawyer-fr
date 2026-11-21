<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useWindowScroll } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { getSessionUserType } from '~/lib/session-user'
import { queryKeys } from '~/lib/query-client'
import { APPLICATION_HOME, WELCOME_STEPS } from '~/lib/setup-paths'

/**
 * A client's welcome steps ("Focused steps"): one column, one question
 * group at a time, a progress bar on top and the actions pinned at the bottom.
 * Two short steps (where you need help, what you need help with), then the
 * dashboard. Lawyers have their own flow and never see this layout.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const STEPS = WELCOME_STEPS

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const store = useClientOnboardingStore()
const { session, refetchSession } = useAuth()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })

const index = computed(() => Math.max(0, STEPS.findIndex(step => step.path === route.path)))
const step = computed(() => STEPS[index.value]!)
const isLast = computed(() => index.value === STEPS.length - 1)

// This flow is for clients who have not finished it. Anyone else is sent on.
watchEffect(() => {
  const user = session.value?.user as { onboarding_completed?: boolean } | undefined
  if (!user) return
  if (getSessionUserType(user) === 'lawyer') void router.replace(APPLICATION_HOME)
  else if (user.onboarding_completed) void router.replace('/dashboard')
})

// The pinned header gets a hairline once the page has moved under it.
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 8)

const saving = ref(false)

async function next() {
  if (saving.value) return
  saving.value = true
  try {
    const ok = await store.saveStep(step.value.key)
    if (!ok) return
    if (!isLast.value) {
      await router.push(STEPS[index.value + 1]!.path)
      return
    }
    await refetchSession()
    await queryClient.invalidateQueries({ queryKey: queryKeys.client.profile })
    toast.success('You’re all set', { description: 'Your preferences were saved. Opening your dashboard.' })
    await router.push('/dashboard')
  }
  finally {
    saving.value = false
  }
}

function back() {
  if (index.value === 0) return
  store.validationError = null
  void router.push(STEPS[index.value - 1]!.path)
}
</script>

<template>
  <div class="mx-auto flex min-h-svh max-w-368 flex-col font-sans">
    <!--
      The header and the progress bar are pinned from tablet width up. On phones
      they scroll away: the Back / Continue bar is already pinned at the bottom,
      and two pinned bars leave too little of the step once the keyboard is open.
    -->
    <div
      class="top-0 z-20 border-b bg-background/92 pt-[max(0.6rem,env(safe-area-inset-top,0px))] pb-2.75 backdrop-blur-[12px] transition-colors duration-300 safe-x sm:sticky"
      :class="scrolled ? 'border-transparent sm:border-border' : 'border-transparent'"
    >
      <div class="flex items-center justify-between gap-4 px-[clamp(0rem,calc((100vw-40rem)*0.12),3.5rem)] py-1.5">
        <CanopyBrand condensed large />
        <div class="flex items-center gap-1">
          <CanopyThemeToggle />
          <button
            type="button"
            class="-mr-2 inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-muted-foreground hover:text-brand disabled:opacity-60"
            :disabled="isSigningOut"
            @click="handleSignOut('login')"
          >
            {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>

      <!-- where you are: one segment per step -->
      <div class="mx-auto mt-4.5 w-[min(100%,44rem)]">
        <div
          class="grid auto-cols-fr grid-flow-col gap-1.5"
          role="progressbar"
          :aria-valuenow="index + 1"
          aria-valuemin="1"
          :aria-valuemax="STEPS.length"
          :aria-valuetext="`Step ${index + 1} of ${STEPS.length}: ${step.label}`"
        >
          <i
            v-for="(item, i) in STEPS"
            :key="item.key"
            class="h-1.5 rounded-full transition-colors duration-300"
            :class="i <= index ? 'bg-primary' : 'bg-border'"
          />
        </div>
        <p class="mt-2.25 flex justify-between gap-4 text-sm text-muted-foreground">
          <b class="font-medium text-foreground">{{ step.label }}</b>
          <span>{{ index + 1 }} of {{ STEPS.length }}</span>
        </p>
      </div>
    </div>

    <main class="mx-auto w-[min(100%,44rem)] flex-1 pt-6 md:pt-7.75 lg:pt-10.25 xl:pt-12 pb-8 safe-x">
      <ClientOnly><AuthFinishPassword /></ClientOnly>
      <slot />
      <p v-if="store.validationError" role="alert" class="mt-4.75 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
        {{ store.validationError }}
      </p>
    </main>

    <!-- the actions stay within reach, whatever the length of the step -->
    <div class="sticky bottom-0 z-10 border-t border-border bg-background pt-3.25 pb-[calc(0.8rem+env(safe-area-inset-bottom,0px))] safe-x">
      <div class="mx-auto flex w-[min(100%,44rem)] items-center justify-between gap-3">
        <button
          v-if="index > 0"
          type="button"
          class="inline-flex min-h-11 cursor-pointer items-center text-base font-medium text-muted-foreground hover:text-brand"
          :disabled="saving"
          @click="back"
        >
          ← Back
        </button>
        <span v-else class="text-sm text-muted-foreground">Takes under a minute</span>
        <Button
          type="button"
          variant="canopy"
          size="pill"
          class="group/btn min-w-44 justify-between pr-2 pl-5.5"
          :disabled="saving"
          :aria-busy="saving"
          @click="next"
        >
          {{ saving ? 'Saving…' : isLast ? 'Finish' : 'Continue' }}<CanopyArrowChip />
        </Button>
      </div>
    </div>
  </div>
</template>
