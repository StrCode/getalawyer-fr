<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { provide } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { APPLICATION_HOME, applicationSectionKeyFor } from '~/lib/setup-paths'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

/**
 * Lawyer application ("Application home"). There is no fixed order: the home
 * page (/application) lists the sections, each section opens on its own page
 * and returns to the home when saved. This layout frames both: the home, and a
 * section with its "Back to your application" link and "Save and return" bar.
 *
 * Everything typed is saved as the lawyer goes (see the store), so leaving a
 * section half-filled loses nothing.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const route = useRoute()
const router = useRouter()
const store = useLawyerOnboardingStore()
const { handleSignOut, isSigningOut } = useSignOut({ redirectTo: 'login' })

/** The store key the section on screen saves under; null on the home and the membership page. */
const sectionKey = computed(() => applicationSectionKeyFor(route.path))
// The section's title from here too: while the saved draft loads (holdForDraft)
// the page itself is not rendered, so on the server its own useHead never ran
// and the tab showed a title made from the address ("About You").
useHead({ title: () => (sectionKey.value ? getLawyerStepDisplay(sectionKey.value).label : undefined) })

// The pinned header gets a hairline once the page has moved under it.
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 8)
const isHome = computed(() => !sectionKey.value)
/**
 * A section's form is held back until the saved application has arrived (or
 * failed to: then the form shows, and saving will report the problem).
 */
const holdForDraft = computed(() => Boolean(sectionKey.value) && !store.draftLoaded && !store.draftFailed)
/**
 * True while the application can still be edited: a section, or the home while
 * it is being filled in. After it is submitted (payment, in review, needs
 * changes) the home shows a status instead, there is nothing to save, so saving
 * is off and the menu is a plain sign-out.
 */
const { state } = useApplicationState()
const editable = computed(() => Boolean(sectionKey.value) || (route.path === APPLICATION_HOME && state.value === 'draft'))

// Section pages register their own check (field errors, async checks) here; the
// "Save and return" button runs it before saving.
/** The section saved a moment ago, read (and cleared) by the application home. */
const justSaved = useState<string | null>('application-just-saved', () => null)

const sectionValidate = ref<(() => Promise<boolean>) | null>(null)
provide('registerLawyerOnboardingStepValidate', (fn: (() => Promise<boolean>) | null) => {
  sectionValidate.value = fn
})

// Tell the store what is on screen so it can save as the lawyer types. On the
// home page the only thing typed is the terms acceptance, saved under "review".
watch(
  () => (editable.value ? sectionKey.value ?? 'review' : null),
  (key) => { store.activeStepKey = key },
  { immediate: true },
)
onBeforeUnmount(() => { store.activeStepKey = null })
watch(() => route.path, () => { store.validationError = null })

const saveStatus = computed(() => {
  if (!editable.value) return ''
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
      // The home marks this one section as just finished (its tick arrives once).
      justSaved.value = sectionKey.value
      await router.push(APPLICATION_HOME)
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
    await router.push(APPLICATION_HOME)
  }
  finally {
    busy.value = false
  }
}

async function saveAndSignOut() {
  if (busy.value || isSigningOut.value) return
  if (!editable.value) {
    await handleSignOut('login')
    return
  }
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
  <div class="mx-auto flex min-h-svh max-w-368 flex-col font-sans">
    <!--
      Pinned to the top, so the save status and sign-out stay in reach. A section
      on a phone is the exception: its "Save and return" bar is already pinned at
      the bottom, and a second pinned bar leaves too little form once the keyboard
      is open, so there the header scrolls away.
      Side padding: the page gutter, plus room that grows with the window (none on
      phones, so the mark lines up with the page).
    -->
    <div
      class="top-0 z-20 border-b bg-background/92 pt-[max(0.6rem,env(safe-area-inset-top,0px))] backdrop-blur-[12px] transition-colors duration-300 safe-x"
      :class="[sectionKey ? 'sm:sticky' : 'sticky', scrolled ? (sectionKey ? 'border-transparent sm:border-border' : 'border-border') : 'border-transparent']"
    >
      <div class="flex items-center justify-between gap-4 px-[clamp(0rem,calc((100vw-40rem)*0.12),3.5rem)] py-1.5">
        <CanopyBrand condensed large />
        <div class="flex items-center gap-1">
          <span v-if="saveStatus" aria-live="polite" class="mr-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground max-sm:hidden">
            <i class="size-2 rounded-full" :class="store.autosave.status === 'error' ? 'bg-destructive' : 'bg-primary'" />{{ saveStatus }}
          </span>
          <CanopyThemeToggle />
          <button
            type="button"
            class="-mr-2 inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-muted-foreground hover:text-brand disabled:opacity-60"
            :disabled="busy || isSigningOut"
            @click="saveAndSignOut"
          >
            {{ isSigningOut ? 'Signing out…' : editable ? 'Save and sign out' : 'Sign out' }}
          </button>
        </div>
      </div>
    </div>

    <main class="mx-auto w-[min(100%,44rem)] flex-1 pt-5 md:pt-5.75 lg:pt-7.75 xl:pt-9.5 pb-10 safe-x">
      <button v-if="!isHome" type="button" class="mb-2.5 inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-muted-foreground hover:text-brand" :disabled="busy" @click="backToHome">
        ← Back to your application
      </button>
      <!-- A section's form waits for the saved application. Shown empty first, its
           fields would fill in a moment later, under whatever had been typed. -->
      <ApplicationSkeleton v-if="holdForDraft" shape="form" label="Loading this section" />
      <slot v-else />
      <p v-if="store.validationError && !isHome" role="alert" class="mt-4.75 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
        {{ store.validationError }}
      </p>
    </main>

    <!-- a section's one action, always within reach -->
    <div v-if="!isHome" class="sticky bottom-0 z-10 border-t border-border bg-background pt-3.25 pb-[calc(0.8rem+env(safe-area-inset-bottom,0px))] safe-x">
      <div class="mx-auto flex w-[min(100%,44rem)] items-center justify-between gap-3">
        <span class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <i class="size-2 rounded-full bg-primary" />Saved as you go
        </span>
        <Button type="button" variant="canopy" size="pill" class="group/btn min-w-48 justify-between pr-2 pl-5.5" :disabled="busy || holdForDraft" :aria-busy="busy" @click="saveAndReturn">
          {{ busy ? 'Saving…' : 'Save and return' }}<CanopyArrowChip />
        </Button>
      </div>
    </div>
  </div>
</template>
