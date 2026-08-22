/**
 * Local-calendar date helpers.
 *
 * `Date#toISOString()` is UTC, so slicing it for "today" shifts the day near
 * midnight for anyone outside UTC. Use these when comparing against
 * local calendar dates (e.g. `scheduledDate`, exception `date`).
 */

/** YYYY-MM-DD for `d` in the user's local timezone. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
