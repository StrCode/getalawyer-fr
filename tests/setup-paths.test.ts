import { describe, expect, it } from 'vitest'
import {
  APPLICATION_HOME,
  APPLICATION_SECTION_PATHS,
  WELCOME_HOME,
  applicationSectionKeyFor,
  isSetupPath,
  setupHomeFor,
} from '~/lib/setup-paths'

describe('setup paths', () => {
  it('sends lawyers to their application and everyone else to the welcome steps', () => {
    expect(setupHomeFor({ userType: 'lawyer' })).toBe(APPLICATION_HOME)
    expect(setupHomeFor({ userType: 'client' })).toBe(WELCOME_HOME)
    expect(setupHomeFor({ role: 'lawyer' })).toBe(APPLICATION_HOME)
    expect(setupHomeFor(null)).toBe(WELCOME_HOME)
  })

  it('recognises the application and welcome addresses, and nothing that only starts the same', () => {
    expect(isSetupPath('/application')).toBe(true)
    expect(isSetupPath('/application/identity')).toBe(true)
    expect(isSetupPath('/welcome/legal-needs')).toBe(true)
    expect(isSetupPath('/applications')).toBe(false)
    expect(isSetupPath('/welcome-back')).toBe(false)
    expect(isSetupPath('/dashboard')).toBe(false)
  })

  it('maps a section address to the key it saves under', () => {
    expect(applicationSectionKeyFor(APPLICATION_SECTION_PATHS.nin_verification)).toBe('nin_verification')
    expect(applicationSectionKeyFor('/application/practice')).toBe('practice_info')
    expect(applicationSectionKeyFor('/application')).toBeNull()
    expect(applicationSectionKeyFor('/application/membership')).toBeNull()
  })
})
