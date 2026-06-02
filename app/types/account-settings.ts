export type SettingsSectionId =
  | 'legal-preferences'
  | 'identity'
  | 'documents'
  | 'case-history'
  | 'saved-lawyers'
  | 'notifications'
  | 'privacy'
  | 'help'

export type VerificationStatus = 'verified' | 'pending' | 'not_submitted'

export type ConsultationChannel = 'in_person' | 'video' | 'chat'

export type UrgencyLevel = 'standard' | 'urgent'

export interface AccountSettingsDraft {
  legalPreferences: {
    practiceAreas: string[]
    consultationType: ConsultationChannel
    preferredLawyerGender: string
    budgetMin: number
    budgetMax: number
    urgency: UrgencyLevel
  }
  identity: {
    idDocumentStatus: VerificationStatus
    addressProofStatus: VerificationStatus
    phoneVerified: boolean
  }
  privacy: {
    profileVisibleToLawyers: boolean
    hideContactFromLawyers: boolean
    anonymousConsultation: boolean
    dataUseConsent: boolean
    twoFactorMethod: 'sms' | 'authenticator' | 'none'
    loginAlerts: boolean
  }
  notifications: {
    lawyerMatch: { inApp: boolean, email: boolean, sms: boolean }
    messages: { inApp: boolean, email: boolean, sms: boolean }
    consultationReminder: { inApp: boolean, email: boolean, sms: boolean }
    documents: { inApp: boolean, email: boolean, sms: boolean }
    payments: { inApp: boolean, email: boolean, sms: boolean }
    announcements: { inApp: boolean, email: boolean, sms: boolean }
  }
}
