import { describe, expect, it } from 'vitest'
import { pickTurn } from '../app/lib/take-turns'

describe('pickTurn', () => {
  const ten = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

  it('gives the next group each turn and wraps round at the end', () => {
    expect(pickTurn(ten, 0, 4)).toEqual(['a', 'b', 'c', 'd'])
    expect(pickTurn(ten, 1, 4)).toEqual(['e', 'f', 'g', 'h'])
    expect(pickTurn(ten, 2, 4)).toEqual(['i', 'j', 'a', 'b'])
  })

  it('shows everyone equally often over a full cycle', () => {
    const seen = new Map<string, number>()
    for (let turn = 0; turn < ten.length; turn++) {
      for (const item of pickTurn(ten, turn, 4)) seen.set(item, (seen.get(item) ?? 0) + 1)
    }
    expect([...seen.values()]).toEqual(Array(10).fill(4))
  })

  it('returns the whole list when it is no longer than the count', () => {
    expect(pickTurn(['a', 'b'], 7, 4)).toEqual(['a', 'b'])
    expect(pickTurn(['a', 'b', 'c', 'd'], 3, 4)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('copes with a negative or fractional turn', () => {
    expect(pickTurn(ten, -1, 4)).toHaveLength(4)
    expect(pickTurn(ten, 1.9, 4)).toEqual(['e', 'f', 'g', 'h'])
  })
})
