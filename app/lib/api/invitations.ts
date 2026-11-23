import { httpClient } from './client'

export type InvitationKind = 'client' | 'lawyer'

/** Who an invitation is for, as the accept page shows it. */
export interface InvitationSummary {
  kind: InvitationKind
  email: string
  name: string
  expiresAt: string
  invitedByName: string
}

export interface InvitationPrefill {
  state?: string
  interests?: string[]
}

export const invitationsAPI = {
  /** Fails with INVITATION_NOT_FOUND / _EXPIRED / _CANCELLED / _ACCEPTED when the link does not work. */
  lookUp: (token: string) => httpClient.get<InvitationSummary>(`/api/invitations/${encodeURIComponent(token)}`, { credentials: 'omit' }),
  /** What staff chose for a client who accepted, to start their profile from. */
  mine: () => httpClient.getAuth<{ prefill: InvitationPrefill | null }>('/api/invitations/mine'),
}
