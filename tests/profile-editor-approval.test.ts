import { describe, expect, it } from 'bun:test'
import {
  canEditLawyerPublicProfile,
  getProfileEditorApprovalNotice,
} from '../app/lib/lawyerOnboardingStatus'

describe('profile editor approval', () => {
  it('allows edit only when approved', () => {
    expect(canEditLawyerPublicProfile('approved')).toBe(true)
    expect(canEditLawyerPublicProfile('pending')).toBe(false)
  })

  it('shows notice when pending', () => {
    const notice = getProfileEditorApprovalNotice({
      applicationStatus: 'pending_verification',
      currentState: 'submitted',
    })
    expect(notice?.title).toContain('locked')
  })

  it('hides notice when approved', () => {
    expect(
      getProfileEditorApprovalNotice({
        applicationStatus: 'approved',
        currentState: 'approved',
      }),
    ).toBeNull()
  })
})
