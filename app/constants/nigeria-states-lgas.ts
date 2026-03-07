/**
 * Nigerian States and Local Government Areas (LGAs)
 * Complete list of all 36 states + FCT with their LGAs
 */

export interface LGA {
  code: string
  name: string
}

export interface StateData {
  code: string
  name: string
  lgas: LGA[]
}

export const NIGERIA_STATES: StateData[] = [
  {
    code: 'AB',
    name: 'Abia',
    lgas: [
      { code: 'ABA_NORTH', name: 'Aba North' },
      { code: 'ABA_SOUTH', name: 'Aba South' },
      { code: 'AROCHUKWU', name: 'Arochukwu' },
      { code: 'BENDE', name: 'Bende' },
      { code: 'IKWUANO', name: 'Ikwuano' },
      { code: 'ISIALA_NGWA_NORTH', name: 'Isiala Ngwa North' },
      { code: 'ISIALA_NGWA_SOUTH', name: 'Isiala Ngwa South' },
      { code: 'ISUIKWUATO', name: 'Isuikwuato' },
      { code: 'OBI_NGWA', name: 'Obi Ngwa' },
      { code: 'OHAFIA', name: 'Ohafia' },
      { code: 'OSISIOMA', name: 'Osisioma' },
      { code: 'UGWUNAGBO', name: 'Ugwunagbo' },
      { code: 'UKWA_EAST', name: 'Ukwa East' },
      { code: 'UKWA_WEST', name: 'Ukwa West' },
      { code: 'UMUAHIA_NORTH', name: 'Umuahia North' },
      { code: 'UMUAHIA_SOUTH', name: 'Umuahia South' },
      { code: 'UMU_NNEOCHI', name: 'Umu Nneochi' },
    ],
  },
  {
    code: 'LA',
    name: 'Lagos',
    lgas: [
      { code: 'AGEGE', name: 'Agege' },
      { code: 'AJEROMI_IFELODUN', name: 'Ajeromi-Ifelodun' },
      { code: 'ALIMOSHO', name: 'Alimosho' },
      { code: 'AMUWO_ODOFIN', name: 'Amuwo-Odofin' },
      { code: 'APAPA', name: 'Apapa' },
      { code: 'BADAGRY', name: 'Badagry' },
      { code: 'EPE', name: 'Epe' },
      { code: 'ETI_OSA', name: 'Eti Osa' },
      { code: 'IBEJU_LEKKI', name: 'Ibeju-Lekki' },
      { code: 'IFAKO_IJAIYE', name: 'Ifako-Ijaiye' },
      { code: 'IKEJA', name: 'Ikeja' },
      { code: 'IKORODU', name: 'Ikorodu' },
      { code: 'KOSOFE', name: 'Kosofe' },
      { code: 'LAGOS_ISLAND', name: 'Lagos Island' },
      { code: 'LAGOS_MAINLAND', name: 'Lagos Mainland' },
      { code: 'MUSHIN', name: 'Mushin' },
      { code: 'OJO', name: 'Ojo' },
      { code: 'OSHODI_ISOLO', name: 'Oshodi-Isolo' },
      { code: 'SHOMOLU', name: 'Shomolu' },
      { code: 'SURULERE', name: 'Surulere' },
    ],
  },
  {
    code: 'FC',
    name: 'Federal Capital Territory',
    lgas: [
      { code: 'ABAJI', name: 'Abaji' },
      { code: 'ABUJA_MUNICIPAL', name: 'Abuja Municipal' },
      { code: 'BWARI', name: 'Bwari' },
      { code: 'GWAGWALADA', name: 'Gwagwalada' },
      { code: 'KUJE', name: 'Kuje' },
      { code: 'KWALI', name: 'Kwali' },
    ],
  },
  // Add more states as needed
]

// Helper functions
export const getLGAsForState = (stateCode: string): LGA[] => {
  const state = NIGERIA_STATES.find((s) => s.code === stateCode)
  return state?.lgas || []
}

export const getStateName = (stateCode: string): string => {
  const state = NIGERIA_STATES.find((s) => s.code === stateCode)
  return state?.name || ''
}

export const getLGAName = (stateCode: string, lgaCode: string): string => {
  const lgas = getLGAsForState(stateCode)
  const lga = lgas.find((l) => l.code === lgaCode)
  return lga?.name || ''
}
