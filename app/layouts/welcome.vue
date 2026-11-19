<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
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
  <div class="mx-auto flex min-h-svh max-w-[92rem] flex-col pt-[max(16px,env(safe-area-inset-top,0px))] font-text">
    <div class="safe-x">
      <div class="flex items-center justify-between gap-4 px-[clamp(0rem,calc((100vw-40rem)*0.12),3.5rem)] py-[0.4rem]">
        <CanopyBrand condensed large />
        <div class="flex items-center gap-1">
          <CanopyThemeToggle />
          <button
            type="button"
            class="-mr-2 inline-flex min-h-11 cursor-pointer items-center px-2 text-[0.9rem] font-semibold text-muted-foreground hover:text-brand disabled:opacity-60"
            :disabled="isSigningOut"
            @click="handleSignOut('login')"
          >
            {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>

      <!-- where you are: one segment per step -->
      <div class="mx-auto mt-[1.1rem] w-[min(100%,44rem)]">
        <div
          class="grid auto-cols-fr grid-flow-col gap-[0.35rem]"
          role="progressbar"
          :aria-valuenow="index + 1"
          aria-valuemin="1"
          :aria-valuemax="STEPS.length"
          :aria-valuetext="`Step ${index + 1} of ${STEPS.length}: ${step.label}`"
        >
          <i
            v-for="(item, i) in STEPS"
            :key="item.key"
            class="h-[0.4rem] rounded-full transition-colors duration-300"
            :class="i <= index ? 'bg-primary' : 'bg-border'"
          />
        </div>
        <p class="mt-[0.55rem] flex justify-between gap-4 text-[0.85rem] text-muted-foreground">
          <b class="font-semibold text-foreground">{{ step.label }}</b>
          <span>{{ index + 1 }} of {{ STEPS.length }}</span>
        </p>
      </div>
    </div>

    <main class="mx-auto w-[min(100%,44rem)] flex-1 pt-[clamp(1.5rem,4vw,3rem)] pb-8 safe-x">
      <slot />
      <p v-if="store.validationError" role="alert" class="mt-[1.2rem] rounded-[1rem] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
        {{ store.validationError }}
      </p>
    </main>

    <!-- the actions stay within reach, whatever the length of the step -->
    <div class="sticky bottom-0 z-10 border-t border-border bg-background pt-[0.8rem] pb-[calc(0.8rem+env(safe-area-inset-bottom,0px))] safe-x">
      <div class="mx-auto flex w-[min(100%,44rem)] items-center justify-between gap-3">
        <button
          v-if="index > 0"
          type="button"
          class="inline-flex min-h-11 cursor-pointer items-center text-[0.95rem] font-semibold text-muted-foreground hover:text-brand"
          :disabled="saving"
          @click="back"
        >
          ← Back
        </button>
        <span v-else class="text-[0.82rem] text-muted-foreground">Takes under a minute</span>
        <Button
          type="button"
          variant="canopy"
          size="pill"
          class="group/btn min-w-[11rem] justify-between pr-2 pl-[1.4rem]"
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
