import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '~/lib/api/client'
import { queryKeys } from '~/lib/query-client'
import { getSessionUserType } from '~/lib/session-user'
import type {
  CaseActivityRow,
  CaseMessageRow,
  CasePriority,
  CaseRow,
  CaseStatus,
  CaseTaskRow,
} from '~/lib/case-view'

/**
 * Loading and changing cases, written against the backend's routes exactly
 * (`lawyer-case.routes.ts`, `client-case.routes.ts` in Law-Backend):
 *
 * - a lawyer's routes are under /api/lawyer/cases, a client's under /api/cases;
 * - editing a case and changing its status are PUT;
 * - only a lawyer changes status, priority or due date, and adds, edits or
 *   deletes tasks; either side can edit the title and description, send
 *   messages and tick a task off.
 *
 * Everything that changes a case refreshes the case, the lists and the counts
 * in the top bar.
 */
const LAWYER = '/api/lawyer/cases'
const CLIENT = '/api/cases'

const listKey = (role: string | undefined) => ['cases', 'work', 'list', role] as const
const fileKey = (id: string) => ['cases', 'work', 'file', id] as const
const threadKey = (id: string) => ['cases', 'work', 'thread', id] as const

export interface CaseFile {
  case: CaseRow
  tasks: CaseTaskRow[]
  activities: CaseActivityRow[]
}

function useRole() {
  const { session } = useAuth()
  const role = computed(() => getSessionUserType(session.value?.user))
  const base = computed(() => (role.value === 'lawyer' ? LAWYER : CLIENT))
  return { role, base }
}

/** Every case, archived ones included (the page sorts them into its tabs). */
export function useCaseList() {
  const { role, base } = useRole()
  return useQuery({
    queryKey: computed(() => listKey(role.value)),
    enabled: computed(() => import.meta.client && Boolean(role.value)),
    queryFn: async () => (await httpClient.getAuth<{ cases: CaseRow[] }>(`${base.value}?includeArchived=true`)).cases ?? [],
    staleTime: 30 * 1000,
  })
}

/** One case with its tasks and its log. Checked again every 30 seconds while open. */
export function useCaseFile(id: MaybeRef<string>) {
  const { role, base } = useRole()
  return useQuery({
    queryKey: computed(() => fileKey(unref(id))),
    enabled: computed(() => import.meta.client && Boolean(role.value) && Boolean(unref(id))),
    queryFn: async (): Promise<CaseFile> => {
      const data = await httpClient.getAuth<{ case: CaseRow, tasks?: CaseTaskRow[], activities?: CaseActivityRow[] }>(`${base.value}/${unref(id)}`)
      return { case: data.case, tasks: data.tasks ?? [], activities: data.activities ?? [] }
    },
    refetchInterval: 30 * 1000,
    retry: false,
  })
}

/**
 * A case's messages. Loading them marks the other person's as read, which is
 * why they are loaded on their own and only while the thread is on screen.
 */
export function useCaseThread(id: MaybeRef<string>, options?: { enabled?: MaybeRef<boolean> }) {
  const { role, base } = useRole()
  return useQuery({
    queryKey: computed(() => threadKey(unref(id))),
    enabled: computed(() => import.meta.client && Boolean(role.value) && Boolean(unref(id)) && unref(options?.enabled) !== false),
    queryFn: async () => (await httpClient.getAuth<{ messages: CaseMessageRow[] }>(`${base.value}/${unref(id)}/messages`)).messages ?? [],
    refetchInterval: 15 * 1000,
  })
}

export function useCaseActions(id: MaybeRef<string>) {
  const { base } = useRole()
  const queryClient = useQueryClient()
  const caseId = () => unref(id)

  /** Every case query: this case, its thread, the lists, and the counts the overview and top bar keep. */
  function refresh() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cases.all })
  }

  /** Title and description (either side); priority and due date (the lawyer's route only). */
  const save = useMutation({
    mutationFn: (changes: { caseTitle?: string, description?: string, priority?: CasePriority, dueDate?: string | null }) =>
      httpClient.put<{ case: CaseRow }>(`${base.value}/${caseId()}`, changes),
    onSuccess: refresh,
  })

  /** The lawyer closes, reopens or archives. */
  const setStatus = useMutation({
    mutationFn: (change: { status: CaseStatus, reason?: string }) =>
      httpClient.put<{ case: CaseRow }>(`${LAWYER}/${caseId()}/status`, change),
    onSuccess: refresh,
  })

  const send = useMutation({
    mutationFn: (messageContent: string) =>
      httpClient.post<{ message: CaseMessageRow }>(`${base.value}/${caseId()}/messages`, { messageContent }),
    onSuccess: refresh,
  })

  /** `assignedTo` is an ACCOUNT id: the client's or the lawyer's, from the case's parties. */
  const addTask = useMutation({
    mutationFn: (task: { taskTitle: string, taskDescription?: string, assignedTo: string, dueDate?: string }) =>
      httpClient.post<{ task: CaseTaskRow }>(`${LAWYER}/${caseId()}/tasks`, task),
    onSuccess: refresh,
  })

  /** Either side can tick a task off. */
  const completeTask = useMutation({
    mutationFn: (taskId: string) => httpClient.put<{ task: CaseTaskRow }>(`${base.value}/${caseId()}/tasks/${taskId}/complete`),
    onSuccess: refresh,
  })

  /** The lawyer puts a finished task back. */
  const reopenTask = useMutation({
    mutationFn: (taskId: string) => httpClient.patch<{ task: CaseTaskRow }>(`${LAWYER}/${caseId()}/tasks/${taskId}`, { status: 'pending' }),
    onSuccess: refresh,
  })

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => httpClient.delete<{ message: string }>(`${LAWYER}/${caseId()}/tasks/${taskId}`),
    onSuccess: refresh,
  })

  return { save, setStatus, send, addTask, completeTask, reopenTask, deleteTask }
}
