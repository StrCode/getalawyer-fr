<script setup lang="ts">
import { provide } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { LAWYER_APPLICATION_HOME } from '~/composables/useLawyerOnboardingEntry'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

/**
 * Lawyer application, direction C ("Application home"). There is no fixed
 * order: the home page lists the sections, each section opens on its own page
 * and returns to the home when saved. This layout frames both: the home, and a
 * section with its "Back to your application" link and "Save and return" bar.
 *
 * Everything typed is saved as the lawyer goes (see the store), so leaving a
 * section half-filled loses nothing.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

/** Section pages and the store key each one saves under. */
const SECTION_KEYS: Record<string, string> = {
  '/onboarding/personal-info': 'personal_info',
  '/onboarding/nin-verification': 'nin_verification',
  '/onboarding/professional-information': 'professional_info',
  '/onboarding/practice-information': 'practice_info',
}

const route = useRoute()
const router = useRouter()
const store = useLawyerOnboardingStore()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })

const sectionKey = computed(() => SECTION_KEYS[route.path] ?? null)
const isHome = computed(() => !sectionKey.value)

// Section pages register their own check (field errors, async checks) here; the
// "Save and return" button runs it before saving.
const sectionValidate = ref<(() => Promise<boolean>) | null>(null)
provide('registerLawyerOnboardingStepValidate', (fn: (() => Promise<boolean>) | null) => {
  sectionValidate.value = fn
})

// Tell the store what is on screen so it can save as the lawyer types. On the
// home page the only thing typed is the terms acceptance, saved under "review".
watch(() => sectionKey.value ?? 'review', (key) => { store.activeStepKey = key }, { immediate: true })
onBeforeUnmount(() => { store.activeStepKey = null })
watch(() => route.path, () => { store.validationError = null })

const saveStatus = computed(() => {
  if (store.autosave.status === 'saving') return 'Saving…'
  if (store.autosave.status === 'error') return 'Not saved yet'
  if (store.autosave.status === 'saved') return 'Saved'
  return ''
})

const busy = ref(false)

/** Check the section, save it, and go back to the application home. */
async function saveAndReturn() {
  if (busy.value || !sectionKey.value) return
  busy.value = true
  try {
    if (sectionValidate.value && !(await sectionValidate.value())) return
    const saved = await store.saveStep(sectionKey.value)
    if (saved) {
      await router.push(LAWYER_APPLICATION_HOME)
    }
    else if (!store.validationError) {
      toast.error('Could not save this section', { description: 'Check your connection and try again.' })
    }
  }
  finally {
    busy.value = false
  }
}

/** Leave a section without finishing it: keep what is typed, as it is. */
async function backToHome() {
  if (busy.value) return
  busy.value = true
  try {
    if (sectionKey.value) await store.saveProgress(sectionKey.value)
    await router.push(LAWYER_APPLICATION_HOME)
  }
  finally {
    busy.value = false
  }
}

async function saveAndSignOut() {
  if (busy.value || isSigningOut.value) return
  busy.value = true
  try {
    const saved = await store.saveProgress(sectionKey.value ?? 'review')
    if (!saved) {
      // Never trap someone in their account because a save failed.
      toast.warning('Your latest changes could not be saved', {
        description: 'Check your connection, or sign out without them.',
        action: { label: 'Sign out anyway', onClick: () => { void handleSignOut('login') } },
        duration: 10000,
      })
      return
    }
    await handleSignOut('login')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-svh max-w-[92rem] flex-col pt-[max(16px,env(safe-area-inset-top,0px))] font-text">
    <div class="flex items-center justify-between gap-4 px-[clamp(0rem,3vw,2.5rem)] py-[0.4rem] safe-x">
      <CanopyBrand condensed large />
      <div class="flex items-center gap-1">
        <span v-if="saveStatus" aria-live="polite" class="mr-2 inline-flex items-center gap-[0.4rem] text-[0.82rem] text-muted-foreground max-sm:hidden">
          <i class="size-2 rounded-full" :class="store.autosave.status === 'error' ? 'bg-destructive' : 'bg-primary'" />{{ saveStatus }}
        </span>
        <CanopyThemeToggle />
        <button
          type="button"
          class="inline-flex min-h-11 cursor-pointer items-center px-2 text-[0.9rem] font-semibold text-muted-foreground hover:text-brand disabled:opacity-60"
          :disabled="busy || isSigningOut"
          @click="saveAndSignOut"
        >
          {{ isSigningOut ? 'Signing out…' : 'Save and sign out' }}
        </button>
      </div>
    </div>

    <main class="mx-auto w-[min(100%,44rem)] flex-1 pt-[clamp(1.25rem,3vw,2.5rem)] pb-10 safe-x">
      <button v-if="!isHome" type="button" class="mb-[0.6rem] inline-flex min-h-11 cursor-pointer items-center text-[0.9rem] font-semibold text-muted-foreground hover:text-brand" :disabled="busy" @click="backToHome">
        ← Back to your application
      </button>
      <slot />
      <p v-if="store.validationError && !isHome" role="alert" class="mt-[1.2rem] rounded-[1rem] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
        {{ store.validationError }}
      </p>
    </main>

    <!-- a section's one action, always within reach -->
    <div v-if="!isHome" class="sticky bottom-0 z-10 border-t border-border bg-background pt-[0.8rem] pb-[calc(0.8rem+env(safe-area-inset-bottom,0px))] safe-x">
      <div class="mx-auto flex w-[min(100%,44rem)] items-center justify-between gap-3">
        <span class="inline-flex items-center gap-[0.4rem] text-[0.82rem] text-muted-foreground">
          <i class="size-2 rounded-full bg-primary" />Saved as you go
        </span>
        <Button type="button" variant="canopy" size="pill" class="group/btn min-w-[12rem] justify-between pr-2 pl-[1.4rem]" :disabled="busy" :aria-busy="busy" @click="saveAndReturn">
          {{ busy ? 'Saving…' : 'Save and return' }}<CanopyArrowChip />
        </Button>
      </div>
    </div>
  </div>
</template>
