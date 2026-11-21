/**
 * The one-time-code errors Better Auth returns (email and phone codes), in
 * plain words. Its own messages ("OTP expired", "Invalid OTP") are technical,
 * so screens that check a code show these instead.
 */
const CODE_MESSAGES: Record<string, string> = {
  OTP_EXPIRED: 'That code has expired. Send a new one.',
  // no code waiting: it expired and was cleared, or was never sent
  OTP_NOT_FOUND: 'That code has expired. Send a new one.',
  INVALID_OTP: 'That code is not right. Check it and try again.',
  TOO_MANY_ATTEMPTS: 'Too many tries with that code. Send a new one.',
}

/**
 * The words to show for a failed code check: a known Better Auth error code
 * gets its plain message, anything else the screen's own fallback (never the
 * raw server text).
 */
export function codeErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code ?? '') : ''
  return CODE_MESSAGES[code] ?? fallback
}
