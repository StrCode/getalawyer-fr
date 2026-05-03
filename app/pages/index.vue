<script setup lang="ts">
import { useLawyerSearch } from '~/composables/useLawyerSearch'
import { useRecentLawyerDirectorySearches } from '~/composables/useRecentLawyerDirectorySearches'
import type { ConsultationType } from '~/types/lawyer'

definePageMeta({
  layout: 'home',
})

const { updatePracticeArea } = useLawyerSearch()
const { pushRecentLawyerDirectorySearch } = useRecentLawyerDirectorySearches()

const handlePracticeAreaSelect = (areaName: string) => {
  updatePracticeArea(areaName)
  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleSearch = (data: {
  practiceArea: string | null
  location: string | null
  consultationType: string | null
}) => {
  if (import.meta.dev) {
    console.info('Search:', data)
  }

  const ct = data.consultationType
  const consultationTypes: ConsultationType[] = (
    ct === 'video' || ct === 'phone' || ct === 'in-person'
  )
    ? [ct]
    : []

  const keywords = data.practiceArea?.trim() ?? ''
  const location = data.location?.trim() ?? ''

  if (keywords || location || consultationTypes.length > 0) {
    pushRecentLawyerDirectorySearch({
      keywords,
      location,
      consultationTypes,
      practiceAreas: [],
    })
  }
}
</script>

<template>
  <div>
    <HeroPreviewSplit id="hero" @search="handleSearch" />

    <HowItWorksSection />

    <PracticeAreasSection
      id="practice-areas"
      @select-area="handlePracticeAreaSelect"
    />

    <ForLawyersSection id="for-lawyers" />

    <FooterSection />
  </div>
</template>
