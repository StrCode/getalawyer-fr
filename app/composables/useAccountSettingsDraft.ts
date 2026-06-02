import type { AccountSettingsDraft } from '~/types/account-settings'

export function createDefaultAccountSettingsDraft(
  overrides?: Partial<AccountSettingsDraft>,
): AccountSettingsDraft {
  return {
    legalPreferences: {
      practiceAreas: [],
      consultationType: 'video',
      preferredLawyerGender: 'none',
      budgetMin: 50000,
      budgetMax: 250000,
      urgency: 'standard',
      ...overrides?.legalPreferences,
    },
    identity: {
      idDocumentStatus: 'not_submitted',
      addressProofStatus: 'not_submitted',
      phoneVerified: false,
      ...overrides?.identity,
    },
    privacy: {
      profileVisibleToLawyers: true,
      hideContactFromLawyers: false,
      anonymousConsultation: false,
      dataUseConsent: true,
      twoFactorMethod: 'none',
      loginAlerts: true,
      ...overrides?.privacy,
    },
    notifications: {
      lawyerMatch: { inApp: true, email: true, sms: false },
      messages: { inApp: true, email: true, sms: true },
      consultationReminder: { inApp: true, email: true, sms: true },
      documents: { inApp: true, email: false, sms: false },
      payments: { inApp: true, email: true, sms: false },
      announcements: { inApp: true, email: true, sms: false },
      ...overrides?.notifications,
    },
  }
}
