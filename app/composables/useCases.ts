import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import type { CaseRow } from '~/lib/case-view'

/**
 * The list of cases as the overviews and the top bar's count read it: each
 * case with a `title` and both parties. The cases pages themselves use
 * `useCaseWork`, which also loads archived cases and one case in full.
 */
export interface CaseSummary extends CaseRow {
  /** The case's title (`caseTitle` on the backend). */
  title: string
}

export const useCases = () => {
  const { session } = useAuth()
  const userType = computed(() => session.value?.user.userType as 'client' | 'lawyer' | undefined)

  const useCasesList = () => useQuery({
    queryKey: computed(() => [...queryKeys.cases.all, undefined, userType.value]),
    enabled: computed(() => Boolean(userType.value)),
    queryFn: async (): Promise<{ cases: CaseSummary[] }> => {
      const base = userType.value === 'lawyer' ? '/api/lawyer/cases' : '/api/cases'
      const data = await httpClient.getAuth<{ cases: CaseRow[] }>(base)
      return { cases: (data.cases ?? []).map(row => ({ ...row, title: row.caseTitle })) }
    },
  })

  return { useCasesList }
}
