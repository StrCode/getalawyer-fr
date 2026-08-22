<template>
  <CaseDashboard
    :cases="cases"
    :loading="loading"
    :error="error"
    :role="role"
    @case-click="handleCaseClick"
    @retry="refetch"
    @filters-change="handleFiltersChange"
  />
</template>

<script setup lang="ts">
import type { CaseFilters } from '~/types'

definePageMeta({ layout: 'dashboard' })

useHead({
  title: 'Cases - GetALawyer',
})

const { session } = useAuth()
const { useCasesList } = useCases()

// Reactive data
const filters = ref<CaseFilters>({})

// Fetch cases with filters
const { data: casesData, isLoading: loading, error, refetch } = useCasesList(filters)

// Computed properties
const role = computed(() => session.value?.user.userType)
const cases = computed(() => casesData.value?.cases || [])

// Methods
const handleCaseClick = (caseId: string) => {
  navigateTo(`/dashboard/cases/${caseId}`)
}

const handleFiltersChange = (newFilters: CaseFilters) => {
  filters.value = newFilters
}
</script>
