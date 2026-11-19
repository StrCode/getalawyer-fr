/**
 * Light / dark / system, on top of @nuxtjs/color-mode.
 *
 * `choice` is what the visitor picked ('system' until they pick). On the server
 * and before hydration it is always reported as 'system', because the stored
 * choice lives in the browser; render theme controls inside <ClientOnly> or
 * key off `ready` to avoid a hydration mismatch.
 */
export type ThemeChoice = 'light' | 'dark' | 'system'

const ORDER: ThemeChoice[] = ['light', 'dark', 'system']

export function useThemeChoice() {
  const colorMode = useColorMode()
  const ready = ref(false)
  onMounted(() => { ready.value = true })

  const choice = computed<ThemeChoice>(() => {
    if (!ready.value) return 'system'
    const p = colorMode.preference
    return p === 'light' || p === 'dark' ? p : 'system'
  })

  function set(next: ThemeChoice) {
    colorMode.preference = next
  }

  function cycle() {
    set(ORDER[(ORDER.indexOf(choice.value) + 1) % ORDER.length]!)
  }

  return { choice, set, cycle, ready, forced: computed(() => colorMode.forced) }
}
