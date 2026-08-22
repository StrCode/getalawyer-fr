/**
 * Case messaging API
 * Feature: case-management-system
 *
 * Lawyers and clients hit different route prefixes for the same case resources
 * (Law-Backend `lawyer-case.routes.ts` vs `client-case.routes.ts`).
 */

import { httpClient } from '~/lib/api/client'

export type CaseUserType = 'client' | 'lawyer'

/** Raw `case_messages` row as returned by the backend (no sender name/image). */
export interface CaseMessageRow {
  id: string
  caseId: string
  senderId: string
  senderType: 'client' | 'lawyer'
  messageContent: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

/** Mirrors Law-Backend `sendMessageSchema` (`messageContent` max length). */
export const CASE_MESSAGE_MAX_LENGTH = 5000

export const getCaseApiBasePath = (userType?: string): string =>
  userType === 'lawyer' ? '/api/lawyer/cases' : '/api/cases'

export const casesAPI = {
  // GET /api/(lawyer/)cases/:id/messages — also marks the other party's messages read
  getCaseMessages: async (caseId: string, userType?: CaseUserType): Promise<CaseMessageRow[]> => {
    const response = await httpClient.getAuth<{ messages: CaseMessageRow[] }>(
      `${getCaseApiBasePath(userType)}/${caseId}/messages`,
    )
    return response.messages
  },

  // POST /api/(lawyer/)cases/:id/messages body { messageContent }
  sendCaseMessage: async (caseId: string, content: string, userType?: CaseUserType): Promise<CaseMessageRow> => {
    const response = await httpClient.post<{ message: CaseMessageRow }>(
      `${getCaseApiBasePath(userType)}/${caseId}/messages`,
      { messageContent: content },
    )
    return response.message
  },
}
