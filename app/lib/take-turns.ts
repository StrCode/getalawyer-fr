/**
 * Take turns through a list: `turn` 0 gives the first `count` items, turn 1 the
 * next `count`, and so on, wrapping round at the end. Everyone in the list is
 * shown equally often. Returns fewer than `count` only when the list is shorter.
 */
export function pickTurn<T>(items: readonly T[], turn: number, count: number): T[] {
  if (items.length <= count) return [...items]
  const start = ((Math.trunc(turn) * count) % items.length + items.length) % items.length
  return Array.from({ length: count }, (_, i) => items[(start + i) % items.length]!)
}
