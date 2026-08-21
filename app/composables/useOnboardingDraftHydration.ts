import { ref, watch } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

type DraftSection = 'personal' | 'professional' | 'practice'

/**
 * Re-seed a wizard step form once the server draft lands.
 *
 * On a hard refresh the draft query resolves after the page's onMounted
 * `form.reset(snapshotFromStore())`, so the form would otherwise stay empty
 * while the store holds the saved values. Fires `onHydrate` once, the first
 * time the draft carries this step's section; if the draft is already loaded
 * when the page mounts (normal step-to-step navigation) it does nothing.
 */
export function useOnboardingDraftHydration(section: DraftSection, onHydrate: () => void) {
  const store = useLawyerOnboardingStore()
  const hydrated = ref(Boolean(store.draft?.data?.[section]))

  watch(
    () => store.draft,
    (draft) => {
      if (hydrated.value || !draft?.data?.[section]) return
      hydrated.value = true
      onHydrate()
    },
  )
}
