export type DirectoryEligibilityBlocker =
  | 'approval'
  | 'subscription_inactive'
  | 'payment_issue'
  | 'profile'

export type SubscriptionDashboardGate =
  | 'pass'
  | 'payment_issue'
  | 'subscription_inactive'

export interface LawyerDirectoryEligibility {
  isDirectoryVisible: boolean
  blockers: DirectoryEligibilityBlocker[]
  subscriptionGate: SubscriptionDashboardGate
  tier1Complete: boolean
}

export interface LawyerProfileStrengthSummary {
  percent: number
  score: number
  totalWeight: number
  isStrong: boolean
  incompleteCheckIds: string[]
}
