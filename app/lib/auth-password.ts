import { z } from 'zod'

export const authPasswordSchema = z
  .string('Password is required.')
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')

export const authPasswordChecks = [
  { key: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number', test: (v: string) => /[0-9]/.test(v) },
] as const

export function authPasswordStrength(password: string) {
  const passed = authPasswordChecks.filter(c => c.test(password)).length
  if (!password) return { label: '', passed: 0, total: authPasswordChecks.length }
  if (passed < authPasswordChecks.length) return { label: 'Weak password', passed, total: authPasswordChecks.length }
  return { label: 'Strong password', passed, total: authPasswordChecks.length }
}
