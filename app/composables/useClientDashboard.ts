import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'
import { dashboardAPI } from '~/lib/api/dashboard'

export function useClientDashboard() {
  return useQuery({
    queryKey: queryKeys.client.dashboard,
    queryFn: () => dashboardAPI.getClientDashboard(),
  })
}
