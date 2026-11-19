/** "month", "6 months", "year", "2 years": the noun phrase for one plan term. */
export function termNoun(termMonths: number): string {
  if (termMonths === 1) return 'month'
  if (termMonths === 12) return 'year'
  if (termMonths % 12 === 0) return `${termMonths / 12} years`
  return `${termMonths} months`
}

/** "a month", "6 months", "a year": the phrase that follows "for" or "every". */
export function termPhrase(termMonths: number): string {
  return termMonths === 1 || termMonths === 12 ? `a ${termNoun(termMonths)}` : termNoun(termMonths)
}
