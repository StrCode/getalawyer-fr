import nigeriaStatesLgas from '~/data/nigeria-states-lgas.json'

/** State name → list of LGA names (see `app/data/nigeria-states-lgas.json`). */
export type NigeriaStatesLgasMap = Record<string, string[]>

export const NIGERIA_STATES_LGAS = nigeriaStatesLgas as NigeriaStatesLgasMap

export const NIGERIA_STATE_NAMES = Object.keys(NIGERIA_STATES_LGAS).sort((a, b) =>
  a.localeCompare(b),
)

export function getLgasForState(stateName: string): string[] {
  const trimmed = stateName.trim()
  if (!trimmed) return []

  let lgas = NIGERIA_STATES_LGAS[trimmed]
  if (!lgas) {
    const match = Object.keys(NIGERIA_STATES_LGAS).find(
      (key) => key.toLowerCase() === trimmed.toLowerCase(),
    )
    lgas = match ? NIGERIA_STATES_LGAS[match] : undefined
  }
  if (!lgas) return []
  return [...lgas].sort((a, b) => a.localeCompare(b))
}

export function isValidStateName(stateName: string): boolean {
  return stateName.trim() !== '' && stateName in NIGERIA_STATES_LGAS
}

export function isValidLgaForState(stateName: string, lgaName: string): boolean {
  const lgas = NIGERIA_STATES_LGAS[stateName]
  if (!lgas || !lgaName.trim()) return false
  return lgas.some((l) => l.trim().toLowerCase() === lgaName.trim().toLowerCase())
}
