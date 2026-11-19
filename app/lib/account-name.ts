/**
 * The name typed at sign-up, split for the lawyer application so it is not
 * typed again. Accounts created by phone can carry the phone number as their
 * name, and some carry an email address; neither is a person's name.
 */
export function splitAccountName(name: string | null | undefined): { firstName: string, lastName: string } {
  const clean = (name ?? '').trim().replace(/\s+/g, ' ')
  if (!clean || clean.includes('@') || /\d/.test(clean)) return { firstName: '', lastName: '' }
  const [firstName = '', ...rest] = clean.split(' ')
  return { firstName, lastName: rest.join(' ') }
}

/** "Adaeze Ngozi Okafor" from the three name fields, skipping blanks. */
export function joinFullName(...parts: Array<string | null | undefined>): string {
  return parts.map(part => (part ?? '').trim()).filter(Boolean).join(' ')
}
